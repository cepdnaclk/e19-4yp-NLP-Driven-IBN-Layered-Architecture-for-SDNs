import axios from 'axios';
import { onosUrl, onosAuth } from '../config/config.js';
import { processQoSIntent, validateQoSConfig } from './qosService.js';
// import { scheduleIntent } from './scheduleService.js';

export const pushIntent = async (config) => {
  try {
    const { intent_id, user_role, QOS, ACL, time_constraints, ...intentData } = config;
    console.log('QOS:', QOS);
    console.log('ACL:', ACL);

    // Process ACL
    if (ACL && ACL.rules && ACL.rules.length > 0) {
      const { rules, schedule: aclSchedule } = ACL;
      
      for (const rule of rules) {
        // Extract required fields similar to the shell script
        const priority = rule.priority ?? 40000;
        const srcIp = rule.source_ip ?? '0.0.0.0/0';
        const srcPort = rule.source_port ?? -1;
        const dstIp = rule.destination_ip ?? '0.0.0.0/0';
        const dstPorts = Array.isArray(rule.destination_port) ? rule.destination_port : [rule.destination_port ?? -1];
        const protocols = rule.protocols ? rule.protocols : ["HTTP"];
        const action = rule.action ?? 'ALLOW';
        
        // Create separate ACL rules for each protocol and destination port combination
        for (const protocol of protocols) {
          for (const dstPort of dstPorts) {
            const aclPayload = {
              priority: priority,
              srcIp: srcIp,
              protocol: protocol.toUpperCase(),
              action: action.toUpperCase()
            };
            
            if (dstIp !== '0.0.0.0/0') {
              aclPayload.dstIp = dstIp;
            }
            
            if (dstPort !== -1) {
              aclPayload.dstPort = parseInt(dstPort);
            }
            
            if (srcPort !== -1) {
              aclPayload.srcPort = parseInt(srcPort);
            }
            
            // Send ACL rule to ONOS ACL API
            console.log(`ACL rule sent to ONOS: ${JSON.stringify(aclPayload)}`);
            try {
              await axios.post(`${onosUrl}/acl/rules`, aclPayload, {
                auth: onosAuth,
                headers: { 'Content-Type': 'application/json' }
              });
              console.log(`ACL rule sent to ONOS: ${JSON.stringify(aclPayload)}`);
            } catch (error) {
              console.error('Error sending ACL rule to ONOS:', error.message);
            }
          }
        }
      }
    }

    // Handle QoS intents using the bash script integration
    if (QOS && Object.keys(QOS).length > 0) {
      console.log('🎯 Processing QoS intent...');
      
      // Validate QoS configuration
      const validation = validateQoSConfig(config);
      if (!validation.valid) {
        throw new Error(`QoS validation failed: ${validation.error}`);
      }
      
      // Process QoS intent using bash scripts
      const qosResult = await processQoSIntent(config);
      console.log('✅ QoS intent processed:', qosResult);
    }
    
    // Determine priority based on user role
    // const onosPriority = user_role === 'admin' ? 50000 : 
    //                     user_role === 'premium' ? 40000 : 30000;

    // // Process QoS
    // if (QoS && QoS.bandwidth) {
    //   const { bandwidth } = QoS;
      
    //   // Create meter for bandwidth control
    //   const meter = {
    //     id: 1,
    //     rate: parseInt(bandwidth.replace('Mbps', '')) * 1000
    //   };

    //   await axios.post(`${onosUrl}/meters/of:0000000000000001`, meter, {
    //     auth: onosAuth,
    //     headers: { 'Content-Type': 'application/json' }
    //   });

    //   // Basic QoS intent without specific IP/port constraints
    //   const qosIntent = {
    //     type: 'PointToPointIntent',
    //     appId: `org.example.qos.${intent_id}`,
    //     priority: onosPriority,
    //     selector: {
    //       criteria: [
    //         { type: 'ETH_TYPE', ethType: '0x0800' } // IPv4
    //       ]
    //     },
    //     treatment: { instructions: [{ type: 'METER', meterId: 1 }] },
    //     ingressPoint: { deviceId: 'of:0000000000000001', port: '1' },
    //     egressPoint: { deviceId: 'of:0000000000000002', port: '1' }
    //   };

    //   scheduleIntent(qosIntent, time_constraints, intent_id);
    // }

    return { success: true, message: 'Intent pushed successfully' };
  } catch (error) {
    console.error('Error pushing intent:', error);
    throw error;
  }
};
