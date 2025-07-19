import fs from 'fs';

const logger = {
  log: (message) => {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync('logs/app.log', logMessage);
    console.log(logMessage);
  }
};

export default logger;

