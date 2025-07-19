import { v4 as uuidv4 } from 'uuid';
import type { Intent, ValidationError, IntentHistory, IntentVersion } from '../types/intent';
import { validateIntentSchema, sampleIntentJson } from '../schemas/intentSchema';
import axios from 'axios';

// Mock delay function to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to extract intent ID from configuration
export const getIntentIdFromConfig = (intentJson: string): string | null => {
  try {
    const parsedIntent = JSON.parse(intentJson);
    return parsedIntent.config?.intent_id || null;
  } catch {
    return null;
  }
};

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_INTENT_BACKEND_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intent service for managing network intents
export const intentService = {
  // Get an intent by ID
  getIntent: async (id: string): Promise<Intent> => {
    
    return {
      id,
      name: "Example Network Intent",
      description: "This is an example network intent",
      raw: sampleIntentJson,
      format: 'json',
      metadata: {
        timestamp: new Date(),
        author: 'AI Assistant',
        llmVersion: 'v1.0',
        status: 'draft'
      },
      validationStatus: {
        isValid: true,
        errors: []
      }
    };
  },
  
  // Validate an intent against the schema
  validateIntent: async (intentJson: string): Promise<{
    isValid: boolean;
    errors: ValidationError[];
  }> => {
    // Simulate API call delay
    await delay(500);
    
    // Use the schema validation helper
    return validateIntentSchema(intentJson);
  },
  
  // Push an intent to the network
  pushIntent: async (intentJson: string): Promise<{
    success: boolean;
    message: string;
    intentId?: string;
  }> => {
    try {
      // Validate the intent first
      const validation = await validateIntentSchema(intentJson);

      if (!validation.isValid) {
        return {
          success: false,
          message: `Push failed: ${validation.errors[0].message}`
        };
      }
      
      // Parse the intent JSON to extract configuration
      let parsedIntent;
      try {
        parsedIntent = JSON.parse(intentJson);
      } catch (parseError) {
        return {
          success: false,
          message: `Invalid JSON format: ${(parseError as Error).message}`
        };
      }
      
      // Get intent ID from configuration or generate a new one
      const intentId = parsedIntent.config?.intent_id || uuidv4();
      
      // Prepare the request body in the format expected by the backend
      const requestBody = {
        intent: parsedIntent,
        config: {
          intent_id: intentId,
          user_role: parsedIntent.config?.user_role || 'admin', // Use config user_role or default to admin
          ...parsedIntent.config // Spread the existing config properties
        }
      };
      
      console.log('Sending request to backend:', requestBody);
      console.log('API base URL:', api.defaults.baseURL);
      
      // Make API call to backend
      const response = await api.post('/intents/acl', requestBody);
      
      console.log('Push response:', response);
      
      if (response.status !== 200) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = response.data;

      return {
        success: true,
        message: result.message || `Intent successfully pushed to the network with ID: ${intentId}`,
        intentId: intentId
      };
      
    } catch (error) {
      console.error('Error pushing intent:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const errorData = error.response?.data;
        
        return {
          success: false,
          message: `Network error (${status}): ${errorData?.error || statusText || error.message}`
        };
      }
      
      return {
        success: false,
        message: `Push error: ${(error as Error).message}`
      };
    }
  },
  
  // Get intent history
  getIntentHistory: async (): Promise<IntentHistory[]> => {
    return [];
  },
  
  // Get versions for a specific intent
  getIntentVersions: async (intentId: string): Promise<IntentVersion[]> => {
    
    if (intentId === '1') {
      return []
    }
    
    // Default return for other intent IDs
    return [];
  },

  // Get intent ID from configuration
  getIntentIdFromConfig: (intentJson: string): string | null => {
    return getIntentIdFromConfig(intentJson);
  }
};

export default intentService;
