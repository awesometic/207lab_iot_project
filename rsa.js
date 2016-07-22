/**
 * https://github.com/rzcoder/node-rsa
 */

/*
 Generate a key pair once a day
 */
var NodeRSA = require('node-rsa');
var logger = require('./logger');
var schedule = require('node-schedule');

var key = new NodeRSA( { b: 2048 } );

// Generate new RSA key pair at every midnight
schedule.scheduleJob('0 0 * * *', function() {
    key = new NodeRSA( { b: 2048 } );
});

var getKey = function() {
    return key;
};

var encryptRsa = function(plainText) {
    return key.encrypt(plainText, 'base64');
};

var decryptRsa = function(cipherText) {
    return key.decrypt(cipherText, 'utf8');
};

var getPublicKey = function() {
    return key.exportKey('pkcs8-public-pem');
};

module.exports = NodeRSA;

module.exports.getKey = getKey;
module.exports.encryptRsa = encryptRsa;
module.exports.decryptRsa = decryptRsa;
module.exports.getPublicKey = getPublicKey;