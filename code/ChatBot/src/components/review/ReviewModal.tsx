import React from 'react';
import { useIntent } from '../../contexts/IntentContext';
// import IntentDiff from '../intent/IntentDiff';
import intentService from '../../services/intentService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPushSuccess: () => void;
  onPushError?: (error: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onPushSuccess, onPushError }) => {
  const { currentIntent } = useIntent();
  const [activeTab, setActiveTab] = React.useState<'code' | 'form'>('code');
  const [isPushing, setIsPushing] = React.useState(false);
  const [simulationResult, setSimulationResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const originalIntentRef = React.useRef<string>('');
  
  React.useEffect(() => {
    if (isOpen && currentIntent) {
      originalIntentRef.current = currentIntent.raw;
    }
  }, [isOpen, currentIntent]);

  if (!isOpen || !currentIntent) return null;



  const handlePush = async () => {
    setIsPushing(true);
    setSimulationResult(null); // Clear previous results
    
    try {
      const resp = await intentService.pushIntent(currentIntent.raw);
      console.log('Push result:', resp.success);
      if (resp.success) {
        onPushSuccess();
      } else {
        const errorMessage = resp.message || 'Failed to push intent to the network. Please try again.';
        setSimulationResult({
          success: false,
          message: errorMessage
        });
        // Call the error callback if provided
        if (onPushError) {
          onPushError(errorMessage);
        } else {
          console.log('ReviewModal: onPushError callback not provided');
        }
      }
    } catch (error) {
      const errorMessage = `Push error: ${(error as Error).message}`;
      setSimulationResult({
        success: false,
        message: errorMessage
      });
      // Call the error callback if provided
      if (onPushError) {
        onPushError(errorMessage);
      }
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Review Intent</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
              onClick={() => setActiveTab('code')}
            >
              Code View
            </button>
            {/* <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
              onClick={() => setActiveTab('form')}
            >
              Form View
            </button> */}
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'code' ? (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Intent Code</h3>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto text-sm font-mono text-left">
                {currentIntent.raw}
                </pre>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Intent Form</h3>
              <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                Form-based editing will be implemented with Formik + Yup in the next step.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                      value="Example Network Intent"
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                      rows={3}
                      value="This is an example network intent generated from your request"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* {currentIntent.raw !== originalIntentRef.current && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Changes</h3>
              <IntentDiff
                original={originalIntentRef.current}
                modified={currentIntent.raw}
                format={currentIntent.format}
              />
            </div>
          ) } */}
          
          {simulationResult && (
            <div className={`mb-6 p-4 rounded-lg border ${
              simulationResult.success
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start">
                {simulationResult.success ? (
                  <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    {simulationResult.success ? 'Success' : 'Push Failed'}
                  </h4>
                  <p className="text-sm">{simulationResult.message}</p>
                  {!simulationResult.success && (
                    <button
                      onClick={() => setSimulationResult(null)}
                      className="mt-2 text-xs underline hover:no-underline"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handlePush}
            disabled={isPushing}
            className={`px-4 py-2 rounded-md ${
              isPushing
                ? 'bg-green-400 cursor-not-allowed text-white'
                : simulationResult?.success === false
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPushing ? 'Pushing...' : simulationResult?.success === false ? 'Retry Push' : 'Push Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
