import React from 'react';
import Editor from '@monaco-editor/react';
import { useIntent } from '../../contexts/IntentContext';

interface MonacoEditorWrapperProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  readOnly?: boolean;
}

const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  value,
  onChange,
  language,
  readOnly = false
}) => {
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-600 flex justify-between items-center">
        <span className="font-medium text-sm uppercase">{language}</span>
        {readOnly && (
          <span className="text-xs text-gray-500 dark:text-gray-400">Read Only</span>
        )}
      </div>
      <Editor
        height="300px"
        language={language.toLowerCase()}
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          readOnly,
          automaticLayout: true,
          wordWrap: 'on',
          theme: 'vs-dark'
        }}
      />
    </div>
  );
};

export default MonacoEditorWrapper;
