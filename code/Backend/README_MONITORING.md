# Monitoring Dashboard Integration

This document explains how to use the monitoring dashboard functionality that automatically generates and opens monitoring URLs when pushing intents with LOGS configuration.

## Overview

When an intent is submitted with `LOGS` configuration, the backend will:
1. Process the intent through ONOS
2. Generate a JSON configuration file
3. Execute the `02_intent_pull_logs.sh` script
4. Return monitoring dashboard URLs
5. Frontend can automatically open these URLs

## Backend API Endpoints

### 1. Submit Intent with Monitoring (Enhanced)
**POST** `/api/intents`

```json
{
  "intent": "Track any unusual activity on our Database servers.",
  "config": {
    "intent_id": "intent_203",
    "user_role": "admin",
    "timestamp": "2025-07-17T09:10:00Z",
    "LOGS": {
      "filters": [
        {
          "ports": "3306,3307",
          "application": "DB",
          "time_window": "30s"
        }
      ]
    }
  }
}
```

**Response:**
```json
{
  "message": "Configuration processed successfully",
  "intent_id": "intent_203",
  "monitoring": {
    "urls": [
      "http://localhost:3000/d/545b4595-0a4e-4ef8-b02c-41e874b63fa3/network-qos-overview?viewPanel=17&from=now-30s&to=now",
      "http://localhost:3000/d/545b4595-0a4e-4ef8-b02c-41e874b63fa3/network-qos-overview?viewPanel=18&from=now-30s&to=now"
    ],
    "configGenerated": true
  }
}
```

### 2. Generate Monitoring Configuration
**POST** `/api/monitoring/generate`

Explicitly generate monitoring configuration for an intent.

### 3. Get Dashboard URLs
**GET** `/api/monitoring/dashboard/:application?timeWindow=30s`

Get dashboard URLs for a specific application.

### 4. Open Dashboard URLs
**POST** `/api/monitoring/open`

Prepare URLs for opening (returns URLs for client-side handling).

### 5. Cleanup Intent Files
**DELETE** `/api/monitoring/cleanup/:intentId`

Clean up temporary intent JSON files.

## File Structure

```
Backend/
├── services/
│   └── monitoringService.js     # Core monitoring functionality
├── routes/
│   ├── intents.js              # Enhanced with monitoring
│   └── monitoring.js           # Dedicated monitoring routes
└── utils/
    ├── testMonitoring.js       # Test script
    └── frontendExample.js      # Frontend integration example
```

## Configuration Requirements

### Intent Configuration
For monitoring to work, your intent must include a `LOGS` section:

```json
{
  "config": {
    "LOGS": {
      "filters": [
        {
          "application": "DB",          // Application name to match
          "time_window": "30s",         // Time window (30s, 5m, 1h, etc.)
          "ports": "3306,3307"          // Optional: specific ports
        }
      ]
    }
  }
}
```

### Required Files
- `TopologySetup/04_utilityScripts/logs_pull/02_intent_pull_logs.sh`
- `TopologySetup/04_utilityScripts/logs_pull/panel_links.csv`
- `TopologySetup/04_utilityScripts/logs_pull/matched_urls.txt` (generated)

## Usage Examples

### Backend Test
```bash
cd Backend/utils
node testMonitoring.js
```

### Frontend Integration
```javascript
const monitoring = new MonitoringDashboard('http://localhost:8080');

// Submit intent with automatic monitoring
const result = await monitoring.submitIntentWithMonitoring(intent, config);

// The monitoring URLs will automatically open in new tabs
```

### Direct Dashboard Access
```javascript
const monitoring = new MonitoringDashboard();

// Get dashboard URLs for specific application
const urls = await monitoring.getDashboardUrls('DB', '1m');

// Open the dashboards
monitoring.openMonitoringDashboards(urls);
```

## Error Handling

- If LOGS configuration is missing, monitoring will be skipped (not failed)
- Script execution errors are logged but don't fail the intent submission
- Invalid configurations return appropriate HTTP error codes
- Temporary files are cleaned up automatically

## Security Considerations

- URLs are validated before opening
- Intent files are stored in a controlled directory
- Cleanup functionality prevents file accumulation
- Background processes are properly managed

## Troubleshooting

### Common Issues
1. **Script not found**: Ensure `02_intent_pull_logs.sh` exists and is executable
2. **No URLs generated**: Check `panel_links.csv` contains matching applications
3. **Permission errors**: Ensure write permissions in logs_pull directory
4. **Bash not found**: Ensure bash is available in system PATH

### Debug Steps
1. Check backend console for detailed logs
2. Verify intent JSON file is generated correctly
3. Run script manually to test functionality
4. Check `matched_urls.txt` for generated URLs

## Performance Notes

- Script execution is asynchronous and non-blocking
- Multiple URLs open with staggered timing to avoid popup blocking
- Temporary files are cleaned up automatically
- Background processes are monitored for completion
