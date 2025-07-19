import express from 'express';
import { pushIntent } from '../services/onosService.js';
// import authenticateJWT from '../middleware/authenticateJWT.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { intent,config } = req.body;
    const { intent_id } = config || {};
    
    // const { user_role } = config;
    // if (user_role !== 'admin' || req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Only admin users can submit ACL rules' });
    // }
    
    // console.log('Request received from frontend:', req.body);
    await pushIntent(config);
    res.status(200).json({ message: 'Configuration processed successfully' });
  } catch (error) {

    res.status(500).json({ error: `Failed to process configuration: ${error.message}` });
  }
});

export default router;