import express from 'express';
import { sendToLLM, generateIntentWithContext } from '../services/llmService.js';

const router = express.Router();

/**
 * POST /api/llm/chat
 * Send message to LLM with chat history context
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, user_id, chat_history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if this is an intent generation request
    const isIntentRequest = message.toLowerCase().includes('generate intent') || 
                           message.toLowerCase().includes('create intent') ||
                           message.toLowerCase().includes('intent');

    if (isIntentRequest) {
      // Use the intent generation service
      const result = await generateIntentWithContext(chat_history, message);
      
      res.json({
        success: true,
        response: result.reasoning,
        intent: result.intent,
        reasoning: result.reasoning,
        timestamp: new Date(),
        user_id: user_id
      });
    } else {
      // Use regular chat service
      const systemPrompt = 'You are a helpful assistant for network intent management.';
      const response = await sendToLLM(chat_history, message, systemPrompt);
      
      res.json({
        success: true,
        response: response,
        timestamp: new Date(),
        user_id: user_id
      });
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      message: error.message 
    });
  }
});

/**
 * POST /api/llm/generate-intent
 * Generate network intent with chat history context
 */
router.post('/generate-intent', async (req, res) => {
  try {
    const { message, user_id, chat_history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await generateIntentWithContext(chat_history, message);
    
    res.json({
      success: true,
      intent: result.intent,
      reasoning: result.reasoning,
      timestamp: new Date(),
      user_id: user_id
    });
  } catch (error) {
    console.error('Error in generate-intent endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate intent',
      message: error.message 
    });
  }
});

export default router;
