// https://github.com/winstonjs/winston
// https://github.com/winstonjs/winston-daily-rotate-file
// references: http://niad.tistory.com/entry/logging-winston

/** winston npm package for daily logging
 * It logs only at the specific files:
 * /db.js /socket.js /routes/index.js
 * 
 */

var winston = require('winston');
require('date-utils');

module.exports = function(filename) {
    filename = '_' + filename;

    var logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: 'info',
                colorize: true,
                timestmap: function() { return new Date().toFormat('YYYY-MM-DD HH24:MI:SS') }
            }),
            new (require('winston-daily-rotate-file'))({
                level: 'info',
                json: false,
                prepend: true,
                datePattern: 'yyyy-MM-dd',
                filename: './logs/' + filename + '.log',
                maxsize: 1000000,
                timestamp: function() { return new Date().toFormat('YYYY-MM-DD HH24:MI:SS') }
            })
        ]
    });
    
    return logger;
};