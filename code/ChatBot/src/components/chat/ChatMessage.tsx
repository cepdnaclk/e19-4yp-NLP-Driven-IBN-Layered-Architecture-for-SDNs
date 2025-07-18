import React from 'react';
import type { Message as MessageType, IntentMessage as IntentMessageType } from '../../types/chat';
import { useIntent } from '../../contexts/IntentContext';

interface MessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<MessageProps> = ({ message }) => {
  const { setCurrentIntent } = useIntent();
  const isIntent = message.role === 'intent';
  const intentMessage = isIntent ? message as IntentMessageType : null;

  const handleEditConfiguration = () => {
    if (intentMessage) {
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
    }
  };

  return (
    <div 
      className={`p-4 mb-4 rounded-lg ${
        message.role === 'user' 
          ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' 
          : message.role === 'system' 
            ? 'bg-gray-50 dark:bg-gray-800 mr-8' 
            : message.role === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 mr-8'
              : 'bg-green-50 dark:bg-green-900/20 mr-8'
      }`}
    >
      <div className="flex items-start">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
          message.role === 'user' 
            ? 'bg-blue-600' 
            : message.role === 'system' 
              ? 'bg-gray-600' 
              : message.role === 'error'
                ? 'bg-red-600'
                : 'bg-green-600'
        }`}>
          {message.role === 'user' ? (
            <span className="text-white text-sm">U</span>
          ) : message.role === 'system' ? (
            <span className="text-white text-sm">AI</span>
          ) : message.role === 'error' ? (
            <span className="text-white text-sm">!</span>
          ) : (
            <span className="text-white text-sm">I</span>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {message.role === 'user' 
              ? 'You' 
              : message.role === 'system' 
                ? 'Assistant' 
                : message.role === 'error'
                  ? 'Error'
                  : 'Generated Intent'}
            <span className="ml-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          
          {isIntent && intentMessage ? (
            <div>
              {/* Display reasoning/explanation */}
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Reasoning:
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              
              {/* Display intent configuration */}
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Intent Configuration:
                </h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-gray-50 dark:bg-gray-800 overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap text-left">
                    {intentMessage.intentData.raw}
                  </pre>
                </div>
              </div>
              
              {/* Display additional reasoning if available */}
              {intentMessage.intentData.reasoning && intentMessage.intentData.reasoning !== message.content && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Additional Details:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {intentMessage.intentData.reasoning}
                  </p>
                </div>
              )}
              
              <div className="mt-2 flex gap-2">
                <button 
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleEditConfiguration}
                >
                  Edit Configuration
                </button>
                {/* <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                  Reset
                </button> */}
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
