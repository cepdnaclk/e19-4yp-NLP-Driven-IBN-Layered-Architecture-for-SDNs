import React, { useState, useEffect } from 'react';
import ChatContainer from '../components/chat/ChatContainer';
import IntentEditor from '../components/intent/IntentEditor';
import ReviewModal from '../components/review/ReviewModal';
import MonitoringButton from '../components/common/MonitoringButton';
// import FeedbackForm from '../components/feedback/FeedbackForm';
import { useChat } from '../contexts/ChatContext';
import { useIntent } from '../contexts/IntentContext';
import { useAuth } from '../contexts/AuthContext';
// import { authService } from '../services/authService';

const ChatPage: React.FC = () => {
  const { currentSession, createSession } = useChat();
  const { currentIntent } = useIntent();
  const { user } = useAuth();
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  // const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [intentPushed, setIntentPushed] = useState(false);
  const [intentPushError, setIntentPushError] = useState<string | null>(null);
  const [monitoringUrls, setMonitoringUrls] = useState<string[]>([]);
  
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
  const handleIntentPushed = (urls?: string[]) => {
    setIsReviewModalOpen(false);
    setIntentPushed(true);
    setIntentPushError(null); // Clear any previous errors
    
    // Store monitoring URLs if provided
    if (urls && urls.length > 0) {
      setMonitoringUrls(urls);
    } else {
      setMonitoringUrls([]);
    }
    
    // Hide success message after 5 seconds (longer to allow monitoring access)
    setTimeout(() => {
      setIntentPushed(false);
    }, 5000);
    // setTimeout(() => {
    //   setIsFeedbackModalOpen(true);
    // }, 1000);
  };

  // Handle failed intent push
  const handleIntentPushError = (error: string) => {
    console.log('handleIntentPushError called with:', error);
    setIntentPushError(error);
    // Hide error message after 5 seconds
    setTimeout(() => {
      setIntentPushError(null);
    }, 5000);
  };
  
  // Handle feedback submission (commented out for now)
  // const handleFeedbackSubmit = async (rating: 'positive' | 'negative', comment: string) => {
  //   if (currentIntent) {
  //     await authService.submitFeedback(currentIntent.id, rating, comment);
  //   }
  //   setIsFeedbackModalOpen(false);
  // };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 animate-gradient-shift"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse-slower"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-green-400/8 to-blue-400/8 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>
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
      <main className="flex-1 overflow-hidden relative">
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
                  {currentIntent ? (
                    <button
                      onClick={handleReviewIntent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Review & Push
                    </button>
                  ):
                  (<div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Configuration Editor</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Edit , save, and push network intents to the network.
                    </p>
                  </div>)
                  }
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
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 transition-all duration-300 max-w-md">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Intent successfully pushed to the network!</p>
              {monitoringUrls.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600 mb-2">
                    {monitoringUrls.length} monitoring dashboard(s) available
                  </p>
                  <MonitoringButton 
                    urls={monitoringUrls} 
                    className="text-sm"
                  />
                </div>
              )}
            </div>
            <button 
              onClick={() => setIntentPushed(false)}
              className="ml-2 text-green-500 hover:text-green-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {intentPushError !== null && (
        <div className={`fixed ${intentPushed ? 'bottom-20' : 'bottom-4'} right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 transition-all duration-300`}>
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p>Failed to push intent to the network: {intentPushError}</p>
            <button 
              onClick={() => setIntentPushError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal 
          isOpen={isReviewModalOpen} 
          onClose={() => setIsReviewModalOpen(false)}
          onPushSuccess={handleIntentPushed}
          onPushError={handleIntentPushError}
        />
      )}
      
      {/* Feedback Modal */}
      {/* {isFeedbackModalOpen && (
        <FeedbackForm
          intentId={currentIntent?.id || ''}
          onSubmit={handleFeedbackSubmit}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      )} */}
    </div>
  );
};

export default ChatPage;
