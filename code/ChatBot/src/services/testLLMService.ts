// Test script to demonstrate the LLM API request format
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example request matching your sample format
const sampleRequest = {
  "message": "Address: Neluwa,Galle I needd 2 Units",
  "user_id": "user1",
  "chat_history": [
    {
      "role": "user",
      "content": "Give me details about Wireless Mouse"
    },
    {
      "role": "assistant",
      "content": "Here are the details for the **Wireless Mouse**:\n\n- **Description**: Ergonomic wireless mouse.\n- **Price**: $19.99\n- **Stock Available**: 100 units\n\nLet me know if you'd like to place an order or need more information!?"
    },
    {
      "role": "user",
      "content": "I need to buy this"
    },
    {
      "role": "assistant",
      "content": "To place an order for the **Wireless Mouse**, I need the following details:\n\n1. **Quantity**: How many units would you like to purchase?\n2. **Shipping Address**: Where should the order be delivered?\n\nLet me know, and I can proceed with the order for you!"
    }
  ]
};

// Function to test chat endpoint
async function testChatEndpoint() {
  try {
    console.log('Testing chat endpoint...');
    console.log('Request:', JSON.stringify(sampleRequest, null, 2));
    
    const response = await api.post('/chat', sampleRequest);
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Function to test generate-intent endpoint
async function testGenerateIntentEndpoint() {
  try {
    console.log('\nTesting generate-intent endpoint...');
    
    const intentRequest = {
      ...sampleRequest,
      message: "Generate a network intent for web access from office network"
    };
    
    console.log('Request:', JSON.stringify(intentRequest, null, 2));
    
    const response = await api.post('/generate-intent', intentRequest);
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  await testChatEndpoint();
  await testGenerateIntentEndpoint();
}

// Export for use in other files
export { sampleRequest, testChatEndpoint, testGenerateIntentEndpoint };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
