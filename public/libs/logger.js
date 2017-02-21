/**
 *  Created by Yang Deokgyu a.k.a. Awesometic
 *
 *  This file is to log any access data of server
 *  Everyday, specific time, automatically
 *
 *  references: http://niad.tistory.com/entry/logging-winston
 *
 *  */

var winston = require('winston');
require('date-utils');

var currentTime = require('./currentTime');

module.exports = function(filename) {
    filename = '_' + filename;

    var logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: 'info',
                colorize: true,
                timestamp: function() { return currentTime.getCurrentDateTime() }
            }),
            new (require('winston-daily-rotate-file'))({
                level: 'info',
                json: false,
                prepend: true,
                datePattern: 'yyyy-MM-dd',
                filename: './logs/' + filename + '.log',
                maxsize: 1000000,
                timestamp: function() { return currentTime.getCurrentDateTime() }
            })
        ]
    });
    
    return logger;
};