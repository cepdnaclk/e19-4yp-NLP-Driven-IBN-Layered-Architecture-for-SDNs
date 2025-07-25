import React from 'react';
import { useIntent } from '../../contexts/IntentContext';
import IntentMetadata from './IntentMetadata';
import ValidationPanel from './ValidationPanel';
import MonacoEditorWrapper from './MonacoEditorWrapper';

const IntentEditor: React.FC = () => {
  const { 
    currentIntent, 
    updateIntentRaw, 
    validateIntent, 
    resetIntent 
  } = useIntent();

  const [isEditing, setIsEditing] = React.useState(false);

  if (!currentIntent) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          No configuration selected. Generate a configuration from the chat to begin.
        </p>
      </div>
    );
  }else{
    // currentIntent.validationStatus.isValid = true; // Ensure validation status is valid for initial render
  }


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    await validateIntent();
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetIntent();
    setIsEditing(false);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {

      updateIntentRaw(value);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {currentIntent.name || 'Network Intent'}
        </h2>
        <div className="flex gap-2">
          
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={resetIntent}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      <IntentMetadata intent={currentIntent} />

      <div className="mb-6">
        <MonacoEditorWrapper
          value={currentIntent.raw}
          onChange={handleEditorChange}
          language={currentIntent.format}
          readOnly={!isEditing}
        />
      </div>

      <ValidationPanel
        errors={currentIntent.validationStatus.errors}
        isValid={currentIntent.validationStatus.isValid}
      />
    </div>
  );
};

export default IntentEditor;
