import React, { useState, useEffect } from 'react';
import ChatContainer from '../components/chat/ChatContainer';
import IntentEditor from '../components/intent/IntentEditor';
import ReviewModal from '../components/review/ReviewModal';
import FeedbackForm from '../components/feedback/FeedbackForm';
import { useChat } from '../contexts/ChatContext';
import { useIntent } from '../contexts/IntentContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const ChatPage: React.FC = () => {
  const { currentSession, createSession } = useChat();
  const { currentIntent, setCurrentIntent } = useIntent();
  const { user } = useAuth();
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [intentPushed, setIntentPushed] = useState(false);
  
  // Create a new chat session if none exists
  useEffect(() => {
    if (!currentSession) {
      createSession();
    }
  }, [currentSession, createSession]);
  
  // Handle review button click
  const handleReviewIntent = () => {
    if (currentIntent) {
      setIsReviewModalOpen(true);
    }
  };
  
  // Handle successful intent push
  const handleIntentPushed = () => {
    setIsReviewModalOpen(false);
    setIntentPushed(true);
    setTimeout(() => {
      setIsFeedbackModalOpen(true);
    }, 1000);
  };
  
  // Handle feedback submission
  const handleFeedbackSubmit = async (rating: 'positive' | 'negative', comment: string) => {
    if (currentIntent) {
      await authService.submitFeedback(currentIntent.id, rating, comment);
    }
    setIsFeedbackModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Network Intent Chatbot</h1>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                  Logged in as <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                </div>
              )}
              <button className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
                <svg className="h-5 w-5 text-gray-500 dark:text-gray-00" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex h-full py-6">
            <div className="w-1/2 pr-3 flex flex-col h-full">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Chat</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ask the assistant to generate or modify network intents
                  </p>
                </div>
                <ChatContainer />
              </div>
            </div>
            
            <div className="w-1/2 pl-3 flex flex-col h-full">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 ">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Intent Editor</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View, edit, and validate network intents
                    </p>
                  </div>
                  {currentIntent && (
                    <button
                      onClick={handleReviewIntent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Review & Push
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-auto">
                  <IntentEditor />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Success Message */}
      {intentPushed && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md">
          <div className="flex items-center">
            <svg className="h- w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>Intent successfully pushed to the network!</p>
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)}
          onPushSuccess={handleIntentPushed}
        />
      )}
      
      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <FeedbackForm
          intentId={currentIntent?.id || ''}
          onSubmit={handleFeedbackSubmit}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;
