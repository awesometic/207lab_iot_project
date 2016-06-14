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

id_isAdmin = function(res, employee_number, password, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT admin FROM identity WHERE employee_number=? AND password=SHA2(?, 256)", [employee_number, password], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            var isAdmin = false;
            if (rows[0].admin)
                isAdmin = true;

            if (typeof callback === "function") {
                callback(isAdmin);
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
                    id_isAdmin(res, employee_number, password, function(isAdmin) {
                        if (typeof callback === "function") {
                            callback(isAdmin);
                        }
                    });
                }
            });
        }
    });
};

var id_getUserInfo = function(smartphone_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT * FROM identity WHERE smartphone_address=?", [smartphone_address], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            if (typeof callback === "function") {
                callback(rows[0]);
            }
        });
    });
};

var id_checkUserRegistered = function(res, smartphone_address, employee_number, callback) {
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

var id_registerUser = function(res, smartphone_address, employee_number, name, password, department, position, permission, admin) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO identity (smartphone_address, employee_number, name, password, department, position, permission, admin)" +
            " VALUES (?, ?, ?, SHA2(?, 256), ?, ?, ?, ?)", [smartphone_address, employee_number, name, password, department, position, permission, admin], function (err) {
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

var id_modifyUser = function(res, smartphone_address, employee_number, modify_name, modify_password, modify_department, modify_position, modify_admin, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE identity SET name=?, password=SHA2(?, 256), department=?, position=?, admin=? WHERE smartphone_address=? AND employee_number=?", [modify_name, modify_password, modify_department, modify_position, modify_admin, smartphone_address, employee_number], function(err) {
            if (err) {
                console.error(err);
                conn.release();
            }
            else
                res.send("<script> alert('Modify Success!'); location.href='/'; </script>");
        });
    });
};

var id_deleteUser = function(res, smartphone_address, employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM identity WHERE smartphone_address=? AND employee_number=?", [smartphone_address, employee_number], function (err) {
            if (err) {
                console.error(err);
                conn.release();
            }
            else
                res.send("<script> alert('Delete Success!'); location.href='/'; </script>");
        });
    });
};

var id_getWorkplaceInfo = function(name_workplace, location_workplace, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT * FROM workplace WHERE name_workplace=? AND location_workplace", [name_workplace, location_workplace], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            if (typeof callback === "function") {
                callback(rows[0]);
            }
        });
    });
};

var id_getWorkplaceID = function(name_workplace, location_workplace, callback) {
    id_checkWorkplaceRegistered(name_workplace, location_workplace, function(valid) {
        if (valid) {
            pool.getConnection(function(err, conn) {
                if (err)
                    console.error(err);

                conn.query("SELECT id_workplace FROM workplace WHERE name_workplace=? AND location_workplace=?", [name_workplace, location_workplace], function(err, rows) {
                    if (err) {
                        console.error(err);
                        conn.release();
                    } else {
                        if (typeof callback === "function") {
                            callback(rows[0].id_workplace);
                        }
                    }
                });
            });
        } else {

        }
    });
};

/* What makes each workplace unique? */
var id_checkWorkplaceRegistered = function(name_workplace, location_workplace, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM workplace WHERE name_workplace=? AND location_workplace", [name_workplace, location_workplace], function(err, rows) {
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

var id_registerWorkplace = function(res, name_workplace, location_workplace) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO workplace (name_workplace, location_workplace, coordinateX, coordinateY, coordinateZ)" +
            " VALUES (?, ?, ?, ?, ?)", [name_workplace, location_workplace, 0, 0, 0], function (err) {
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

var id_modifyWorkplace = function(res, name_workplace, location_workplace, modify_name_workplace, modify_location_workplace, callback) {
    id_getWorkplaceID(name_workplace, location_workplace, function(id_workplace) {
        pool.getConnection(function(err, conn) {
            if (err)
                console.error(err);

            conn.query("UPDATE workplace SET name_workplace=?, location_workplace=? WHERE id_workplace=?", [modify_name_workplace, modify_location_workplace, id_workplace], function(err) {
                if (err) {
                    console.error(err);
                    conn.release();
                }
                else
                    res.send("<script> alert('Modify Success!'); location.href='/'; </script>");
            });
        });
    });
};

var id_deleteWorkplace = function(res, name_workplace, location_workplace, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM workplace WHERE name_workplace=? AND location_workplace=?", [name_workplace, location_workplace], function (err) {
            if (err) {
                console.error(err);
                conn.release();
            }
            else
                res.send("<script> alert('Delete Success!'); location.href='/'; </script>");
        });
    });
};

var id_getBeaconInfo = function(beacon_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT * FROM beacon WHERE beacon_address=?", [beacon_address], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            if (typeof callback === "function") {
                callback(rows[0]);
            }
        });
    });
};

var id_getAvailableBeacon = function(res, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT * FROM beacon WHERE id_workplace=-1", function (err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            var availableBeacon = new Array();
            for (var i = 0; i < rows.length; i++) {
                availableBeacon.push(rows[i].beacon_address);
            }

            if (typeof callback === "function") {
                callback(availableBeacon);
            }

            conn.release();
        });
    });
};

var id_checkBeaconRegistered = function(beacon_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM beacon WHERE beacon_address=?", [beacon_address], function(err, rows) {
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

var id_registerBeacon = function(res, uuid, major, minor, beacon_address) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO beacon (UUID, major, minor, beacon_address, id_workplace)" +
            " VALUES (?, ?, ?, ?, ?)", [uuid, major, minor, beacon_address, -1], function (err) {
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

var id_modifyBeacon = function(res, beacon_address, modify_uuid, modify_major, modify_minor, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE beacon SET UUID=?, major=?, minor=? WHERE beacon_addres=?", [modify_uuid, modify_major, modify_minor, beacon_address], function(err) {
            if (err) {
                console.error(err);
                conn.release();
            }
            else
                res.send("<script> alert('Modify Success!'); location.href='/'; </script>");
        });
    });
};

var id_deleteBeacon = function(res, uuid, major, minor, beacon_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM beacon WHERE UUID=? AND major=? AND minor=? AND beacon_address=?", [uuid, major, minor, beacon_address], function (err) {
            if (err) {
                console.error(err);
                conn.release();
            }
            else
                res.send("<script> alert('Delete Success!'); location.href='/'; </script>");
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

var soc_getBeaconAddressArr = function(stringifiedArr) {
    var beaconAddressArr = new Array();

    for (var i = 0; i < 3; i++) {

        for (var j = 0; j < stringifiedArr.length; j++) {
            if (stringifiedArr[j].split(":")[0].indexOf("BeaconDeviceAddress" + (i + 1)) != -1) {
                beaconAddressArr.push(stringifiedArr[j].substr(21, 17));
                break;
            }
        }

    }

    return beaconAddressArr;
};

var soc_getUUIDArr = function(stringifiedArr) {
    var uuidArr = new Array();

    for (var i = 0; i < 3; i++) {

        for (var j = 0; j < stringifiedArr.length; j++) {
            if (stringifiedArr[j].split(":")[0].indexOf("BeaconData" + (i + 1)) != -1) {
                uuidArr.push(stringifiedArr[j].split(":")[1].replace(/ /g, "").substr(0, 32));
                break;
            }
        }

    }

    return uuidArr;
};

var soc_getMajorArr = function(stringifiedArr) {
    var majorArr = new Array();

    for (var i = 0; i < 3; i++) {

        for (var j = 0; j < stringifiedArr.length; j++) {
            if (stringifiedArr[j].split(":")[0].indexOf("BeaconData" + (i + 1)) != -1) {
                majorArr.push(stringifiedArr[j].split(":")[1].replace(/ /g, "").substr(32, 4));
                break;
            }
        }

    }

    return majorArr;
};

var soc_getMinorArr = function(stringifiedArr) {
    var minorArr = new Array();

    for (var i = 0; i < 3; i++) {

        for (var j = 0; j < stringifiedArr.length; j++) {
            if (stringifiedArr[j].split(":")[0].indexOf("BeaconData" + (i + 1)) != -1) {
                minorArr.push(stringifiedArr[j].split(":")[1].replace(/ /g, "").substr(36, 4));
                break;
            }
        }

    }

    return minorArr;
};

var soc_getSmartphoneAddress = function(stringifiedArr) {
    var value = "";

    for (var i = 0; i < stringifiedArr.length; i++) {
        if (stringifiedArr[i].split(":")[0].indexOf("SmartphoneAddress") != -1) {
            value = stringifiedArr[i].substr(18, 17);
            break;
        }
    }

    return value;
};

var soc_getDatetime = function(stringifiedArr) {
    var value = "";

    for (var i = 0; i < stringifiedArr.length; i++) {
        if (stringifiedArr[i].split(":")[0].indexOf("DateTime") != -1) {
            value = stringifiedArr[i].substr(9, 19);
            break;
        }
    }

    return value;
};

var soc_getCoordinate = function(stringifiedArr) {
    var coordinateArr = new Array();


    for (var i = 0; i < stringifiedArr.length; i++) {
        if (stringifiedArr[i].split(":")[0].indexOf("CoordinateX") != -1) {
            coordinateArr.push(parseInt(stringifiedArr[8].substr(12, 3)));
            break;
        }
    }
    for (var i = 0; i < stringifiedArr.length; i++) {
        if (stringifiedArr[i].split(":")[0].indexOf("CoordinateY") != -1) {
            coordinateArr.push(parseInt(stringifiedArr[9].substr(12, 3)));
            break;
        }
    }
    for (var i = 0; i < stringifiedArr.length; i++) {
        if (stringifiedArr[i].split(":")[0].indexOf("CoordinateZ") != -1) {
            coordinateArr.push(parseInt(stringifiedArr[10].substr(12, 3)));
            break;
        }
    }

    return coordinateArr;
};

var soc_gatewayValidation = function(stringifiedArr, callback) {
    var beaconAddressArr    = soc_getBeaconAddressArr(stringifiedArr);
    var uuidArr             = soc_getUUIDArr(stringifiedArr);
    var majorArr            = soc_getMajorArr(stringifiedArr);
    var minorArr            = soc_getMinorArr(stringifiedArr);

    soc_getWorkplaceOfBeacons(beaconAddressArr, uuidArr, majorArr, minorArr, function(id) {
        soc_getWorkplaceName(id, function(name_workplace) {

            if (name_workplace != "undefined") {
                console.log("Verified Gateway: " + name_workplace);

                if (typeof callback === "function") {
                    callback(id);
                }
            } else {
                console.log("Unverified Gateway");

                if (typeof callback === "function") {
                    callback(false);
                }
            }
        });
    });
};

var soc_getWorkplaceName = function(id_workplace, callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT IF ((SELECT COUNT(*) AS cnt FROM workplace WHERE id_workplace=? HAVING cnt > 0)"
            + ", (SELECT name_workplace FROM workplace WHERE id_workplace=?), 'undefined') AS name_workplace"
            , [id_workplace, id_workplace]
            , function(err, rows) {
                if (err) {
                    console.error(err);
                    conn.release();
                }

                if (typeof callback === "function") {
                    callback(rows[0].name_workplace);
                }

                conn.release();
            });
    });
};

var soc_getWorkplaceOfBeacons = function(beaconAddressArr, uuidArr, majorArr, minorArr, callback) {
    pool.getConnection(function(err, conn) {
        /* Needs better query than it */
        /* Check whether each beacon exists in the beacon table */
        conn.query("SELECT IF ((SELECT COUNT(*) AS cnt FROM beacon WHERE "
            + "(beacon_address=? AND UUID=? AND major=? AND minor=?) OR "
            + "(beacon_address=? AND UUID=? AND major=? AND minor=?) OR "
            + "(beacon_address=? AND UUID=? AND major=? AND minor=?) HAVING cnt=3) AND "
            /* Check whether id_workplace values each beacon has are same */
            /* When the two strings are same, STRCMP() returns 0 */
            + "(SELECT IF (STRCMP((SELECT id_workplace FROM beacon WHERE beacon_address=?), "
            + "(SELECT id_workplace FROM beacon WHERE beacon_address=?)), FALSE, TRUE)) AND "
            + "(SELECT IF (STRCMP((SELECT id_workplace FROM beacon WHERE beacon_address=?), "
            + "(SELECT id_workplace FROM beacon WHERE beacon_address=?)), FALSE, TRUE))"
            /* If true, returns id_workplace value, or not, returns -1 as id_workplace */
            + ", (SELECT id_workplace FROM beacon WHERE beacon_address=?), -1) "
            + "AS id_workplace"
            , [
                beaconAddressArr[0], uuidArr[0], majorArr[0], minorArr[0],
                beaconAddressArr[1], uuidArr[1], majorArr[1], minorArr[1],
                beaconAddressArr[2], uuidArr[2], majorArr[2], minorArr[2],
                beaconAddressArr[0], beaconAddressArr[1],
                beaconAddressArr[0], beaconAddressArr[2],
                beaconAddressArr[0]
            ]
            , function(err, rows) {
                if (err) {
                    console.error(err);
                    conn.release();
                }

                if (typeof callback === "function") {
                    callback(rows[0].id_workplace);
                }

                conn.release();
            });
    });
};

var soc_smartphoneValidation = function(stringifiedArr, callback) {

    soc_getSmartphoneUserName(stringifiedArr, function(name) {

        if (name != "undefined") {
            console.log("Verified Smartphone: " + name);

            if (typeof callback === "function") {
                callback(name);
            }
        } else {
            console.log("Unverified Smartphone");

            if (typeof callback === "function") {
                callback(false);
            }
        }
    });
};

var soc_getSmartphoneUserName = function(stringifiedArr, callback) {
    var smartphone_address = soc_getSmartphoneAddress(stringifiedArr);

    pool.getConnection(function(err, conn) {
        conn.query("SELECT IF ((SELECT COUNT(*) AS cnt FROM identity WHERE smartphone_address=? HAVING cnt > 0)"
            + ", (SELECT name FROM identity WHERE smartphone_address=?), 'undefined') AS name"
            , [smartphone_address, smartphone_address]
            , function(err, rows) {
                if (err) {
                    console.error(err);
                    conn.release();
                }

                if (typeof callback === "function") {
                    callback(rows[0].name);
                }

                conn.release();
            });
    });
};

var soc_registerCommute = function(stringifiedArr, id_workplace, callback) {
    var smartphoneAddress   = soc_getSmartphoneAddress(stringifiedArr);
    var datetime            = soc_getDatetime(stringifiedArr);

    pool.getConnection(function(err, conn) {
        conn.query("INSERT INTO circumstance (datetime, id_workplace, smartphone_address)" +
            "VALUES (?, ?, ?)", [datetime, id_workplace, smartphoneAddress], function(err) {
            if (err) {
                console.error(err);

                if (typeof callback === "function") {
                    callback(false);
                }

                conn.release();

            } else {
                console.log("\"" + datetime + "\" / \"" + id_workplace + "\" / \"" + smartphoneAddress + "\": Registered");

                if (typeof callback === "function") {
                    callback(true);
                }

                conn.release();
            }
        });
    });
};

var soc_RSSICalibration = function(stringifiedArr, id, name, callback) {
    var coordinateArr        = soc_getCoordinate(stringifiedArr);
    var datetime            = soc_getDatetime(stringifiedArr);

    pool.getConnection(function(err, conn) {
        conn.query("UPDATE workplace SET coordinateX=?, coordinateY=?, coordinateZ=? WHERE id_workplace=?"
            , [coordinateArr[0], coordinateArr[1], coordinateArr[2], id], function(err) {
                if (err) {
                    console.error(err);

                    if (typeof callback === "function") {
                        callback(false);
                    }

                    conn.release();

                } else {
                    console.log(datetime + "\t" + "Coordinate updated at " + id + " workplace, by " + name);

                    if (typeof callback === "function") {
                        callback(true);
                    }

                    conn.release();
                }
            });
    });
};

var soc_getEssentialData = function(callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT workplace.id_workplace, coordinateX, coordinateY, coordinateZ, "
            + "GROUP_CONCAT(beacon.beacon_address SEPARATOR '-') AS beacon_address "
            + "FROM workplace, beacon WHERE workplace.id_workplace=beacon.id_workplace "
            + "AND workplace.beacon_set=1 "
            + "ORDER BY workplace.id_workplace", function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            console.log(rows);

            if (typeof callback === "function") {
                callback(rows);
            }

            conn.release();
        });
    });
};

var soc_getBeaconMACAddress = function(callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT beacon_address, id_workplace FROM beacon", function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            if (typeof callback === "function") {
                callback(JSON.stringify(rows));
            }

            conn.release();
        });
    });
};

var soc_getRSSI = function(callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT id_workplace, coordinateX, coordinateY, coordinateZ FROM workplace", function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }

            if (typeof callback === "function") {
                callback(JSON.stringify(rows));
            }

            conn.release();
        });
    });
};

var soc_amIRegistered = function(stringifiedArr, callback) {
    var datetime = soc_getDatetime(stringifiedArr);
    var smartphone_address = soc_getSmartphoneAddress(stringifiedArr);
    
    pool.getConnection(function(err, conn) {
        conn.query("SELECT COUNT(*) AS cnt FROM identity WHERE smartphone_address=?", [smartphone_address], function(err, rows) {
            if (err) {
                console.error(err);
                conn.release();
            }
            
            var isRegistered = false;
            if (rows[0].cnt == 1)
                isRegistered = true;
            
            if (typeof callback === "function") {
                callback(isRegistered);
            }

            conn.release();
        });
    });
};

/* Exports */
module.exports = pool;

/* index.js */
module.exports.id_checkLoginName            = id_checkLoginName;
module.exports.id_checkLoginPassword        = id_checkLoginPassword;
module.exports.id_isAdmin                   = id_isAdmin;
module.exports.id_loginValidation           = id_loginValidation;

module.exports.id_getUserInfo               = id_getUserInfo;
module.exports.id_checkUserRegistered       = id_checkUserRegistered;
module.exports.id_registerUser              = id_registerUser;
module.exports.id_modifyUser                = id_modifyUser;
module.exports.id_deleteUser                = id_deleteUser;

module.exports.id_getWorkplaceInfo          = id_getWorkplaceInfo;
module.exports.id_getWorkplaceID            = id_getWorkplaceID;
module.exports.id_checkWorkplaceRegistered  = id_checkWorkplaceRegistered;
module.exports.id_registerWorkplace         = id_registerWorkplace;
module.exports.id_modifyWorkplace           = id_modifyWorkplace;
module.exports.id_deleteWorkplace           = id_deleteWorkplace;

module.exports.id_getBeaconInfo             = id_getBeaconInfo;
module.exports.id_getAvailableBeacon        = id_getAvailableBeacon;
module.exports.id_checkBeaconRegistered     = id_checkBeaconRegistered;
module.exports.id_registerBeacon            = id_registerBeacon;
module.exports.id_modifyBeacon              = id_modifyBeacon;
module.exports.id_deleteBeacon              = id_deleteBeacon;

module.exports.id_getSmartphoneAddress      = id_getSmartphoneAddress;
module.exports.id_checkAdmin                = id_checkAdmin;

module.exports.id_getCircumstance           = id_getCircumstance;


/* socket.js */
module.exports.soc_analyzeJSON              = soc_analyzeJSON;
module.exports.soc_getBeaconAddressArr      = soc_getBeaconAddressArr;
module.exports.soc_getUUIDArr               = soc_getUUIDArr;
module.exports.soc_getMajorArr              = soc_getMajorArr;
module.exports.soc_getMinorArr              = soc_getMinorArr;
module.exports.soc_getSmartphoneAddress     = soc_getSmartphoneAddress;
module.exports.soc_getDatetime              = soc_getDatetime;
module.exports.soc_gatewayValidation        = soc_gatewayValidation;
module.exports.soc_smartphoneValidation     = soc_smartphoneValidation;
module.exports.soc_getWorkplaceOfBeacons    = soc_getWorkplaceOfBeacons;
module.exports.soc_getWorkplaceName         = soc_getWorkplaceName;
module.exports.soc_getSmartphoneUserName    = soc_getSmartphoneUserName;
module.exports.soc_registerCommute          = soc_registerCommute;

module.exports.soc_RSSICalibration          = soc_RSSICalibration;
module.exports.soc_getEssentialData         = soc_getEssentialData;
module.exports.soc_getBeaconMACAddress      = soc_getBeaconMACAddress;
module.exports.soc_getRSSI                  = soc_getRSSI;

module.exports.soc_getCoordinate            = soc_getCoordinate;

module.exports.soc_amIRegistered            = soc_amIRegistered;