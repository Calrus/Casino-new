const fs = require('fs');
const path = require('path');

const logSession = (req, res, next) => {
    const logFilePath = path.join(__dirname, '..', 'logs', 'sessionLogs.txt');
    const logData = `Session Data at ${new Date().toISOString()}:\n${JSON.stringify(req.session, null, 2)}\n\n`;

    // Ensure the logs directory exists
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
        fs.mkdirSync(path.join(__dirname, '..', 'logs'));
    }

    // Append session data to the log file
    fs.appendFile(logFilePath, logData, (err) => {
        if (err) {
            console.error('Error logging session data:', err);
        }
    });

    next();
};

module.exports = logSession;
