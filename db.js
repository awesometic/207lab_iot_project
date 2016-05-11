/**
 *  Created by Yang Deokgyu
 *
 *  Connect to database
 *  Database is used at index.js, socket.js
 *
 *
 *  Must use callback function to deal with SQL Query properly!
 *  These are references about it
 *
 *  http://inspiredjw.tistory.com/entry/JavaScript-%EC%BD%9C%EB%B0%B1-%ED%95%A8%EC%88%98%EC%9D%98-%ED%99%9C%EC%9A%A9
 *  http://blog.jui.io/?p=19
 *  http://yubylab.tistory.com/entry/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EC%9D%98-%EC%BD%9C%EB%B0%B1%ED%95%A8%EC%88%98-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0
 *
 *  */

//https://github.com/felixge/node-mysql
/* Init connect to database */
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : '207lab',
    password        : '207lab',
    database        : 'project_CM'
});

// https://github.com/caolan/async
// Async is a utility module which provides straight-forward,
// powerful functions for working with asynchronous JavaScript
var async = require("async");

/* Functions */
/*!!! Need to move all of the res.send() or console.log out of here !!!*/
/* index.js */
var id_checkLoginName = function(res, employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM identity WHERE employee_number=?", [employee_number], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            var cnt = rows[0].cnt;
            var valid = false;

            if (cnt == 1)
                valid = true;
            else
                res.send("<script> alert('Unregistered Employee!'); history.back(); </script>");

            if (typeof callback === "function") {
                callback(valid);
            }

            conn.release();
        });
    });
};

var id_checkLoginPassword = function(res, employee_number, password, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM identity WHERE employee_number=? AND password=SHA2(?, 256)", [employee_number, password], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            var cnt = rows[0].cnt;
            var valid = false;

            if (cnt == 1)
                valid = true;
            else
                res.send("<script> alert('Check your password!'); history.back(); </script>");

            if (typeof callback === "function") {
                callback(valid);
            }

            conn.release();
        });
    });
};

var id_loginValidation = function(res, employee_number, password, callback) {
    id_checkLoginName(res, employee_number, function(valid) {
        if (valid) {
            id_checkLoginPassword(res, employee_number, password, function(valid) {
                if (valid) {
                    if (typeof callback === "function") {
                        callback(true);
                    }
                }
            });
        }
    });
};

var id_checkRegistered = function(res, smartphone_address, employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM identity WHERE smartphone_address=? OR employee_number=?", [smartphone_address, employee_number], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            var cnt = rows[0].cnt;
            var valid = true;

            if (cnt > 0)
                valid = false;

            if (typeof callback === "function") {
                callback(valid);
            }

            conn.release();
        });
    });
};

var id_registerUser = function(res, smartphone_address, employee_number, name, password, department, position, permission) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO identity (smartphone_address, employee_number, name, password, department, position, permission)" +
            " VALUES (?, ?, ?, SHA2(?, 256), ?, ?, ?)", [smartphone_address, employee_number, name, password, department, position, permission], function (err) {
            if (err) {
                console.error(err);
                conn.release();
            }
            else
                res.send("<script> alert('Register Success!'); location.href='/'; </script>");

            conn.release();
        });
    });
};

var id_registerWorkplace = function(res, name_workplace, location_workplace, uuid, gateway_address) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO workplace (name_workplace, location_workplace, UUID, gateway_address)" +
            " VALUES (?, ?, ?, ?)", [name_workplace, location_workplace, uuid, gateway_address], function (err) {
            if (err) {
                console.error(err);
                conn.release();
            }
            else
                res.send("<script> alert('Register Success!'); history.back(); </script>");

            conn.release();
        });
    });
};

var id_getSmartphoneAddress = function(res, employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT smartphone_address FROM identity WHERE employee_number=?", [employee_number], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            var smartphone_address = rows[0].smartphone_address;

            if (typeof callback === "function") {
                callback(smartphone_address);
            }

            conn.release();
        });
    });
};

var id_checkAdmin = function(res, employee_number, smartphone_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT permission FROM identity WHERE employee_number=? AND smartphone_address=?", [employee_number, smartphone_address], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            var permission = false;
            if (rows[0].permission == 1)
                permission = true;

            if (typeof callback === "function") {
                callback(permission);
            }

            conn.release();
        });
    });
};

/* Not using date yet */
var id_getCircumstance = function(res, date, smartphone_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT * FROM circumstance WHERE smartphone_address=?", [smartphone_address], function(err, rows) {
            if (err)
                console.error(err);
            console.log(rows);
            if (typeof callback === "function") {
                callback(rows);
            }

            conn.release();
        });
    });
};

/* socket.js */
var soc_analyzeJSON = function(data) {

    var stringified;

    stringified = JSON.stringify(data);
    stringified = stringified
        .replace(/\{/g, "")
        .replace(/\}/g, "")
        .replace(/\"/g, "");
    var stringifiedArr = stringified.split(",");

    return stringifiedArr;
};

var soc_getDeviceAddress = function(stringifiedArr) {
    var key = stringifiedArr[0].substr(0, 18);
    var value = stringifiedArr[0].substr(20, 17);
    var deviceAddress = [key, value];

    return deviceAddress;
};

var soc_getUUID = function(stringifiedArr) {
    var uuid = stringifiedArr[1].split(":");
    uuid[0] = "uuid";
    uuid[1] = uuid[1].replace(/ /g, "").substr(0, 32);

    return uuid;
};

var soc_getMajor = function(stringifiedArr) {
    var major = stringifiedArr[1].split(":");
    major[0] = "major";
    major[1] = major[1].replace(/ /g, "").substr(32, 4);

    return major;
};

var soc_getMinor = function(stringifiedArr) {
    var minor = stringifiedArr[1].split(":");
    minor[0] = "minor";
    minor[1] = minor[1].replace(/ /g, "").substr(36, 4);

    return minor;
};

var soc_getSmartphoneAddress = function(stringifiedArr) {
    var key = stringifiedArr[2].substr(0, 16);
    var value = stringifiedArr[2].substr(18, 17);
    var smartphoneAddress = [key, value];

    return smartphoneAddress;
};

var soc_getDatetime = function(stringifiedArr) {
    var key = stringifiedArr[3].substr(0, 7);
    var value = stringifiedArr[3].substr(9, 19);
    var datetime = [key, value];

    return datetime;
};

var soc_gatewayValidation = function(stringifiedArr, callback) {
    var deviceAddress       = soc_getDeviceAddress(stringifiedArr);
    var uuid                = soc_getUUID(stringifiedArr);

    soc_getWorkplaceName(stringifiedArr, function(name_workplace) {
        pool.getConnection(function(err, conn) {
            conn.query("SELECT count(*) cnt FROM workplace WHERE gateway_address=? AND UUID=?", [deviceAddress[1], uuid[1]], function(err, rows) {
                if (err) {
                    console.error(err);
                    conn.release();
                }

                var cnt = rows[0].cnt;
                var valid = false;

                if (cnt == 1) {
                    console.log("\"" + deviceAddress[1] + "\" / \"" + uuid[1] + "\": Verified Gateway");
                    // console.log("Workplace: \"" + name_workplace + "\"");
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
    });
};

var soc_smartphoneValidation = function(stringifiedArr, callback) {
    var smartphoneAddress   = soc_getSmartphoneAddress(stringifiedArr);

    soc_getSmartphoneUserName(stringifiedArr, function(name) {
        pool.getConnection(function(err, conn) {
            conn.query("SELECT count(*) cnt FROM identity WHERE smartphone_address=?", smartphoneAddress[1], function(err, rows) {
                if (err) {
                    console.error(err);
                    conn.release();
                }

                var cnt = rows[0].cnt;
                var valid = false;

                if (cnt == 1) {
                    console.log("\"" + smartphoneAddress[1] + "\": Verified Smartphone");
                    // console.log("User: \"" + name + "\"");
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
    });
};

var soc_getWorkplaceName = function(stringifiedArr, callback) {
    var deviceAddress       = soc_getDeviceAddress(stringifiedArr);
    var uuid                = soc_getUUID(stringifiedArr);

    pool.getConnection(function(err, conn) {
        conn.query("SELECT name_workplace FROM workplace WHERE gateway_address=? AND UUID=?", [deviceAddress[1], uuid[1]], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            var name_workplace = rows[0].name_workplace;

            if (typeof callback === "function") {
                callback(name_workplace);
            }

            conn.release();
        });
    });
};

var soc_getSmartphoneUserName = function(stringifiedArr, callback) {
    var smartphone_address = soc_getSmartphoneAddress(stringifiedArr);

    pool.getConnection(function(err, conn) {
        conn.query("SELECT name FROM identity WHERE smartphone_address=?", [smartphone_address[1]], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            var name = rows[0].name;

            if (typeof callback === "function") {
                callback(name);
            }

            conn.release();
        });
    });
};

var soc_registerCommute = function(stringifiedArr, callback) {
    var smartphoneAddress   = soc_getSmartphoneAddress(stringifiedArr);
    var datetime            = soc_getDatetime(stringifiedArr);

    soc_getWorkplaceName(stringifiedArr, function(name_workplace) {
        pool.getConnection(function(err, conn) {
            conn.query("INSERT INTO circumstance (time, name_workplace, smartphone_address) VALUES (?, ?, ?)", [datetime[1], name_workplace, smartphoneAddress[1]], function(err) {
                if (err) {
                    console.error(err);

                    if (typeof callback === "function") {
                        callback(false);
                    }

                    conn.release();

                } else {
                    console.log("\"" + datetime[1] + "\" / \"" + name_workplace + "\" / \"" + smartphoneAddress[1] + "\": Registered");

                    if (typeof callback === "function") {
                        callback(true);
                    }

                    conn.release();
                }
            });
        });
    });
};

var soc_RSSICalibration = function(stringifiedArr, callback) {
    
};

var soc_getRSSI = function(stringifiedArr, callback) {
    
};

/* Exports */
module.exports = pool;

/* index.js */
module.exports.id_checkLoginName            = id_checkLoginName;
module.exports.id_checkLoginPassword        = id_checkLoginPassword;
module.exports.id_loginValidation           = id_loginValidation;
module.exports.id_checkRegistered           = id_checkRegistered;
module.exports.id_registerUser              = id_registerUser;
module.exports.id_registerWorkplace         = id_registerWorkplace;

module.exports.id_getSmartphoneAddress      = id_getSmartphoneAddress;
module.exports.id_checkAdmin                = id_checkAdmin;

module.exports.id_getCircumstance           = id_getCircumstance;


/* socket.js */
module.exports.soc_analyzeJSON              = soc_analyzeJSON;
module.exports.soc_getDeviceAddress         = soc_getDeviceAddress;
module.exports.soc_getUUID                  = soc_getUUID;
module.exports.soc_getMajor                 = soc_getMajor;
module.exports.soc_getMinor                 = soc_getMinor;
module.exports.soc_getSmartphoneAddress     = soc_getSmartphoneAddress;
module.exports.soc_getDatetime              = soc_getDatetime;
module.exports.soc_gatewayValidation        = soc_gatewayValidation;
module.exports.soc_smartphoneValidation     = soc_smartphoneValidation;
module.exports.soc_getWorkplaceName         = soc_getWorkplaceName;
module.exports.soc_getSmartphoneUserName    = soc_getSmartphoneUserName;
module.exports.soc_registerCommute          = soc_registerCommute;

module.exports.soc_RSSICalibration          = soc_RSSICalibration;
module.exports.soc_getRSSI                  = soc_getRSSI;
