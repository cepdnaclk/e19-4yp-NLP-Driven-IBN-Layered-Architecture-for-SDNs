import React from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useChat } from '../../contexts/ChatContext';
import { useIntent } from '../../contexts/IntentContext';

const ChatContainer: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { currentSession, addMessage, addIntentMessage } = useChat();
  const { setCurrentIntent } = useIntent();

  const handleSendMessage = async (message: string) => {
    if (!currentSession) return;
    
    // Add user message to chat
    addMessage('user', message);
    
    // Simulate LLM processing
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API endpoint
      // For now, we'll simulate with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if message is asking for intent generation
      if (message.toLowerCase().includes('generate intent') || 
          message.toLowerCase().includes('create intent')) {
        
        // Add system message
        addMessage('system', 'I\'ve generated a network intent based on your request:');
        
        // Generate mock intent
        const mockIntentRaw = JSON.stringify({
          name: "Example Network Configuration",
          description: "This is an example network configuration generated from your request",
          source: "192.168.1.0/24",
          destination: "10.0.0.0/24",
          protocol: "TCP",
          port: 443,
          qos: {
            bandwidth: "10Mbps",
            latency: "50ms"
          },
          security: {
            encryption: "AES-256",
            authentication: "required"
          }
        }, null, 2);
        
        // Add intent message
        addIntentMessage(
          'Here\'s the generated configuration according to your request. You can edit it or push it to the network.',
          {
            raw: mockIntentRaw,
            format: 'json',
            metadata: {
              timestamp: new Date(),
              author: 'AI Assistant',
              llmVersion: 'v1.0',
              status: 'draft'
            }
          }
        );
        
        // Set current intent in context
        setCurrentIntent({
          id: Math.random().toString(36).substring(2, 9),
          name: "Example Network configuration",
          description: "This is an example network configuration generated from your request",
          raw: mockIntentRaw,
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
        });
      } else {
        // Regular response
        addMessage('system', 'I understand you want to work with network intents. You can ask me to generate an intent, edit an existing one, or push an intent to the network.');
      }
    } catch (error) {
      addMessage('error', `An error occurred: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHistory />
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatContainer;
