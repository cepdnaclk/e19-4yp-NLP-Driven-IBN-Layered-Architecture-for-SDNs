import React from 'react';
import type { IntentVersion } from '../../types/intent';

interface VersionListProps {
  versions: IntentVersion[];
  currentVersionId: string;
  onSelect: (version: IntentVersion) => void;
  onRevert: (version: IntentVersion) => void;
}

const VersionList: React.FC<VersionListProps> = ({ 
  versions, 
  currentVersionId, 
  onSelect, 
  onRevert 
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">Version History</h3>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {versions.length === 0 ? (
          <li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No version history available
          </li>
        ) : (
          versions.map((version) => (
            <li 
              key={version.id} 
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                version.id === currentVersionId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(version.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Author: {version.author}
                  </p>
                  {version.comment && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {version.comment}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelect(version)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                  {version.id !== currentVersionId && (
                    <button
                      onClick={() => onRevert(version)}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Revert
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default VersionList;
