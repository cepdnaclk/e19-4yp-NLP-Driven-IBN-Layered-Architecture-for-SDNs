import React from 'react';
import { useChat } from '../../contexts/ChatContext';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading = false }) => {
  const [message, setMessage] = React.useState('');
  const { currentSession } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 ">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 ">
          <textarea
            className="w-full p-3 overflow-auto border border-gray-300 dark:color-gray-600 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
            placeholder="Type your message..."
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading || !currentSession}
          />
        </div>
        <button
          type="submit"
          className={`px-4 py-3 rounded-md my-7 ${
            isLoading || !message.trim() || !currentSession
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          disabled={isLoading || !message.trim() || !currentSession}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
