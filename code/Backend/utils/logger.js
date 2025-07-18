const fs = require('fs');

module.exports = {
  log: (message) => {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync('logs/app.log', logMessage);
    console.log(logMessage);
  }
};

