import express from 'express';
import { pushIntent } from '../services/onosService.js';
// import authenticateJWT from '../middleware/authenticateJWT.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { intent, config } = req.body;
    const { intent_id, user_role } = config;
    if (user_role !== 'admin' ) {
      return res.status(403).json({ error: 'Only admin users can submit intents' });
    }
    await pushIntent(config);
    res.status(200).json({ message: 'Intent processed successfully', intent_id,config });
  } catch (error) {
    res.status(500).json({ error: `Failed to process intent: ${error.message}` });
  }
});

router.post('/acl', async (req, res) => {
  try {
    const { config } = req.body;
    const { user_role } = config;
    if (user_role !== 'admin' || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin users can submit ACL rules' });
    }
    await pushAclRule(config);
    res.status(200).json({ message: 'ACL rule processed successfully' });
  } catch (error) {
    res.status(500).json({ error: `Failed to process ACL rule: ${error.message}` });
  }
});

export default router;