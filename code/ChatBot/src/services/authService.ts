import type { User, Feedback } from '../types/user';

// Mock delay function to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication service for user management
export const authService = {
  // Get current user information
  getCurrentUser: async (): Promise<User | null> => {
    // Simulate API call delay
    await delay(500);
    
    // Return mock user data
    return {
      id: '1',
      name: 'Test User',
      email: 'user@example.com',
      role: 'editor',
      permissions: {
        canEdit: true,
        canPush: true,
        canSimulate: true,
      },
    };
  },
  
  // Login user
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API call delay
    await delay(1000);
    
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Return mock user data
    return {
      id: '1',
      name: 'Test User',
      email,
      role: 'editor',
      permissions: {
        canEdit: true,
        canPush: true,
        canSimulate: true,
      },
    };
  },
  
  // Logout user
  logout: async (): Promise<void> => {
    // Simulate API call delay
    await delay(500);
    
    // In a real app, this would clear session data on the server
    return;
  },
  
  // Submit feedback
  submitFeedback: async (intentId: string, rating: 'positive' | 'negative', comment: string): Promise<Feedback> => {
    // Simulate API call delay
    await delay(800);
    
    // Return mock feedback data
    return {
      id: Math.random().toString(36).substring(2, 9),
      intentId,
      userId: '1',
      rating,
      comment,
      timestamp: new Date(),
    };
  },
  
  // Get user permissions for a specific intent
  getIntentPermissions: async (intentId: string): Promise<{
    canEdit: boolean;
    canPush: boolean;
    canSimulate: boolean;
  }> => {
    // Simulate API call delay
    await delay(300);
    
    // Return mock permissions
    return {
      canEdit: true,
      canPush: true,
      canSimulate: true,
    };
  }
};

export default authService;
