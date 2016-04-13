//http://socket.io/docs/
var port = process.env.PORT || 2070;
var io = require("socket.io").listen(port);

var pool = require("./db.js");

var analyzeJSON = function(data) {
    var stringified;

    stringified = JSON.stringify(data);
    stringified.replace("{", "");
    stringified.replace("}", "");
    var stringifiedArr = stringified.split(",");

    return stringifiedArr;
};

var getDeviceAddress = function(stringifiedArr) {
    var deviceAddress = stringifiedArr[0].split(":");

    return deviceAddress;
};

var getUUID = function(stringifiedArr) {
    var uuid = stringifiedArr[1].split(":");
    uuid[1] = uuid[1].replace(" ", "");

    return uuid;
};

var getMajor = function(stringifiedArr) {
    var major = stringifiedArr[2].split(":");

    return major;
};

var getMinor = function(stringifiedArr) {
    var minor = stringifiedArr[3].split(":");

    return minor;
};

var getSmartphoneAddress = function(stringifiedArr) {
    var smartphoneAddress = stringifiedArr[4].split(":");

    return smartphoneAddress;
}

var getDatetime = function(stringifiedArr) {
    var datetime = stringifiedArr[5].split(":");

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
                console.log(deviceAddress[1] + " / " + uuid[1] + ": Valified Gateway");
                valid = true;
            } else {
                console.log(deviceAddress[1] + " / " + uuid[1] + ": Not Valified Gateway");
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
                console.log(smartphoneAddress[1] + ": Valified Smartphone");
                valid = true;
            } else {
                console.log(smartphoneAddress[1] + ": Not Valified Smartphone");
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
            conn.query("INSERT INTO circumstance time, name_workplace, smartphone_address VALUES (?, ?, ?)", [datetime[1], name_workplace, smartphoneAddress[1]], function(err) {
                if (err) {
                    console.error(err);

                    if (typeof callback === "function") {
                        callback(false);
                    }
                } else {
                    console.log(datetime[1] + " / " + name_workplace + " / " + smartphoneAddress[1] + ": Registered");

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
    var answerStr = "{ 'MyNameIs':'207LAB Server' }";
    var answerJSONObj = JSON.parse(answerStr);

    var stringifiedArr = array();
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

    socket.emit("answer", answerJSONObj);
});

module.exports = io;
