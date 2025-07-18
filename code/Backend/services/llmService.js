import axios from 'axios';

// Configuration for your LLM API (OpenAI, Anthropic, etc.)
const LLM_CONFIG = {
  apiUrl: process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions',
  apiKey: process.env.LLM_API_KEY || 'your-api-key-here',
  model: process.env.LLM_MODEL || 'gpt-3.5-turbo'
};

/**
 * Send chat history and current message to LLM
 * @param {Array} chatHistory - Array of previous messages
 * @param {string} currentMessage - Current user message
 * @param {string} systemPrompt - System prompt for the LLM
 * @returns {Promise<string>} LLM response
 */
export const sendToLLM = async (chatHistory = [], currentMessage, systemPrompt = '') => {
  try {
    // Format messages for LLM API
    const messages = [
      {
        role: 'system',
        content: systemPrompt || 'You are a helpful assistant for network intent management. You can generate, edit, and help with network configurations.'
      },
      // Add chat history
      ...chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      // Add current message
      {
        role: 'user',
        content: currentMessage
      }
    ];

    const response = await axios.post(LLM_CONFIG.apiUrl, {
      model: LLM_CONFIG.model,
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${LLM_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling LLM API:', error);
    throw new Error('Failed to get LLM response');
  }
};

/**
 * Generate network intent using LLM with chat history context
 * @param {Array} chatHistory - Array of previous messages
 * @param {string} userRequest - User's intent generation request
 * @returns {Promise<Object>} Generated intent configuration with reasoning
 */
export const generateIntentWithContext = async (chatHistory = [], userRequest) => {
  try {
    const systemPrompt = `You are a network intent generator. Generate network configurations in JSON format based on user requests. 
    Consider the chat history to understand the context and requirements.
    
    Please provide your response in the following format:
    1. First, provide a brief explanation/reasoning for the intent configuration
    2. Then, provide the JSON configuration wrapped in \`\`\`json and \`\`\`
    
    Generate intents with the following structure:
    {
      "name": "Intent Name",
      "description": "Intent description",
      "source": "source IP/subnet",
      "destination": "destination IP/subnet", 
      "protocol": "TCP/UDP/ICMP/etc",
      "port": port_number,
      "qos": {
        "bandwidth": "bandwidth_requirement",
        "latency": "latency_requirement"
      },
      "security": {
        "encryption": "encryption_type",
        "authentication": "auth_requirement"
      },
      "ACL": {
        "rules": [
          {
            "priority": 40000,
            "source_ip": "source_ip",
            "destination_ip": "destination_ip",
            "protocol": "protocol",
            "action": "ALLOW/DENY"
          }
        ]
      }
    }`;

    const llmResponse = await sendToLLM(chatHistory, userRequest, systemPrompt);
    
    // Extract reasoning and intent from the response
    const jsonMatch = llmResponse.match(/```json\s*([\s\S]*?)\s*```/);
    let intentConfig = null;
    let reasoning = llmResponse;
    
    if (jsonMatch) {
      try {
        intentConfig = JSON.parse(jsonMatch[1]);
        // Remove the JSON part from reasoning
        reasoning = llmResponse.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
      } catch (parseError) {
        console.error('Error parsing JSON from LLM response:', parseError);
      }
    }
    
    // If no JSON found in code blocks, try to extract any JSON
    if (!intentConfig) {
      const fallbackJsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (fallbackJsonMatch) {
        try {
          intentConfig = JSON.parse(fallbackJsonMatch[0]);
          reasoning = llmResponse.replace(fallbackJsonMatch[0], '').trim();
        } catch (parseError) {
          console.error('Error parsing fallback JSON:', parseError);
        }
      }
    }
    
    // Fallback if no JSON found
    if (!intentConfig) {
      intentConfig = {
        name: "Generated Intent",
        description: "Intent generated from: " + userRequest,
        error: "Could not parse intent configuration from LLM response"
      };
    }
    
    return {
      intent: intentConfig,
      reasoning: reasoning || "No reasoning provided"
    };
  } catch (error) {
    console.error('Error generating intent:', error);
    throw new Error('Failed to generate intent');
  }
};

export default {
  sendToLLM,
  generateIntentWithContext
};
