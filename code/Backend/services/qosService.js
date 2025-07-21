import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Path to your QoS scripts
const QOS_SCRIPTS_PATH = path.join(process.cwd(), '../TopologySetup/04_utilityScripts/qos_push');

/**
 * Process QoS configuration and push intents to ONOS
 * @param {Object} config - The configuration object from frontend
 */
export const processQoSIntent = async (config) => {
  try {
    const { intent_id, QOS } = config;
    
    if (!QOS) {
      throw new Error('QOS configuration is required');
    }

    // Create a temporary JSON file for the bash script
    const tempJsonPath = path.join(QOS_SCRIPTS_PATH, `temp_${intent_id}.json`);
    
    // Write config to temporary JSON file
    await fs.writeFile(tempJsonPath, JSON.stringify(config, null, 2));
    
    console.log(`📝 Created temporary config file: ${tempJsonPath}`);
    
    // Initialize network knowledge (run once if needed)
    await initializeNetworkKnowledge();
    
    // Execute the QoS intent push process
    const result = await executeQoSPush(tempJsonPath);
    
    // Clean up temporary file
    try {
      await fs.unlink(tempJsonPath);
    } catch (unlinkError) {
      console.warn('⚠️  Could not delete temporary file:', unlinkError.message);
    }
    
    return {
      success: result.success !== false, // Default to true unless explicitly false
      message: result.success !== false 
        ? 'QoS intents successfully pushed to ONOS' 
        : 'QoS intent push completed with warnings - check logs',
      details: result
    };
    
  } catch (error) {
    console.error('❌ Error processing QoS intent:', error);
    throw error;
  }
};

/**
 * Initialize network knowledge by running the init script
 */
const initializeNetworkKnowledge = async () => {
  try {
    const initScriptPath = path.join(QOS_SCRIPTS_PATH, '01_init.sh');
    
    // Check if network_knowledge.yaml exists and is recent
    const yamlPath = path.join(QOS_SCRIPTS_PATH, 'network_knowledge.yaml');
    
    try {
      const stats = await fs.stat(yamlPath);
      const ageInMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
      
      // Refresh if older than 10 minutes
      if (ageInMinutes < 10) {
        console.log('📋 Using existing network knowledge (fresh)');
        return;
      }
    } catch (err) {
      // File doesn't exist, need to create it
    }
    
    console.log('🔄 Refreshing network knowledge...');
    
    // Change to the scripts directory and run init
    const { stdout, stderr } = await execAsync(`cd "${QOS_SCRIPTS_PATH}" && bash 01_init.sh`);
    
    if (stderr && !stderr.includes('Skipping')) {
      console.warn('⚠️  Init warnings:', stderr);
    }
    
    console.log('✅ Network knowledge updated');
    
  } catch (error) {
    console.error('❌ Error initializing network knowledge:', error);
    throw new Error('Failed to initialize network knowledge');
  }
};

/**
 * Execute the QoS push process
 */
const executeQoSPush = async (jsonFilePath) => {
  try {
    const pushScriptPath = path.join(QOS_SCRIPTS_PATH, '02_intent_push_qos.sh');
    
    console.log('🚀 Pushing QoS intents to ONOS...');
    
    // Execute the intent push script with improved error handling
    const { stdout, stderr } = await execAsync(
      `cd "${QOS_SCRIPTS_PATH}" && bash 02_intent_push_qos.sh "${jsonFilePath}"`,
      { 
        timeout: 1200000, // 2 minute timeout (increased from 60s)
        maxBuffer: 1024 * 1024 * 15, // 10MB buffer for large outputs
        killSignal: 'SIGTERM'
      }
    );
    
    // Clean up ANSI escape sequences and control characters from output
    const cleanStdout = stdout ? stdout.replace(/\x1B\[[?]?\d*[;h=]*[A-Za-z]/g, '').replace(/\r/g, '') : '';
    const cleanStderr = stderr ? stderr.replace(/\x1B\[[?]?\d*[;h=]*[A-Za-z]/g, '').replace(/\r/g, '') : '';
    
    // Log warnings but don't fail for SSH warnings
    if (cleanStderr && !cleanStderr.includes('Warning: Permanently added')) {
      console.warn('⚠️  Push warnings:', cleanStderr);
    }
    
    console.log('📤 ONOS Response (cleaned):', cleanStdout);
    
    // Check if the output indicates success
    const isSuccess = cleanStdout.includes('Intent') || 
                     cleanStdout.includes('submitted') || 
                     cleanStdout.includes('installed') ||
                     !cleanStdout.includes('error') && !cleanStdout.includes('failed');
    
    if (!isSuccess && cleanStdout.length > 0) {
      console.warn('⚠️  Possible script execution issue - check output manually');
    }
    
    return {
      stdout: cleanStdout,
      stderr: cleanStderr,
      timestamp: new Date().toISOString(),
      success: isSuccess
    };
    
  } catch (error) {
    console.error('❌ Error executing QoS push:', error);
    
    // Provide more specific error information
    if (error.code === 'TIMEOUT') {
      throw new Error('Script execution timeout - ONOS may be slow to respond');
    } else if (error.code === 'ENOENT') {
      throw new Error('QoS script not found - check script path');
    } else {
      throw new Error(`Script execution failed: ${error.message}`);
    }
  }
};

/**
 * Validate QoS configuration
 */
export const validateQoSConfig = (config) => {
  const { QOS } = config;
  
  if (!QOS) {
    return { valid: false, error: 'QOS configuration is required' };
  }
  
  // Check priority
  const validPriorities = ['low', 'medium', 'high'];
  if (QOS.priority && !validPriorities.includes(QOS.priority)) {
    return { 
      valid: false, 
      error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
    };
  }
  
  // Check IP format if provided
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (QOS.source_ip && !ipRegex.test(QOS.source_ip)) {
    return { valid: false, error: 'Invalid source IP format' };
  }
  
  if (QOS.destination_ip && !ipRegex.test(QOS.destination_ip)) {
    return { valid: false, error: 'Invalid destination IP format' };
  }
  
  return { valid: true };
};

/**
 * Get current network topology info
 */
export const getNetworkTopology = async () => {
  try {
    const yamlPath = path.join(QOS_SCRIPTS_PATH, 'network_knowledge.yaml');
    const yamlContent = await fs.readFile(yamlPath, 'utf8');
    
    // You can parse YAML here if needed, or return raw content
    return {
      success: true,
      data: yamlContent,
      lastUpdated: (await fs.stat(yamlPath)).mtime
    };
    
  } catch (error) {
    console.error('❌ Error reading network topology:', error);
    throw new Error('Failed to read network topology');
  }
};
