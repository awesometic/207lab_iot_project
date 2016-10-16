/**
 *  Created by Yang Deokgyu AKA Awesometic
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
            conn.release();

            if (err) {
                console.error(err);
            }

            var cnt = rows[0].cnt;
            var valid = false;

            if (cnt == 1)
                valid = true;

            if (typeof callback === "function") {
                callback(valid);
            }
        });
    });
};

var id_checkLoginPassword = function(employee_number, password, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM identity WHERE employee_number=? AND password=SHA2(?, 256)", [employee_number, password], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            var cnt = rows[0].cnt;
            var valid = false;

            if (cnt == 1)
                valid = true;

            if (typeof callback === "function") {
                callback(valid);
            }
        });
    });
};

var id_isAdmin = function(employee_number, password, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT admin FROM identity WHERE employee_number=? AND password=SHA2(?, 256)", [employee_number, password], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            var isAdmin = false;
            if (rows[0].admin)
                isAdmin = true;

            if (typeof callback === "function") {
                callback(isAdmin);
            }
        });
    });
};

var id_isPermitted = function(smartphone_address, employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT permission FROM identity WHERE smartphone_address=? AND employee_number=?", [smartphone_address, employee_number], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            var isPermitted = false;
            if (rows[0].permission)
                isPermitted = true;

            if (typeof callback === "function") {
                callback(isPermitted);
            }
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
        conn.query("SELECT smartphone_address, employee_number, name, id_department, id_position," +
            " (SELECT name FROM department WHERE identity.id_department = department.id) AS department," +
            " (SELECT name FROM position WHERE identity.id_position = position.id) AS position, " +
            " permission, admin FROM identity", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
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
        conn.query("SELECT smartphone_address, employee_number, name, id_department, id_position," +
            " (SELECT name FROM department WHERE identity.id_department = department.id) AS department," +
            " (SELECT name FROM position WHERE identity.id_position = position.id) AS position, " +
            " permission, admin FROM identity WHERE smartphone_address = ?", [smartphone_address], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
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
            conn.release();

            if (err) {
                console.error(err);
            }

            var cnt = rows[0].cnt;
            var valid = true;

            if (cnt > 0)
                valid = false;

            if (typeof callback === "function") {
                callback(valid);
            }
        });
    });
};

var id_registerUser = function(smartphone_address, employee_number, name, password, id_department, id_position, permission, admin, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO identity (smartphone_address, employee_number, name, password, id_department, id_position, permission, admin)" +
            " VALUES (?, ?, ?, SHA2(?, 256), ?, ?, ?, ?)", [smartphone_address, employee_number, name, password, id_department, id_position, permission, admin], function (err) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_modifyUser = function(smartphone_address, employee_number, modify_name, modify_password, modify_id_department, modify_id_position, modify_admin, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        if (modify_password == null) {
            conn.query("UPDATE identity SET name=?, id_department=?, id_position=?, admin=? WHERE smartphone_address=? AND employee_number=?",
                [modify_name, modify_id_department, modify_id_position, modify_admin, smartphone_address, employee_number], function (err) {
                    conn.release();

                    if (err) {
                        console.error(err);
                    }

                    if (typeof callback === "function") {
                        callback(true);
                    }
                });
        } else {
            conn.query("UPDATE identity SET name=?, password=SHA2(?, 256), id_department=?, id_position=?, admin=? WHERE smartphone_address=? AND employee_number=?",
                [modify_name, modify_password, modify_id_department, modify_id_position, modify_admin, smartphone_address, employee_number], function (err) {
                    conn.release();

                    if (err) {
                        console.error(err);
                    }

                    if (typeof callback === "function") {
                        callback(true);
                    }
                });
        }
    });
};

var id_deleteUser = function(smartphone_address, employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM identity WHERE smartphone_address=? AND employee_number=?", [smartphone_address, employee_number], function (err) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
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
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_getWorkplaceList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT * FROM workplace", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
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
            conn.release();

            if (err) {
                console.error(err);
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
                    conn.release();

                    if (err) {
                        console.error(err);
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
                conn.release();

                if (err) {
                    console.error(err);
                }

                if (typeof callback === "function") {
                    callback(true);
                }
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
                conn.release();

                if (err) {
                    console.error(err);
                }

                if (typeof callback === "function") {
                    callback(true);
                }
            });
    });
};

var id_deleteWorkplace = function(id_workplace, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM workplace WHERE id_workplace=?", [id_workplace], function (err) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
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
            conn.release();

            if (err) {
                console.error(err);
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
            conn.release();

            if (err) {
                console.error(err);
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
            conn.release();

            if (err) {
                console.error(err);
            }

            var availableBeacon = new Array();
            for (var i = 0; i < rows.length; i++) {
                availableBeacon.push(rows[i].beacon_address);
            }

            if (typeof callback === "function") {
                callback(availableBeacon);
            }
        });
    });
};

var id_checkBeaconRegistered = function(beacon_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT count(*) cnt FROM beacon WHERE beacon_address=?", [beacon_address], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            var cnt = rows[0].cnt;
            var valid = true;

            if (cnt > 0)
                valid = false;

            if (typeof callback === "function") {
                callback(valid);
            }
        });
    });
};

var id_registerBeacon = function(beacon_address, uuid, major, minor, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO beacon (UUID, major, minor, beacon_address, id_workplace)" +
            " VALUES (?, ?, ?, ?, ?)", [uuid, major, minor, beacon_address, -1], function (err) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_modifyBeacon = function(beacon_address, modify_uuid, modify_major, modify_minor, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE beacon SET UUID=?, major=?, minor=? WHERE beacon_address=?", [modify_uuid, modify_major, modify_minor, beacon_address], function(err) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_deleteBeacon = function(beacon_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM beacon WHERE beacon_address=?", [beacon_address], function (err) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_getNotPermittedUserList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT * FROM identity WHERE permission = 0", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows);
            }
        });
    });
};

// TODO: need to edit. not working for now yet.
var id_getUserListCond = function(department, position, permission_level, admin, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        var sql = "SELECT * FROM identity WHERE department LIKE " + conn.escape('%' + department + '%') +
            " AND position LIKE " + conn.escape('%' + position + '%') +
            " AND permission_level =" + conn.escape(permission_level) + " AND admin = " + conn.escape(admin);

        conn.query(sql, function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows);
            }
        });
    });
};

var id_getDepartmentList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT department.id, department.name, COUNT(identity.id_department) AS population" +
            " FROM department LEFT JOIN identity ON department.id = identity.id_department" +
            " GROUP BY department.name ORDER BY population DESC", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows);
            }
        });
    });
};

var id_addDepartment = function(name, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO department (name) VALUES (?)", [name], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_modifyDepartment = function(id, name, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE department SET name = ? WHERE id = ?", [name, id], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_deleteDepartment = function(id, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM department WHERE id = ?", [id], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_getPositionList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT position.id, position.name, COUNT(identity.id_position) AS population" +
            " FROM position LEFT JOIN identity ON position.id = identity.id_position" +
            " GROUP BY position.name ORDER BY position.permission_level DESC", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows);
            }
        });
    });
};

var id_addPosition = function(name, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO `position` (name, permission_level) VALUES (?, 0)", [name], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_modifyPosition = function(id, name, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE position SET name = ? WHERE id = ?", [name, id], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_deletePosition = function(id, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("DELETE FROM position WHERE id = ?", [id], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_getSmartphoneAddress = function(employee_number, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT smartphone_address FROM identity WHERE employee_number=?", [employee_number], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            var smartphone_address = rows[0].smartphone_address;

            if (typeof callback === "function") {
                callback(smartphone_address);
            }
        });
    });
};

var id_checkAdmin = function(employee_number, smartphone_address, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT admin FROM identity WHERE employee_number=? AND smartphone_address=?", [employee_number, smartphone_address], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            var admin = false;
            if (rows[0].admin == 1)
                admin = true;

            if (typeof callback === "function") {
                callback(admin);
            }
        });
    });
};

var id_getCompanyName = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT company_name FROM common", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows[0].company_name);
            }
        });
    });
};

var id_editCompanyName = function(company_name, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE common SET company_name = ?",[company_name], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(true);
            }
        });
    });
};

var id_getWorkStartTime = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT work_start_time FROM common", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows[0].work_start_time);
            }
        });
    });
};

var id_getWorkEndTime = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT work_end_time FROM common", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows[0].work_end_time);
            }
        });
    });
};

var id_editWorkStartEndTime = function(work_start_time, work_end_time, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE common SET work_start_time = ?, work_end_time = ?"
            ,[work_start_time, work_end_time], function(err, rows) {
                conn.release();

                if (err) {
                    console.error(err);
                }

                if (typeof callback === "function") {
                    callback(true);
                }
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
                conn.release();

                if (err) {
                    console.error(err);
                }

                if (typeof callback === "function") {
                    callback(rows[0].name_workplace);
                }
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
                conn.release();

                if (err) {
                    console.error(err);
                }

                if (typeof callback === "function") {
                    callback(rows[0].id_workplace);
                }
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
                conn.release();

                if (err) {
                    console.error(err);
                }

                if (typeof callback === "function") {
                    callback(rows[0].name);
                }
            });
    });
};

var soc_getSmartphoneUserEmployeeNumber = function(smartphoneAddress, callback) {

    pool.getConnection(function(err, conn) {
        conn.query("SELECT IF ((SELECT COUNT(*) AS cnt FROM identity WHERE smartphone_address=? HAVING cnt > 0)"
            + ", (SELECT employee_number FROM identity WHERE smartphone_address=?), 'undefined') AS employee_number"
            , [smartphoneAddress, smartphoneAddress]
            , function(err, rows) {
                conn.release();

                if (err) {
                    console.error(err);
                }

                if (typeof callback === "function") {
                    callback(rows[0].employee_number);
                }
            });
    });
};

var soc_registerCommute = function(smartphoneAddress, id_workplace, commuteStatus, datetime, callback) {
    pool.getConnection(function(err, conn) {
        conn.query("INSERT INTO circumstance (datetime, id_workplace, smartphone_address, commute_status)" +
            " VALUES (?, ?, ?, ?)", [datetime, id_workplace, smartphoneAddress, commuteStatus], function(err) {
            conn.release();

            if (err) {
                console.error(err);

                if (typeof callback === "function") {
                    callback(false);
                }
            } else {

                if (typeof callback === "function") {
                    callback(true);
                }
            }
        });
    });
};

var soc_RSSICalibration = function(coordinateArr, thresholdArr, id, name, datetime, callback) {
    pool.getConnection(function(err, conn) {
        conn.query("UPDATE workplace SET coordinateX=?, coordinateY=?, coordinateZ=?, thresholdX=?, thresholdY=?, thresholdZ=?" +
            " WHERE id_workplace=?"
            , [coordinateArr[0], coordinateArr[1], coordinateArr[2], thresholdArr[0], thresholdArr[1], thresholdArr[2], id], function(err) {
                conn.release();

                if (err) {
                    console.error(err);

                    if (typeof callback === "function") {
                        callback(false);
                    }

                } else {

                    if (typeof callback === "function") {
                        callback(true);
                    }
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
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows);
            }
        });
    });
};

var soc_getBeaconMACAddress = function(callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT beacon_address, id_workplace FROM beacon", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);$(document).ready(function() {

                    $("#login-open-modal").click(function(){
                        $("#login-join-modal").modal();
                    });

                    $("#main-beacon-list").ready(function() {

                        $("#main-beacon-list").html()
                    });
                });
            }

            if (typeof callback === "function") {
                callback(JSON.stringify(rows));
            }
        });
    });
};

var soc_getRSSI = function(callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT id_workplace, coordinateX, coordinateY, coordinateZ FROM workplace", function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(JSON.stringify(rows));
            }
        });
    });
};

var soc_amIRegistered = function(smartphone_address, datetime, callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT COUNT(*) AS cnt FROM identity WHERE smartphone_address=?", [smartphone_address], function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            var isRegistered = false;
            if (rows[0].cnt == 1)
                isRegistered = true;

            if (typeof callback === "function") {
                callback(isRegistered);
            }
        });
    });
};

/* Chart */
var chart_getPopulationOfDepartments = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        var sql = "SELECT department.name AS department, COUNT(identity.id_department) AS count" +
            " FROM department, identity WHERE department.id = identity.id_department" +
            " GROUP BY identity.id_department";

        conn.query(sql, function(err, rows) {
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows);
            }
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
    var startDatetime;
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

                    case 10:
                    case 19:
                    case 39:
                        if (args[0].length != 10)
                            startDatetime = currentTime.convertCurrentTimezoneDateTime(args[0]);
                        else
                            startDatetime = args[0];

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
                            case 10:
                            case 19:
                            case 39:
                                if (args[1].length != 10)
                                    startDatetime = currentTime.convertCurrentTimezoneDateTime(args[1]);
                                else
                                    startDatetime = args[1];

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

                    case 10:
                    case 19:
                    case 39:
                        if (args[0].length != 10)
                            startDatetime = currentTime.convertCurrentTimezoneDateTime(args[0]);
                        else
                            startDatetime = args[0];

                        if (args[1].length != 10)
                            endDatetime = currentTime.convertCurrentTimezoneDateTime(args[1]);
                        else
                            endDatetime = args[1];

                        sql += " WHERE datetime >= " + conn.escape(startDatetime) +
                            " AND datetime <= " + conn.escape(endDatetime);
                        break;

                    default:
                        id_workplace = args[0];

                        if (args[1].length != 10)
                            startDatetime = currentTime.convertCurrentTimezoneDateTime(args[1]);
                        else
                            startDatetime = args[1];

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
                            case 10:
                            case 19:
                            case 39:
                                if (args[0].length != 10)
                                    startDatetime = currentTime.convertCurrentTimezoneDateTime(args[1]);
                                else
                                    startDatetime = args[1];

                                if (args[1].length != 10)
                                    endDatetime = currentTime.convertCurrentTimezoneDateTime(args[2]);
                                else
                                    endDatetime = args[2];

                                sql += " WHERE smartphone_address = " + conn.escape(smartphone_address) +
                                    " AND datetime >= " + conn.escape(startDatetime) + " AND datetime <= " + conn.escape(endDatetime);
                                break;

                            default:
                                id_workplace = args[1];

                                if (args[0].length != 10)
                                    startDatetime = currentTime.convertCurrentTimezoneDateTime(args[2]);
                                else
                                    startDatetime = args[2];

                                sql += " WHERE smartphone_address = " + conn.escape(smartphone_address) +
                                    "AND id_workplace = " + conn.escape(id_workplace) + " AND datetime >= " + conn.escape(startDatetime);
                                break;
                        }
                        break;

                    default:
                        id_workplace = args[0];

                        if (args[0].length != 10)
                            startDatetime = currentTime.convertCurrentTimezoneDateTime(args[1]);
                        else
                            startDatetime = args[1];

                        if (args[1].length != 10)
                            endDatetime = currentTime.convertCurrentTimezoneDateTime(args[2]);
                        else
                            endDatetime = args[2];

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

                if (args[0].length != 10)
                    startDatetime = currentTime.convertCurrentTimezoneDateTime(args[2]);
                else
                    startDatetime = args[2];

                if (args[1].length != 10)
                    endDatetime = currentTime.convertCurrentTimezoneDateTime(args[3]);
                else
                    endDatetime = args[3];

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
            conn.release();

            if (err) {
                console.error(err);
            }

            if (typeof callback === "function") {
                callback(rows);
            }
        });
    });
};

/**
 * Cannot evaluate by each workplace yet
 * Just shows you first come in to somewhere workplace datetime
 * @param arg1 will be smartphone address of specific user (option)
 * @param callback
 */
var chart_getTodayComeInTime = function(arg1, callback) {
    var smartphone_address; // 00:00:00:00:00:00

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    callback = args.pop();

    if (args.length > 0) arg1 = args.shift(); else arg1 = null;

    if (arg1 != null) args.push(arg1);

    var resultJsonString = '{ "userList" : [';
    var resultJson;

    id_getUserList(function(userListRows) {
        switch (args.length) {
            case 1:
                smartphone_address = String(args[0]);

                for (var i = 0; i < userListRows.length; i++) {
                    if (smartphone_address == userListRows[i].smartphone_address) {
                        resultJsonString += '{';
                        resultJsonString += '"todayComeInTime":"' + 'NO DATA' + '",';
                        resultJsonString += '"id_workplace":"' + 'NO DATA' + '",';
                        resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                        resultJsonString += '"name_workplace":"' + 'NO DATA' + '",';
                        resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                        resultJsonString += '}';

                        break;
                    }
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(smartphone_address, currentTime.getCurrentDate(), function(circumstanceRows) {
                    var lastIndex = circumstanceRows.length - 1;

                    for (var i = 0; i < circumstanceRows.length; i++) {
                        if (circumstanceRows[i].commute_status == 1)
                            lastIndex = i;
                    }

                    resultJson.userList[0].todayComeInTime = circumstanceRows[lastIndex].datetime;
                    resultJson.userList[0].id_workplace = circumstanceRows[lastIndex].id_workplace;
                    resultJson.userList[0].name_workplace = circumstanceRows[lastIndex].name_workplace;

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });

                break;

            default:
                for (var i = 0; i < userListRows.length; i++) {
                    resultJsonString += '{';
                    resultJsonString += '"todayComeInTime":"' + 'NO DATA' + '",';
                    resultJsonString += '"id_workplace":"' + 'NO DATA' + '",';
                    resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                    resultJsonString += '"name_workplace":"' + 'NO DATA' + '",';
                    resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                    resultJsonString += '}';

                    if (i < userListRows.length - 1)
                        resultJsonString += ',';
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(currentTime.getCurrentDate(), function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = 0; i < circumstanceRows.length; i++) {
                        for (var j = 0; j < resultJson.userList.length; j++) {
                            if (resultJson.userList[j].smartphone_address == circumstanceRows[i].smartphone_address) {
                                if (circumstanceRows[i].commute_status == 1) {
                                    resultJson.userList[j].todayComeInTime = circumstanceRows[i].datetime;
                                    resultJson.userList[j].id_workplace = circumstanceRows[i].id_workplace;
                                    resultJson.userList[j].name_workplace = circumstanceRows[i].name_workplace;
                                }
                            }
                        }
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });

                break;
        }
    });
};

/**
 * Cannot evaluate by each workplace yet
 * Just shows you last come out to somewhere workplace datetime
 * @param arg1 will be smartphone address of specific user (option)
 * @param callback
 */
var chart_getTodayComeOutTime = function(arg1, callback) {
    var smartphone_address; // 00:00:00:00:00:00

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    callback = args.pop();

    if (args.length > 0) arg1 = args.shift(); else arg1 = null;

    if (arg1 != null) args.push(arg1);

    var resultJsonString = '{ "userList" : [';
    var resultJson;

    id_getUserList(function(userListRows) {
        switch (args.length) {
            case 1:
                smartphone_address = String(args[0]);

                for (var i = 0; i < userListRows.length; i++) {
                    if (smartphone_address == userListRows[i].smartphone_address) {
                        resultJsonString += '{';
                        resultJsonString += '"todayComeOutTime":"' + 'NO DATA' + '",';
                        resultJsonString += '"id_workplace":"' + 'NO DATA' + '",';
                        resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                        resultJsonString += '"name_workplace":"' + 'NO DATA' + '",';
                        resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                        resultJsonString += '}';

                        break;
                    }
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(smartphone_address, currentTime.getCurrentDate(), function(circumstanceRows) {
                    var firstIndex = 0;

                    for (var i = circumstanceRows.length - 1; i >= 0; i--) {
                        if (circumstanceRows[i].commute_status == 0)
                            firstIndex = i;
                    }

                    resultJson.userList[0].todayComeOutTime = circumstanceRows[firstIndex].datetime;
                    resultJson.userList[0].id_workplace = circumstanceRows[firstIndex].id_workplace;
                    resultJson.userList[0].name_workplace = circumstanceRows[firstIndex].name_workplace;

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });

                break;

            default:
                for (var i = 0; i < userListRows.length; i++) {
                    resultJsonString += '{';
                    resultJsonString += '"todayComeOutTime":"' + 'NO DATA' + '",';
                    resultJsonString += '"id_workplace":"' + 'NO DATA' + '",';
                    resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                    resultJsonString += '"name_workplace":"' + 'NO DATA' + '",';
                    resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                    resultJsonString += '}';

                    if (i < userListRows.length - 1)
                        resultJsonString += ',';
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(currentTime.getCurrentDate(), function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = circumstanceRows.length - 1; i >= 0; i--) {
                        for (var j = 0; j < resultJson.userList.length; j++) {
                            if (resultJson.userList[j].smartphone_address == circumstanceRows[i].smartphone_address) {
                                if (circumstanceRows[i].commute_status == 0) {
                                    resultJson.userList[j].todayComeOutTime = circumstanceRows[i].datetime;
                                    resultJson.userList[j].id_workplace = circumstanceRows[i].id_workplace;
                                    resultJson.userList[j].name_workplace = circumstanceRows[i].name_workplace;
                                }
                            }
                        }
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });

                break;
        }
    });
};

/**
 * Evaluating by each workplace not functioning yet
 * Only involves today total working time for now
 * @param arg1 will be smartphone address of specific user (option)
 * @param callback
 */
var chart_getTodayWorkTime = function(arg1, callback) {
    var smartphone_address; // 00:00:00:00:00:00

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    callback = args.pop();

    if (args.length > 0) arg1 = args.shift(); else arg1 = null;

    if (arg1 != null) args.push(arg1);

    var resultJsonString = '{ "userList" : [';
    var resultJson;

    id_getUserList(function(userListRows) {
        id_getWorkplaceList(function(workplaceListRows) {
            switch (args.length) {
                case 1:
                    smartphone_address = String(args[0]);

                    for (var i = 0; i < userListRows.length; i++) {
                        if (smartphone_address == userListRows[i].smartphone_address) {
                            resultJsonString += '{';
                            resultJsonString += '"todayWorkingTime":"' + 'UNAVAILABLE' + '",';
                            resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                            resultJsonString += '"name_user":"' + userListRows[i].name + '",';
                            resultJsonString += '"workplaceList" : [';

                            for (var j = 0; j < workplaceListRows.length; j++) {
                                resultJsonString += '{';
                                resultJsonString += '"id_workplace":"' + workplaceListRows[j].id_workplace + '",';
                                resultJsonString += '"name_workplace":"' + workplaceListRows[j].name_workplace + '",';
                                resultJsonString += '"todayWorkingTime":"' + 'UNAVAILABLE' + '"';
                                resultJsonString += '}';

                                if (j < workplaceListRows.length - 1)
                                    resultJsonString += ',';
                            }

                            resultJsonString += ']}';

                            break;
                        }
                    }

                    resultJsonString += ']}';
                    resultJson = JSON.parse(resultJsonString);

                    chart_getTodayComeInTime(smartphone_address, function(todayComeInTime) {
                        chart_getTodayComeOutTime(smartphone_address, function(todayComeOutTime) {
                            if (todayComeInTime.userList[0].todayComeInTime != "NO DATA"
                                && todayComeOutTime.userList[0].todayComeOutTime != "NO DATA") {
                                var comeInTime = new Date(todayComeInTime.userList[0].todayComeInTime);
                                var comeOutTime = new Date(todayComeOutTime.userList[0].todayComeOutTime);

                                resultJson.userList[0].todayWorkingTime = (comeOutTime.getTime() - comeInTime.getTime()) / 1000;
                            }

                            if (typeof callback === "function") {
                                callback(resultJson);
                            }
                        });
                    });

                    break;

                default:
                    for (var i = 0; i < userListRows.length; i++) {
                        resultJsonString += '{';
                        resultJsonString += '"todayWorkingTime":"' + 'UNAVAILABLE' + '",';
                        resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                        resultJsonString += '"name_user":"' + userListRows[i].name + '",';
                        resultJsonString += '"workplaceList" : [';

                        for (var j = 0; j < workplaceListRows.length; j++) {
                            resultJsonString += '{';
                            resultJsonString += '"id_workplace":"' + workplaceListRows[j].id_workplace + '",';
                            resultJsonString += '"name_workplace":"' + workplaceListRows[j].name_workplace + '",';
                            resultJsonString += '"todayWorkingTime":"' + 'UNAVAILABLE' + '"';
                            resultJsonString += '}';

                            if (j < workplaceListRows.length - 1)
                                resultJsonString += ',';
                        }

                        resultJsonString += ']}';

                        if (i < userListRows.length - 1)
                            resultJsonString += ',';
                    }

                    resultJsonString += ']}';
                    resultJson = JSON.parse(resultJsonString);

                    chart_getTodayComeInTime(function(todayComeInTime) {
                        chart_getTodayComeOutTime(function(todayComeOutTime) {
                            for (var i = 0; i < todayComeInTime.userList.length; i++) {
                                if (todayComeInTime.userList[i].todayComeInTime != "NO DATA"
                                    && todayComeOutTime.userList[i].todayComeOutTime != "NO DATA") {
                                    var comeInTime = new Date(todayComeInTime.userList[i].todayComeInTime);
                                    var comeOutTime = new Date(todayComeOutTime.userList[i].todayComeOutTime);

                                    resultJson.userList[i].todayWorkingTime = (comeOutTime.getTime() - comeInTime.getTime()) / 1000;
                                }
                            }

                            if (typeof callback === "function") {
                                callback(resultJson);
                            }
                        });
                    });

                    break;
            }
        });
    });
};

/**
 * To get average come to work time at specific period
 * The sequence of each parameters is important due to setting up period if it's needed
 *
 * You can put parameters in this like
 * (# is number of parameters)
 * 0
 * (It returns all user's circumstance data of all period)
 *
 * 1
 * smartphone_address
 *
 * 2
 * startDate, endDate
 *
 * 3
 * startDate, endDate, smartphone_address
 *
 * @param arg1 will be start date (option)
 * @param arg2 will be end date (option)
 * @param arg3 will be smartphone address of specific user (option)
 * @param callback
 */
var chart_getAvgComeInTime = function(arg1, arg2, arg3, callback) {
    var startDate;
    var endDate;
    var smartphone_address; // 00:00:00:00:00:00

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    callback = args.pop();

    if (args.length > 0) arg1 = args.shift(); else arg1 = null;
    if (args.length > 0) arg2 = args.shift(); else arg2 = null;
    if (args.length > 0) arg3 = args.shift(); else arg3 = null;

    if (arg1 != null) args.push(arg1);
    if (arg2 != null) args.push(arg2);
    if (arg3 != null) args.push(arg3);

    var resultJsonString = '{ "userList" : [';
    var resultJson;

    id_getUserList(function(userListRows) {
        switch (args.length) {
            case 1:
                args[0] = String(args[0]);
                smartphone_address = args[0];

                for (var i = 0; i < userListRows.length; i++) {
                    if (userListRows[i].smartphone_address == smartphone_address) {
                        resultJsonString += '{';
                        resultJsonString += '"avgComeInTime":"' + 'UNAVAILABLE' + '",';
                        resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                        resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                        resultJsonString += '}';

                        break;
                    }
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(startDate, endDate, function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = 0; i < resultJson.userList.length; i++) {
                        var calculatedDate = '1970-01-02';
                        var timeMsecArray = [];

                        for (var j = circumstanceRows.length - 1; j >= 0; j--) {
                            if (circumstanceRows[j].commute_status == 1) {
                                var currentRowDate = currentTime.convertCurrentTimezoneDateTime(String(new Date(circumstanceRows[j].datetime))).split(' ')[0];

                                if (calculatedDate == currentRowDate)
                                    continue;
                                else
                                    calculatedDate = currentRowDate;

                                timeMsecArray.push(new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime());
                            }
                        }

                        if (timeMsecArray.length > 0) {
                            var avgComeInTime = 0;

                            for (var j = 0; j < timeMsecArray.length; j++)
                                avgComeInTime += timeMsecArray[j];

                            avgComeInTime /= timeMsecArray.length;

                            resultJson.userList[i].avgComeInTime = String(new Date(avgComeInTime)).split(' ')[4];
                        }

                        timeMsecArray = null;
                        calculatedDate = '1970-01-02';
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });


                break;

            case 2:
                args[0] = String(args[0]);
                args[1] = String(args[1]);

                if (args[0].length != 10)
                    startDate = currentTime.convertCurrentTimezoneDateTime(args[0]);
                else
                    startDate = args[0];

                if (args[1].length != 10)
                    endDate = currentTime.convertCurrentTimezoneDateTime(args[1]);
                else
                    endDate = args[1];

                for (var i = 0; i < userListRows.length; i++) {
                    resultJsonString += '{';
                    resultJsonString += '"avgComeInTime":"' + 'UNAVAILABLE' + '",';
                    resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                    resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                    resultJsonString += '}';

                    if (i < userListRows.length - 1)
                        resultJsonString += ',';
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(startDate, endDate, function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = 0; i < resultJson.userList.length; i++) {
                        var calculatedDate = '1970-01-02';
                        var timeMsecArray = [];

                        for (var j = circumstanceRows.length - 1; j >= 0; j--) {
                            if (resultJson.userList[i].smartphone_address == circumstanceRows[j].smartphone_address) {
                                if (circumstanceRows[j].commute_status == 1) {
                                    var currentRowDate = currentTime.convertCurrentTimezoneDateTime(String(new Date(circumstanceRows[j].datetime))).split(' ')[0];

                                    if (calculatedDate == currentRowDate)
                                        continue;
                                    else
                                        calculatedDate = currentRowDate;

                                    timeMsecArray.push(new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime());
                                }
                            }
                        }

                        if (timeMsecArray.length > 0) {
                            var avgComeInTime = 0;

                            for (var j = 0; j < timeMsecArray.length; j++)
                                avgComeInTime += timeMsecArray[j];

                            avgComeInTime /= timeMsecArray.length;

                            resultJson.userList[i].avgComeInTime = String(new Date(avgComeInTime)).split(' ')[4];
                        }

                        timeMsecArray = null;
                        calculatedDate = '1970-01-02';
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });

                break;

            case 3:
                args[0] = String(args[0]);
                args[1] = String(args[1]);
                args[2] = String(args[2]);

                if (args[0].length != 10)
                    startDate = currentTime.convertCurrentTimezoneDateTime(args[0]);
                else
                    startDate = args[0];

                if (args[1].length != 10)
                    endDate = currentTime.convertCurrentTimezoneDateTime(args[1]);
                else
                    endDate = args[1];

                smartphone_address = args[2];

                for (var i = 0; i < userListRows.length; i++) {
                    if (userListRows[i].smartphone_address == smartphone_address) {
                        resultJsonString += '{';
                        resultJsonString += '"avgComeInTime":"' + 'UNAVAILABLE' + '",';
                        resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                        resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                        resultJsonString += '}';

                        break;
                    }
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(startDate, endDate, smartphone_address, function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = 0; i < resultJson.userList.length; i++) {
                        var calculatedDate = '1970-01-02';
                        var timeMsecArray = [];

                        for (var j = circumstanceRows.length - 1; j >= 0; j--) {
                            if (circumstanceRows[j].commute_status == 1) {
                                var currentRowDate = currentTime.convertCurrentTimezoneDateTime(String(new Date(circumstanceRows[j].datetime))).split(' ')[0];

                                if (calculatedDate == currentRowDate)
                                    continue;
                                else
                                    calculatedDate = currentRowDate;

                                timeMsecArray.push(new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime());
                            }
                        }

                        if (timeMsecArray.length > 0) {
                            var avgComeInTime = 0;

                            for (var j = 0; j < timeMsecArray.length; j++)
                                avgComeInTime += timeMsecArray[j];

                            avgComeInTime /= timeMsecArray.length;

                            resultJson.userList[i].avgComeInTime = String(new Date(avgComeInTime)).split(' ')[4];
                        }

                        timeMsecArray = null;
                        calculatedDate = '1970-01-02';
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });


                break;

            default:
                for (var i = 0; i < userListRows.length; i++) {
                    resultJsonString += '{';
                    resultJsonString += '"avgComeInTime":"' + 'UNAVAILABLE' + '",';
                    resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                    resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                    resultJsonString += '}';

                    if (i < userListRows.length - 1)
                        resultJsonString += ',';
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = 0; i < resultJson.userList.length; i++) {
                        var calculatedDate = '1970-01-02';
                        var timeMsecArray = [];

                        for (var j = circumstanceRows.length - 1; j >= 0; j--) {
                            if (resultJson.userList[i].smartphone_address == circumstanceRows[j].smartphone_address) {
                                if (circumstanceRows[j].commute_status == 1) {
                                    var currentRowDate = currentTime.convertCurrentTimezoneDateTime(String(new Date(circumstanceRows[j].datetime))).split(' ')[0];

                                    if (calculatedDate == currentRowDate)
                                        continue;
                                    else
                                        calculatedDate = currentRowDate;

                                    timeMsecArray.push(new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime());
                                }
                            }
                        }

                        if (timeMsecArray.length > 0) {
                            var avgComeInTime = 0;

                            for (var j = 0; j < timeMsecArray.length; j++)
                                avgComeInTime += timeMsecArray[j];

                            avgComeInTime /= timeMsecArray.length;

                            resultJson.userList[i].avgComeInTime = String(new Date(avgComeInTime)).split(' ')[4];
                        }

                        timeMsecArray = null;
                        calculatedDate = '1970-01-02';
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });


                break;
        }
    });
};

/**
 * To get average come out of work time at specific period
 * The sequence of each parameters is important due to setting up period if it's needed
 *
 * You can put parameters in this like
 * (# is number of parameters)
 * 0
 * (It returns all user's circumstance data of all period)
 *
 * 1
 * smartphone_address
 *
 * 2
 * startDate, endDate
 *
 * 3
 * startDate, endDate, smartphone_address
 *
 * @param arg1 will be start date (option)
 * @param arg2 will be end date (option)
 * @param arg3 will be smartphone address of specific user (option)
 * @param callback
 */
var chart_getAvgComeOutTime = function(arg1, arg2, arg3, callback) {
    var startDate;
    var endDate;
    var smartphone_address; // 00:00:00:00:00:00

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    callback = args.pop();

    if (args.length > 0) arg1 = args.shift(); else arg1 = null;
    if (args.length > 0) arg2 = args.shift(); else arg2 = null;
    if (args.length > 0) arg3 = args.shift(); else arg3 = null;

    if (arg1 != null) args.push(arg1);
    if (arg2 != null) args.push(arg2);
    if (arg3 != null) args.push(arg3);

    var resultJsonString = '{ "userList" : [';
    var resultJson;

    id_getUserList(function(userListRows) {
        switch (args.length) {
            case 1:
                args[0] = String(args[0]);
                smartphone_address = args[0];

                for (var i = 0; i < userListRows.length; i++) {
                    if (userListRows[i].smartphone_address == smartphone_address) {
                        resultJsonString += '{';
                        resultJsonString += '"avgComeOutTime":"' + 'UNAVAILABLE' + '",';
                        resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                        resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                        resultJsonString += '}';

                        break;
                    }
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(smartphone_address, function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = 0; i < resultJson.userList.length; i++) {
                        var calculatedDate = '1970-01-02';
                        var timeMsecArray = [];

                        for (var j = 0; j < circumstanceRows.length; j++) {
                            if (circumstanceRows[j].commute_status == 0) {
                                var currentRowDate = currentTime.convertCurrentTimezoneDateTime(String(new Date(circumstanceRows[j].datetime))).split(' ')[0];

                                if (calculatedDate == currentRowDate)
                                    continue;
                                else
                                    calculatedDate = currentRowDate;

                                timeMsecArray.push(new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime());
                            }
                        }

                        if (timeMsecArray.length > 0) {
                            var avgComeOutTime = 0;

                            for (var j = 0; j < timeMsecArray.length; j++)
                                avgComeOutTime += timeMsecArray[j];

                            avgComeOutTime /= timeMsecArray.length;

                            resultJson.userList[i].avgComeOutTime = String(new Date(avgComeOutTime)).split(' ')[4];
                        }

                        timeMsecArray = null;
                        calculatedDate = '1970-01-02';
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });

                break;

            case 2:
                args[0] = String(args[0]);
                args[1] = String(args[1]);

                if (args[0].length != 10)
                    startDate = currentTime.convertCurrentTimezoneDateTime(args[0]);
                else
                    startDate = args[0];

                if (args[1].length != 10)
                    endDate = currentTime.convertCurrentTimezoneDateTime(args[1]);
                else
                    endDate = args[1];

                for (var i = 0; i < userListRows.length; i++) {
                    resultJsonString += '{';
                    resultJsonString += '"avgComeOutTime":"' + 'UNAVAILABLE' + '",';
                    resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                    resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                    resultJsonString += '}';

                    if (i < userListRows.length - 1)
                        resultJsonString += ',';
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(startDate, endDate, function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = 0; i < resultJson.userList.length; i++) {
                        var calculatedDate = '1970-01-02';
                        var timeMsecArray = [];

                        for (var j = 0; j < circumstanceRows.length; j++) {
                            if (resultJson.userList[i].smartphone_address == circumstanceRows[j].smartphone_address) {
                                if (circumstanceRows[j].commute_status == 0) {
                                    var currentRowDate = currentTime.convertCurrentTimezoneDateTime(String(new Date(circumstanceRows[j].datetime))).split(' ')[0];

                                    if (calculatedDate == currentRowDate)
                                        continue;
                                    else
                                        calculatedDate = currentRowDate;

                                    timeMsecArray.push(new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime());
                                }
                            }
                        }

                        if (timeMsecArray.length > 0) {
                            var avgComeOutTime = 0;

                            for (var j = 0; j < timeMsecArray.length; j++)
                                avgComeOutTime += timeMsecArray[j];

                            avgComeOutTime /= timeMsecArray.length;

                            resultJson.userList[i].avgComeOutTime = String(new Date(avgComeOutTime)).split(' ')[4];
                        }

                        timeMsecArray = null;
                        calculatedDate = '1970-01-02';
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });

                break;

            case 3:
                args[0] = String(args[0]);
                args[1] = String(args[1]);
                args[2] = String(args[2]);

                if (args[0].length != 10)
                    startDate = currentTime.convertCurrentTimezoneDateTime(args[0]);
                else
                    startDate = args[0];

                if (args[1].length != 10)
                    endDate = currentTime.convertCurrentTimezoneDateTime(args[1]);
                else
                    endDate = args[1];

                smartphone_address = args[2];

                for (var i = 0; i < userListRows.length; i++) {
                    if (userListRows[i].smartphone_address == smartphone_address) {
                        resultJsonString += '{';
                        resultJsonString += '"avgComeOutTime":"' + 'UNAVAILABLE' + '",';
                        resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                        resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                        resultJsonString += '}';

                        break;
                    }
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(startDate, endDate, smartphone_address, function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = 0; i < resultJson.userList.length; i++) {
                        var calculatedDate = '1970-01-02';
                        var timeMsecArray = [];

                        for (var j = 0; j < circumstanceRows.length; j++) {
                            if (circumstanceRows[j].commute_status == 0) {
                                var currentRowDate = currentTime.convertCurrentTimezoneDateTime(String(new Date(circumstanceRows[j].datetime))).split(' ')[0];

                                if (calculatedDate == currentRowDate)
                                    continue;
                                else
                                    calculatedDate = currentRowDate;

                                timeMsecArray.push(new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime());
                            }
                        }

                        if (timeMsecArray.length > 0) {
                            var avgComeOutTime = 0;

                            for (var j = 0; j < timeMsecArray.length; j++)
                                avgComeOutTime += timeMsecArray[j];

                            avgComeOutTime /= timeMsecArray.length;

                            resultJson.userList[i].avgComeOutTime = String(new Date(avgComeOutTime)).split(' ')[4];
                        }

                        timeMsecArray = null;
                        calculatedDate = '1970-01-02';
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });

                break;

            default:
                for (var i = 0; i < userListRows.length; i++) {
                    resultJsonString += '{';
                    resultJsonString += '"avgComeOutTime":"' + 'UNAVAILABLE' + '",';
                    resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                    resultJsonString += '"name_user":"' + userListRows[i].name + '"';
                    resultJsonString += '}';

                    if (i < userListRows.length - 1)
                        resultJsonString += ',';
                }

                resultJsonString += ']}';
                resultJson = JSON.parse(resultJsonString);

                chart_getCircumstanceTable(function (circumstanceRows) {
                    // Need to modify below to improve performance
                    for (var i = 0; i < resultJson.userList.length; i++) {
                        var calculatedDate = '1970-01-02';
                        var timeMsecArray = [];

                        for (var j = 0; j < circumstanceRows.length; j++) {
                            if (resultJson.userList[i].smartphone_address == circumstanceRows[j].smartphone_address) {
                                if (circumstanceRows[j].commute_status == 0) {
                                    var currentRowDate = currentTime.convertCurrentTimezoneDateTime(String(new Date(circumstanceRows[j].datetime))).split(' ')[0];

                                    if (calculatedDate == currentRowDate)
                                        continue;
                                    else
                                        calculatedDate = currentRowDate;

                                    timeMsecArray.push(new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime());
                                }
                            }
                        }

                        if (timeMsecArray.length > 0) {
                            var avgComeOutTime = 0;

                            for (var j = 0; j < timeMsecArray.length; j++)
                                avgComeOutTime += timeMsecArray[j];

                            avgComeOutTime /= timeMsecArray.length;

                            resultJson.userList[i].avgComeOutTime = String(new Date(avgComeOutTime)).split(' ')[4];
                        }

                        timeMsecArray = null;
                        calculatedDate = '1970-01-02';
                    }

                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });

                break;
        }
    });
};

/**
 * To get average time on work at specific period
 * The sequence of each parameters is important due to setting up period if it's needed
 *
 * You can put parameters in this like
 * (# is number of parameters)
 * 0
 * (It returns all user's circumstance data of all period)
 *
 * 1
 * smartphone_address
 *
 * 2
 * startDate, endDate
 *
 * 3
 * startDate, endDate, smartphone_address
 *
 * @param arg1 will be start date (option)
 * @param arg2 will be end date (option)
 * @param arg3 will be smartphone address of specific user (option)
 * @param callback
 */
var chart_getAvgWorkTime = function(arg1, arg2, arg3, callback) {
    var startDate;
    var endDate;
    var smartphone_address; // 00:00:00:00:00:00

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    callback = args.pop();

    if (args.length > 0) arg1 = args.shift(); else arg1 = null;
    if (args.length > 0) arg2 = args.shift(); else arg2 = null;
    if (args.length > 0) arg3 = args.shift(); else arg3 = null;

    if (arg1 != null) args.push(arg1);
    if (arg2 != null) args.push(arg2);
    if (arg3 != null) args.push(arg3);

    var resultJsonString = '{ "userList" : [';
    var resultJson;
    
    id_getUserList(function(userListRows) {
        id_getWorkplaceList(function(workplaceListRows) {
            switch (args.length) {
                case 1:
                    smartphone_address = String(args[0]);

                    for (var i = 0; i < userListRows.length; i++) {
                        if (smartphone_address == userListRow[i].smartphone_address) {
                            resultJsonString += '{';
                            resultJsonString += '"avgWorkingTime":"' + 'UNAVAILABLE' + '",';
                            resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                            resultJsonString += '"name_user":"' + userListRows[i].name + '",';
                            resultJsonString += '"workplaceList" : [';

                            for (var j = 0; j < workplaceListRows.length; j++) {
                                resultJsonString += '{';
                                resultJsonString += '"id_workplace":"' + workplaceListRows[j].id_workplace + '",';
                                resultJsonString += '"name_workplace":"' + workplaceListRows[j].name_workplace + '",';
                                resultJsonString += '"avgWorkingTime":"' + 'UNAVAILABLE' + '"';
                                resultJsonString += '}';

                                if (j < workplaceListRows.length - 1)
                                    resultJsonString += ',';
                            }

                            resultJsonString += ']}';

                            break;
                        }
                    }

                    resultJsonString += ']}';
                    resultJson = JSON.parse(resultJsonString);

                    chart_getAvgComeInTime(smartphone_address, function(avgComeInTime) {
                        chart_getAvgComeOutTime(smartphone_address, function(avgComeOutTime) {
                            for (var i = 0; i < avgComeInTime.userList.length; i++) {
                                if (avgComeInTime.userList[i].avgComeInTime != 'UNAVAILABLE'
                                    && avgComeOutTime.userList[i].avgComeOutTime != 'UNAVAILABLE') {
                                    var comeInTime = new Date('1970-01-02 ' + avgComeInTime.userList[i].avgComeInTime);
                                    var comeOutTime = new Date('1970-01-02 ' + avgComeOutTime.userList[i].avgComeOutTime);

                                    resultJson.userList[i].avgWorkingTime = (comeOutTime.getTime() - comeInTime.getTime()) / 1000;
                                }
                            }

                            if (typeof callback === "function") {
                                callback(resultJson);
                            }
                        });
                    });

                    break;
                
                case 2:
                    args[0] = String(args[0]);
                    args[1] = String(args[1]);

                    if (args[0].length != 10)
                        startDate = currentTime.convertCurrentTimezoneDateTime(args[0]);
                    else
                        startDate = args[0];

                    if (args[1].length != 10)
                        endDate = currentTime.convertCurrentTimezoneDateTime(args[1]);
                    else
                        endDate = args[1];

                    for (var i = 0; i < userListRows.length; i++) {
                        resultJsonString += '{';
                        resultJsonString += '"avgWorkingTime":"' + 'UNAVAILABLE' + '",';
                        resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                        resultJsonString += '"name_user":"' + userListRows[i].name + '",';
                        resultJsonString += '"workplaceList" : [';

                        for (var j = 0; j < workplaceListRows.length; j++) {
                            resultJsonString += '{';
                            resultJsonString += '"id_workplace":"' + workplaceListRows[j].id_workplace + '",';
                            resultJsonString += '"name_workplace":"' + workplaceListRows[j].name_workplace + '",';
                            resultJsonString += '"avgWorkingTime":"' + 'UNAVAILABLE' + '"';
                            resultJsonString += '}';

                            if (j < workplaceListRows.length - 1)
                                resultJsonString += ',';
                        }

                        resultJsonString += ']}';

                        if (i < userListRows.length - 1)
                            resultJsonString += ',';
                    }

                    resultJsonString += ']}';
                    resultJson = JSON.parse(resultJsonString);

                    chart_getAvgComeInTime(startDate, endDate, function(avgComeInTime) {
                        chart_getAvgComeOutTime(startDate, endDate, function(avgComeOutTime) {
                            for (var i = 0; i < avgComeInTime.userList.length; i++) {
                                if (avgComeInTime.userList[i].avgComeInTime != 'UNAVAILABLE'
                                    && avgComeOutTime.userList[i].avgComeOutTime != 'UNAVAILABLE') {
                                    var comeInTime = new Date('1970-01-02 ' + avgComeInTime.userList[i].avgComeInTime);
                                    var comeOutTime = new Date('1970-01-02 ' + avgComeOutTime.userList[i].avgComeOutTime);

                                    resultJson.userList[i].avgWorkingTime = (comeOutTime.getTime() - comeInTime.getTime()) / 1000;
                                }
                            }

                            if (typeof callback === "function") {
                                callback(resultJson);
                            }
                        });
                    });
                    
                    break;
                
                case 3:
                    args[0] = String(args[0]);
                    args[1] = String(args[1]);
                    args[2] = String(args[2]);

                    if (args[0].length != 10)
                        startDate = currentTime.convertCurrentTimezoneDateTime(args[0]);
                    else
                        startDate = args[0];

                    if (args[1].length != 10)
                        endDate = currentTime.convertCurrentTimezoneDateTime(args[1]);
                    else
                        endDate = args[1];

                    smartphone_address = args[2];

                    for (var i = 0; i < userListRows.length; i++) {
                        if (smartphone_address == userListRow[i].smartphone_address) {
                            resultJsonString += '{';
                            resultJsonString += '"avgWorkingTime":"' + 'UNAVAILABLE' + '",';
                            resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                            resultJsonString += '"name_user":"' + userListRows[i].name + '",';
                            resultJsonString += '"workplaceList" : [';

                            for (var j = 0; j < workplaceListRows.length; j++) {
                                resultJsonString += '{';
                                resultJsonString += '"id_workplace":"' + workplaceListRows[j].id_workplace + '",';
                                resultJsonString += '"name_workplace":"' + workplaceListRows[j].name_workplace + '",';
                                resultJsonString += '"avgWorkingTime":"' + 'UNAVAILABLE' + '"';
                                resultJsonString += '}';

                                if (j < workplaceListRows.length - 1)
                                    resultJsonString += ',';
                            }

                            resultJsonString += ']}';
                            
                            break;
                        }
                    }

                    resultJsonString += ']}';
                    resultJson = JSON.parse(resultJsonString);

                    chart_getAvgComeInTime(startDate, endDate, smartphone_address, function(avgComeInTime) {
                        chart_getAvgComeOutTime(startDate, endDate, smartphone_address, function(avgComeOutTime) {
                            for (var i = 0; i < avgComeInTime.userList.length; i++) {
                                if (avgComeInTime.userList[i].avgComeInTime != 'UNAVAILABLE'
                                    && avgComeOutTime.userList[i].avgComeOutTime != 'UNAVAILABLE') {
                                    var comeInTime = new Date('1970-01-02 ' + avgComeInTime.userList[i].avgComeInTime);
                                    var comeOutTime = new Date('1970-01-02 ' + avgComeOutTime.userList[i].avgComeOutTime);

                                    resultJson.userList[i].avgWorkingTime = (comeOutTime.getTime() - comeInTime.getTime()) / 1000;
                                }
                            }

                            if (typeof callback === "function") {
                                callback(resultJson);
                            }
                        });
                    });
                    
                    break;

                default:
                    for (var i = 0; i < userListRows.length; i++) {
                        resultJsonString += '{';
                        resultJsonString += '"avgWorkingTime":"' + 'UNAVAILABLE' + '",';
                        resultJsonString += '"smartphone_address":"' + userListRows[i].smartphone_address + '",';
                        resultJsonString += '"name_user":"' + userListRows[i].name + '",';
                        resultJsonString += '"workplaceList" : [';

                        for (var j = 0; j < workplaceListRows.length; j++) {
                            resultJsonString += '{';
                            resultJsonString += '"id_workplace":"' + workplaceListRows[j].id_workplace + '",';
                            resultJsonString += '"name_workplace":"' + workplaceListRows[j].name_workplace + '",';
                            resultJsonString += '"avgWorkingTime":"' + 'UNAVAILABLE' + '"';
                            resultJsonString += '}';

                            if (j < workplaceListRows.length - 1)
                                resultJsonString += ',';
                        }

                        resultJsonString += ']}';

                        if (i < userListRows.length - 1)
                            resultJsonString += ',';
                    }

                    resultJsonString += ']}';
                    resultJson = JSON.parse(resultJsonString);

                    chart_getAvgComeInTime(function(avgComeInTime) {
                        chart_getAvgComeOutTime(function(avgComeOutTime) {
                            for (var i = 0; i < avgComeInTime.userList.length; i++) {
                                if (avgComeInTime.userList[i].avgComeInTime != 'UNAVAILABLE'
                                    && avgComeOutTime.userList[i].avgComeOutTime != 'UNAVAILABLE') {
                                    var comeInTime = new Date('1970-01-02 ' + avgComeInTime.userList[i].avgComeInTime);
                                    var comeOutTime = new Date('1970-01-02 ' + avgComeOutTime.userList[i].avgComeOutTime);

                                    resultJson.userList[i].avgWorkingTime = (comeOutTime.getTime() - comeInTime.getTime()) / 1000;
                                }
                            }

                            if (typeof callback === "function") {
                                callback(resultJson);
                            }
                        });
                    });

                    break;
            }
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
module.exports.id_addDepartment             = id_addDepartment;
module.exports.id_modifyDepartment          = id_modifyDepartment;
module.exports.id_deleteDepartment          = id_deleteDepartment;
module.exports.id_getPositionList           = id_getPositionList;
module.exports.id_addPosition               = id_addPosition;
module.exports.id_modifyPosition            = id_modifyPosition;
module.exports.id_deletePosition            = id_deletePosition;

module.exports.id_getSmartphoneAddress      = id_getSmartphoneAddress;
module.exports.id_checkAdmin                = id_checkAdmin;

module.exports.id_getCompanyName            = id_getCompanyName;
module.exports.id_editCompanyName           = id_editCompanyName;
module.exports.id_getWorkStartTime          = id_getWorkStartTime;
module.exports.id_getWorkEndTime            = id_getWorkEndTime;
module.exports.id_editWorkStartEndTime      = id_editWorkStartEndTime;

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
module.exports.chart_getTodayComeInTime     = chart_getTodayComeInTime;
module.exports.chart_getTodayComeOutTime    = chart_getTodayComeOutTime;
module.exports.chart_getTodayWorkTime       = chart_getTodayWorkTime;
module.exports.chart_getAvgComeInTime       = chart_getAvgComeInTime;
module.exports.chart_getAvgComeOutTime      = chart_getAvgComeOutTime;
module.exports.chart_getAvgWorkTime         = chart_getAvgWorkTime;