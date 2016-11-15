/**
 *  Created by Yang Deokgyu a.k.a. Awesometic
 *
 *  This file is to connect to database
 *  The functions here are used at /routes/index.js, /public/libs/socket.js
 *
 *  In Node.js, as it is working based on asynchronous, "using callback parameter" is required to get data from database properly
 *  Below are references about it
 *  http://inspiredjw.tistory.com/entry/JavaScript-%EC%BD%9C%EB%B0%B1-%ED%95%A8%EC%88%98%EC%9D%98-%ED%99%9C%EC%9A%A9
 *  http://blog.jui.io/?p=19
 *  http://yubylab.tistory.com/entry/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EC%9D%98-%EC%BD%9C%EB%B0%B1%ED%95%A8%EC%88%98-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0
 *
 *  */

/* Init connection to the database */
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : '207lab',
    password        : '207lab',
    database        : 'project_CM'
});

/* Load the other libraries */
var async = require("async");
var currentTime = require('./currentTime');
var logger = require("./logger");

/* Functions */
/* index.js */
var checkLoginName = function(employee_number, callback) {
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

var checkLoginPassword = function(employee_number, password, callback) {
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

var isAdmin = function(employee_number, password, callback) {
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

var isPermitted = function(smartphone_address, employee_number, callback) {
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

var loginValidation = function(employee_number, password, callback) {
    checkLoginName(employee_number, function(valid) {
        if (valid) {
            checkLoginPassword(employee_number, password, function(valid) {
                if (valid) {
                    isAdmin(employee_number, password, function(isAdmin) {
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

var getUserList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT smartphone_address, employee_number, name, id_department, id_position," +
            " (SELECT name FROM department WHERE identity.id_department = department.id) AS department," +
            " (SELECT name FROM position WHERE identity.id_position = position.id) AS position, " +
            " permission, admin FROM identity WHERE smartphone_address NOT IN ('00:00:00:00:00:00')", function(err, rows) {
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

var getUserInfo = function(smartphone_address, callback) {
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

var checkUserRegistered = function(smartphone_address, employee_number, callback) {
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

var registerUser = function(smartphone_address, employee_number, name, password, id_department, id_position, permission, admin, callback) {
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

var modifyUser = function(smartphone_address, employee_number, modify_name, modify_password, modify_id_department, modify_id_position, modify_admin, callback) {
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

var deleteUser = function(smartphone_address, employee_number, callback) {
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

var permitUsers = function(smartphone_address_arr, callback) {
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

var getWorkplaceList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT * FROM workplace WHERE id_workplace > 0", function(err, rows) {
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

var getWorkplaceInfo = function(id_workplace, callback) {
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

var registerWorkplace = function(name_workplace, location_workplace, latitude, longitude, callback) {
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

var modifyWorkplace = function(id_workplace, modify_name_workplace, modify_location_workplace,
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

var deleteWorkplace = function(id_workplace, callback) {
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

var getBeaconList = function(callback) {
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

var getBeaconInfo = function(beacon_address, callback) {
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

var getAvailableBeacon = function(callback) {
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

var checkBeaconRegistered = function(beacon_address, callback) {
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

var registerBeacon = function(beacon_address, uuid, major, minor, id_workplace, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("INSERT INTO beacon (UUID, major, minor, beacon_address, id_workplace)" +
            " VALUES (?, ?, ?, ?, ?)", [uuid, major, minor, beacon_address, id_workplace], function (err) {
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

var modifyBeacon = function(beacon_address, modify_uuid, modify_major, modify_minor, modified_id_workplace, callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("UPDATE beacon SET UUID=?, major=?, minor=?, id_workplace=? WHERE beacon_address=?",
            [modify_uuid, modify_major, modify_minor, modified_id_workplace, beacon_address], function(err) {
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

var deleteBeacon = function(beacon_address, callback) {
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

var getNotPermittedUserList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);
        conn.query("SELECT smartphone_address, employee_number, name, id_department, id_position," +
            " (SELECT name FROM department WHERE identity.id_department = department.id) AS department," +
            " (SELECT name FROM position WHERE identity.id_position = position.id) AS position, " +
            " permission, admin FROM identity WHERE permission = 0", function(err, rows) {
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
var getUserListCond = function(department, position, permission_level, admin, callback) {
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

var getDepartmentList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT department.id, department.name, COUNT(identity.id_department) AS population" +
            " FROM department LEFT JOIN identity ON department.id = identity.id_department WHERE id > 0" +
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

var addDepartment = function(name, callback) {
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

var modifyDepartment = function(id, name, callback) {
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

var deleteDepartment = function(id, callback) {
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

var getPositionList = function(callback) {
    pool.getConnection(function(err, conn) {
        if (err)
            console.error(err);

        conn.query("SELECT position.id, position.name, COUNT(identity.id_position) AS population" +
            " FROM position LEFT JOIN identity ON position.id = identity.id_position WHERE id > 0" +
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

var addPosition = function(name, callback) {
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

var modifyPosition = function(id, name, callback) {
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

var deletePosition = function(id, callback) {
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

var getSmartphoneAddress = function(employee_number, callback) {
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

var checkAdmin = function(employee_number, smartphone_address, callback) {
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

var getCompanyName = function(callback) {
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

var editCompanyName = function(company_name, callback) {
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

var getWorkStartTime = function(callback) {
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

var getWorkEndTime = function(callback) {
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

var editWorkStartEndTime = function(work_start_time, work_end_time, callback) {
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
var gatewayValidation = function(beaconAddressArr, uuidArr, majorArr, minorArr, callback) {
    getWorkplaceOfBeacons(beaconAddressArr, uuidArr, majorArr, minorArr, function(id) {
        getWorkplaceName(id, function(name_workplace) {
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

var getWorkplaceName = function(id_workplace, callback) {
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

var getWorkplaceOfBeacons = function(beaconAddressArr, uuidArr, majorArr, minorArr, callback) {
    pool.getConnection(function(err, conn) {
        /* Needs change to better query than it if there would be */
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

var getBeaconsCountOfWorkplace = function(id_workplace, callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT COUNT(beacon.id_workplace) AS count" +
            " FROM workplace, beacon WHERE beacon.id_workplace = workplace.id_workplace AND workplace.id_workplace=?"
            , [id_workplace], function(err, rows) {
                conn.release();

                if (err) {
                    console.error(err);
                }

                if (typeof callback === "function") {
                    callback(rows[0].count);
                }
            });
    });
};

var smartphoneValidation = function(smartphone_address, callback) {

    getSmartphoneUserName(smartphone_address, function(name) {

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

var getSmartphoneUserName = function(smartphone_address, callback) {
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

var getSmartphoneUserEmployeeNumber = function(smartphoneAddress, callback) {

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

var registerCommute = function(smartphoneAddress, id_workplace, commuteStatus, datetime, callback) {
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

var RSSICalibration = function(coordinateArr, thresholdArr, id, name, datetime, callback) {
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

var getEssentialData = function(callback) {
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

var getBeaconMACAddress = function(callback) {
    pool.getConnection(function(err, conn) {
        conn.query("SELECT beacon_address, id_workplace FROM beacon", function(err, rows) {
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

var getRSSI = function(callback) {
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

var amIRegistered = function(smartphone_address, datetime, callback) {
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
var getPopulationOfDepartments = function(callback) {
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
var getCircumstanceTable = function(arg1, arg2, arg3, arg4, callback) {
    var smartphone_address; // 00:00:00:00:00:00
    var id_workplace;
    var startDatetime;
    var endDatetime;

    var sql = "SELECT DATE_FORMAT(datetime, '%Y-%m-%d %H:%i:%s') AS datetime" +
        ", id_workplace, smartphone_address, commute_status" +
        ", (SELECT name_workplace FROM workplace WHERE circumstance.id_workplace = workplace.id_workplace) AS name_workplace" +
        ", (SELECT name FROM identity WHERE circumstance.smartphone_address = identity.smartphone_address) AS name_user" +
        ", (SELECT id_department FROM identity WHERE circumstance.smartphone_address = identity.smartphone_address) AS id_department" +
        ", (SELECT id_position FROM identity WHERE circumstance.smartphone_address = identity.smartphone_address) AS id_position" +
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
 * This function returns a JSON object that is structured like
 *
 * The means of "valid" in each JSON Object is
 * the data measured with only successively completed stubs at a work cycle,
 * which means the time between commute_status == 1 and commute_status == 0
 *
 * {
 *     "userList":[{
 *         "smartphoneAddress",
 *         "employeeNumber",
 *         "name",
 *         "id_department",
 *         "id_position",
 *         "firstComeInTime",
 *         "lastComeOutTime",
 *         "validWorkingTime",
 *         "validOverWorkingTime"
 *     }],
 *     "workplaceList":[{
 *         "id_workplace",
 *         "name",
 *         "location",
 *         "latitude",
 *         "longitude",
 *         "firstComeInTime",
 *         "lastComeOutTime",
 *         "totalValidWorkingTime",
 *         "totalValidOverWorkingTime"
 *         "avgFirstComeInTime",
 *         "avgLastComeOutTime",
 *         "avgValidWorkingTime"
 *         "avgUserValidWorkingTime"
 *         "avgValidOverWorkingTime"
 *         "avgUserValidOverWorkingTime"
 *     }],
 *     "departmentList":[{
 *         "id_department",
 *         "name",
 *         "firstComeInTime",
 *         "lastComeOutTime",
 *         "totalValidWorkingTime",
 *         "totalValidOverWorkingTime"
 *         "avgFirstComeInTime",
 *         "avgLastComeOutTime",
 *         "avgValidWorkingTime"
 *         "avgUserValidWorkingTime"
 *         "avgValidOverWorkingTime"
 *         "avgUserValidOverWorkingTime"
 *     }],
 *     "positionList":[{
 *         "id_position",
 *         "name",
 *         "firstComeInTime",
 *         "lastComeOutTime",
 *         "totalValidWorkingTime",
 *         "totalValidOverWorkingTime"
 *         "avgFirstComeInTime",
 *         "avgLastComeOutTime",
 *         "avgValidWorkingTime"
 *         "avgUserValidWorkingTime"
 *         "avgValidOverWorkingTime"
 *         "avgUserValidOverWorkingTime"
 *     }]
 * }
 *
 * @param arg1 will be start date (option)
 * @param arg2 will be end date (option)
 * @param arg3 will be workplace id (option)
 * @param arg4 will be department id (option)
 * @param arg5 will be position id (option)
 * @param arg6 will be smartphone bluetooth address (option)
 * @param callback
 */
function getTodayCommuteInfo(arg1, arg2, arg3, arg4, arg5, arg6, callback) {
    var startDate, endDate;

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    callback = args.pop();

    if (args.length > 0) arg1 = args.shift(); else arg1 = null;
    if (args.length > 0) arg2 = args.shift(); else arg2 = null;
    if (args.length > 0) arg3 = args.shift(); else arg3 = null;
    if (args.length > 0) arg4 = args.shift(); else arg4 = null;
    if (args.length > 0) arg5 = args.shift(); else arg5 = null;
    if (args.length > 0) arg6 = args.shift(); else arg6 = null;

    if (arg1 != null) args.push(arg1);
    if (arg2 != null) args.push(arg2);
    if (arg3 != null) args.push(arg3);
    if (arg4 != null) args.push(arg4);
    if (arg5 != null) args.push(arg5);
    if (arg6 != null) args.push(arg6);

    // TODO: implement options
    switch (args.length) {
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

            getCircumstanceTable(startDate, endDate, function(circumstanceRows) {
                getTodayCommuteInfoSetupJson(circumstanceRows, function(todayCommuteInfo) {
                    if (typeof callback === 'function') {
                        callback(todayCommuteInfo);
                    }
                });
            });
            break;

        default:
            break;
    }
}

function getTodayCommuteInfoSetupJson(circumstanceRows, callback) {
    getUserList(function (userListRows) {
        getWorkplaceList(function (workplaceListRows) {
            getDepartmentList(function (departmentListRows) {
                getPositionList(function (positionListRows) {
                    getWorkStartTime(function (workStartTime) {
                        getWorkEndTime(function (workEndTime) {
                            var i, j, k;
                            var resultJsonString = '{';
                            var resultJson;

                            if (userListRows.length > 0) {
                                resultJsonString += '"userList":[';
                                for (i = 0; i < userListRows.length; i++) {
                                    resultJsonString += '{';
                                    resultJsonString += '"smartphoneAddress":"' + userListRows[i].smartphone_address + '",';
                                    resultJsonString += '"employeeNumber":"' + userListRows[i].employee_number + '",';
                                    resultJsonString += '"name":"' + userListRows[i].name + '",';
                                    resultJsonString += '"id_department":"' + userListRows[i].id_department + '",';
                                    resultJsonString += '"id_position":"' + userListRows[i].id_position + '",';
                                    resultJsonString += '"firstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"lastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"validWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"validOverWorkingTime":"' + 0 + '"';
                                    resultJsonString += '}';

                                    if (i < userListRows.length - 1)
                                        resultJsonString += ',';
                                }
                                resultJsonString += '],';
                            }

                            if (workplaceListRows.length > 0) {
                                resultJsonString += '"workplaceList":[';
                                for (i = 0; i < workplaceListRows.length; i++) {
                                    resultJsonString += '{';
                                    resultJsonString += '"id_workplace":"' + workplaceListRows[i].id_workplace + '",';
                                    resultJsonString += '"name":"' + workplaceListRows[i].name_workplace + '",';
                                    resultJsonString += '"location":"' + workplaceListRows[i].location + '",';
                                    resultJsonString += '"latitude":"' + workplaceListRows[i].latitude + '",';
                                    resultJsonString += '"longitude":"' + workplaceListRows[i].longitude + '",';
                                    resultJsonString += '"firstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"lastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"avgLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidOverWorkingTime":"' + 0 + '"';
                                    resultJsonString += '}';

                                    if (i < workplaceListRows.length - 1)
                                        resultJsonString += ',';
                                }
                                resultJsonString += '],';
                            }

                            if (departmentListRows.length > 0) {
                                resultJsonString += '"departmentList":[';
                                for (i = 0; i < departmentListRows.length; i++) {
                                    resultJsonString += '{';
                                    resultJsonString += '"id_department":"' + departmentListRows[i].id + '",';
                                    resultJsonString += '"name":"' + departmentListRows[i].name + '",';
                                    resultJsonString += '"firstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"lastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"avgLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidOverWorkingTime":"' + 0 + '"';
                                    resultJsonString += '}';

                                    if (i < departmentListRows.length - 1)
                                        resultJsonString += ',';
                                }
                                resultJsonString += '],';
                            }

                            if (positionListRows.length > 0) {
                                resultJsonString += '"positionList":[';
                                for (i = 0; i < positionListRows.length; i++) {
                                    resultJsonString += '{';
                                    resultJsonString += '"id_position":"' + positionListRows[i].id + '",';
                                    resultJsonString += '"name":"' + positionListRows[i].name + '",';
                                    resultJsonString += '"firstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"lastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"avgLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidOverWorkingTime":"' + 0 + '"';
                                    resultJsonString += '}';

                                    if (i < positionListRows.length - 1)
                                        resultJsonString += ',';
                                }
                                resultJsonString += ']';
                            }

                            resultJsonString += '}';
                            resultJson = JSON.parse(resultJsonString);

                            var workStartTimeMsec = new Date('1970-01-02 ' + workStartTime).getTime() - new Date('1970-01-02 00:00:00').getTime();
                            var workEndTimeMsec = new Date('1970-01-02 ' + workEndTime).getTime() - new Date('1970-01-02 00:00:00').getTime();
                            var comeInTimeMsec = 0;
                            var comeOutTimeMsec = 0;
                            var comeInTimeArr = [];
                            var comeOutTimeArr = [];
                            var validWorkingTimeArr = [];
                            var validOverWorkingTimeArr = [];
                            var isMidnightComeIn = false;

                            for (i = 0; i < resultJson.userList.length; i++) {
                                for (j = 0; j < circumstanceRows.length; j++) {
                                    if (circumstanceRows[j].smartphone_address == resultJson.userList[i].smartphoneAddress) {
                                        if (circumstanceRows[j].commute_status == 1) {
                                            comeInTimeMsec = new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                            if (comeInTimeMsec == 0) {
                                                isMidnightComeIn = true;
                                            }
                                        } else if (isMidnightComeIn || (comeInTimeMsec != 0 && circumstanceRows[j].commute_status == 0)) {
                                            comeOutTimeMsec = new Date('1970-01-02 ' + circumstanceRows[j].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                            if (comeOutTimeMsec > comeInTimeMsec) {
                                                comeInTimeArr.push(comeInTimeMsec);
                                                comeOutTimeArr.push(comeOutTimeMsec);
                                                validWorkingTimeArr.push(comeOutTimeMsec - comeInTimeMsec);

                                                if (comeInTimeMsec < workStartTimeMsec) {
                                                    validOverWorkingTimeArr.push(workStartTimeMsec - comeInTimeMsec);
                                                }
                                                if (comeOutTimeMsec > workEndTimeMsec) {
                                                    validOverWorkingTimeArr.push(comeOutTimeMsec - workEndTimeMsec);
                                                }

                                                isMidnightComeIn = false;
                                            }

                                            comeInTimeMsec = 0;
                                            comeOutTimeMsec = 0;
                                        } else {
                                            // continue;
                                        }
                                    }
                                }

                                if (comeInTimeArr.length > 0) {
                                    resultJson.userList[i].firstComeInTime = comeInTimeArr.sort()[0];
                                }
                                if (comeOutTimeArr.length > 0) {
                                    resultJson.userList[i].lastComeOutTime = comeOutTimeArr.sort()[comeOutTimeArr.length - 1];
                                }

                                for (j = 0; j < validWorkingTimeArr.length; j++) {
                                    resultJson.userList[i].validWorkingTime = parseInt(resultJson.userList[i].validWorkingTime) + validWorkingTimeArr[j];
                                }
                                for (j = 0; j < validOverWorkingTimeArr.length; j++) {
                                    resultJson.userList[i].validOverWorkingTime = parseInt(resultJson.userList[i].validOverWorkingTime) + validOverWorkingTimeArr[j];
                                }

                                comeInTimeMsec = 0;
                                comeOutTimeMsec = 0;
                                comeInTimeArr = [];
                                comeOutTimeArr = [];
                                validWorkingTimeArr = [];
                                validOverWorkingTimeArr = [];
                            }

                            var allUserComeInTimeArr = [];
                            var allUserComeOutTimeArr = [];
                            var allUserFirstComeInTimeArr = [];
                            var allUserLastComeOutTimeArr = [];
                            var allUserAvgWorkingTimeArr = [];
                            var allUserAvgOverWorkingTimeArr = [];
                            var eachUserAvgWorkingTimeMsec = 0;
                            var eachUserAvgOverWorkingTimeMsec = 0;
                            var isThisUserCommute = false;
                            var commutePersonCount = 0;
                            var overWorkingPersonCount = 0;

                            for (i = 0; i < resultJson.workplaceList.length; i++) {
                                for (j = 0; j < resultJson.userList.length; j++) {
                                    for (k = 0; k < circumstanceRows.length; k++) {
                                        if (circumstanceRows[k].id_workplace == resultJson.workplaceList[i].id_workplace
                                            && circumstanceRows[k].smartphone_address == resultJson.userList[j].smartphoneAddress) {

                                            if (circumstanceRows[k].commute_status == 1) {
                                                comeInTimeMsec = new Date('1970-01-02 ' + circumstanceRows[k].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeInTimeMsec == 0) {
                                                    isMidnightComeIn = true;
                                                }
                                            } else if (isMidnightComeIn || (comeInTimeMsec != 0 && circumstanceRows[k].commute_status == 0)) {
                                                comeOutTimeMsec = new Date('1970-01-02 ' + circumstanceRows[k].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeOutTimeMsec > comeInTimeMsec) {
                                                    comeInTimeArr.push(comeInTimeMsec);
                                                    comeOutTimeArr.push(comeOutTimeMsec);
                                                    validWorkingTimeArr.push(comeOutTimeMsec - comeInTimeMsec);

                                                    allUserComeInTimeArr.push(comeInTimeMsec);
                                                    allUserComeOutTimeArr.push(comeOutTimeMsec);

                                                    if (comeInTimeMsec < workStartTimeMsec) {
                                                        validOverWorkingTimeArr.push(workStartTimeMsec - comeInTimeMsec);
                                                    }
                                                    if (comeOutTimeMsec > workEndTimeMsec) {
                                                        validOverWorkingTimeArr.push(comeOutTimeMsec - workEndTimeMsec);
                                                    }

                                                    isMidnightComeIn = false;
                                                    isThisUserCommute = true;
                                                }

                                                comeInTimeMsec = 0;
                                                comeOutTimeMsec = 0;
                                            } else {
                                                // continue;
                                            }
                                        }
                                    }

                                    if (isThisUserCommute) {
                                        if (validWorkingTimeArr.length > 0) {
                                            for (k = 0; k < validWorkingTimeArr.length; k++) {
                                                eachUserAvgWorkingTimeMsec += validWorkingTimeArr[k];
                                                resultJson.workplaceList[i].totalValidWorkingTime = parseInt(resultJson.workplaceList[i].totalValidWorkingTime) + validWorkingTimeArr[k];
                                            }
                                            eachUserAvgWorkingTimeMsec /= validWorkingTimeArr.length;
                                        }

                                        if (validOverWorkingTimeArr.length > 0) {
                                            for (k = 0; k < validOverWorkingTimeArr.length; k++) {
                                                eachUserAvgOverWorkingTimeMsec += validOverWorkingTimeArr[k];
                                                resultJson.workplaceList[i].totalValidOverWorkingTime = parseInt(resultJson.workplaceList[i].totalValidOverWorkingTime) + validOverWorkingTimeArr[k];
                                            }
                                            eachUserAvgOverWorkingTimeMsec /= validOverWorkingTimeArr.length;
                                            overWorkingPersonCount++;
                                        }

                                        if (comeInTimeArr.length > 0) {
                                            allUserFirstComeInTimeArr.push(comeInTimeArr.sort()[0]);
                                        }
                                        if (comeOutTimeArr.length > 0) {
                                            allUserLastComeOutTimeArr.push(comeOutTimeArr.sort()[comeOutTimeArr.length - 1]);
                                        }
                                        if (eachUserAvgWorkingTimeMsec != 0) {
                                            allUserAvgWorkingTimeArr.push(eachUserAvgWorkingTimeMsec);
                                        }
                                        if (eachUserAvgOverWorkingTimeMsec != 0) {
                                            allUserAvgOverWorkingTimeArr.push(eachUserAvgOverWorkingTimeMsec);
                                        }

                                        commutePersonCount++;
                                    }

                                    comeInTimeMsec = 0;
                                    comeOutTimeMsec = 0;
                                    comeInTimeArr = [];
                                    comeOutTimeArr = [];
                                    validWorkingTimeArr = [];
                                    validOverWorkingTimeArr = [];
                                    eachUserAvgWorkingTimeMsec = 0;
                                    eachUserAvgOverWorkingTimeMsec = 0;
                                    isThisUserCommute = false;
                                }

                                if (commutePersonCount > 0) {
                                    resultJson.workplaceList[i].firstComeInTime = allUserComeInTimeArr.sort()[0];
                                    resultJson.workplaceList[i].lastComeOutTime = allUserComeOutTimeArr.sort()[allUserComeOutTimeArr.length - 1];

                                    for (j = 0; j < allUserFirstComeInTimeArr.length; j++) {
                                        resultJson.workplaceList[i].avgFirstComeInTime = parseInt(resultJson.workplaceList[i].avgFirstComeInTime) + allUserFirstComeInTimeArr[j];
                                    }
                                    resultJson.workplaceList[i].avgFirstComeInTime = parseInt(resultJson.workplaceList[i].avgFirstComeInTime) / allUserFirstComeInTimeArr.length;

                                    for (j = 0; j < allUserLastComeOutTimeArr.length; j++) {
                                        resultJson.workplaceList[i].avgLastComeOutTime = parseInt(resultJson.workplaceList[i].avgLastComeOutTime) + allUserLastComeOutTimeArr[j];
                                    }
                                    resultJson.workplaceList[i].avgLastComeOutTime = parseInt(resultJson.workplaceList[i].avgLastComeOutTime) / allUserLastComeOutTimeArr.length;

                                    for (j = 0; j < allUserAvgWorkingTimeArr.length; j++) {
                                        resultJson.workplaceList[i].avgValidWorkingTime = parseInt(resultJson.workplaceList[i].avgValidWorkingTime) + allUserAvgWorkingTimeArr[j];
                                    }
                                    resultJson.workplaceList[i].avgValidWorkingTime = parseInt(resultJson.workplaceList[i].avgValidWorkingTime) / allUserAvgWorkingTimeArr.length;
                                    resultJson.workplaceList[i].avgUserValidWorkingTime = parseInt(resultJson.workplaceList[i].totalValidWorkingTime) / commutePersonCount;

                                    if (allUserAvgOverWorkingTimeArr.length > 0) {
                                        for (j = 0; j < allUserAvgOverWorkingTimeArr.length; j++) {
                                            resultJson.workplaceList[i].avgValidOverWorkingTime = parseInt(resultJson.workplaceList[i].avgValidOverWorkingTime) + allUserAvgOverWorkingTimeArr[j];
                                        }
                                        resultJson.workplaceList[i].avgValidOverWorkingTime = parseInt(resultJson.workplaceList[i].avgValidOverWorkingTime) / allUserAvgOverWorkingTimeArr.length;
                                        resultJson.workplaceList[i].avgUserValidOverWorkingTime = parseInt(resultJson.workplaceList[i].totalValidOverWorkingTime) / overWorkingPersonCount;
                                    }
                                }

                                allUserComeInTimeArr = [];
                                allUserComeOutTimeArr = [];
                                allUserFirstComeInTimeArr = [];
                                allUserLastComeOutTimeArr = [];
                                allUserAvgWorkingTimeArr = [];
                                allUserAvgOverWorkingTimeArr = [];
                                commutePersonCount = 0;
                                overWorkingPersonCount = 0;
                            }

                            for (i = 0; i < resultJson.departmentList.length; i++) {
                                for (j = 0; j < resultJson.userList.length; j++) {
                                    for (k = 0; k < circumstanceRows.length; k++) {
                                        if (circumstanceRows[k].id_department == resultJson.departmentList[i].id_department
                                            && circumstanceRows[k].smartphone_address == resultJson.userList[j].smartphoneAddress) {

                                            if (circumstanceRows[k].commute_status == 1) {
                                                comeInTimeMsec = new Date('1970-01-02 ' + circumstanceRows[k].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeInTimeMsec == 0) {
                                                    isMidnightComeIn = true;
                                                }
                                            } else if (isMidnightComeIn || (comeInTimeMsec != 0 && circumstanceRows[k].commute_status == 0)) {
                                                comeOutTimeMsec = new Date('1970-01-02 ' + circumstanceRows[k].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeOutTimeMsec > comeInTimeMsec) {
                                                    comeInTimeArr.push(comeInTimeMsec);
                                                    comeOutTimeArr.push(comeOutTimeMsec);
                                                    validWorkingTimeArr.push(comeOutTimeMsec - comeInTimeMsec);

                                                    allUserComeInTimeArr.push(comeInTimeMsec);
                                                    allUserComeOutTimeArr.push(comeOutTimeMsec);

                                                    if (comeInTimeMsec < workStartTimeMsec) {
                                                        validOverWorkingTimeArr.push(workStartTimeMsec - comeInTimeMsec);
                                                    }
                                                    if (comeOutTimeMsec > workEndTimeMsec) {
                                                        validOverWorkingTimeArr.push(comeOutTimeMsec - workEndTimeMsec);
                                                    }

                                                    isMidnightComeIn = false;
                                                    isThisUserCommute = true;
                                                }

                                                comeInTimeMsec = 0;
                                                comeOutTimeMsec = 0;
                                            } else {
                                                // continue;
                                            }
                                        }
                                    }

                                    if (isThisUserCommute) {
                                        if (validWorkingTimeArr.length > 0) {
                                            for (k = 0; k < validWorkingTimeArr.length; k++) {
                                                eachUserAvgWorkingTimeMsec += validWorkingTimeArr[k];
                                                resultJson.departmentList[i].totalValidWorkingTime = parseInt(resultJson.departmentList[i].totalValidWorkingTime) + validWorkingTimeArr[k];
                                            }
                                            eachUserAvgWorkingTimeMsec /= validWorkingTimeArr.length;
                                        }

                                        if (validOverWorkingTimeArr.length > 0) {
                                            for (k = 0; k < validOverWorkingTimeArr.length; k++) {
                                                eachUserAvgOverWorkingTimeMsec += validOverWorkingTimeArr[k];
                                                resultJson.departmentList[i].totalValidOverWorkingTime = parseInt(resultJson.departmentList[i].totalValidOverWorkingTime) + validOverWorkingTimeArr[k];
                                            }
                                            eachUserAvgOverWorkingTimeMsec /= validOverWorkingTimeArr.length;
                                            overWorkingPersonCount++;
                                        }

                                        if (comeInTimeArr.length > 0) {
                                            allUserFirstComeInTimeArr.push(comeInTimeArr.sort()[0]);
                                        }
                                        if (comeOutTimeArr.length > 0) {
                                            allUserLastComeOutTimeArr.push(comeOutTimeArr.sort()[comeOutTimeArr.length - 1]);
                                        }
                                        if (eachUserAvgWorkingTimeMsec != 0) {
                                            allUserAvgWorkingTimeArr.push(eachUserAvgWorkingTimeMsec);
                                        }
                                        if (eachUserAvgOverWorkingTimeMsec != 0) {
                                            allUserAvgOverWorkingTimeArr.push(eachUserAvgOverWorkingTimeMsec);
                                        }

                                        commutePersonCount++;
                                    }

                                    comeInTimeMsec = 0;
                                    comeOutTimeMsec = 0;
                                    comeInTimeArr = [];
                                    comeOutTimeArr = [];
                                    validWorkingTimeArr = [];
                                    validOverWorkingTimeArr = [];
                                    eachUserAvgWorkingTimeMsec = 0;
                                    eachUserAvgOverWorkingTimeMsec = 0;
                                    isThisUserCommute = false;
                                }

                                if (commutePersonCount > 0) {
                                    resultJson.departmentList[i].firstComeInTime = allUserComeInTimeArr.sort()[0];
                                    resultJson.departmentList[i].lastComeOutTime = allUserComeOutTimeArr.sort()[allUserComeOutTimeArr.length - 1];

                                    for (j = 0; j < allUserFirstComeInTimeArr.length; j++) {
                                        resultJson.departmentList[i].avgFirstComeInTime = parseInt(resultJson.departmentList[i].avgFirstComeInTime) + allUserFirstComeInTimeArr[j];
                                    }
                                    resultJson.departmentList[i].avgFirstComeInTime = parseInt(resultJson.departmentList[i].avgFirstComeInTime) / allUserFirstComeInTimeArr.length;

                                    for (j = 0; j < allUserLastComeOutTimeArr.length; j++) {
                                        resultJson.departmentList[i].avgLastComeOutTime = parseInt(resultJson.departmentList[i].avgLastComeOutTime) + allUserLastComeOutTimeArr[j];
                                    }
                                    resultJson.departmentList[i].avgLastComeOutTime = parseInt(resultJson.departmentList[i].avgLastComeOutTime) / allUserLastComeOutTimeArr.length;

                                    for (j = 0; j < allUserAvgWorkingTimeArr.length; j++) {
                                        resultJson.departmentList[i].avgValidWorkingTime = parseInt(resultJson.departmentList[i].avgValidWorkingTime) + allUserAvgWorkingTimeArr[j];
                                    }
                                    resultJson.departmentList[i].avgValidWorkingTime = parseInt(resultJson.departmentList[i].avgValidWorkingTime) / allUserAvgWorkingTimeArr.length;
                                    resultJson.departmentList[i].avgUserValidWorkingTime = parseInt(resultJson.departmentList[i].totalValidWorkingTime) / commutePersonCount;

                                    if (allUserAvgOverWorkingTimeArr.length > 0) {
                                        for (j = 0; j < allUserAvgOverWorkingTimeArr.length; j++) {
                                            resultJson.departmentList[i].avgValidOverWorkingTime = parseInt(resultJson.departmentList[i].avgValidOverWorkingTime) + allUserAvgOverWorkingTimeArr[j];
                                        }
                                        resultJson.departmentList[i].avgValidOverWorkingTime = parseInt(resultJson.departmentList[i].avgValidOverWorkingTime) / allUserAvgOverWorkingTimeArr.length;
                                        resultJson.departmentList[i].avgUserValidOverWorkingTime = parseInt(resultJson.departmentList[i].totalValidOverWorkingTime) / overWorkingPersonCount;
                                    }
                                }

                                allUserComeInTimeArr = [];
                                allUserComeOutTimeArr = [];
                                allUserFirstComeInTimeArr = [];
                                allUserLastComeOutTimeArr = [];
                                allUserAvgWorkingTimeArr = [];
                                allUserAvgOverWorkingTimeArr = [];
                                commutePersonCount = 0;
                                overWorkingPersonCount = 0;
                            }

                            for (i = 0; i < resultJson.positionList.length; i++) {
                                for (j = 0; j < resultJson.userList.length; j++) {
                                    for (k = 0; k < circumstanceRows.length; k++) {
                                        if (circumstanceRows[k].id_position == resultJson.positionList[i].id_position
                                            && circumstanceRows[k].smartphone_address == resultJson.userList[j].smartphoneAddress) {

                                            if (circumstanceRows[k].commute_status == 1) {
                                                comeInTimeMsec = new Date('1970-01-02 ' + circumstanceRows[k].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeInTimeMsec == 0) {
                                                    isMidnightComeIn = true;
                                                }
                                            } else if (isMidnightComeIn || (comeInTimeMsec != 0 && circumstanceRows[k].commute_status == 0)) {
                                                comeOutTimeMsec = new Date('1970-01-02 ' + circumstanceRows[k].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeOutTimeMsec > comeInTimeMsec) {
                                                    comeInTimeArr.push(comeInTimeMsec);
                                                    comeOutTimeArr.push(comeOutTimeMsec);
                                                    validWorkingTimeArr.push(comeOutTimeMsec - comeInTimeMsec);

                                                    allUserComeInTimeArr.push(comeInTimeMsec);
                                                    allUserComeOutTimeArr.push(comeOutTimeMsec);

                                                    if (comeInTimeMsec < workStartTimeMsec) {
                                                        validOverWorkingTimeArr.push(workStartTimeMsec - comeInTimeMsec);
                                                    }
                                                    if (comeOutTimeMsec > workEndTimeMsec) {
                                                        validOverWorkingTimeArr.push(comeOutTimeMsec - workEndTimeMsec);
                                                    }

                                                    isMidnightComeIn = false;
                                                    isThisUserCommute = true;
                                                }

                                                comeInTimeMsec = 0;
                                                comeOutTimeMsec = 0;
                                            } else {
                                                // continue;
                                            }
                                        }
                                    }

                                    if (isThisUserCommute) {
                                        if (validWorkingTimeArr.length > 0) {
                                            for (k = 0; k < validWorkingTimeArr.length; k++) {
                                                eachUserAvgWorkingTimeMsec += validWorkingTimeArr[k];
                                                resultJson.positionList[i].totalValidWorkingTime = parseInt(resultJson.positionList[i].totalValidWorkingTime) + validWorkingTimeArr[k];
                                            }
                                            eachUserAvgWorkingTimeMsec /= validWorkingTimeArr.length;
                                        }

                                        if (validOverWorkingTimeArr.length > 0) {
                                            for (k = 0; k < validOverWorkingTimeArr.length; k++) {
                                                eachUserAvgOverWorkingTimeMsec += validOverWorkingTimeArr[k];
                                                resultJson.positionList[i].totalValidOverWorkingTime = parseInt(resultJson.positionList[i].totalValidOverWorkingTime) + validOverWorkingTimeArr[k];
                                            }
                                            eachUserAvgOverWorkingTimeMsec /= validOverWorkingTimeArr.length;
                                            overWorkingPersonCount++;
                                        }

                                        if (comeInTimeArr.length > 0) {
                                            allUserFirstComeInTimeArr.push(comeInTimeArr.sort()[0]);
                                        }
                                        if (comeOutTimeArr.length > 0) {
                                            allUserLastComeOutTimeArr.push(comeOutTimeArr.sort()[comeOutTimeArr.length - 1]);
                                        }
                                        if (eachUserAvgWorkingTimeMsec != 0) {
                                            allUserAvgWorkingTimeArr.push(eachUserAvgWorkingTimeMsec);
                                        }
                                        if (eachUserAvgOverWorkingTimeMsec != 0) {
                                            allUserAvgOverWorkingTimeArr.push(eachUserAvgOverWorkingTimeMsec);
                                        }

                                        commutePersonCount++;
                                    }

                                    comeInTimeMsec = 0;
                                    comeOutTimeMsec = 0;
                                    comeInTimeArr = [];
                                    comeOutTimeArr = [];
                                    validWorkingTimeArr = [];
                                    validOverWorkingTimeArr = [];
                                    eachUserAvgWorkingTimeMsec = 0;
                                    eachUserAvgOverWorkingTimeMsec = 0;
                                    isThisUserCommute = false;
                                }

                                if (commutePersonCount > 0) {
                                    resultJson.positionList[i].firstComeInTime = allUserComeInTimeArr.sort()[0];
                                    resultJson.positionList[i].lastComeOutTime = allUserComeOutTimeArr.sort()[allUserComeOutTimeArr.length - 1];

                                    for (j = 0; j < allUserFirstComeInTimeArr.length; j++) {
                                        resultJson.positionList[i].avgFirstComeInTime = parseInt(resultJson.positionList[i].avgFirstComeInTime) + allUserFirstComeInTimeArr[j];
                                    }
                                    resultJson.positionList[i].avgFirstComeInTime = parseInt(resultJson.positionList[i].avgFirstComeInTime) / allUserFirstComeInTimeArr.length;

                                    for (j = 0; j < allUserLastComeOutTimeArr.length; j++) {
                                        resultJson.positionList[i].avgLastComeOutTime = parseInt(resultJson.positionList[i].avgLastComeOutTime) + allUserLastComeOutTimeArr[j];
                                    }
                                    resultJson.positionList[i].avgLastComeOutTime = parseInt(resultJson.positionList[i].avgLastComeOutTime) / allUserLastComeOutTimeArr.length;

                                    for (j = 0; j < allUserAvgWorkingTimeArr.length; j++) {
                                        resultJson.positionList[i].avgValidWorkingTime = parseInt(resultJson.positionList[i].avgValidWorkingTime) + allUserAvgWorkingTimeArr[j];
                                    }
                                    resultJson.positionList[i].avgValidWorkingTime = parseInt(resultJson.positionList[i].avgValidWorkingTime) / allUserAvgWorkingTimeArr.length;
                                    resultJson.positionList[i].avgUserValidWorkingTime = parseInt(resultJson.positionList[i].totalValidWorkingTime) / commutePersonCount;

                                    if (allUserAvgOverWorkingTimeArr.length > 0) {
                                        for (j = 0; j < allUserAvgOverWorkingTimeArr.length; j++) {
                                            resultJson.positionList[i].avgValidOverWorkingTime = parseInt(resultJson.positionList[i].avgValidOverWorkingTime) + allUserAvgOverWorkingTimeArr[j];
                                        }
                                        resultJson.positionList[i].avgValidOverWorkingTime = parseInt(resultJson.positionList[i].avgValidOverWorkingTime) / allUserAvgOverWorkingTimeArr.length;
                                        resultJson.positionList[i].avgUserValidOverWorkingTime = parseInt(resultJson.positionList[i].totalValidOverWorkingTime) / overWorkingPersonCount;
                                    }
                                }

                                allUserComeInTimeArr = [];
                                allUserComeOutTimeArr = [];
                                allUserFirstComeInTimeArr = [];
                                allUserLastComeOutTimeArr = [];
                                allUserAvgWorkingTimeArr = [];
                                allUserAvgOverWorkingTimeArr = [];
                                commutePersonCount = 0;
                                overWorkingPersonCount = 0;
                            }

                            if (typeof callback === "function") {
                                callback(resultJson);
                            }
                        });
                    });
                });
            });
        });
    });
}

/**
 * This function returns a JSON object that is structured like
 * {
 *     "userList":[{
 *         "smartphoneAddress",
 *         "employeeNumber",
 *         "name",
 *         "id_department",
 *         "id_position",
 *         "commuteDays",
 *         "overWorkingDays",
 *         "totalValidWorkingTime",
 *         "totalValidOverWorkingTime",
 *         "avgFirstComeInTime",
 *         "avgLastComeOutTime",
 *         "avgValidWorkingTime",
 *         "avgValidOverWorkingTime",
 *         "minFirstComeInTime",
 *         "minLastComeOutTime",
 *         "minValidWorkingTime",
 *         "minValidOverWorkingTime",
 *         "maxFirstComeInTime",
 *         "maxLastComeOutTime",
 *         "maxValidWorkingTime",
 *         "maxValidOverWorkingTime"
 *     }],
 *     "workplaceList":[{
 *         "id_workplace",
 *         "name",
 *         "location",
 *         "latitude",
 *         "longitude",
 *         "totalValidWorkingTime",
 *         "totalValidOverWorkingTime",
 *         "avgFirstComeInTime",
 *         "avgLastComeOutTime",
 *         "avgValidWorkingTime",
 *         "avgUserValidWorkingTime",
 *         "avgValidOverWorkingTime",
 *         "avgUserValidOverWorkingTime",
 *         "minFirstComeInTime",
 *         "minLastComeOutTime",
 *         "minValidWorkingTime",
 *         "minUserValidWorkingTime",
 *         "minValidOverWorkingTime",
 *         "minUserValidOverWorkingTime",
 *         "maxFirstComeInTime",
 *         "maxLastComeOutTime",
 *         "maxValidWorkingTime",
 *         "maxUserValidWorkingTime",
 *         "maxValidOverWorkingTime",
 *         "maxUserValidOverWorkingTime"
 *     }],
 *     "departmentList":[{
 *         "id_department",
 *         "name",
 *         "totalValidWorkingTime",
 *         "totalValidOverWorkingTime",
 *         "avgFirstComeInTime",
 *         "avgLastComeOutTime",
 *         "avgValidWorkingTime",
 *         "avgUserValidWorkingTime",
 *         "avgValidOverWorkingTime",
 *         "avgUserValidOverWorkingTime",
 *         "minFirstComeInTime",
 *         "minLastComeOutTime",
 *         "minValidWorkingTime",
 *         "minUserValidWorkingTime",
 *         "minValidOverWorkingTime",
 *         "minUserValidOverWorkingTime",
 *         "maxFirstComeInTime",
 *         "maxLastComeOutTime",
 *         "maxValidWorkingTime",
 *         "maxUserValidWorkingTime",
 *         "maxValidOverWorkingTime",
 *         "maxUserValidOverWorkingTime"
 *     }],
 *     "positionList":[{
 *         "id_position",
 *         "name",
 *         "totalValidWorkingTime",
 *         "totalValidOverWorkingTime",
 *         "avgFirstComeInTime",
 *         "avgLastComeOutTime",
 *         "avgValidWorkingTime",
 *         "avgUserValidWorkingTime",
 *         "avgValidOverWorkingTime",
 *         "avgUserValidOverWorkingTime",
 *         "minFirstComeInTime",
 *         "minLastComeOutTime",
 *         "minValidWorkingTime",
 *         "minUserValidWorkingTime",
 *         "minValidOverWorkingTime",
 *         "minUserValidOverWorkingTime",
 *         "maxFirstComeInTime",
 *         "maxLastComeOutTime",
 *         "maxValidWorkingTime",
 *         "maxUserValidWorkingTime",
 *         "maxValidOverWorkingTime",
 *         "maxUserValidOverWorkingTime"
 *     }]
 * }
 *
 * @param arg1 will be start date (option)
 * @param arg2 will be end date (option)
 * @param arg3 will be workplace id (option)
 * @param arg4 will be department id (option)
 * @param arg5 will be position id (option)
 * @param arg6 will be smartphone bluetooth address (option)
 * @param callback
 */
function getCommuteInfo(arg1, arg2, arg3, arg4, arg5, arg6, callback) {
    var startDate, endDate;

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    callback = args.pop();

    if (args.length > 0) arg1 = args.shift(); else arg1 = null;
    if (args.length > 0) arg2 = args.shift(); else arg2 = null;
    if (args.length > 0) arg3 = args.shift(); else arg3 = null;
    if (args.length > 0) arg4 = args.shift(); else arg4 = null;
    if (args.length > 0) arg5 = args.shift(); else arg5 = null;
    if (args.length > 0) arg6 = args.shift(); else arg6 = null;

    if (arg1 != null) args.push(arg1);
    if (arg2 != null) args.push(arg2);
    if (arg2 != null) args.push(arg3);
    if (arg2 != null) args.push(arg4);
    if (arg2 != null) args.push(arg5);
    if (arg2 != null) args.push(arg6);

    // TODO: implement options
    switch (args.length) {
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

            getCircumstanceTable(startDate, endDate, function (circumstanceRows) {
                getCommuteInfoSetupJson(circumstanceRows, function (resultJson) {
                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });
            });

            break;

        default:
            getCircumstanceTable(function (circumstanceRows) {
                getCommuteInfoSetupJson(circumstanceRows, function (resultJson) {
                    if (typeof callback === "function") {
                        callback(resultJson);
                    }
                });
            });

            break;
    }

}

function getCommuteInfoSetupJson(circumstanceRows, callback) {
    getUserList(function (userListRows) {
        getWorkplaceList(function (workplaceListRows) {
            getDepartmentList(function (departmentListRows) {
                getPositionList(function (positionListRows) {
                    getWorkStartTime(function (workStartTime) {
                        getWorkEndTime(function (workEndTime) {
                            var i;
                            var resultJsonString = '{';
                            var resultJson;

                            if (userListRows.length > 0) {
                                resultJsonString += '"userList":[';
                                for (i = 0; i < userListRows.length; i++) {
                                    resultJsonString += '{';
                                    resultJsonString += '"smartphoneAddress":"' + userListRows[i].smartphone_address + '",';
                                    resultJsonString += '"employeeNumber":"' + userListRows[i].employee_number + '",';
                                    resultJsonString += '"name":"' + userListRows[i].name + '",';
                                    resultJsonString += '"id_department":"' + userListRows[i].id_department + '",';
                                    resultJsonString += '"id_position":"' + userListRows[i].id_position + '",';
                                    resultJsonString += '"commuteDays":"' + 0 + '",';
                                    resultJsonString += '"overWorkingDays":"' + 0 + '",';
                                    resultJsonString += '"totalValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"avgLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"minLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"minValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"maxLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"maxValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxValidOverWorkingTime":"' + 0 + '"';
                                    resultJsonString += '}';

                                    if (i < userListRows.length - 1)
                                        resultJsonString += ',';
                                }
                                resultJsonString += '],';
                            }

                            if (workplaceListRows.length > 0) {
                                resultJsonString += '"workplaceList":[';
                                for (i = 0; i < workplaceListRows.length; i++) {
                                    resultJsonString += '{';
                                    resultJsonString += '"id_workplace":"' + workplaceListRows[i].id_workplace + '",';
                                    resultJsonString += '"name":"' + workplaceListRows[i].name_workplace + '",';
                                    resultJsonString += '"location":"' + workplaceListRows[i].location + '",';
                                    resultJsonString += '"latitude":"' + workplaceListRows[i].latitude + '",';
                                    resultJsonString += '"longitude":"' + workplaceListRows[i].longitude + '",';
                                    resultJsonString += '"totalValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"avgLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"minLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"minValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minUserValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"maxLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"maxValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxUserValidOverWorkingTime":"' + 0 + '"';
                                    resultJsonString += '}';

                                    if (i < workplaceListRows.length - 1)
                                        resultJsonString += ',';
                                }
                                resultJsonString += '],';
                            }

                            if (departmentListRows.length > 0) {
                                resultJsonString += '"departmentList":[';
                                for (i = 0; i < departmentListRows.length; i++) {
                                    resultJsonString += '{';
                                    resultJsonString += '"id_department":"' + departmentListRows[i].id + '",';
                                    resultJsonString += '"name":"' + departmentListRows[i].name + '",';
                                    resultJsonString += '"totalValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"avgLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"minLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"minValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minUserValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"maxLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"maxValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxUserValidOverWorkingTime":"' + 0 + '"';
                                    resultJsonString += '}';

                                    if (i < departmentListRows.length - 1)
                                        resultJsonString += ',';
                                }
                                resultJsonString += '],';
                            }

                            if (positionListRows.length > 0) {
                                resultJsonString += '"positionList":[';
                                for (i = 0; i < positionListRows.length; i++) {
                                    resultJsonString += '{';
                                    resultJsonString += '"id_position":"' + positionListRows[i].id + '",';
                                    resultJsonString += '"name":"' + positionListRows[i].name + '",';
                                    resultJsonString += '"totalValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"totalValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"avgLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"avgUserValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"minLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"minValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"minUserValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxFirstComeInTime":"' + 0 + '",';
                                    resultJsonString += '"maxLastComeOutTime":"' + 0 + '",';
                                    resultJsonString += '"maxValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxUserValidWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxValidOverWorkingTime":"' + 0 + '",';
                                    resultJsonString += '"maxUserValidOverWorkingTime":"' + 0 + '"';
                                    resultJsonString += '}';

                                    if (i < positionListRows.length - 1)
                                        resultJsonString += ',';
                                }
                                resultJsonString += ']';
                            }

                            resultJsonString += '}';
                            resultJson = JSON.parse(resultJsonString);

                            var workStartTimeMsec = new Date('1970-01-02 ' + workStartTime).getTime() - new Date('1970-01-02 00:00:00').getTime();
                            var workEndTimeMsec = new Date('1970-01-02 ' + workEndTime).getTime() - new Date('1970-01-02 00:00:00').getTime();

                            var circumstanceStartDate = circumstanceRows[0].datetime.split(' ')[0];
                            var circumstanceEndDate = circumstanceRows[circumstanceRows.length - 1].datetime.split(' ')[0];
                            var startDateStringArr = circumstanceStartDate.split('-');
                            var endDateStringArr = circumstanceEndDate.split('-');
                            var startDateObj = new Date(startDateStringArr[0], Number(startDateStringArr[1]) - 1, startDateStringArr[2]);
                            var endDateObj = new Date(endDateStringArr[0], Number(endDateStringArr[1]) - 1, endDateStringArr[2]);
                            var betweenDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / 1000 / 60 / 60 / 24) + 1;
                            var targetDate;

                            var comeInTimeMsec = 0;
                            var comeOutTimeMsec = 0;
                            var comeInTimeArr = [];
                            var comeOutTimeArr = [];
                            var validWorkingTimeArr = [];
                            var validOverWorkingTimeArr = [];

                            var allPeriodComeInTimeArr = [];
                            var allPeriodComeOutTimeArr = [];
                            var allPeriodValidWorkingTimeArr = [];
                            var allPeriodValidOverWorkingTimeArr = [];
                            var allPeriodFirstComeInTimeArr = [];
                            var allPeriodLastComeOutTimeArr = [];
                            var allPeriodAvgWorkingTimeArr = [];
                            var allPeriodAvgOverWorkingTimeArr = [];
                            var allPeriodDayTotalWorkingTimeArr = [];
                            var allPeriodDayTotalOverWorkingTimeArr = [];

                            var allUserFirstComeInTimeArr = [];
                            var allUserLastComeOutTimeArr = [];
                            var allUserAvgWorkingTimeArr = [];
                            var allUserAvgOverWorkingTimeArr = [];
                            var allUserTotalAvgWorkingTime = 0;
                            var allUserTotalAvgOverWorkingTime = 0;
                            var eachUserAvgWorkingTimeMsec = 0;
                            var eachUserAvgOverWorkingTimeMsec = 0;
                            
                            var isMidnightComeIn = false;
                            var isThisUserCommute = false;
                            var isThisDayCommuted = false;
                            var isThisDayOverWorked = false;
                            var commutePersonCount = 0;
                            var overWorkingPersonCount = 0;

                            var dayIndex, userIndex, circIndex, condIndex;

                            for (userIndex = 0; userIndex < resultJson.userList.length; userIndex++) {
                                for (dayIndex = 0; dayIndex < betweenDays; dayIndex++) {
                                    targetDate = currentTime.convertCurrentTimezoneDateTime(new Date(startDateObj.setDate(parseInt(startDateStringArr[2]) + dayIndex))).split(' ')[0];

                                    for (circIndex = 0; circIndex < circumstanceRows.length; circIndex++) {
                                        if (circumstanceRows[circIndex].datetime.split(' ')[0] == targetDate
                                            && circumstanceRows[circIndex].smartphone_address == resultJson.userList[userIndex].smartphoneAddress) {
                                            if (circumstanceRows[circIndex].commute_status == 1) {
                                                comeInTimeMsec = new Date('1970-01-02 ' + circumstanceRows[circIndex].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeInTimeMsec == 0) {
                                                    isMidnightComeIn = true;
                                                }
                                            } else if (isMidnightComeIn || (comeInTimeMsec != 0 && circumstanceRows[circIndex].commute_status == 0)) {
                                                comeOutTimeMsec = new Date('1970-01-02 ' + circumstanceRows[circIndex].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeOutTimeMsec > comeInTimeMsec) {
                                                    comeInTimeArr.push(comeInTimeMsec);
                                                    comeOutTimeArr.push(comeOutTimeMsec);
                                                    validWorkingTimeArr.push(comeOutTimeMsec - comeInTimeMsec);

                                                    allPeriodComeInTimeArr.push(comeInTimeMsec);
                                                    allPeriodComeOutTimeArr.push(comeOutTimeMsec);
                                                    allPeriodValidWorkingTimeArr.push(comeOutTimeMsec - comeInTimeMsec);

                                                    if (comeInTimeMsec < workStartTimeMsec) {
                                                        validOverWorkingTimeArr.push(workStartTimeMsec - comeInTimeMsec);
                                                        allPeriodValidOverWorkingTimeArr.push(workStartTimeMsec - comeInTimeMsec);
                                                    }
                                                    if (comeOutTimeMsec > workEndTimeMsec) {
                                                        validOverWorkingTimeArr.push(comeOutTimeMsec - workEndTimeMsec);
                                                        allPeriodValidOverWorkingTimeArr.push(comeOutTimeMsec - workEndTimeMsec);
                                                    }

                                                    isMidnightComeIn = false;
                                                    isThisUserCommute = true;
                                                }

                                                comeInTimeMsec = 0;
                                                comeOutTimeMsec = 0;
                                            } else {
                                                // continue;
                                            }
                                        }
                                    }

                                    if (isThisUserCommute) {
                                        allPeriodFirstComeInTimeArr.push(comeInTimeArr.sort()[0]);
                                        allPeriodLastComeOutTimeArr.push(comeOutTimeArr.sort()[comeOutTimeArr.length - 1]);

                                        if (validWorkingTimeArr.length > 0) {
                                            for (i = 0; i < validWorkingTimeArr.length; i++) {
                                                resultJson.userList[userIndex].totalValidWorkingTime = parseInt(resultJson.userList[userIndex].totalValidWorkingTime) + validWorkingTimeArr[i];
                                            }
                                            allPeriodAvgWorkingTimeArr.push(resultJson.userList[userIndex].totalValidWorkingTime / validWorkingTimeArr.length);
                                            resultJson.userList[userIndex].commuteDays = parseInt(resultJson.userList[userIndex].commuteDays) + 1;
                                        }

                                        if (validOverWorkingTimeArr.length > 0) {
                                            for (i = 0; i < validOverWorkingTimeArr.length; i++) {
                                                resultJson.userList[userIndex].totalValidOverWorkingTime = parseInt(resultJson.userList[userIndex].totalValidOverWorkingTime) + validOverWorkingTimeArr[i];
                                            }
                                            allPeriodAvgOverWorkingTimeArr.push(resultJson.userList[userIndex].totalValidOverWorkingTime / validOverWorkingTimeArr.length);
                                            resultJson.userList[userIndex].overWorkingDays = parseInt(resultJson.userList[userIndex].overWorkingDays) + 1;
                                        }
                                    }

                                    comeInTimeMsec = 0;
                                    comeOutTimeMsec = 0;
                                    comeInTimeArr = [];
                                    comeOutTimeArr = [];
                                    validWorkingTimeArr = [];
                                    validOverWorkingTimeArr = [];
                                    isThisUserCommute = false;
                                }

                                if (allPeriodFirstComeInTimeArr.length > 0) {
                                    for (i = 0; i < allPeriodFirstComeInTimeArr.length; i++) {
                                        resultJson.userList[userIndex].avgFirstComeInTime = parseInt(resultJson.userList[userIndex].avgFirstComeInTime) + allPeriodFirstComeInTimeArr[i];
                                    }
                                    resultJson.userList[userIndex].avgFirstComeInTime = parseInt(resultJson.userList[userIndex].avgFirstComeInTime) / allPeriodFirstComeInTimeArr.length;
                                    resultJson.userList[userIndex].minFirstComeInTime = allPeriodFirstComeInTimeArr[0];
                                    resultJson.userList[userIndex].maxFirstComeInTime = allPeriodFirstComeInTimeArr[allPeriodFirstComeInTimeArr.length - 1];
                                }

                                if (allPeriodLastComeOutTimeArr.length > 0) {
                                    for (i = 0; i < allPeriodLastComeOutTimeArr.length; i++) {
                                        resultJson.userList[userIndex].avgLastComeOutTime = parseInt(resultJson.userList[userIndex].avgLastComeOutTime) + allPeriodLastComeOutTimeArr[i];
                                    }
                                    resultJson.userList[userIndex].avgLastComeOutTime = parseInt(resultJson.userList[userIndex].avgLastComeOutTime) / allPeriodLastComeOutTimeArr.length;
                                    resultJson.userList[userIndex].minLastComeOutTime = allPeriodLastComeOutTimeArr[0];
                                    resultJson.userList[userIndex].maxLastComeOutTime = allPeriodLastComeOutTimeArr[allPeriodLastComeOutTimeArr.length - 1];
                                }

                                if (allPeriodValidWorkingTimeArr.length > 0) {
                                    for (i = 0; i < allPeriodValidWorkingTimeArr.length; i++) {
                                        resultJson.userList[userIndex].avgValidWorkingTime = parseInt(resultJson.userList[userIndex].avgValidWorkingTime) + allPeriodValidWorkingTimeArr[i];
                                    }
                                    resultJson.userList[userIndex].avgValidWorkingTime = parseInt(resultJson.userList[userIndex].avgValidWorkingTime) / allPeriodValidWorkingTimeArr.length;
                                    resultJson.userList[userIndex].minValidWorkingTime = allPeriodValidWorkingTimeArr[0];
                                    resultJson.userList[userIndex].maxValidWorkingTime = allPeriodValidWorkingTimeArr[allPeriodValidWorkingTimeArr.length - 1];
                                }

                                if (allPeriodValidOverWorkingTimeArr.length > 0) {
                                    for (i = 0; i < allPeriodValidOverWorkingTimeArr.length; i++) {
                                        resultJson.userList[userIndex].avgValidOverWorkingTime = parseInt(resultJson.userList[userIndex].avgValidOverWorkingTime) + allPeriodValidOverWorkingTimeArr[i];
                                    }
                                    resultJson.userList[userIndex].avgValidOverWorkingTime = parseInt(resultJson.userList[userIndex].avgValidOverWorkingTime) / allPeriodValidOverWorkingTimeArr.length;
                                    resultJson.userList[userIndex].minValidOverWorkingTime = allPeriodValidOverWorkingTimeArr[0];
                                    resultJson.userList[userIndex].maxValidOverWorkingTime = allPeriodValidOverWorkingTimeArr[allPeriodValidOverWorkingTimeArr.length - 1];
                                }

                                allPeriodComeInTimeArr = [];
                                allPeriodComeOutTimeArr = [];
                                allPeriodValidWorkingTimeArr = [];
                                allPeriodValidOverWorkingTimeArr = [];
                                allPeriodFirstComeInTimeArr = [];
                                allPeriodLastComeOutTimeArr = [];
                                allPeriodAvgWorkingTimeArr = [];
                                allPeriodAvgOverWorkingTimeArr = [];
                            }

                            for (userIndex = 0; userIndex < resultJson.userList.length; userIndex++) {
                                for (dayIndex = 0; dayIndex < betweenDays; dayIndex++) {
                                    targetDate = currentTime.convertCurrentTimezoneDateTime(new Date(startDateObj.setDate(parseInt(startDateStringArr[2]) + dayIndex))).split(' ')[0];

                                    for (circIndex = 0; circIndex < circumstanceRows.length; circIndex++) {
                                        if (circumstanceRows[circIndex].datetime.split(' ')[0] == targetDate
                                            && circumstanceRows[circIndex].smartphone_address == resultJson.userList[userIndex].smartphoneAddress) {
                                            if (circumstanceRows[circIndex].commute_status == 1) {
                                                comeInTimeMsec = new Date('1970-01-02 ' + circumstanceRows[circIndex].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeInTimeMsec == 0) {
                                                    isMidnightComeIn = true;
                                                }
                                            } else if (isMidnightComeIn || (comeInTimeMsec != 0 && circumstanceRows[circIndex].commute_status == 0)) {
                                                comeOutTimeMsec = new Date('1970-01-02 ' + circumstanceRows[circIndex].datetime.split(' ')[1]).getTime() - new Date('1970-01-02 00:00:00').getTime();

                                                if (comeOutTimeMsec > comeInTimeMsec) {
                                                    comeInTimeArr.push(comeInTimeMsec);
                                                    comeOutTimeArr.push(comeOutTimeMsec);
                                                    validWorkingTimeArr.push(comeOutTimeMsec - comeInTimeMsec);

                                                    allPeriodComeInTimeArr.push(comeInTimeMsec);
                                                    allPeriodComeOutTimeArr.push(comeOutTimeMsec);
                                                    allPeriodValidWorkingTimeArr.push(comeOutTimeMsec - comeInTimeMsec);

                                                    if (comeInTimeMsec < workStartTimeMsec) {
                                                        validOverWorkingTimeArr.push(workStartTimeMsec - comeInTimeMsec);
                                                        allPeriodValidOverWorkingTimeArr.push(workStartTimeMsec - comeInTimeMsec);
                                                    }
                                                    if (comeOutTimeMsec > workEndTimeMsec) {
                                                        validOverWorkingTimeArr.push(comeOutTimeMsec - workEndTimeMsec);
                                                        allPeriodValidOverWorkingTimeArr.push(comeOutTimeMsec - workEndTimeMsec);
                                                    }

                                                    isMidnightComeIn = false;
                                                    isThisUserCommute = true;
                                                }

                                                comeInTimeMsec = 0;
                                                comeOutTimeMsec = 0;
                                            } else {
                                                // continue;
                                            }
                                        }
                                    }

                                    if (isThisUserCommute) {
                                        allPeriodFirstComeInTimeArr.push(comeInTimeArr.sort()[0]);
                                        allPeriodLastComeOutTimeArr.push(comeOutTimeArr.sort()[comeOutTimeArr.length - 1]);

                                        if (validWorkingTimeArr.length > 0) {
                                            for (i = 0; i < validWorkingTimeArr.length; i++) {
                                                resultJson.userList[userIndex].totalValidWorkingTime = parseInt(resultJson.userList[userIndex].totalValidWorkingTime) + validWorkingTimeArr[i];
                                            }
                                            allPeriodAvgWorkingTimeArr.push(resultJson.userList[userIndex].totalValidWorkingTime / validWorkingTimeArr.length);
                                            resultJson.userList[userIndex].commuteDays = parseInt(resultJson.userList[userIndex].commuteDays) + 1;
                                        }

                                        if (validOverWorkingTimeArr.length > 0) {
                                            for (i = 0; i < validOverWorkingTimeArr.length; i++) {
                                                resultJson.userList[userIndex].totalValidOverWorkingTime = parseInt(resultJson.userList[userIndex].totalValidOverWorkingTime) + validOverWorkingTimeArr[i];
                                            }
                                            allPeriodAvgOverWorkingTimeArr.push(resultJson.userList[userIndex].totalValidOverWorkingTime / validOverWorkingTimeArr.length);
                                            resultJson.userList[userIndex].overWorkingDays = parseInt(resultJson.userList[userIndex].overWorkingDays) + 1;
                                        }
                                    }

                                    comeInTimeMsec = 0;
                                    comeOutTimeMsec = 0;
                                    comeInTimeArr = [];
                                    comeOutTimeArr = [];
                                    validWorkingTimeArr = [];
                                    validOverWorkingTimeArr = [];
                                    isThisUserCommute = false;
                                }

                                if (allPeriodFirstComeInTimeArr.length > 0) {
                                    for (i = 0; i < allPeriodFirstComeInTimeArr.length; i++) {
                                        resultJson.userList[userIndex].avgFirstComeInTime = parseInt(resultJson.userList[userIndex].avgFirstComeInTime) + allPeriodFirstComeInTimeArr[i];
                                    }
                                    resultJson.userList[userIndex].avgFirstComeInTime = parseInt(resultJson.userList[userIndex].avgFirstComeInTime) / allPeriodFirstComeInTimeArr.length;
                                    resultJson.userList[userIndex].minFirstComeInTime = allPeriodFirstComeInTimeArr[0];
                                    resultJson.userList[userIndex].maxFirstComeInTime = allPeriodFirstComeInTimeArr[allPeriodFirstComeInTimeArr.length - 1];
                                }

                                if (allPeriodLastComeOutTimeArr.length > 0) {
                                    for (i = 0; i < allPeriodLastComeOutTimeArr.length; i++) {
                                        resultJson.userList[userIndex].avgLastComeOutTime = parseInt(resultJson.userList[userIndex].avgLastComeOutTime) + allPeriodLastComeOutTimeArr[i];
                                    }
                                    resultJson.userList[userIndex].avgLastComeOutTime = parseInt(resultJson.userList[userIndex].avgLastComeOutTime) / allPeriodLastComeOutTimeArr.length;
                                    resultJson.userList[userIndex].minLastComeOutTime = allPeriodLastComeOutTimeArr[0];
                                    resultJson.userList[userIndex].maxLastComeOutTime = allPeriodLastComeOutTimeArr[allPeriodLastComeOutTimeArr.length - 1];
                                }

                                if (allPeriodValidWorkingTimeArr.length > 0) {
                                    for (i = 0; i < allPeriodValidWorkingTimeArr.length; i++) {
                                        resultJson.userList[userIndex].avgValidWorkingTime = parseInt(resultJson.userList[userIndex].avgValidWorkingTime) + allPeriodValidWorkingTimeArr[i];
                                    }
                                    resultJson.userList[userIndex].avgValidWorkingTime = parseInt(resultJson.userList[userIndex].avgValidWorkingTime) / allPeriodValidWorkingTimeArr.length;
                                    resultJson.userList[userIndex].minValidWorkingTime = allPeriodValidWorkingTimeArr[0];
                                    resultJson.userList[userIndex].maxValidWorkingTime = allPeriodValidWorkingTimeArr[allPeriodValidWorkingTimeArr.length - 1];
                                }

                                if (allPeriodValidOverWorkingTimeArr.length > 0) {
                                    for (i = 0; i < allPeriodValidOverWorkingTimeArr.length; i++) {
                                        resultJson.userList[userIndex].avgValidOverWorkingTime = parseInt(resultJson.userList[userIndex].avgValidOverWorkingTime) + allPeriodValidOverWorkingTimeArr[i];
                                    }
                                    resultJson.userList[userIndex].avgValidOverWorkingTime = parseInt(resultJson.userList[userIndex].avgValidOverWorkingTime) / allPeriodValidOverWorkingTimeArr.length;
                                    resultJson.userList[userIndex].minValidOverWorkingTime = allPeriodValidOverWorkingTimeArr[0];
                                    resultJson.userList[userIndex].maxValidOverWorkingTime = allPeriodValidOverWorkingTimeArr[allPeriodValidOverWorkingTimeArr.length - 1];
                                }

                                allPeriodComeInTimeArr = [];
                                allPeriodComeOutTimeArr = [];
                                allPeriodValidWorkingTimeArr = [];
                                allPeriodValidOverWorkingTimeArr = [];
                                allPeriodFirstComeInTimeArr = [];
                                allPeriodLastComeOutTimeArr = [];
                                allPeriodAvgWorkingTimeArr = [];
                                allPeriodAvgOverWorkingTimeArr = [];
                            }

                            if (typeof callback === "function") {
                                callback(resultJson);
                            }
                        });
                    });
                });
            });
        });
    });
}



/* Exports */
module.exports = pool;

module.exports.checkLoginName               = checkLoginName;
module.exports.checkLoginPassword           = checkLoginPassword;
module.exports.isAdmin                      = isAdmin;
module.exports.isPermitted                  = isPermitted;
module.exports.loginValidation              = loginValidation;

module.exports.getUserList                  = getUserList;
module.exports.getUserInfo                  = getUserInfo;
module.exports.checkUserRegistered          = checkUserRegistered;
module.exports.registerUser                 = registerUser;
module.exports.modifyUser                   = modifyUser;
module.exports.deleteUser                   = deleteUser;
module.exports.permitUsers                  = permitUsers;

module.exports.getWorkplaceList             = getWorkplaceList;
module.exports.getWorkplaceInfo             = getWorkplaceInfo;
module.exports.registerWorkplace            = registerWorkplace;
module.exports.modifyWorkplace              = modifyWorkplace;
module.exports.deleteWorkplace              = deleteWorkplace;

module.exports.getBeaconList                = getBeaconList;
module.exports.getBeaconInfo                = getBeaconInfo;
module.exports.getAvailableBeacon           = getAvailableBeacon;
module.exports.checkBeaconRegistered        = checkBeaconRegistered;
module.exports.registerBeacon               = registerBeacon;
module.exports.modifyBeacon                 = modifyBeacon;
module.exports.deleteBeacon                 = deleteBeacon;

module.exports.getNotPermittedUserList      = getNotPermittedUserList;
module.exports.getUserListCond              = getUserListCond;

module.exports.getDepartmentList            = getDepartmentList;
module.exports.addDepartment                = addDepartment;
module.exports.modifyDepartment             = modifyDepartment;
module.exports.deleteDepartment             = deleteDepartment;
module.exports.getPositionList              = getPositionList;
module.exports.addPosition                  = addPosition;
module.exports.modifyPosition               = modifyPosition;
module.exports.deletePosition               = deletePosition;

module.exports.getSmartphoneAddress         = getSmartphoneAddress;
module.exports.checkAdmin                   = checkAdmin;

module.exports.getCompanyName               = getCompanyName;
module.exports.editCompanyName              = editCompanyName;
module.exports.getWorkStartTime             = getWorkStartTime;
module.exports.getWorkEndTime               = getWorkEndTime;
module.exports.editWorkStartEndTime         = editWorkStartEndTime;

module.exports.gatewayValidation            = gatewayValidation;
module.exports.smartphoneValidation         = smartphoneValidation;
module.exports.getWorkplaceOfBeacons        = getWorkplaceOfBeacons;
module.exports.getBeaconsCountOfWorkplace   = getBeaconsCountOfWorkplace;
module.exports.getWorkplaceName             = getWorkplaceName;
module.exports.getSmartphoneUserName        = getSmartphoneUserName;
module.exports.getSmartphoneUserENum        = getSmartphoneUserEmployeeNumber;
module.exports.registerCommute              = registerCommute;

module.exports.RSSICalibration              = RSSICalibration;
module.exports.getEssentialData             = getEssentialData;
module.exports.getBeaconMACAddress          = getBeaconMACAddress;
module.exports.getRSSI                      = getRSSI;

module.exports.amIRegistered                = amIRegistered;

module.exports.getCircumstanceTable         = getCircumstanceTable;
module.exports.getTodayCommuteInfo          = getTodayCommuteInfo;
module.exports.getCommuteInfo               = getCommuteInfo;

// Belows will be deprecated
module.exports.getPopulOfDepartment         = getPopulationOfDepartments;