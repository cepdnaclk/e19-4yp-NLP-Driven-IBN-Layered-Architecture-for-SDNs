import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { Message, IntentMessage } from '../types/chat';
import { sampleIntentJson } from '../schemas/intentSchema';

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock delay function to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Chat service for interacting with LLM
export const chatService = {
  // Send a message to the LLM and get a response
  sendMessage: async (message: string, chatHistory?: Message[], userId: string = 'admin'): Promise<Message> => {
    // Simulate API call delay
    await delay(1000);
    
    // Call backend LLM service with chat history
    try {
      const response = await api.post('/chat', {
        message: message,
        user_id: userId,
        session_id: "session_12345", // for testing
        seller_id: "1", // for testing
        chat_history: chatHistory ? chatHistory.map(msg => ({
          role: msg.role === 'system' ? 'assistant' : msg.role,
          content: msg.content
        })) : []
      });
      console.log('LLM response:', response.data);
      return {
        id: uuidv4(),
        role: 'system',
        content: response.data.response,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error calling LLM service:', error);
      // Fallback to mock response
    }
    
    // For now, check if message is asking for intent generation
    // if (message.toLowerCase().includes('generate intent') || 
    //     message.toLowerCase().includes('create intent')) {
      
    //   // Return a mock system message
    //   return {
    //     id: uuidv4(),
    //     role: 'system',
    //     content: 'I\'ve generated a network intent based on your request.',
    //     timestamp: new Date(),
    //   };
    // }
    
    
    // Return a generic response for other messages
    return {
      id: uuidv4(),
      role: 'system',
      content: `I understand you want to work with network intents. You can ask me to generate an intent, edit an existing one, or push an intent to the network. ${chatHistory ? `(Context: ${chatHistory.length} previous messages)` : ''}`,
      timestamp: new Date(),
    };
  },
  
  // Generate an intent based on user request
  generateIntent: async (message: string, chatHistory?: Message[], userId: string = 'admin'): Promise<IntentMessage> => {
    // Simulate API call delay
    await delay(1500);
    
    // Call backend LLM service for intent generation
    try {
      const response = await api.post('/chat', {
        message: message,
        user_id: userId,
        seller_id: "1", // for testing
        session_id: "session_12345", // for testing
        chat_history: chatHistory ? chatHistory.map(msg => ({
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.role === 'intent' && 'intentData' in msg 
          ? `${msg.content}\n\nIntent Configuration:\n${(msg as IntentMessage).intentData.raw}`
          : msg.content
      })) : []
      });
      
      // Parse the response to separate JSON and reasoning
      let intentConfig = response.data.intent;
      let reasoning = response.data.reasoning;
      
      // If the response contains both JSON and reasoning in a single field, parse them
      if (!intentConfig && response.data.response) {
        const responseText = response.data.response;
        
        // Extract JSON from the response (look for content between ```json and ```)
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            intentConfig = JSON.parse(jsonMatch[1]);
            console.log('Parsed intent config:', intentConfig);
          } catch (parseError) {
            console.error('Error parsing JSON from response:', parseError);
          }
        }
        
        // Extract reasoning (everything before the JSON block)
        const reasoningMatch = responseText.match(/^([\s\S]*?)(?=```json|$)/);
        if (reasoningMatch) {
          reasoning = reasoningMatch[1].trim();
        }
      }
      
      // Fallback to defaults if parsing failed
      intentConfig = intentConfig || sampleIntentJson;
      reasoning = reasoning || 'There was an issue with the connection. Please refer to the template below to create your network configuration. The system will use default settings based on common network requirements.';

      return {
        id: uuidv4(),
        role: 'intent',
        content: reasoning || 'Here\'s the generated intent based on our conversation. You can edit it or push it to the network.',
        timestamp: new Date(),
        intentData: {
          raw: JSON.stringify(intentConfig, null, 2),
          format: 'json',
          reasoning: reasoning,
          metadata: {
            timestamp: new Date(),
            author: 'AI Assistant',
            llmVersion: 'v1.0',
            status: 'draft'
          }
        }
      };
    } catch (error) {
      console.error('Error calling LLM service for intent generation:', error);
      // Fallback to mock response
    }
    
    // For now, generate a mock intent that could be enhanced with chat history
    // Return a mock intent message
    return {
      id: uuidv4(),
      role: 'intent',
      content: 'Here\'s the generated intent based on our conversation. You can edit it or push it to the network.',
      timestamp: new Date(),
      intentData: {
        raw: sampleIntentJson,
        format: 'json',
        reasoning: 'This is a mock intent generated based on your request. In a real scenario, this would contain the LLM\'s reasoning for the configuration choices.',
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
