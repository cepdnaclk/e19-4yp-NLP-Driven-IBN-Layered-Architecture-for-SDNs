import React from 'react';
import type { Intent } from '../../types/intent';

interface IntentMetadataProps {
  intent: Intent;
}

const IntentMetadata: React.FC<IntentMetadataProps> = ({ intent }) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'validated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'simulated':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'pushed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4 text-sm">
      <div className="flex items-center">
        <span className="text-gray-500 dark:text-gray-400 mr-2">Created:</span>
        <span className="font-medium">
          {new Date(intent.metadata.timestamp).toLocaleString()}
        </span>
      </div>
      
      <div className="flex items-center">
        <span className="text-gray-500 dark:text-gray-400 mr-2">Author:</span>
        <span className="font-medium">{intent.metadata.author}</span>
      </div>
      
      <div className="flex items-center">
        <span className="text-gray-500 dark:text-gray-400 mr-2">LLM Version:</span>
        <span className="font-medium">{intent.metadata.llmVersion}</span>
      </div>
      
      <div className="flex items-center">
        <span className="text-gray-500 dark:text-gray-400 mr-2">Status:</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(intent.metadata.status)}`}>
          {intent.metadata.status.charAt(0).toUpperCase() + intent.metadata.status.slice(1)}
        </span>
      </div>
      
      <div className="flex items-center">
        <span className="text-gray-500 dark:text-gray-400 mr-2">Format:</span>
        <span className="font-medium uppercase">{intent.format}</span>
      </div>
    </div>
  );
};

export default IntentMetadata;
