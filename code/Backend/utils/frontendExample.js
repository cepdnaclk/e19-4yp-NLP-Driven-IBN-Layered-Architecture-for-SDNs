/**
 * Frontend JavaScript code to handle monitoring dashboard functionality
 * This can be integrated into your existing React/Vue/Angular frontend
 */

class MonitoringDashboard {
  constructor(backendUrl = 'http://localhost:8080') {
    this.backendUrl = backendUrl;
  }

  /**
   * Submit intent and automatically handle monitoring dashboard generation
   */
  async submitIntentWithMonitoring(intent, config) {
    try {
      console.log('📤 Submitting intent with monitoring...');
      
      const response = await fetch(`${this.backendUrl}/api/intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ intent, config })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Intent submitted successfully:', result);

      // If monitoring URLs were generated, open them
      if (result.monitoring && result.monitoring.urls.length > 0) {
        console.log('🔗 Opening monitoring dashboards...');
        this.openMonitoringDashboards(result.monitoring.urls);
      } else {
        console.log('ℹ️ No monitoring dashboards configured for this intent');
      }

      return result;
    } catch (error) {
      console.error('❌ Error submitting intent:', error);
      throw error;
    }
  }

  /**
   * Get dashboard URLs for a specific application
   */
  async getDashboardUrls(application, timeWindow = '30s') {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/monitoring/dashboard/${application}?timeWindow=${timeWindow}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data.urls;
    } catch (error) {
      console.error('❌ Error getting dashboard URLs:', error);
      throw error;
    }
  }

  /**
   * Open monitoring dashboards in new browser tabs
   */
  openMonitoringDashboards(urls) {
    if (!urls || urls.length === 0) {
      console.log('ℹ️ No URLs to open');
      return;
    }

    console.log(`🌐 Opening ${urls.length} monitoring dashboard(s)...`);
    
    urls.forEach((url, index) => {
      setTimeout(() => {
        window.open(url, `_monitoring_${index}`, 'noopener,noreferrer');
        console.log(`🔗 Opened: ${url}`);
      }, index * 500); // Stagger opening to avoid popup blocking
    });
  }

  /**
   * Generate monitoring configuration for existing intent
   */
  async generateMonitoringConfig(config) {
    try {
      const response = await fetch(`${this.backendUrl}/api/monitoring/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error generating monitoring config:', error);
      throw error;
    }
  }

  /**
   * Clean up temporary intent files
   */
  async cleanupIntentFiles(intentId) {
    try {
      const response = await fetch(`${this.backendUrl}/api/monitoring/cleanup/${intentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error cleaning up intent files:', error);
      throw error;
    }
  }
}

// Example usage
async function exampleUsage() {
  const monitoring = new MonitoringDashboard();

  // Example intent with LOGS configuration
  const sampleIntent = "Track any unusual activity on our Database servers.";
  const sampleConfig = {
    "intent_id": "intent_" + Date.now(),
    "user_role": "admin",
    "timestamp": new Date().toISOString(),
    "LOGS": {
      "filters": [
        {
          "ports": "3306,3307",
          "application": "DB",
          "time_window": "30s"
        }
      ]
    }
  };

  try {
    // Submit intent and automatically open monitoring dashboards
    const result = await monitoring.submitIntentWithMonitoring(sampleIntent, sampleConfig);
    console.log('🎉 Intent processing completed:', result);

    // Optional: Clean up after some time
    setTimeout(async () => {
      await monitoring.cleanupIntentFiles(sampleConfig.intent_id);
      console.log('🧹 Cleanup completed');
    }, 300000); // Clean up after 5 minutes

  } catch (error) {
    console.error('💥 Example failed:', error);
  }
}

// For browser environments
if (typeof window !== 'undefined') {
  window.MonitoringDashboard = MonitoringDashboard;
  window.exampleUsage = exampleUsage;
}

// For Node.js environments
if (typeof module !== 'undefined') {
  module.exports = MonitoringDashboard;
}
