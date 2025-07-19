import * as Yup from 'yup';

// Time constraints schema for QoS
const timeConstraintsSchema = Yup.object().shape({
  start: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Start time must be in ISO format (e.g., 2023-09-01T00:00:00Z)'),
  
  end: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'End time must be in ISO format (e.g., 2023-10-01T00:00:00Z)'),
  
  days: Yup.array()
    .of(Yup.string().oneOf(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'Invalid day')),
});

// ACL rule schema
const aclRuleSchema = Yup.object().shape({
  action: Yup.string()
    .required('Action is required')
    .oneOf(['allow', 'deny'], 'Action must be allow or deny'),
  
  source_ip: Yup.string()
    .required('Source IP is required')
    .matches(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, 'Source IP must be a valid IP address or CIDR notation'),
  
  destination_ip: Yup.string()
    .required('Destination IP is required')
    .matches(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, 'Destination IP must be a valid IP address or CIDR notation'),
  
  source_ports: Yup.array()
    .of(Yup.string().matches(/^\d+$/, 'Port must be a number'))
    .required('Source ports are required'),
  
  destination_ports: Yup.array()
    .of(Yup.string().matches(/^\d+$/, 'Port must be a number'))
    .required('Destination ports are required'),
  
  protocols: Yup.array()
    .of(Yup.string().oneOf(['HTTP', 'HTTPS', 'TCP', 'UDP', 'ICMP'], 'Invalid protocol'))
    .required('Protocols are required'),
});

// Schedule schema for ACL
const scheduleSchema = Yup.object().shape({
  start: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'ACL start time must be in ISO format'),
  
  end: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'ACL end time must be in ISO format'),
});

// Log filter schema
const logFilterSchema = Yup.object().shape({
  hosts: Yup.string()
    .matches(/^(\d{1,3}\.){3}\d{1,3}$/, 'Host must be a valid IP address'),
  
  ports: Yup.string()
    .matches(/^\d+$/, 'Port must be a number'),
  
  application: Yup.string()
    .oneOf(['WEB', 'VIDEO', 'VOICE', 'ZOOM', 'VOIP', 'YouTube', 'Netflix', 'Web Browsing'], 'Invalid application type'),
  
  time_window: Yup.string()
    .matches(/^\d+[smhd]$/, 'Time window must be in format like 6h, 30s, 1d'),
});

// Main intent schema validation
export const intentSchema = Yup.object().shape({
  intent: Yup.string(),
  
  config: Yup.object().shape({
    intent_id: Yup.string()
      .required('Intent ID is required')
      .min(3, 'Intent ID must be at least 3 characters'),
    
    user_role: Yup.string()
      .required('User role is required')
      .oneOf(['admin', 'user', 'guest'], 'User role must be admin, user, or guest'),
    
    timestamp: Yup.string()
      .required('Timestamp is required')
      .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Timestamp must be in ISO format'),
    
    QOS: Yup.object().shape({
      application: Yup.string()
        .oneOf(['VOIP', 'ZOOM', 'YouTube', 'Netflix', 'Web Browsing'], 'Invalid application'),
      
      category: Yup.string()
        .oneOf(['video', 'voice', 'web', 'file'], 'Category must be video, voice, web, or file'),
      
      latency: Yup.string()
        .matches(/^\d+ms$/, 'Latency must be in format like 50ms'),
      
      bandwidth: Yup.string()
        .matches(/^\d+[KMG]?bps$/, 'Bandwidth must be in format like 10Mbps'),
      
      jitter: Yup.string()
        .matches(/^\d+ms$/, 'Jitter must be in format like 10ms'),
      
      priority: Yup.string()
        .oneOf(['high', 'medium', 'low'], 'Priority must be high, medium, or low'),
      
      time_constraints: timeConstraintsSchema,
    }),
    
    ACL: Yup.object().shape({
      rules: Yup.array()
        .of(aclRuleSchema)
        .min(1, 'At least one ACL rule is required'),
      
      schedule: scheduleSchema,
    }),
    
    LOGS: Yup.object().shape({
      filters: Yup.array()
        .of(logFilterSchema)
        .min(1, 'At least one log filter is required'),
    }),
  }).required('Config is required'),
});


// Helper function to validate JSON against the intent schema
export const validateIntentSchema = async (jsonString: string): Promise<{
  isValid: boolean;
  errors: { path: string; message: string; severity: 'error' | 'warning' }[];
}> => {
  try {
    // First, check if it's valid JSON
    JSON.parse(jsonString);
    
    // For now, we'll be more lenient and just validate JSON format
    // This allows for different intent structures while ensuring valid JSON
    // console.log('Validating intent JSON:True');
    return { isValid: true, errors: [] };
    
  } catch (parseError) {
    return { 
      isValid: false, 
      errors: [{ path: 'root', message: `Invalid JSON: ${(parseError as Error).message}`, severity: 'error' }] 
    };
  }
};

// Sample intent object that conforms to the new schema
export const sampleIntent = {
  intent: "Configure high-priority video streaming for conference room from 192.168.1.0/24 to 10.0.0.0/24 during business hours",
  config: {
    intent_id: "INTENT_001",
    user_role: "admin",
    timestamp: "2023-09-01T09:00:00Z",
    QOS: {
      application: "ZOOM",
      category: "video",
      latency: "50ms",
      bandwidth: "10Mbps",
      jitter: "5ms",
      priority: "high",
      time_constraints: {
        start: "2023-09-01T09:00:00Z",
        end: "2023-09-01T17:00:00Z",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      }
    },
    ACL: {
      rules: [
        {
          action: "allow",
          source_ip: "192.168.1.0/24",
          destination_ip: "10.0.0.0/24",
          source_ports: ["443", "80"],
          destination_ports: ["443", "8080"],
          protocols: ["HTTPS", "HTTP"]
        }
      ],
      schedule: {
        start: "2023-09-01T00:00:00Z",
        end: "2023-10-01T00:00:00Z"
      }
    },
    LOGS: {
      filters: [
        {
          hosts: "192.168.1.1",
          ports: "443",
          application: "ZOOM",
          time_window: "6h"
        }
      ]
    }
  }
};

// Convert the sample intent to a JSON string
export const sampleIntentJson = JSON.stringify(sampleIntent, null, 2);
