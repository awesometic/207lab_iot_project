var express = require('express');
var router = express.Router();

var pool = require("../db");
var logger = require("../logger");

var getCurrentDateTime = function() {
    var date = new Date();
    var currentMonth = date.getMonth() + 1;
    var str_currentMonth;
    if (currentMonth < 10)
        str_currentMonth = '0' + currentMonth;

    return date.getFullYear() + "-" + str_currentMonth + "-" + date.getDate()
        + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
};

/* GET */
var title = "Suwon Univ. 207 Lab - IoT Project";
router.get('/', function(req, res, next) {
    res.render('index', {
        title: title,
        page: "index",
        user_id: req.session.user_id,
        smartphone_address: req.session.smartphone_address,
        admin: req.session.admin
    });
});

router.get('/log', function(req, res, next) {
    var user_id = req.session.user_id;
    var smartphone_address = req.session.smartphone_address;

    pool.id_getCircumstance(getCurrentDateTime(), smartphone_address, function (rows) {
        pool.chart_getPopulOfDepartment(function (departItems) {
            res.render("index", {
                title: title,
                page: "log",
                user_id: user_id,
                smartphone_address: smartphone_address,
                admin: req.session.admin,
                rows: rows,
                departItems: departItems
            });
        });
    });
});

router.get('/management', function(req, res, next) {
    var user_id = req.session.user_id;
    var smartphone_address = req.session.smartphone_address;
    var admin = req.session.admin;

    pool.id_getUserList(user_id, admin, function(userListRows) {
        pool.id_getWorkplaceList(user_id, admin, function(workplaceListRows) {
           pool.id_getBeaconList(user_id, admin, function(beaconListRows) {
               res.render("index", {
                   title: title,
                   page: "management",
                   user_id: user_id,
                   smartphone_address: smartphone_address,
                   userlist: userListRows,
                   workplacelist: workplaceListRows,
                   beaconlist: beaconListRows,
                   admin: admin
               });
           });
        });
    });
});

router.get("/logout", function(req, res, next) {
    req.session.destroy(function(err) {
        if (err)
            console.error("err", err);
        res.send("<script> location.href='/';</script>");
    });
});

/* POST */
router.post("/", function(req, res) {
    if (typeof req.body.user_id != 'undefined') {
        var user_id = req.body.user_id;
        var pass = req.body.pass;

        pool.id_loginValidation(user_id, pass, function (result) {
            if (result == "unregistered")
                res.send("<script> alert('Unregistered Employee!'); history.back(); </script>");
            else if (result == "wrong password")
                res.send("<script> alert('Check your password!'); history.back(); </script>");
            else {
                pool.id_getSmartphoneAddress(user_id, function (smartphone_number) {
                    req.session.user_id = user_id;
                    req.session.smartphone_address = smartphone_number;

                    if (result)
                        req.session.admin = true;
                    else
                        req.session.admin = false;

                    res.send("<script> location.href='/'; </script>");
                });
            }
        });
    } else if (typeof req.body.employee_number != 'undefined') {
        var smartphone_address = req.body.smartphone_address;
        var employee_number = req.body.employee_number;
        var name = req.body.name;
        var password1 = req.body.join_pwd;
        var password2 = req.body.join_pwd2;
        var department = req.body.department;
        var position = req.body.position;
        var permission = req.body.permission;
        var admin = req.body.admin;

        if (permission == "false")
            permission = 0;
        else
            permission = 1;

        if (admin == "false")
            admin = 0;
        else
            admin = 1;

        if (password1 != password2) {
            res.send("<script> alert('Check Retype-Password!'); history.back(); </script>");
        } else if (smartphone_address.length != 17) {
            res.send("<script> alert('Type Correct Information!'); history.back(); </script>");
        } else {
            pool.id_checkUserRegistered(smartphone_address, employee_number, function(valid) {
                if (valid) {
                    pool.id_registerUser(smartphone_address, employee_number, name, password1, department, position, permission, admin, function(success) {
                        if (success) {
                            res.send("<script> alert('Register Success!'); history.back(); </script>");
                        } else {
                            res.send("<script> alert('Register Fail!'); history.back(); </script>");
                        }
                    });
                } else {
                    res.send("<script> alert('Already Registered!'); history.back(); </script>");
                }
            });
        }
    }
});

module.exports = router;
