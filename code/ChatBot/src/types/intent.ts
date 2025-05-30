export interface Intent {
  id: string;
  name: string;
  description: string;
  raw: string; // JSON or YAML string
  format: 'json' | 'yaml';
  metadata: {
    timestamp: Date;
    author: string;
    llmVersion: string;
    status: 'draft' | 'validated' | 'simulated' | 'pushed' | 'failed';
  };
  validationStatus: {
    isValid: boolean;
    errors: ValidationError[];
  };
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface IntentVersion {
  id: string;
  intentId: string;
  raw: string;
  format: 'json' | 'yaml';
  timestamp: Date;
  author: string;
  comment: string;
}

export interface IntentHistory {
  id: string;
  summary: string;
  timestamp: Date;
  status: 'draft' | 'validated' | 'simulated' | 'pushed' | 'failed';
  versions: IntentVersion[];
}
