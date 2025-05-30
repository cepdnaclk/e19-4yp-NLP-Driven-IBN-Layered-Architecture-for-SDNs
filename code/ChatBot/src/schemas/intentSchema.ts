import * as Yup from 'yup';

// Basic intent schema validation
export const intentSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters'),
  
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  
  source: Yup.string()
    .required('Source is required')
    .matches(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, 'Source must be a valid IP address or CIDR notation'),
  
  destination: Yup.string()
    .required('Destination is required')
    .matches(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, 'Destination must be a valid IP address or CIDR notation'),
  
  protocol: Yup.string()
    .required('Protocol is required')
    .oneOf(['TCP', 'UDP', 'ICMP'], 'Protocol must be TCP, UDP, or ICMP'),
  
  port: Yup.number()
    .when('protocol', {
      is: (protocol: string) => protocol === 'TCP' || protocol === 'UDP',
      then: (schema) => schema.required('Port is required for TCP/UDP').min(1).max(65535),
      otherwise: (schema) => schema.notRequired(),
    }),
  
  qos: Yup.object().shape({
    bandwidth: Yup.string()
      .matches(/^\d+[KMG]?bps$/, 'Bandwidth must be in format like 10Mbps'),
    
    latency: Yup.string()
      .matches(/^\d+ms$/, 'Latency must be in format like 50ms'),
    
    priority: Yup.string()
      .oneOf(['low', 'medium', 'high'], 'Priority must be low, medium, or high'),
  }),
  
  security: Yup.object().shape({
    encryption: Yup.string()
      .oneOf(['none', 'AES-128', 'AES-256'], 'Encryption must be none, AES-128, or AES-256'),
    
    authentication: Yup.string()
      .oneOf(['none', 'required'], 'Authentication must be none or required'),
  }),
});

// Helper function to validate JSON against the schema
export const validateIntentJson = async (jsonString: string): Promise<{
  isValid: boolean;
  errors: { path: string; message: string; severity: 'error' | 'warning' }[];
}> => {
  try {
    const parsedJson = JSON.parse(jsonString);
    
    try {
      await intentSchema.validate(parsedJson, { abortEarly: false });
      return { isValid: true, errors: [] };
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        const errors = validationError.inner.map((err) => ({
          path: err.path || 'unknown',
          message: err.message,
          severity: 'error' as const,
        }));
        return { isValid: false, errors };
      }
      return { 
        isValid: false, 
        errors: [{ path: 'root', message: 'Unknown validation error', severity: 'error' }] 
      };
    }
  } catch (parseError) {
    return { 
      isValid: false, 
      errors: [{ path: 'root', message: `Invalid JSON: ${(parseError as Error).message}`, severity: 'error' }] 
    };
  }
};

// Sample intent object that conforms to the schema
export const sampleIntent = {
  name: "Example Network Intent",
  description: "This is an example network intent generated from your request",
  source: "192.168.1.0/24",
  destination: "10.0.0.0/24",
  protocol: "TCP",
  port: 443,
  qos: {
    bandwidth: "10Mbps",
    latency: "50ms",
    priority: "medium"
  },
  security: {
    encryption: "AES-256",
    authentication: "required"
  }
};

// Convert the sample intent to a JSON string
export const sampleIntentJson = JSON.stringify(sampleIntent, null, 2);
