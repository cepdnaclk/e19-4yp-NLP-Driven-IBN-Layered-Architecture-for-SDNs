import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the topology setup scripts
const LOGS_PULL_DIR = path.join(__dirname, '../../TopologySetup/04_utilityScripts/logs_pull');
const INTENT_PULL_SCRIPT = path.join(LOGS_PULL_DIR, '02_intent_pull_logs.sh');
const MATCHED_URLS_FILE = path.join(LOGS_PULL_DIR, 'matched_urls.txt');
const MONITORING_SERVER_IP = process.env.MONITORING_SERVER_IP || 'localhost';

/**
 * Generate JSON file for the intent configuration and trigger logs pulling
 * @param {Object} config - The intent configuration
 * @returns {Promise<Object>} - Result with monitoring URLs
 */
export const generateMonitoringConfig = async (config) => {
  try {
    const { intent_id, LOGS } = config;
    
    if (!LOGS || !LOGS.filters || LOGS.filters.length === 0) {
      throw new Error('No LOGS configuration found in intent');
    }

    // Generate JSON file for the intent
    const intentJsonPath = path.join(LOGS_PULL_DIR, `intent_${intent_id}.json`);
    const intentData = {
      intent: `Monitoring configuration for intent ${intent_id}`,
      config: config
    };

    // Write the intent JSON file
    await fs.promises.writeFile(intentJsonPath, JSON.stringify(intentData, null, 2), 'utf8');
    console.log(`[+] Intent JSON file created: ${intentJsonPath}`);

    // Execute the intent pull logs script
    const scriptResult = await executeIntentPullScript(intentJsonPath);
    console.log(`[+] Script execution result:`, scriptResult);

    // Read the matched URLs
    const monitoringUrls = await readMatchedUrls();
    
    return {
      success: true,
      intentJsonPath,
      monitoringUrls,
      scriptOutput: scriptResult
    };
  } catch (error) {
    console.error('Error generating monitoring config:', error);
    throw error;
  }
};

/**
 * Execute the intent pull logs script
 * @param {string} intentJsonPath - Path to the intent JSON file
 * @returns {Promise<string>} - Script output
 */
const executeIntentPullScript = (intentJsonPath) => {
  return new Promise((resolve, reject) => {
    console.log(`[+] Executing script: ${INTENT_PULL_SCRIPT} with ${intentJsonPath}`);
    
    const process = spawn('bash', [INTENT_PULL_SCRIPT, intentJsonPath], {
      cwd: LOGS_PULL_DIR,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`[SCRIPT] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`[SCRIPT ERROR] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        reject(new Error(`Script exited with code ${code}. STDERR: ${stderr}`));
      }
    });

    process.on('error', (error) => {
      reject(new Error(`Failed to execute script: ${error.message}`));
    });
  });
};

/**
 * Read matched URLs from the output file
 * @returns {Promise<Array>} - Array of monitoring URLs
 */
const readMatchedUrls = async () => {
  try {
    if (!fs.existsSync(MATCHED_URLS_FILE)) {
      console.log('[!] No matched URLs file found');
      return [];
    }

    const content = await fs.promises.readFile(MATCHED_URLS_FILE, 'utf8');
    const urls = content
      .split('\n')
      .filter(line => line.trim() && line.startsWith('http'))
      .map(url => url.trim().replace('localhost', MONITORING_SERVER_IP));
    
    console.log(`[+] Found ${urls.length} monitoring URLs`);
    return urls;
  } catch (error) {
    console.error('Error reading matched URLs:', error);
    return [];
  }
};

/**
 * Get dashboard URLs for specific application and time window
 * @param {string} application - Application name to filter
 * @param {string} timeWindow - Time window (e.g., "30s", "5m")
 * @returns {Promise<Array>} - Array of filtered dashboard URLs
 */
export const getDashboardUrls = async (application, timeWindow = '30s') => {
  try {
    const config = {
      intent_id: `temp_${Date.now()}`,
      LOGS: {
        filters: [
          {
            application: application,
            time_window: timeWindow
          }
        ]
      }
    };

    const result = await generateMonitoringConfig(config);
    return result.monitoringUrls;
  } catch (error) {
    console.error('Error getting dashboard URLs:', error);
    throw error;
  }
};

/**
 * Clean up temporary intent JSON files
 * @param {string} intentId - Intent ID to clean up
 */
export const cleanupIntentFiles = async (intentId) => {
  try {
    const intentJsonPath = path.join(LOGS_PULL_DIR, `intent_${intentId}.json`);
    if (fs.existsSync(intentJsonPath)) {
      await fs.promises.unlink(intentJsonPath);
      console.log(`[+] Cleaned up intent file: ${intentJsonPath}`);
    }
  } catch (error) {
    console.error('Error cleaning up intent files:', error);
  }
};
