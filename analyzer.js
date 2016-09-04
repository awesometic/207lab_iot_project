
// Cipher modules
var aes256 = require('./aes256Cipher');
var rsa = require('./rsaCipher');

// logger
var logger = require('./logger');

var Analyzer = {};

Analyzer.aes256 = aes256;
Analyzer.rsa = rsa;

// http://stackoverflow.com/questions/14603205/how-to-convert-hex-string-into-a-bytes-array-and-a-bytes-array-in-the-hex-strin
// Convert a hex string to a byte array
var hexToBytes = function(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }

    return bytes;
};

// Convert a byte array to a hex string
var bytesToHex = function(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }

    return hex.join("");
};

// Mining the data from JSON formatted data
Analyzer.getBeaconAddressArray = function(json) {
    return [ json.BeaconDeviceAddress1, json.BeaconDeviceAddress2, json.BeaconDeviceAddress3 ];
};

Analyzer.getUuidArray = function(json) {
    var uuidArray = [];

    uuidArray.push(json.BeaconData1.replace(/ /g, "").substr(0, 32));
    uuidArray.push(json.BeaconData2.replace(/ /g, "").substr(0, 32));
    uuidArray.push(json.BeaconData3.replace(/ /g, "").substr(0, 32));

    return uuidArray;
};

Analyzer.getMajorArray = function(json) {
    var majorArray = [];

    majorArray.push(json.BeaconData1.replace(/ /g, "").substr(32, 4));
    majorArray.push(json.BeaconData2.replace(/ /g, "").substr(32, 4));
    majorArray.push(json.BeaconData3.replace(/ /g, "").substr(32, 4));

    return majorArray;
};

Analyzer.getMinorArray = function(json) {
    var minorArray = [];

    minorArray.push(json.BeaconData1.replace(/ /g, "").substr(36, 4));
    minorArray.push(json.BeaconData2.replace(/ /g, "").substr(36, 4));
    minorArray.push(json.BeaconData3.replace(/ /g, "").substr(36, 4));

    return minorArray;
};

Analyzer.getSmartphoneAddress = function(json) {
    return json.SmartphoneAddress;
};

Analyzer.getCoordinateArray = function(json) {
    var coordinateArray = [];

    coordinateArray.push(parseInt(json.CoordinateX));
    coordinateArray.push(parseInt(json.CoordinateY));
    coordinateArray.push(parseInt(json.CoordinateZ));

    return coordinateArray;
};

Analyzer.getThresholdArray = function(json) {
    var thresholdArray = [];

    thresholdArray.push(parseInt(json.ThresholdX));
    thresholdArray.push(parseInt(json.ThresholdY));
    thresholdArray.push(parseInt(json.ThresholdZ));

    return thresholdArray;
};

Analyzer.getSignal = function(json) {
    return json.Signal;
};

Analyzer.getEmployeeNumber = function(json) {
    return json.EmployeeNumber;
};

Analyzer.getName = function(json) {
    return json.Name;
};

Analyzer.getPassword = function(json) {
    return json.Password;
};

Analyzer.getDepartment = function(json) {
    return json.Department;
};

Analyzer.getPosition = function(json) {
    return json.Position;
};

Analyzer.getPermission = function(json) {
    return json.Permission;
};

Analyzer.getAdmin = function(json) {
    return json.Admin;
};

Analyzer.getCommuteStatus = function(json) {
    return (json.Commute == "true") ? 1 : 0;
};

Analyzer.extractContentFromReceivedJson = function(json) {
    var dataKeyIvJson = JSON.parse(rsa.decrypt(json.aesKeyIv));

    var smartphoneAesCryptKey = new Buffer(hexToBytes(dataKeyIvJson.aesCryptKey));
    var smartphoneAesCryptIv = new Buffer(hexToBytes(dataKeyIvJson.aesCryptIv));

    return JSON.parse(aes256.decrypt(smartphoneAesCryptKey, smartphoneAesCryptIv, json.content));
};

Analyzer.encryptSendJson = function(rsaPublicKey, content) {
    var aesCryptKey = aes256.KEY;
    var aesCryptIv = aes256.makeIv;

    var keyIvJsonString = "{ ";
    keyIvJsonString += "\"aesCryptKey\":\"" + bytesToHex(aesCryptKey) + "\", ";
    keyIvJsonString += "\"aesCryptIv\":\"" + bytesToHex(aesCryptIv) + "\"";
    keyIvJsonString += " }";

    var rsaEncryptedKeyIvJsonString = rsa.encrypt(keyIvJsonString, rsaPublicKey);
    var aesEncryptedContentJsonString = aes256.encrypt(aesCryptKey, aesCryptIv, JSON.stringify(content));

    var sendJson = "{ ";
    sendJson += "\"aesKeyIv\":\"" + rsaEncryptedKeyIvJsonString +"\", ";
    sendJson += "\"content\":\"" + aesEncryptedContentJsonString +"\"";
    sendJson += " }";

    return JSON.parse(sendJson);
};

module.exports = Analyzer;