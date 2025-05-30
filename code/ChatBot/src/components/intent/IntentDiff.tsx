import React from 'react';
import type { Intent } from '../../types/intent';

interface DiffViewerProps {
  original: string;
  modified: string;
  format: 'json' | 'yaml';
}

const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified, format }) => {
  // This is a placeholder component that will be enhanced with a proper diff viewer
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
        <h3 className="font-medium">Changes</h3>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Original</h4>
          <pre className="text-sm whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded-md overflow-auto max-h-[300px]">
            {original}
          </pre>
        </div>
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Modified</h4>
          <pre className="text-sm whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded-md overflow-auto max-h-[300px]">
            {modified}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
