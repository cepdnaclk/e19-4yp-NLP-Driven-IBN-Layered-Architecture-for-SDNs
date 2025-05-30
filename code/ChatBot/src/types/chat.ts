export type MessageRole = 'user' | 'system' | 'error' | 'intent';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface IntentMessage extends Message {
  role: 'intent';
  intentData: {
    raw: string; // JSON or YAML string
    format: 'json' | 'yaml';
    metadata: {
      timestamp: Date;
      author: string;
      llmVersion: string;
      status: 'draft' | 'validated' | 'simulated' | 'pushed' | 'failed';
    };
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
