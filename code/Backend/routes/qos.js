import express from 'express';
import { processQoSIntent, validateQoSConfig, getNetworkTopology } from '../services/qosService.js';
// import authenticateJWT from '../middleware/authenticateJWT.js';

const router = express.Router();

/**
 * POST /qos - Apply QoS policy
 */
router.post('/', async (req, res) => {
  try {
    const config = req.body;
    
    // Validate the configuration
    const validation = validateQoSConfig(config);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid QoS configuration', 
        details: validation.error 
      });
    }
    
    console.log('📥 QoS request received:', JSON.stringify(config, null, 2));
    
    // Process the QoS intent
    const result = await processQoSIntent(config);
    
    res.status(200).json({
      success: true,
      message: 'QoS policy applied successfully',
      intent_id: config.intent_id,
      result: result
    });
    
  } catch (error) {
    console.error('❌ QoS processing error:', error);
    res.status(500).json({ 
      error: 'Failed to apply QoS policy', 
      details: error.message 
    });
  }
});

/**
 * GET /qos/topology - Get current network topology
 */
router.get('/topology', async (req, res) => {
  try {
    const topology = await getNetworkTopology();
    res.status(200).json(topology);
  } catch (error) {
    console.error('❌ Topology fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch network topology', 
      details: error.message 
    });
  }
});

/**
 * POST /qos/validate - Validate QoS configuration
 */
router.post('/validate', (req, res) => {
  try {
    const config = req.body;
    const validation = validateQoSConfig(config);
    
    res.status(200).json(validation);
  } catch (error) {
    console.error('❌ Validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate configuration', 
      details: error.message 
    });
  }
});

export default router;
