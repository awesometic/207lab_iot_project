var winston = require('winston');

module.exports = function(filename) {
    var logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: 'info'
            }),
            new winston.transports.File({
                level: 'debug',
                json: false,
                filename: filename
            })
        ]
    });
    
    return logger;
};