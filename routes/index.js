var express = require('express');
var router = express.Router();

// https://github.com/caolan/async
// Async is a utility module which provides straight-forward,
// powerful functions for working with asynchronous JavaScript
var async = require("async");

/* Functions using Database */
// Loading database connection file by Yang Deokgyu
var pool = require("../db.js");

/** Must use callback function! These are references
 * http://inspiredjw.tistory.com/entry/JavaScript-%EC%BD%9C%EB%B0%B1-%ED%95%A8%EC%88%98%EC%9D%98-%ED%99%9C%EC%9A%A9
 * http://blog.jui.io/?p=19
 * http://yubylab.tistory.com/entry/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EC%9D%98-%EC%BD%9C%EB%B0%B1%ED%95%A8%EC%88%98-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0
 */

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

/* GET */
var title = "Suwon Univ. 207 Lab - IoT Project";
router.get('/', function(req, res, next) {
    res.render('index', {
        title: title,
        lab_desc: "공사중!",
        employee_number: req.session.employee_number
    });
});

router.get("/login", function(req, res, next) {
    res.render("login", {
        title: title,
        employee_number: req.session.employee_number
    });
});

router.get("/add_user", function(req, res, next) {
    res.render("add_user", {
        title: title,
        employee_number: req.session.employee_number
    });
});

router.get("/add_workplace", function(req, res, next) {
    res.render("add_workplace", {
        title: title,
        employee_number: req.session.employee_number
    });
});

router.get("/logout", function(req, res, next) {
    req.session.destroy(function(err) {
        if (err)
            console.error("err", err);
        res.send("<script> alert('Logout Success!'); location.href='/';</script>");
    });
});

/* POST */
router.post("/login", function(req, res) {
    var employee_number = req.body.employee_number;
    var password = req.body.password;

    loginValidation(req, res, employee_number, password);
});

router.post("/add_user", function(req, res) {
    var employee_number = req.body.employee_number;
    var name = req.body.name;
    var password = req.body.password;
    var retype_password = req.body.retype_password;
    var department = req.body.department;
    var position = req.body.position;
    var permission = req.body.permission;
    var smartphone_address = req.body.smartphone_address;

    if (permission)
        permission = 1;
    else
        permission = 0;

    if (password != retype_password) {
        res.send("<script> alert('Check Retype-Password!'); history.back(); </script>");
    } else if (smartphone_address.length != 17) {
        res.send("<script> alert('Type Correct Information!'); history.back(); </script>");
    } else {
        checkRegistered(res, smartphone_address, employee_number, function(valid) {
            if (valid) {
                registerUser(res, smartphone_address, employee_number, name, password, department, position, permission);
            }
        });
    }
});

router.post("/add_workplace", function(req, res) {
    var name_workplace = req.body.name_workplace;
    var location_workplace = req.body.location_workplace;
    var uuid = req.body.uuid;
    var gateway_address = req.body.gateway_address;

    if (uuid.length != 32 || gateway_address.length != 17) {
        res.send("<script> alert('Type Correct Information!'); history.back(); </script>");
    } else {
        registerWorkplace(res, name_workplace, location_workplace, uuid, gateway_address);
    }
});

module.exports = router;
