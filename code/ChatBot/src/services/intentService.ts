import { v4 as uuidv4 } from 'uuid';
import type { Intent, ValidationError, IntentHistory, IntentVersion } from '../types/intent';
import { validateIntentJson, sampleIntentJson } from '../schemas/intentSchema';

// Mock delay function to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Intent service for managing network intents
export const intentService = {
  // Get an intent by ID
  getIntent: async (id: string): Promise<Intent> => {
    // Simulate API call delay
    await delay(800);
    
    // Return a mock intent
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
    return validateIntentJson(intentJson);
  },
  
  // Simulate an intent before pushing
  simulateIntent: async (intentJson: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    // Simulate API call delay
    await delay(1500);
    
    try {
      // Validate the intent first
      const validation = await validateIntentJson(intentJson);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: `Simulation failed: ${validation.errors[0].message}`
        };
      }
      
      // 90% chance of success for demo purposes
      const success = Math.random() > 0.1;
      
      return {
        success,
        message: success 
          ? 'Simulation successful. The intent is valid and can be pushed to the network.'
          : 'Simulation failed. There might be conflicts with existing network policies.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Simulation error: ${(error as Error).message}`
      };
    }
  },
  
  // Push an intent to the network
  pushIntent: async (intentJson: string): Promise<{
    success: boolean;
    message: string;
    intentId?: string;
  }> => {
    // Simulate API call delay
    await delay(2000);
    
    try {
      // Validate the intent first
      const validation = await validateIntentJson(intentJson);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: `Push failed: ${validation.errors[0].message}`
        };
      }
      
      // 90% chance of success for demo purposes
      const success = Math.random() > 0.1;
      const intentId = uuidv4();
      
      return {
        success,
        message: success 
          ? `Intent successfully pushed to the network with ID: ${intentId}`
          : 'Push failed. There might be conflicts with existing network policies.',
        intentId: success ? intentId : undefined
      };
    } catch (error) {
      return {
        success: false,
        message: `Push error: ${(error as Error).message}`
      };
    }
  },
  
  // Get intent history
  getIntentHistory: async (): Promise<IntentHistory[]> => {
    // Simulate API call delay
    await delay(800);
    
    // Return mock history data
    return [
      {
        id: '1',
        summary: 'Web server to database connection',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'pushed',
        versions: [
          {
            id: '1-1',
            intentId: '1',
            raw: JSON.stringify({
              name: "Web DB Connection",
              description: "Connection between web server and database",
              source: "192.168.1.10/32",
              destination: "10.0.0.5/32",
              protocol: "TCP",
              port: 3306,
              qos: {
                bandwidth: "5Mbps",
                latency: "20ms"
              },
              security: {
                encryption: "AES-256",
                authentication: "required"
              }
            }, null, 2),
            format: 'json',
            timestamp: new Date(Date.now() - 3600000),
            author: 'John Doe',
            comment: 'Initial version'
          }
        ]
      },
      {
        id: '2',
        summary: 'Load balancer to application servers',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        status: 'simulated',
        versions: [
          {
            id: '2-1',
            intentId: '2',
            raw: JSON.stringify({
              name: "Load Balancer Config",
              description: "Connection between load balancer and app servers",
              source: "192.168.1.5/32",
              destination: "10.0.0.0/24",
              protocol: "TCP",
              port: 8080,
              qos: {
                bandwidth: "50Mbps",
                latency: "5ms",
                priority: "high"
              },
              security: {
                encryption: "AES-128",
                authentication: "required"
              }
            }, null, 2),
            format: 'json',
            timestamp: new Date(Date.now() - 7200000),
            author: 'Jane Smith',
            comment: 'Initial version'
          }
        ]
      },
      {
        id: '3',
        summary: 'External API gateway configuration',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        status: 'failed',
        versions: [
          {
            id: '3-1',
            intentId: '3',
            raw: JSON.stringify({
              name: "API Gateway Config",
              description: "External API gateway configuration",
              source: "0.0.0.0/0",
              destination: "192.168.1.100/32",
              protocol: "TCP",
              port: 443,
              qos: {
                bandwidth: "100Mbps",
                latency: "50ms",
                priority: "medium"
              },
              security: {
                encryption: "AES-256",
                authentication: "required"
              }
            }, null, 2),
            format: 'json',
            timestamp: new Date(Date.now() - 86400000),
            author: 'Admin User',
            comment: 'Initial version'
          }
        ]
      }
    ];
  },
  
  // Get versions for a specific intent
  getIntentVersions: async (intentId: string): Promise<IntentVersion[]> => {
    // Simulate API call delay
    await delay(600);
    
    // Return mock versions based on intent ID
    if (intentId === '1') {
      return [
        {
          id: '1-2',
          intentId: '1',
          raw: JSON.stringify({
            name: "Web DB Connection",
            description: "Connection between web server and database",
            source: "192.168.1.10/32",
            destination: "10.0.0.5/32",
            protocol: "TCP",
            port: 3306,
            qos: {
              bandwidth: "10Mbps", // Increased from 5Mbps
              latency: "10ms" // Improved from 20ms
            },
            security: {
              encryption: "AES-256",
              authentication: "required"
            }
          }, null, 2),
          format: 'json',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          author: 'John Doe',
          comment: 'Improved QoS settings'
        },
        {
          id: '1-1',
          intentId: '1',
          raw: JSON.stringify({
            name: "Web DB Connection",
            description: "Connection between web server and database",
            source: "192.168.1.10/32",
            destination: "10.0.0.5/32",
            protocol: "TCP",
            port: 3306,
            qos: {
              bandwidth: "5Mbps",
              latency: "20ms"
            },
            security: {
              encryption: "AES-256",
              authentication: "required"
            }
          }, null, 2),
          format: 'json',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          author: 'John Doe',
          comment: 'Initial version'
        }
      ];
    }
    
    // Default return for other intent IDs
    return [];
  }
};

export default intentService;
