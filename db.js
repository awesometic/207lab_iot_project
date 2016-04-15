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
/* index.js */
var checkRegistered = function(res, smartphone_address, employee_number, callback) {
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

var checkLoginName = function(res, employee_number, callback) {
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

var checkLoginPassword = function(res, employee_number, password, callback) {
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

var loginValidation = function(req, res, employee_number, password) {
    checkLoginName(res, employee_number, function(valid) {
        if (valid) {
            checkLoginPassword(res, employee_number, password, function(valid) {
                if (valid) {
                    req.session.employee_number = employee_number;
                    res.send("<script> alert('Login Success!'); location.href='/'; </script>");
                }
            });
        }
    });
};

var registerUser = function(res, smartphone_address, employee_number, name, password, department, position, permission) {
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
                res.send("<script> alert('Register Success!'); location.href='/login'; </script>");

            conn.release();
        });
    });
};

var registerWorkplace = function(res, name_workplace, location_workplace, uuid, gateway_address) {
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

/* socket.js */
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
            if (err) {
                console.error(err);
                conn.release();
            }

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
            if (err) {
                console.error(err);
                conn.release();
            }

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

/* Exports */
module.exports = pool;

/* index.js */
module.exports.checkRegistered      = checkRegistered;
module.exports.checkLoginName       = checkLoginName;
module.exports.checkLoginPassword   = checkLoginPassword;
module.exports.loginValidation      = loginValidation;
module.exports.registerUser         = registerUser;
module.exports.registerWorkplace    = registerWorkplace;

/* socket.js */
module.exports.analyzeJSON          = analyzeJSON;
module.exports.getDeviceAddress     = getDeviceAddress;
module.exports.getUUID              = getUUID;
module.exports.getMajor             = getMajor;
module.exports.getMinor             = getMinor;
module.exports.getSmartphoneAddress = getSmartphoneAddress;
module.exports.getDatetime          = getDatetime;
module.exports.gatewayValidation    = gatewayValidation;
module.exports.smartphoneValidation = smartphoneValidation;
module.exports.getWorkplaceName     = getWorkplaceName;
module.exports.registerCommute      = registerCommute;