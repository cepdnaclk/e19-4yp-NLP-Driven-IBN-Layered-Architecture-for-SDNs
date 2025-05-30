import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatMessage from './ChatMessage';

const ChatHistory: React.FC = () => {
  const { currentSession } = useChat();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  if (!currentSession) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Start a new conversation to begin
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {currentSession.messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Start a new conversation
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Ask questions about network intents or request the system to generate, edit, or push intents.
            </p>
          </div>
        </div>
      ) : (
        <>
          {currentSession.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatHistory;
