#!/usr/bin/env node

/**
 * Demo script to test monitoring functionality end-to-end
 */

import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';

// Sample intent with LOGS configuration for testing
const sampleIntentWithLogs = {
  intent: "Monitor database server activity for security analysis",
  config: {
    intent_id: `demo_intent_${Date.now()}`,
    user_role: "admin",
    timestamp: new Date().toISOString(),
    LOGS: {
      filters: [
        {
          ports: "3306,3307,5432",
          application: "DB",
          time_window: "30s"
        }
      ]
    },
    // Optional: Add other configurations
    ACL: {
      rules: [
        {
          priority: 40000,
          source_ip: "192.168.1.0/24",
          destination_ip: "10.0.0.5",
          destination_port: 3306,
          protocols: ["TCP"],
          action: "ALLOW"
        }
      ]
    }
  }
};

async function testMonitoringWorkflow() {
  console.log('🧪 Testing Monitoring Workflow...\n');
  
  try {
    console.log('📤 Submitting intent with LOGS configuration...');
    console.log('Intent Configuration:');
    console.log(JSON.stringify(sampleIntentWithLogs, null, 2));
    console.log('\n');

    const response = await axios.post(`${BACKEND_URL}/api/intents`, sampleIntentWithLogs, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Intent submitted successfully!');
    console.log('Backend Response:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.monitoring) {
      const { urls, configGenerated } = response.data.monitoring;
      console.log(`\n🔗 Monitoring Configuration:`);
      console.log(`   Config Generated: ${configGenerated}`);
      console.log(`   Number of URLs: ${urls.length}`);
      
      if (urls.length > 0) {
        console.log('\n📊 Monitoring Dashboard URLs:');
        urls.forEach((url, index) => {
          console.log(`   ${index + 1}. ${url}`);
        });
        
        console.log('\n💡 These URLs would be opened in the frontend when clicking "Monitor" button');
      } else {
        console.log('\n⚠️  No monitoring URLs generated');
      }
    } else {
      console.log('\n⚠️  No monitoring configuration in response');
    }

  } catch (error) {
    console.error('❌ Test failed:');
    
    if (axios.isAxiosError(error)) {
      console.error(`   HTTP ${error.response?.status}: ${error.response?.statusText}`);
      console.error(`   Error: ${error.response?.data?.error || error.message}`);
      
      if (error.response?.status === 404) {
        console.error('   💡 Make sure the backend server is running on port 8080');
      }
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

async function testMonitoringEndpoints() {
  console.log('\n🧪 Testing Monitoring-Specific Endpoints...\n');
  
  try {
    // Test direct monitoring config generation
    console.log('📤 Testing direct monitoring config generation...');
    const monitoringResponse = await axios.post(`${BACKEND_URL}/api/monitoring/generate`, {
      config: sampleIntentWithLogs.config
    });
    
    console.log('✅ Direct monitoring generation successful!');
    console.log(JSON.stringify(monitoringResponse.data, null, 2));
    
    // Test dashboard URL retrieval
    console.log('\n📤 Testing dashboard URL retrieval...');
    const dashboardResponse = await axios.get(`${BACKEND_URL}/api/monitoring/dashboard/DB?timeWindow=1m`);
    
    console.log('✅ Dashboard URL retrieval successful!');
    console.log(JSON.stringify(dashboardResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Monitoring endpoint test failed:');
    if (axios.isAxiosError(error)) {
      console.error(`   HTTP ${error.response?.status}: ${error.response?.statusText}`);
      console.error(`   Error: ${error.response?.data?.error || error.message}`);
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

// Run the tests
console.log('🚀 Starting Monitoring Integration Demo\n');
console.log('Prerequisites:');
console.log('   - Backend server running on http://localhost:8080');
console.log('   - TopologySetup scripts available');
console.log('   - Monitoring configuration files in place');
console.log('   - Bash available for script execution\n');

await testMonitoringWorkflow();
await testMonitoringEndpoints();

console.log('\n🎉 Demo completed!');
console.log('\n💡 Next steps:');
console.log('   1. Test the frontend by creating an intent with LOGS configuration');
console.log('   2. Push the intent and observe the "Monitor" button');
console.log('   3. Click the Monitor button to open dashboard URLs');
console.log('   4. Verify dashboards open correctly in new tabs');
