//http://socket.io/docs/
var port = process.env.PORT || 2070;
var io = require("socket.io").listen(port);

var pool = require("./db.js");

var analyzeJSON = function(data) {

    var stringified;

    stringified = JSON.stringify(data);
    stringified = stringified
        .replace(/\{/g, "")
        .replace(/\}/g, "")
        .replace(/\"/g, "");
    var stringifiedArr = stringified.split(",");

    return stringifiedArr;
};

var getDeviceAddress = function(stringifiedArr) {
    var key = stringifiedArr[0].substr(0, 12);
    var value = stringifiedArr[0].substr(14, 17);
    var deviceAddress = [key, value];


    return deviceAddress;
};

var getUUID = function(stringifiedArr) {
    var uuid = stringifiedArr[1].split(":");
    uuid[1] = uuid[1].replace(/ /g, "");

    return uuid;
};

var getMajor = function(stringifiedArr) {
    var major = stringifiedArr[2].split(":");
    major[1] = major[1].replace(/ /g, "");

    return major;
};

var getMinor = function(stringifiedArr) {
    var minor = stringifiedArr[3].split(":");
    minor[1] = minor[1].replace(/ /g, "");

    return minor;
};

var getSmartphoneAddress = function(stringifiedArr) {
    var key = stringifiedArr[4].substr(0, 16);
    var value = stringifiedArr[4].substr(18, 17);
    var smartphoneAddress = [key, value];

    return smartphoneAddress;
};

var getDatetime = function(stringifiedArr) {
    var key = stringifiedArr[5].substr(0, 7);
    var value = stringifiedArr[5].substr(9, 19);
    var datetime = [key, value];

    return datetime;
};

var gatewayValidation = function(stringifiedArr, callback) {
    var deviceAddress       = getDeviceAddress(stringifiedArr);
    var uuid                = getUUID(stringifiedArr);

    pool.getConnection(function(err, conn) {
        conn.query("SELECT count(*) cnt FROM workplace WHERE gateway_address=? AND UUID=?", [deviceAddress[1], uuid[1]], function(err, rows) {
            if (err)
                console.error(err);
            var cnt = rows[0].cnt;
            var valid = false;

            if (cnt == 1) {
                console.log("\"" + deviceAddress[1] + "\" / \"" + uuid[1] + "\": Verified Gateway");
                valid = true;
            } else {
                console.log("\"" + deviceAddress[1] + "\" / \"" + uuid[1] + "\": Not Verified Gateway");
            }

            if (typeof callback === "function") {
                callback(valid);
            }

            conn.release();
        });
    });
};

var smartphoneValidation = function(stringifiedArr, callback) {
    var smartphoneAddress   = getSmartphoneAddress(stringifiedArr);

    pool.getConnection(function(err, conn) {
        conn.query("SELECT count(*) cnt FROM identity WHERE smartphone_address=?", smartphoneAddress[1], function(err, rows) {
            if (err)
                console.error(err);
            var cnt = rows[0].cnt;
            var valid = false;

            if (cnt == 1) {
                console.log("\"" + smartphoneAddress[1] + "\": Verified Smartphone");
                valid = true;
            } else {
                console.log("\"" + smartphoneAddress[1] + "\": Not Verified Smartphone");
            }

            if (typeof callback === "function") {
                callback(valid);
            }

            conn.release();
        });
    });
};


var getWorkplaceName = function(stringifiedArr, callback) {
    var deviceAddress       = getDeviceAddress(stringifiedArr);
    var uuid                = getUUID(stringifiedArr);

    pool.getConnection(function(err, conn) {
        conn.query("SELECT name_workplace FROM workplace WHERE gateway_address=? AND UUID=?", [deviceAddress[1], uuid[1]], function(err, rows) {
            if (err)
                console.error(err);
            var name_workplace = rows[0].name_workplace;

            if (typeof callback === "function") {
                callback(name_workplace);
            }

            conn.release();
        });
    });
};

var registerCommute = function(stringifiedArr, callback) {
    var smartphoneAddress   = getSmartphoneAddress(stringifiedArr);
    var datetime            = getDatetime(stringifiedArr);

    getWorkplaceName(stringifiedArr, function(name_workplace) {
        pool.getConnection(function(err, conn) {
            conn.query("INSERT INTO circumstance (time, name_workplace, smartphone_address) VALUES (?, ?, ?)", [datetime[1], name_workplace, smartphoneAddress[1]], function(err) {
                if (err) {
                    console.error(err);

                    if (typeof callback === "function") {
                        callback(false);
                    }
                } else {
                    console.log("\"" + datetime[1] + "\" / \"" + name_workplace + "\" / \"" + smartphoneAddress[1] + "\": Registered");

                    if (typeof callback === "function") {
                        callback(true);
                    }
                }

                conn.release();
            });
        });
    });
};

io.on("connection", function(socket) {
    var stringifiedArr;
    socket.on("call", function(data) {
        console.log(data);
        stringifiedArr = analyzeJSON(data);

        gatewayValidation(stringifiedArr, function(valid) {
            if (valid)
                smartphoneValidation(stringifiedArr, function(valid) {
                    if (valid)
                        registerCommute(stringifiedArr, function(valid) {
                            if (valid)
                                console.log("socket.on success: " + valid);
                        });
                });
        });
    });

    socket.emit("answer", {
        socketCommunication: "Success"
    });
});

module.exports = io;
