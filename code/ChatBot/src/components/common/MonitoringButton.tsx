import React, { useState } from 'react';

interface MonitoringButtonProps {
  urls: string[];
  className?: string;
  disabled?: boolean;
}

const MonitoringButton: React.FC<MonitoringButtonProps> = ({ 
  urls, 
  className = '', 
  disabled = false 
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenMonitoring = async () => {
    if (urls.length === 0 || disabled) return;
    
    setIsOpening(true);
    
    try {
      console.log(`Opening ${urls.length} monitoring dashboard(s)...`);
      
      // Open each URL in a new tab with a slight delay to prevent popup blocking
      urls.forEach((url, index) => {
        setTimeout(() => {
          window.open(url, `_monitoring_${Date.now()}_${index}`, 'noopener,noreferrer');
          console.log(`Opened monitoring dashboard: ${url}`);
        }, index * 300); // 300ms delay between each tab
      });
      
    } catch (error) {
      console.error('Error opening monitoring dashboards:', error);
    } finally {
      setTimeout(() => setIsOpening(false), 1500);
    }
  };

  if (urls.length === 0) {
    return (
      <button
        disabled
        className={`px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed ${className}`}
      >
        No Monitoring Available
      </button>
    );
  }

  return (
    <button
      onClick={handleOpenMonitoring}
      disabled={disabled || isOpening}
      className={`px-4 py-2 rounded-md transition-colors ${
        disabled || isOpening
          ? 'bg-blue-400 cursor-not-allowed text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${className}`}
      title={`Open ${urls.length} monitoring dashboard(s)`}
    >
      {isOpening ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Opening...
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Monitor ({urls.length})
        </div>
      )}
    </button>
  );
};

export default MonitoringButton;
