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
    await fs.unlink(tempJsonPath);
    
    return {
      success: true,
      message: 'QoS intents successfully pushed to ONOS',
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
    
    // Execute the intent push script
    const { stdout, stderr } = await execAsync(
      `cd "${QOS_SCRIPTS_PATH}" && bash 02_intent_push_qos.sh "${jsonFilePath}"`,
      { timeout: 60000 } // 60 second timeout
    );
    
    if (stderr) {
      console.warn('⚠️  Push warnings:', stderr);
    }
    
    console.log('📤 ONOS Response:', stdout);
    
    return {
      stdout,
      stderr,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error executing QoS push:', error);
    throw new Error('Failed to push intents to ONOS');
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
