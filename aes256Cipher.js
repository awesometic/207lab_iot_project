/** Awesometic
 * references: https://gist.github.com/ericchen/3081970
 */

var crypto = require('crypto');

var AESCrypt = {};

AESCrypt.encrypt = function(cryptKey, crpytIv, plainData) {
    var encipher = crypto.createCipheriv('aes-256-cbc', cryptKey, crpytIv),
        encrypted = encipher.update(plainData, 'utf8', 'binary');

    encrypted += encipher.final('binary');

    return new Buffer(encrypted, 'binary').toString('base64');
};

AESCrypt.decrypt = function(cryptKey, cryptIv, encrypted) {
    encrypted = new Buffer(encrypted, 'base64').toString('binary');

    var decipher = crypto.createDecipheriv('aes-256-cbc', cryptKey, cryptIv),
        decrypted = decipher.update(encrypted, 'binary', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
};

AESCrypt.makeIv = crypto.randomBytes(16);

// Change this private symmetric key salt
AESCrypt.KEY = crypto.createHash('sha256').update('Awesometic').digest();

module.exports = AESCrypt;