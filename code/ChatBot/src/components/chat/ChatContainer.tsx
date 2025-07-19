import React from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useChat } from '../../contexts/ChatContext';
import { useIntent } from '../../contexts/IntentContext';
import { chatService } from '../../services/chatService';

const ChatContainer: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { currentSession, addMessage, addIntentMessage } = useChat();
  const { setCurrentIntent } = useIntent();

  const handleSendMessage = async (message: string) => {
    if (!currentSession) return;
    
    // Get current chat history BEFORE adding the user message
    const chatHistory = currentSession.messages;
    
    // Add user message to chat
    addMessage('user', message);
    
    // Simulate LLM processing
    setIsLoading(true);
    
    try {
        
        // Add system message
        addMessage('system', 'I\'m processing your request...');
        
        // Generate intent using the service with chat history
        const intentMessage = await chatService.generateIntent(message, chatHistory, 'admin');
        
        // Add intent message
        addIntentMessage(intentMessage.content, intentMessage.intentData);
        console.log('Intent generated:', intentMessage);
        // Set current intent in context
        setCurrentIntent({
          id: Math.random().toString(36).substring(2, 9),
          name: "Network configuration",
          description: "This is a network configuration generated from your request",
          raw: intentMessage.intentData.raw,
          format: intentMessage.intentData.format,
          metadata: intentMessage.intentData.metadata,
          validationStatus: {
            isValid: true,
            errors: []
          }
        });
      
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
