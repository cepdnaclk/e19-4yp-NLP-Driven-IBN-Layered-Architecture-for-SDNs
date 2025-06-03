import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import thumbsDownIcon from '../../assets/thumbs-down.svg';
import thumbsUPIcon from '../../assets/thumbs-up.svg';

interface RatingControlProps {
  value: 'positive' | 'negative' | null;
  onChange: (value: 'positive' | 'negative') => void;
}

const RatingControl: React.FC<RatingControlProps> = ({ value, onChange }) => {
  return (
    <div className="flex justify-center gap-6">
      <button
        type="button"
        onClick={() => onChange('positive')}
        className={`flex flex-col items-center p-3 rounded-md ${
          value === 'positive'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-green-500'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-transparent'
        }`}
      >
        {/* <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"></path>
        </svg> */}
        <img 
          src={thumbsUPIcon} 
          alt="Thumbs down" 
          className="w-8 h-8"
        />
        <span className="mt-1">Thumbs Up</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('negative')}
        className={`flex flex-col items-center p-3 rounded-md ${
          value === 'negative'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-2 border-red-500'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-transparent'
        }`}
      >
        {/* <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z"></path>
        </svg> */}
        <img 
          src={thumbsDownIcon} 
          alt="Thumbs down" 
          className="w-8 h-8"
        />
        <span className="mt-1">Thumbs Down</span>
      </button>
    </div>
  );
};

export default RatingControl;
