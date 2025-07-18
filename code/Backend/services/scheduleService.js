const schedule = require('node-schedule');
const axios = require('axios');
const { onosUrl, onosAuth } = require('../config/config');

function scheduleIntent(intent, timeConstraints, intentId) {
  let { start, end, days } = timeConstraints;

  // Handle QoS (HH:MM:SS) and ACL (ISO 8601) time formats
  if (start.includes('T')) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    start = `${startDate.getUTCHours()}:${startDate.getUTCMinutes()}:00`;
    end = `${endDate.getUTCHours()}:${endDate.getUTCMinutes()}:00`;
  }

  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  const cronDays = days ? days.map(day => day.slice(0, 3).toUpperCase()).join(',') : '*';

  schedule.scheduleJob(`${startMinute} ${startHour} * * ${cronDays}`, async () => {
    try {
      await axios.post(`${onosUrl}/intents`, intent, {
        auth: onosAuth,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`Intent ${intent.appId} submitted`);
    } catch (error) {
      console.error(`Error submitting intent ${intent.appId}:`, error.message);
    }
  });

  schedule.scheduleJob(`${endMinute} ${endHour} * * ${cronDays}`, async () => {
    try {
      await axios.delete(`${onosUrl}/intents/${intent.appId}/${intentId}`, {
        auth: onosAuth
      });
      console.log(`Intent ${intent.appId} withdrawn`);
    } catch (error) {
      console.error(`Error withdrawing intent ${intent.appId}:`, error.message);
    }
  });
}

module.exports = { scheduleIntent };