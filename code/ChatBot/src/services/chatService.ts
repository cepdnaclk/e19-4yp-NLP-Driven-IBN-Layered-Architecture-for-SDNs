import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { Message, IntentMessage } from '../types/chat';
import { sampleIntentJson } from '../schemas/intentSchema';

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock delay function to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Chat service for interacting with LLM
export const chatService = {
  // Send a message to the LLM and get a response
  sendMessage: async (message: string): Promise<Message> => {
    // Simulate API call delay
    await delay(1000);
    
    // Check if message is asking for intent generation
    if (message.toLowerCase().includes('generate intent') || 
        message.toLowerCase().includes('create intent')) {
      
      // Return a mock system message
      return {
        id: uuidv4(),
        role: 'system',
        content: 'I\'ve generated a network intent based on your request.',
        timestamp: new Date(),
      };
    }
    
    // Return a generic response for other messages
    return {
      id: uuidv4(),
      role: 'system',
      content: 'I understand you want to work with network intents. You can ask me to generate an intent, edit an existing one, or push an intent to the network.',
      timestamp: new Date(),
    };
  },
  
  // Generate an intent based on user request
  generateIntent: async (message: string): Promise<IntentMessage> => {
    // Simulate API call delay
    await delay(1500);
    
    // Return a mock intent message
    return {
      id: uuidv4(),
      role: 'intent',
      content: 'Here\'s the generated intent. You can edit it or push it to the network.',
      timestamp: new Date(),
      intentData: {
        raw: sampleIntentJson,
        format: 'json',
        metadata: {
          timestamp: new Date(),
          author: 'AI Assistant',
          llmVersion: 'v1.0',
          status: 'draft'
        }
      }
    };
  },
  
  // Get LLM suggestions for intent improvement
  getIntentSuggestions: async (intentJson: string, type: 'optimize' | 'qos'): Promise<string> => {
    // Simulate API call delay
    await delay(1000);
    
    try {
      const intent = JSON.parse(intentJson);
      
      if (type === 'optimize') {
        // Add optimization fields
        intent.optimized = true;
        if (intent.qos) {
          intent.qos.optimized = true;
        }
      } else if (type === 'qos') {
        // Improve QoS settings
        if (!intent.qos) {
          intent.qos = {};
        }
        intent.qos.bandwidth = "100Mbps";
        intent.qos.latency = "10ms";
        intent.qos.priority = "high";
      }
      
      return JSON.stringify(intent, null, 2);
    } catch (error) {
      console.error('Error parsing intent JSON:', error);
      return intentJson;
    }
  }
};

export default chatService;
