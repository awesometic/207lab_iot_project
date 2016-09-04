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
var currentTime = require('./currentTime');
var logger = require("./logger");

/* Functions */
/* index.js */
var id_checkLoginName = function(employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM identity WHERE employee_number=?", [employee_number], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            var cnt = rows[0].cnt;
            var valid = false;

            if (cnt == 1)
                valid = true;

            if (typeof callback === "function") {
                callback(valid);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_checkLoginPassword = function(employee_number, password, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM identity WHERE employee_number=? AND password=SHA2(?, 256)", [employee_number, password], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            var cnt = rows[0].cnt;
            var valid = false;

            if (cnt == 1)
                valid = true;

            if (typeof callback === "function") {
                callback(valid);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_isAdmin = function(employee_number, password, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT admin FROM identity WHERE employee_number=? AND password=SHA2(?, 256)", [employee_number, password], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            var isAdmin = false;
            if (rows[0].admin)
                isAdmin = true;

            if (typeof callback === "function") {
                callback(isAdmin);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_isPermitted = function(smartphone_address, employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT permission FROM identity WHERE smartphone_address=? AND employee_number=?", [smartphone_address, employee_number], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            var isPermitted = false;
            if (rows[0].permission)
                isPermitted = true;

            if (typeof callback === "function") {
                callback(isPermitted);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_loginValidation = function(employee_number, password, callback) {
    id_checkLoginName(employee_number, function(valid) {
        if (valid) {
            id_checkLoginPassword(employee_number, password, function(valid) {
                if (valid) {
                    id_isAdmin(employee_number, password, function(isAdmin) {
                        if (typeof callback === "function") {
                            callback(isAdmin);
                        }
                    });
                } else {
                    if (typeof callback === "function") {
                        callback("wrong password");
                    }
                }
            });
        } else {
            if (typeof callback === "function") {
                callback("unregistered");
            }
        }
    });
};

var id_getUserList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT * FROM identity", function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }
        });
    });
};

var id_getUserInfo = function(smartphone_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT * FROM identity WHERE smartphone_address=?", [smartphone_address], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows[0]);
            }
        });
    });
};

var id_checkUserRegistered = function(smartphone_address, employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM identity WHERE smartphone_address=? OR employee_number=?", [smartphone_address, employee_number], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            var cnt = rows[0].cnt;
            var valid = true;

            if (cnt > 0)
                valid = false;

            if (typeof callback === "function") {
                callback(valid);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_registerUser = function(smartphone_address, employee_number, name, password, department, position, permission, admin, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO identity (smartphone_address, employee_number, name, password, department, position, permission, admin)" +
            " VALUES (?, ?, ?, SHA2(?, 256), ?, ?, ?, ?)", [smartphone_address, employee_number, name, password, department, position, permission, admin], function (err) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(true);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_modifyUser = function(smartphone_address, employee_number, modify_name, modify_password, modify_department, modify_position, modify_admin, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        if (modify_password == null) {
            conn.query("UPDATE identity SET name=?, department=?, position=?, admin=? WHERE smartphone_address=? AND employee_number=?",
                [modify_name, modify_department, modify_position, modify_admin, smartphone_address, employee_number], function (err) {
                    if (err) {
                        console.error(err);
                        if (conn.connected) conn.release();
                    }

                    if (typeof callback === "function") {
                        callback(true);
                    }

                    if (conn.connected) conn.release();
                });
        } else {
            conn.query("UPDATE identity SET name=?, password=SHA2(?, 256), department=?, position=?, admin=? WHERE smartphone_address=? AND employee_number=?",
                [modify_name, modify_password, modify_department, modify_position, modify_admin, smartphone_address, employee_number], function (err) {
                    if (err) {
                        console.error(err);
                        if (conn.connected) conn.release();
                    }

                    if (typeof callback === "function") {
                        callback(true);
                    }

                    if (conn.connected) conn.release();
                });
        }
    });
};

var id_deleteUser = function(smartphone_address, employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM identity WHERE smartphone_address=? AND employee_number=?", [smartphone_address, employee_number], function (err) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(true);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_permitUsers = function(smartphone_address_arr, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        var sql = "UPDATE identity SET permission = 1 WHERE ";
        for (var i = 0; i < smartphone_address_arr.length; i++) {
            sql += "smartphone_address = " + conn.escape(smartphone_address_arr[i]);

            if (i != smartphone_address_arr.length - 1)
                sql += " OR ";
        }

        conn.query(sql, function (err) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(true);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_getWorkplaceList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT * FROM workplace", function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }
        });
    });
};

var id_getWorkplaceInfo = function(id_workplace, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT * FROM workplace WHERE id_workplace=?", [id_workplace], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
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
                        if (conn.connected) conn.release();
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

var id_registerWorkplace = function(name_workplace, location_workplace, latitude, longitude, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO workplace (name_workplace, location_workplace," +
            " coordinateX, coordinateY, coordinateZ," +
            " thresholdX, thresholdY, thresholdZ," +
            " latitude, longitude)" +
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [name_workplace, location_workplace, 0, 0, 0, 0, 0, 0, latitude, longitude], function (err) {
                if (err) {
                    console.error(err);
                    if (conn.connected) conn.release();
                }

                if (typeof callback === "function") {
                    callback(true);
                }

                if (conn.connected) conn.release();
            });
    });
};

var id_modifyWorkplace = function(id_workplace, modify_name_workplace, modify_location_workplace,
                                  modify_coordinateX, modify_coordinateY, modify_coordinateZ,
                                  modify_thresholdX, modify_thresholdY, modify_thresholdZ,
                                  modify_latitude, modify_longitude, modify_beacon_set,
                                  callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE workplace SET name_workplace=?, location_workplace=?," +
            "coordinateX=?, coordinateY=?, coordinateZ=?," +
            "thresholdX=?, thresholdY=?, thresholdZ=?," +
            "latitude=?, longitude=?, beacon_set=?" +
            " WHERE id_workplace=?",
            [modify_name_workplace, modify_location_workplace,
                modify_coordinateX, modify_coordinateY, modify_coordinateZ,
                modify_thresholdX, modify_thresholdY, modify_thresholdZ,
                modify_latitude, modify_longitude, modify_beacon_set,
                id_workplace], function(err) {
                if (err) {
                    console.error(err);
                    if (conn.connected) conn.release();
                }

                if (typeof callback === "function") {
                    callback(true);
                }

                if (conn.connected) conn.release();
            });
    });
};

var id_deleteWorkplace = function(id_workplace, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM workplace WHERE id_workplace=?", [id_workplace], function (err) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(true);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_getBeaconList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT *, id_workplace," +
            " (SELECT name_workplace FROM workplace WHERE beacon.id_workplace = workplace.id_workplace)" +
            " AS name_workplace FROM beacon", function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }
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
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows[0]);
            }
        });
    });
};

var id_getAvailableBeacon = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT * FROM beacon WHERE id_workplace=-1", function (err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            var availableBeacon = new Array();
            for (var i = 0; i < rows.length; i++) {
                availableBeacon.push(rows[i].beacon_address);
            }

            if (typeof callback === "function") {
                callback(availableBeacon);
            }

            if (conn.connected) conn.release();
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
                if (conn.connected) conn.release();
            }

            var cnt = rows[0].cnt;
            var valid = true;

            if (cnt > 0)
                valid = false;

            if (typeof callback === "function") {
                callback(valid);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_registerBeacon = function(beacon_address, uuid, major, minor, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO beacon (UUID, major, minor, beacon_address, id_workplace)" +
            " VALUES (?, ?, ?, ?, ?)", [uuid, major, minor, beacon_address, -1], function (err) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(true);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_modifyBeacon = function(beacon_address, modify_uuid, modify_major, modify_minor, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE beacon SET UUID=?, major=?, minor=? WHERE beacon_address=?", [modify_uuid, modify_major, modify_minor, beacon_address], function(err) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(true);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_deleteBeacon = function(beacon_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM beacon WHERE beacon_address=?", [beacon_address], function (err) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(true);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_getNotPermittedUserList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT * FROM identity WHERE permission = 0", function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_getUserListCond = function(department, position, permission, admin, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        var sql = "SELECT * FROM identity WHERE department LIKE " + conn.escape('%' + department + '%') +
            " AND position LIKE " + conn.escape('%' + position + '%') +
            " AND permission=" + conn.escape(permission) + " AND admin = " + conn.escape(admin);

        conn.query(sql, function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_getDepartmentList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT department FROM identity GROUP BY department", function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_getPositionList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT position FROM identity GROUP BY position", function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_getSmartphoneAddress = function(employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT smartphone_address FROM identity WHERE employee_number=?", [employee_number], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            var smartphone_address = rows[0].smartphone_address;

            if (typeof callback === "function") {
                callback(smartphone_address);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_checkAdmin = function(employee_number, smartphone_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT admin FROM identity WHERE employee_number=? AND smartphone_address=?", [employee_number, smartphone_address], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            var admin = false;
            if (rows[0].admin == 1)
                admin = true;

            if (typeof callback === "function") {
                callback(admin);
            }

            if (conn.connected) conn.release();
        });
    });
};

var id_getCompanyName = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT name FROM common", function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows[0].name);
            }

            if (conn.connected) conn.release();
        });
    });
};


/* socket.js */
var soc_gatewayValidation = function(beaconAddressArr, uuidArr, majorArr, minorArr, callback) {
    soc_getWorkplaceOfBeacons(beaconAddressArr, uuidArr, majorArr, minorArr, function(id) {
        soc_getWorkplaceName(id, function(name_workplace) {
            if (name_workplace != "undefined") {
                if (typeof callback === "function") {
                    callback(id);
                }
            } else {
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
                    if (conn.connected) conn.release();
                }

                if (typeof callback === "function") {
                    callback(rows[0].name_workplace);
                }

                if (conn.connected) conn.release();
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
                    if (conn.connected) conn.release();
                }

                if (typeof callback === "function") {
                    callback(rows[0].id_workplace);
                }

                if (conn.connected) conn.release();
            });
    });
};

var soc_smartphoneValidation = function(smartphone_address, callback) {

    soc_getSmartphoneUserName(smartphone_address, function(name) {

        if (name != "undefined") {
            if (typeof callback === "function") {
                callback(name);
            }
        } else {
            if (typeof callback === "function") {
                callback(false);
            }
        }
    });
};

var soc_getSmartphoneUserName = function(smartphone_address, callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT IF ((SELECT COUNT(*) AS cnt FROM identity WHERE smartphone_address=? HAVING cnt > 0)"
            + ", (SELECT name FROM identity WHERE smartphone_address=?), 'undefined') AS name"
            , [smartphone_address, smartphone_address]
            , function(err, rows) {
                if (err) {
                    console.error(err);
                    if (conn.connected) conn.release();
                }

                if (typeof callback === "function") {
                    callback(rows[0].name);
                }

                if (conn.connected) conn.release();
            });
    });
};

var soc_getSmartphoneUserEmployeeNumber = function(smartphoneAddress, callback) {

    pool.getConnection(function(err, conn) {
        conn.query("SELECT IF ((SELECT COUNT(*) AS cnt FROM identity WHERE smartphone_address=? HAVING cnt > 0)"
            + ", (SELECT employee_number FROM identity WHERE smartphone_address=?), 'undefined') AS employee_number"
            , [smartphoneAddress, smartphoneAddress]
            , function(err, rows) {
                if (err) {
                    console.error(err);
                    if (conn.connected) conn.release();
                }

                if (typeof callback === "function") {
                    callback(rows[0].employee_number);
                }

                if (conn.connected) conn.release();
            });
    });
};

var soc_registerCommute = function(smartphoneAddress, id_workplace, commuteStatus, datetime, callback) {
    pool.getConnection(function(err, conn) {
        conn.query("INSERT INTO circumstance (datetime, id_workplace, smartphone_address, commute_status)" +
            "VALUES (?, ?, ?, ?)", [datetime, id_workplace, smartphoneAddress, commuteStatus], function(err) {
            if (err) {
                console.error(err);

                if (typeof callback === "function") {
                    callback(false);
                }

                if (conn.connected) conn.release();

            } else {

                if (typeof callback === "function") {
                    callback(true);
                }

                if (conn.connected) conn.release();
            }
        });
    });
};

var soc_RSSICalibration = function(coordinateArr, thresholdArr, id, name, datetime, callback) {
    pool.getConnection(function(err, conn) {
        conn.query("UPDATE workplace SET coordinateX=?, coordinateY=?, coordinateZ=?, thresholdX=?, thresholdY=?, thresholdZ=?" +
            " WHERE id_workplace=?"
            , [coordinateArr[0], coordinateArr[1], coordinateArr[2], thresholdArr[0], thresholdArr[1], thresholdArr[2], id], function(err) {
                if (err) {
                    console.error(err);

                    if (typeof callback === "function") {
                        callback(false);
                    }

                    if (conn.connected) conn.release();

                } else {

                    if (typeof callback === "function") {
                        callback(true);
                    }

                    if (conn.connected) conn.release();
                }
            });
    });
};

var soc_getEssentialData = function(callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT workplace.id_workplace, coordinateX, coordinateY, coordinateZ, "
            + "thresholdX, thresholdY, thresholdZ, "
            + "GROUP_CONCAT(beacon.beacon_address SEPARATOR '-') AS beacon_address "
            + "FROM workplace, beacon WHERE workplace.id_workplace=beacon.id_workplace "
            + "AND workplace.beacon_set=1 "
            + "ORDER BY workplace.id_workplace", function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }

            if (conn.connected) conn.release();
        });
    });
};

var soc_getBeaconMACAddress = function(callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT beacon_address, id_workplace FROM beacon", function(err, rows) {
            if (err) {
                console.error(err);$(document).ready(function() {

                    $("#login-open-modal").click(function(){
                        $("#login-join-modal").modal();
                    });

                    $("#main-beacon-list").ready(function() {

                        $("#main-beacon-list").html()
                    });
                });

                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(JSON.stringify(rows));
            }

            if (conn.connected) conn.release();
        });
    });
};

var soc_getRSSI = function(callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT id_workplace, coordinateX, coordinateY, coordinateZ FROM workplace", function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(JSON.stringify(rows));
            }

            if (conn.connected) conn.release();
        });
    });
};

var soc_amIRegistered = function(smartphone_address, datetime, callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT COUNT(*) AS cnt FROM identity WHERE smartphone_address=?", [smartphone_address], function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            var isRegistered = false;
            if (rows[0].cnt == 1)
                isRegistered = true;

            if (typeof callback === "function") {
                callback(isRegistered);
            }

            if (conn.connected) conn.release();
        });
    });
};

/* Chart */
var chart_getPopulationOfDepartments = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        var sql = "SELECT department, COUNT(*) as count FROM identity GROUP BY department";

        conn.query(sql, function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }

            if (conn.connected) conn.release();
        });
    });
};

/**
 * It returns working time of the user or users
 * Parameters is not specified, but the sequence of each parameters is important
 * Each parameters should be:
 *  smartphone_address, id_workplace, startDatetime, endDatetime
 *
 * Parameter usage (count):
 *  0 (none)
 *  1 smartphone_address
 *  2 smartphone_address, id_workplace
 *  3 smartphone_address, id_workplace, startDatetime
 *  4 smartphone_address, id_workplace, startDatetime, endDatetime
 *  2 smartphone_address, startDatetime
 *  3 smartphone_address, startDatetime, endDatetime
 *  1 id_workplace
 *  2 id_workplace, startDatetime
 *  3 id_workplace, startDatetime, endDatetime
 *  1 startDatetime
 *  2 startDatetime, endDatetime
 *
 *  1
 *  smartphone_address
 *  id_workplace
 *  startDatetime
 *
 *  2
 *  smartphone_address, id_workplace
 *  smartphone_address, startDatetime
 *  id_workplace, startDatetime
 *  startDatetime, endDatetime
 *
 *  3
 *  smartphone_address, id_workplace, startDatetime
 *  smartphone_address, startDatetime, endDatetime
 *  id_workplace, startDatetime, endDatetime
 *
 *  4
 *  smartphone_address, id_workplace, startDatetime, endDatetime
 *
 *
 * It is not necessary to put all parameters in, even you can put no parameters in here
 * It returns specific working time as concepts
 */
var chart_getCircumstanceTable = function(arg1, arg2, arg3, arg4, callback) {
    var smartphone_address; // 00:00:00:00:00:00
    var id_workplace;
    var startDatetime; // 0000-00-00 00:00:00
    var endDatetime;

    var sql = "SELECT DATE_FORMAT(datetime, '%Y-%m-%d %H:%i:%s') AS datetime" +
        ", id_workplace, smartphone_address, commute_status" +
        ", (SELECT name_workplace FROM workplace WHERE circumstance.id_workplace = workplace.id_workplace) AS name_workplace" +
        ", (SELECT name FROM identity WHERE circumstance.smartphone_address = identity.smartphone_address) AS name_user" +
        " FROM circumstance";

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    callback = args.pop();

    if (args.length > 0) arg1 = args.shift(); else arg1 = null;
    if (args.length > 0) arg2 = args.shift(); else arg2 = null;
    if (args.length > 0) arg3 = args.shift(); else arg3 = null;
    if (args.length > 0) arg4 = args.shift(); else arg4 = null;

    if (arg1 != null) args.push(arg1);
    if (arg2 != null) args.push(arg2);
    if (arg3 != null) args.push(arg3);
    if (arg4 != null) args.push(arg4);

    pool.getConnection(function(err, conn) {
        if (err) {
            console.error(err);
            if (conn.connected) conn.release();
        }

        switch (args.length) {
            case 0:
                break;

            case 1:
                args[0] = String(args[0]);

                switch (args[0].length) {
                    case 17:
                        smartphone_address = args[0];
                        sql += " WHERE smartphone_address = " + conn.escape(smartphone_address);
                        break;

                    case 19:
                        startDatetime= currentTime.getCurrentTimezoneDateTime(args[0]);

                        sql += " WHERE datetime >= " + conn.escape(startDatetime);
                        break;

                    default:
                        id_workplace = args[0];
                        sql += " WHERE id_workplace = " + conn.escape(id_workplace);
                        break;
                }
                break;

            case 2:
                args[0] = String(args[0]);
                args[1] = String(args[1]);

                switch (args[0].length) {
                    case 17:
                        smartphone_address = args[0];

                        switch (args[1].length) {
                            case 19:
                                startDatetime = currentTime.getCurrentTimezoneDateTime(args[1]);
                                sql += " WHERE smartphone_address = " + conn.escape(smartphone_address) +
                                    " AND datetime >= "  + conn.escape(startDatetime);
                                break;

                            default:
                                id_workplace = args[1];
                                sql += " WHERE smartphone_address = " + conn.escape(smartphone_address) +
                                    " AND id_workplace = "  + conn.escape(id_workplace);
                                break;
                        }
                        break;

                    case 19:
                        startDatetime = currentTime.getCurrentTimezoneDateTime(args[0]);
                        endDatetime = currentTime.getCurrentTimezoneDateTime(args[1]);

                        sql += " WHERE datetime >= " + conn.escape(startDatetime) +
                            " AND datetime <= " + conn.escape(endDatetime);
                        break;

                    default:
                        id_workplace = args[0];
                        startDatetime = currentTime.getCurrentTimezoneDateTime(args[1]);
                        sql += " WHERE id_workplace = " + conn.escape(id_workplace) +
                            " AND datetime >= " + conn.escape(startDatetime);
                        break;
                }
                break;

            case 3:
                args[0] = String(args[0]);
                args[1] = String(args[1]);
                args[2] = String(args[2]);

                switch (args[0].length) {
                    case 17:
                        smartphone_address = args[0];

                        switch (args[1].length) {
                            case 19:
                                startDatetime = currentTime.getCurrentTimezoneDateTime(args[1]);
                                endDatetime = currentTime.getCurrentTimezoneDateTime(args[2]);
                                sql += " WHERE smartphone_address = " + conn.escape(smartphone_address) +
                                    " AND datetime >= " + conn.escape(startDatetime) + " AND datetime <= " + conn.escape(endDatetime);
                                break;

                            default:
                                id_workplace = args[1];
                                startDatetime = currentTime.getCurrentTimezoneDateTime(args[2]);
                                sql += " WHERE smartphone_address = " + conn.escape(smartphone_address) +
                                    "AND id_workplace = " + conn.escape(id_workplace) + " AND datetime >= " + conn.escape(startDatetime);
                                break;
                        }
                        break;

                    default:
                        id_workplace = args[0];
                        startDatetime = currentTime.getCurrentTimezoneDateTime(args[1]);
                        endDatetime = currentTime.getCurrentTimezoneDateTime(args[2]);
                        sql += " WHERE id_workplace = " + conn.escape(id_workplace) +
                            " AND datetime >= " + conn.escape(startDatetime) + " AND datetime <= " + conn.escape(endDatetime);
                        break;
                }
                break;

            case 4:
                args[0] = String(args[0]);
                args[1] = String(args[1]);
                args[2] = String(args[2]);
                args[3] = String(args[3]);

                smartphone_address = args[0];
                id_workplace = args[1];
                startDatetime = currentTime.getCurrentTimezoneDateTime(args[2]);
                endDatetime = currentTime.getCurrentTimezoneDateTime(args[3]);

                sql += " WHERE smartphone_address = " + conn.escape(smartphone_address) +
                    " AND id_workplace = " + conn.escape(id_workplace) +
                    " AND datetime >= " + conn.escape(startDatetime) + " AND datetime <= " + conn.escape(endDatetime);
                break;

            default:
                sql = null;
                break;
        }

        sql += " ORDER BY datetime DESC";

        conn.query(sql, function(err, rows) {
            if (err) {
                console.error(err);
                if (conn.connected) conn.release();
            }

            if (typeof callback === "function") {
                callback(rows);
            }

            if (conn.connected) conn.release();
        });
    });
};

/* Exports */
module.exports = pool;

/* index.js */
module.exports.id_checkLoginName            = id_checkLoginName;
module.exports.id_checkLoginPassword        = id_checkLoginPassword;
module.exports.id_isAdmin                   = id_isAdmin;
module.exports.id_isPermitted               = id_isPermitted;
module.exports.id_loginValidation           = id_loginValidation;

module.exports.id_getUserList               = id_getUserList;
module.exports.id_getUserInfo               = id_getUserInfo;
module.exports.id_checkUserRegistered       = id_checkUserRegistered;
module.exports.id_registerUser              = id_registerUser;
module.exports.id_modifyUser                = id_modifyUser;
module.exports.id_deleteUser                = id_deleteUser;
module.exports.id_permitUsers               = id_permitUsers;

module.exports.id_getWorkplaceList          = id_getWorkplaceList;
module.exports.id_getWorkplaceInfo          = id_getWorkplaceInfo;
module.exports.id_getWorkplaceID            = id_getWorkplaceID;
module.exports.id_registerWorkplace         = id_registerWorkplace;
module.exports.id_modifyWorkplace           = id_modifyWorkplace;
module.exports.id_deleteWorkplace           = id_deleteWorkplace;

module.exports.id_getBeaconList             = id_getBeaconList;
module.exports.id_getBeaconInfo             = id_getBeaconInfo;
module.exports.id_getAvailableBeacon        = id_getAvailableBeacon;
module.exports.id_checkBeaconRegistered     = id_checkBeaconRegistered;
module.exports.id_registerBeacon            = id_registerBeacon;
module.exports.id_modifyBeacon              = id_modifyBeacon;
module.exports.id_deleteBeacon              = id_deleteBeacon;

module.exports.id_getNotPermittedUserList   = id_getNotPermittedUserList;
module.exports.id_getUserListCond           = id_getUserListCond;
module.exports.id_getDepartmentList         = id_getDepartmentList;
module.exports.id_getPositionList           = id_getPositionList;

module.exports.id_getSmartphoneAddress      = id_getSmartphoneAddress;
module.exports.id_checkAdmin                = id_checkAdmin;

module.exports.id_getCompanyName            = id_getCompanyName;

/* socket.js */
module.exports.soc_gatewayValidation        = soc_gatewayValidation;
module.exports.soc_smartphoneValidation     = soc_smartphoneValidation;
module.exports.soc_getWorkplaceOfBeacons    = soc_getWorkplaceOfBeacons;
module.exports.soc_getWorkplaceName         = soc_getWorkplaceName;
module.exports.soc_getSmartphoneUserName    = soc_getSmartphoneUserName;
module.exports.soc_getSmartphoneUserENum    = soc_getSmartphoneUserEmployeeNumber;
module.exports.soc_registerCommute          = soc_registerCommute;

module.exports.soc_RSSICalibration          = soc_RSSICalibration;
module.exports.soc_getEssentialData         = soc_getEssentialData;
module.exports.soc_getBeaconMACAddress      = soc_getBeaconMACAddress;
module.exports.soc_getRSSI                  = soc_getRSSI;

module.exports.soc_amIRegistered            = soc_amIRegistered;

/* Chart */
module.exports.chart_getPopulOfDepartment   = chart_getPopulationOfDepartments;
module.exports.chart_getCircumstanceTable   = chart_getCircumstanceTable;