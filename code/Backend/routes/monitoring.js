import express from 'express';
import { generateMonitoringConfig, getDashboardUrls, cleanupIntentFiles } from '../services/monitoringService.js';

const router = express.Router();

/**
 * Generate monitoring configuration and get dashboard URLs
 */
router.post('/generate', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || !config.LOGS || !config.LOGS.filters) {
      return res.status(400).json({ 
        error: 'Invalid configuration. LOGS.filters is required.' 
      });
    }

    const result = await generateMonitoringConfig(config);
    
    res.status(200).json({
      success: true,
      message: 'Monitoring configuration generated successfully',
      data: {
        intentJsonPath: result.intentJsonPath,
        urls: result.monitoringUrls,
        scriptOutput: result.scriptOutput
      }
    });
  } catch (error) {
    console.error('Error generating monitoring config:', error);
    res.status(500).json({ 
      error: `Failed to generate monitoring configuration: ${error.message}` 
    });
  }
});

/**
 * Get dashboard URLs for specific application
 */
router.get('/dashboard/:application', async (req, res) => {
  try {
    const { application } = req.params;
    const { timeWindow = '30s' } = req.query;
    
    const urls = await getDashboardUrls(application, timeWindow);
    
    res.status(200).json({
      success: true,
      message: `Dashboard URLs retrieved for ${application}`,
      data: {
        application,
        timeWindow,
        urls
      }
    });
  } catch (error) {
    console.error('Error getting dashboard URLs:', error);
    res.status(500).json({ 
      error: `Failed to get dashboard URLs: ${error.message}` 
    });
  }
});

/**
 * Open dashboard URLs in browser (returns URLs for frontend to handle)
 */
router.post('/open', async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ 
        error: 'URLs array is required' 
      });
    }

    // Return URLs for frontend to open in new tabs
    res.status(200).json({
      success: true,
      message: 'URLs ready to open',
      data: {
        urls,
        openMethod: 'client_side'
      }
    });
  } catch (error) {
    console.error('Error preparing URLs for opening:', error);
    res.status(500).json({ 
      error: `Failed to prepare URLs: ${error.message}` 
    });
  }
});

/**
 * Clean up temporary intent files
 */
router.delete('/cleanup/:intentId', async (req, res) => {
  try {
    const { intentId } = req.params;
    
    await cleanupIntentFiles(intentId);
    
    res.status(200).json({
      success: true,
      message: `Cleanup completed for intent ${intentId}`
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ 
      error: `Failed to cleanup: ${error.message}` 
    });
  }
});

export default router;
