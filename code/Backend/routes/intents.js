import express from 'express';
import { pushIntent } from '../services/onosService.js';
import { generateMonitoringConfig } from '../services/monitoringService.js';
// import authenticateJWT from '../middleware/authenticateJWT.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { intent, config } = req.body;
    const { intent_id } = config || {};
    
    // const { user_role } = config;
    // if (user_role !== 'admin' || req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Only admin users can submit ACL rules' });
    // }
    
    console.log('Request received from frontend:', req.body);
    
    // Push the intent to ONOS
    await pushIntent(config);
    
    let monitoringResult = null;
    
    // If the intent has LOGS configuration, generate monitoring config
    if (config.LOGS && config.LOGS.filters && config.LOGS.filters.length > 0) {
      try {
        console.log('[+] Processing monitoring configuration...');
        monitoringResult = await generateMonitoringConfig(config);
        console.log('[+] Monitoring URLs generated:', monitoringResult.monitoringUrls);
      } catch (monitoringError) {
        console.error('Warning: Failed to generate monitoring config:', monitoringError.message);
        // Don't fail the entire request if monitoring fails
      }
    }
    
    const response = {
      message: 'Configuration processed successfully',
      intent_id,
      monitoring: monitoringResult ? {
        urls: monitoringResult.monitoringUrls,
        configGenerated: true
      } : {
        urls: [ ],
        configGenerated: false,
        reason: 'No LOGS configuration found'
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error processing intent:', error);
    res.status(500).json({ error: `Failed to process configuration: ${error.message}` });
  }
});

export default router;