import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        // In a real app, this would call an API endpoint
        // For now, we'll simulate with mock data
        const mockUser: User = {
          id: '1',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'editor',
          permissions: {
            canEdit: true,
            canPush: true,
            canSimulate: true,
          },
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would call an API endpoint
      // For now, we'll simulate with mock data
      const mockUser: User = {
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
      
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    // In a real app, this would call an API endpoint
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
