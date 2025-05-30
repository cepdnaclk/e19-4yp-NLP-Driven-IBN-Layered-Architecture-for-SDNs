import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Intent, ValidationError } from '../types/intent';

interface IntentContextType {
  currentIntent: Intent | null;
  setCurrentIntent: (intent: Intent | null) => void;
  updateIntentRaw: (raw: string) => void;
  updateIntentFormat: (format: 'json' | 'yaml') => void;
  validateIntent: () => void;
  resetIntent: () => void;
  simulateIntent: () => Promise<boolean>;
  pushIntent: () => Promise<boolean>;
}

const IntentContext = createContext<IntentContextType | undefined>(undefined);

interface IntentProviderProps {
  children: ReactNode;
}

export const IntentProvider: React.FC<IntentProviderProps> = ({ children }) => {
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);

  const updateIntentRaw = (raw: string) => {
    if (!currentIntent) return;

    setCurrentIntent({
      ...currentIntent,
      raw,
      validationStatus: {
        isValid: false, // Reset validation status when content changes
        errors: [],
      },
    });
  };

  const updateIntentFormat = (format: 'json' | 'yaml') => {
    if (!currentIntent) return;

    setCurrentIntent({
      ...currentIntent,
      format,
    });
  };

  const validateIntent = () => {
    if (!currentIntent) return;

    // In a real app, this would use a schema validation library
    // For now, we'll simulate with basic validation
    try {
      let parsed;
      if (currentIntent.format === 'json') {
        parsed = JSON.parse(currentIntent.raw);
      } else {
        // YAML parsing would be implemented here
        parsed = {}; // Placeholder
      }

      const errors: ValidationError[] = [];

      // Basic validation checks
      if (!parsed.name) {
        errors.push({
          path: 'name',
          message: 'Name is required',
          severity: 'error',
        });
      }

      if (!parsed.description) {
        errors.push({
          path: 'description',
          message: 'Description is required',
          severity: 'error',
        });
      }

      setCurrentIntent({
        ...currentIntent,
        validationStatus: {
          isValid: errors.length === 0,
          errors,
        },
      });
    } catch (error) {
      setCurrentIntent({
        ...currentIntent,
        validationStatus: {
          isValid: false,
          errors: [
            {
              path: 'root',
              message: `Invalid ${currentIntent.format.toUpperCase()} format: ${(error as Error).message}`,
              severity: 'error',
            },
          ],
        },
      });
    }
  };

  const resetIntent = () => {
    if (!currentIntent) return;

    // In a real app, this would fetch the original intent from the API
    // For now, we'll reset to a default state
    setCurrentIntent({
      ...currentIntent,
      raw: '{\n  "name": "Example Intent",\n  "description": "This is an example intent"\n}',
      format: 'json',
      validationStatus: {
        isValid: true,
        errors: [],
      },
    });
  };

  const simulateIntent = async (): Promise<boolean> => {
    if (!currentIntent) return false;

    // In a real app, this would call an API endpoint
    // For now, we'll simulate with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentIntent({
          ...currentIntent,
          metadata: {
            ...currentIntent.metadata,
            status: 'simulated',
          },
        });
        resolve(true);
      }, 1500);
    });
  };

  const pushIntent = async (): Promise<boolean> => {
    if (!currentIntent) return false;

    // In a real app, this would call an API endpoint
    // For now, we'll simulate with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentIntent({
          ...currentIntent,
          metadata: {
            ...currentIntent.metadata,
            status: 'pushed',
          },
        });
        resolve(true);
      }, 1500);
    });
  };

  return (
    <IntentContext.Provider
      value={{
        currentIntent,
        setCurrentIntent,
        updateIntentRaw,
        updateIntentFormat,
        validateIntent,
        resetIntent,
        simulateIntent,
        pushIntent,
      }}
    >
      {children}
    </IntentContext.Provider>
  );
};

export const useIntent = (): IntentContextType => {
  const context = useContext(IntentContext);
  if (context === undefined) {
    throw new Error('useIntent must be used within an IntentProvider');
  }
  return context;
};
