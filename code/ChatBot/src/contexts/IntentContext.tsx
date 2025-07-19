import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Intent } from '../types/intent';
import { validateIntentSchema, sampleIntentJson } from '../schemas/intentSchema';

interface IntentContextType {
  currentIntent: Intent | null;
  setCurrentIntent: (intent: Intent | null) => void;
  updateIntentRaw: (raw: string) => void;
  updateIntentFormat: (format: 'json' | 'yaml') => void;
  validateIntent: () => Promise<void>;
  resetIntent: () => void;
  simulateIntent: () => Promise<boolean>;
  pushIntent: () => Promise<boolean>;
}

const IntentContext = createContext<IntentContextType | undefined>(undefined);

interface IntentProviderProps {
  children: ReactNode;
}

export const IntentProvider: React.FC<IntentProviderProps> = ({ children }) => {
  const [currentIntent, setCurrentIntentState] = useState<Intent | null>(null);

  // Enhanced setCurrentIntent that automatically validates when an intent is set
  const setCurrentIntent = useCallback( async (intent: Intent | null) => {
    if (!intent) {
      setCurrentIntentState(null);
      return;
    }

    // Set the intent first
    // setCurrentIntentState(intent);

    // Then validate it automatically
    try {
      const validation = await validateIntentSchema(intent.raw);
      console.log('Intent validation result:', validation);
      setCurrentIntentState({
        ...intent,
        validationStatus: {
          isValid: validation.isValid,
          errors: validation.errors,
        },
      });
    } catch (error) {
      setCurrentIntentState({
        ...intent,
        validationStatus: {
          isValid: false,
          errors: [
            {
              path: 'root',
              message: `Validation error: ${(error as Error).message}`,
              severity: 'error',
            },
          ],
        },
      });
    }
  }, []);

  const updateIntentRaw = (raw: string) => {
    if (!currentIntent) return;

    setCurrentIntentState({
      ...currentIntent,
      raw,
      validationStatus: {
        isValid: true, // Reset validation status when content changes
        errors: [],
      },
    });
  };

  const updateIntentFormat = (format: 'json' | 'yaml') => {
    if (!currentIntent) return;

    setCurrentIntentState({
      ...currentIntent,
      format,
    });
  };

  const validateIntent = async () => {
    if (!currentIntent) return;

    try {
      // Use the schema validation function
      const validation = await validateIntentSchema(currentIntent.raw);
      
      setCurrentIntentState({
        ...currentIntent,
        validationStatus: {
          isValid: validation.isValid,
          errors: validation.errors,
        },
      });
    } catch (error) {
      setCurrentIntentState({
        ...currentIntent,
        validationStatus: {
          isValid: false,
          errors: [
            {
              path: 'root',
              message: `Validation error: ${(error as Error).message}`,
              severity: 'error',
            },
          ],
        },
      });
    }
  };

  const resetIntent = () => {
    if (!currentIntent) return;

    // Reset to the sample intent from the schema
    setCurrentIntentState({
      ...currentIntent,
      raw: sampleIntentJson,
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
        setCurrentIntentState({
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
        setCurrentIntentState({
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
