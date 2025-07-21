#!/usr/bin/env node

/**
 * Test script for monitoring dashboard functionality
 * Usage: node testMonitoring.js
 */

import { generateMonitoringConfig, getDashboardUrls } from '../services/monitoringService.js';

// Test configuration similar to the sample intent
const testConfig = {
  "intent_id": "test_intent_" + Date.now(),
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

async function testMonitoringService() {
  console.log('🧪 Testing Monitoring Service...\n');
  
  try {
    console.log('📋 Test Configuration:');
    console.log(JSON.stringify(testConfig, null, 2));
    console.log('\n');

    console.log('🔄 Generating monitoring configuration...');
    const result = await generateMonitoringConfig(testConfig);
    
    console.log('✅ Monitoring configuration generated successfully!');
    console.log('📁 Intent JSON Path:', result.intentJsonPath);
    console.log('🔗 Monitoring URLs:');
    result.monitoringUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });
    
    if (result.scriptOutput) {
      console.log('\n📜 Script Output:');
      console.log('STDOUT:', result.scriptOutput.stdout);
      if (result.scriptOutput.stderr) {
        console.log('STDERR:', result.scriptOutput.stderr);
      }
    }

    console.log('\n🌐 Testing direct URL retrieval...');
    const directUrls = await getDashboardUrls('DB', '1m');
    console.log('🔗 Direct URLs for DB application:');
    directUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testMonitoringService();
