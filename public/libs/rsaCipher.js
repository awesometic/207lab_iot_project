/** Awesometic
 * references: https://github.com/rzcoder/node-rsa
 */
var NodeRSA = require('node-rsa');
var schedule = require('node-schedule');

var key = new NodeRSA( { b: 2048 } );

// Generate new RSA key pair at every midnight
schedule.scheduleJob('0 0 * * *', function() {
    key = new NodeRSA( { b: 2048 } );
});

var encrypt = function() {
    switch (arguments.length) {
        case 1:
            return key.encrypt(arguments[0], 'base64');

        case 2:
            tempKey = new NodeRSA();
            tempKey.importKey(arguments[1], 'pkcs8-public-pem');

            return tempKey.encrypt(arguments[0], 'base64');

        default:
            return null;
    }
};

var decrypt = function(cipherText) {
    return key.decrypt(cipherText, 'utf8');
};

var getKeyPair = function() {
    return key;
};

var getPublicKey = function() {
    return key.exportKey('pkcs8-public-pem');
};

module.exports = NodeRSA;

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.getKeyPair = getKeyPair;
module.exports.getPublicKey = getPublicKey;