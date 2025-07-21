import React from 'react';
import MonitoringButton from './MonitoringButton';

const MonitoringTest: React.FC = () => {
  // Sample URLs from matched_urls.txt
  const sampleUrls = [
    'http://localhost:3000/d/545b4595-0a4e-4ef8-b02c-41e874b63fa3/network-qos-overview?viewPanel=17&from=now-30s&to=now',
    'http://localhost:3000/d/545b4595-0a4e-4ef8-b02c-41e874b63fa3/network-qos-overview?viewPanel=18&from=now-30s&to=now',
    'http://localhost:3000/d/545b4595-0a4e-4ef8-b02c-41e874b63fa3/network-qos-overview?viewPanel=19&from=now-30s&to=now',
    'http://localhost:3000/d/545b4595-0a4e-4ef8-b02c-41e874b63fa3/network-qos-overview?viewPanel=20&from=now-30s&to=now'
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Monitoring Dashboard Test
      </h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            With URLs ({sampleUrls.length} dashboards)
          </h3>
          <MonitoringButton urls={sampleUrls} />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Without URLs (No monitoring available)
          </h3>
          <MonitoringButton urls={[]} />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Disabled State
          </h3>
          <MonitoringButton urls={sampleUrls} disabled />
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">
          Sample URLs that will be opened:
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {sampleUrls.map((url, index) => (
            <li key={index} className="truncate">
              {index + 1}. {url}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MonitoringTest;
