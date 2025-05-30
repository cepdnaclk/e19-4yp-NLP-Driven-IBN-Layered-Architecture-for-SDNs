import React from 'react';
import type { ValidationError } from '../../types/intent';

interface ValidationPanelProps {
  errors: ValidationError[];
  isValid: boolean;
  onOptimize: () => void;
  onImproveQoS: () => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ 
  errors, 
  isValid, 
  onOptimize, 
  onImproveQoS 
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className={`p-3 ${isValid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <div className="flex items-center">
          {isValid ? (
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          )}
          <h3 className={`font-medium ${isValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
            {isValid ? 'Intent is valid' : 'Intent has validation errors'}
          </h3>
        </div>
      </div>
      
      {errors.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Validation Issues:</h4>
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className={`inline-block w-2 h-2 rounded-full mt-1.5 mr-2 ${error.severity === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                <div>
                  <span className="font-medium">{error.path}: </span>
                  <span>{error.message}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions:</h4>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onOptimize}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Optimize Intent
          </button>
          <button 
            onClick={onImproveQoS}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
          >
            Improve QoS
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;
