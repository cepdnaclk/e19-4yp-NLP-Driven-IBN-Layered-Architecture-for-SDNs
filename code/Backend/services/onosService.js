import axios from 'axios';
import { onosUrl, onosAuth } from '../config/config.js';
import { scheduleIntent } from './scheduleService.js';

export const pushIntent = async (config) => {
  try {
    const { intent_id, user_role, QoS, ACL, time_constraints, ...intentData } = config;
    
    // Determine priority based on user role
    const onosPriority = user_role === 'admin' ? 50000 : 
                        user_role === 'premium' ? 40000 : 30000;

    // Process QoS
    if (QoS && QoS.bandwidth) {
      const { bandwidth } = QoS;
      
      // Create meter for bandwidth control
      const meter = {
        id: 1,
        rate: parseInt(bandwidth.replace('Mbps', '')) * 1000
      };

      await axios.post(`${onosUrl}/meters/of:0000000000000001`, meter, {
        auth: onosAuth,
        headers: { 'Content-Type': 'application/json' }
      });

      const qosIntent = {
        type: 'PointToPointIntent',
        appId: `org.example.qos.${intent_id}`,
        priority: onosPriority,
        selector: {
          criteria: [
            { type: 'IPV4_SRC', ip: ACL.allow_rules[0].source_ip + '/32' },
            { type: 'IPV4_DST', ip: ACL.allow_rules[0].destination_ip + '/32' },
            { type: 'UDP_SRC', udpPort: parseInt(ACL.allow_rules[0].source_ports[0]) },
            { type: 'UDP_DST', udpPort: parseInt(ACL.allow_rules[0].destination_ports[0]) },
            { type: 'IP_PROTO', protocol: 'UDP' }
          ]
        },
        treatment: { instructions: [{ type: 'METER', meterId: 1 }] },
        ingressPoint: { deviceId: 'of:0000000000000001', port: '1' },
        egressPoint: { deviceId: 'of:0000000000000002', port: '1' }
      };

      scheduleIntent(qosIntent, time_constraints, intent_id);
    }

    // Process ACL
    if (ACL && ACL.allow_rules.length > 0) {
      const { allow_rules, schedule: aclSchedule } = ACL;
      for (const rule of allow_rules) {
        const aclIntent = {
          type: 'PointToPointIntent',
          appId: `org.example.acl.${intent_id}`,
          priority: 40000,
          selector: {
            criteria: [
              { type: 'IPV4_SRC', ip: rule.source_ip + '/32' },
              { type: 'IPV4_DST', ip: rule.destination_ip + '/32' },
              { type: 'UDP_SRC', udpPort: parseInt(rule.source_ports[0]) },
              { type: 'UDP_DST', udpPort: parseInt(rule.destination_ports[0]) },
              { type: 'IP_PROTO', protocol: 'UDP' }
            ]
          },
          treatment: { instructions: [{ type: 'OUTPUT', port: '1' }] },
          ingressPoint: { deviceId: 'of:0000000000000001', port: '1' },
          egressPoint: { deviceId: 'of:0000000000000002', port: '1' }
        };

        scheduleIntent(aclIntent, aclSchedule || time_constraints, intent_id);
      }
    }

    return { success: true, message: 'Intent pushed successfully' };
  } catch (error) {
    console.error('Error pushing intent:', error);
    throw error;
  }
};
