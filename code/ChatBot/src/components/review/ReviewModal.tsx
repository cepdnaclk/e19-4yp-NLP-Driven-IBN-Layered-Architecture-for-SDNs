import React from 'react';
import { useIntent } from '../../contexts/IntentContext';
import IntentDiff from '../intent/IntentDiff';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPushSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onPushSuccess }) => {
  const { currentIntent, simulateIntent, pushIntent } = useIntent();
  const [activeTab, setActiveTab] = React.useState<'code' | 'form'>('code');
  const [isSimulating, setIsSimulating] = React.useState(false);
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

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    
    try {
      const success = await simulateIntent();
      setSimulationResult({
        success,
        message: success 
          ? 'Simulation successful. The intent is valid and can be pushed to the network.'
          : 'Simulation failed. Please check the intent for errors.'
      });
    } catch (error) {
      setSimulationResult({
        success: false,
        message: `Simulation error: ${(error as Error).message}`
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    
    try {
      const success = await pushIntent();
      if (success) {
        onPushSuccess();
      } else {
        setSimulationResult({
          success: false,
          message: 'Failed to push intent to the network. Please try again.'
        });
      }
    } catch (error) {
      setSimulationResult({
        success: false,
        message: `Push error: ${(error as Error).message}`
      });
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
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
              onClick={() => setActiveTab('form')}
            >
              Form View
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'code' ? (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Intent Code</h3>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto text-sm font-mono">
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
          
          {currentIntent.raw !== originalIntentRef.current && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Changes</h3>
              <IntentDiff
                original={originalIntentRef.current}
                modified={currentIntent.raw}
                format={currentIntent.format}
              />
            </div>
          )}
          
          {simulationResult && (
            <div className={`mb-6 p-4 rounded-md ${
              simulationResult.success
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}>
              <div className="flex items-start">
                {simulationResult.success ? (
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                )}
                <p>{simulationResult.message}</p>
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
            onClick={handleSimulate}
            disabled={isSimulating || isPushing}
            className={`px-4 py-2 rounded-md ${
              isSimulating
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isSimulating ? 'Simulating...' : 'Simulate'}
          </button>
          <button
            onClick={handlePush}
            disabled={isPushing || isSimulating || (simulationResult?.success === false)}
            className={`px-4 py-2 rounded-md ${
              isPushing || isSimulating || (simulationResult?.success === false)
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPushing ? 'Pushing...' : 'Push Intent'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
