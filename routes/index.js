var express = require('express');
var router = express.Router();

var pool = require("../db");

/* GET */
var title = "Suwon Univ. 207 Lab - IoT Project";
router.get('/', function(req, res, next) {
    res.render('index', {
        title: title,
        user_id: req.session.user_id,
        smartphone_address: req.session.smartphone_address
    });
});

router.get("/main_home", function(req, res, next) {
    res.render("main_home", {
        title: title,
        user_id: req.session.user_id,
        smartphone_address: req.session.smartphone_address
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
router.post("/", function(req, res) {
    if (typeof req.body.user_id != 'undefined') {
        var user_id = req.body.user_id;
        var pass = req.body.pass;

        pool.id_loginValidation(res, user_id, pass, function (valid) {
            if (valid) {
                pool.id_getSmartphoneAddress(res, user_id, function (smartphone_number) {
                    req.session.user_id = user_id;
                    req.session.smartphone_address = smartphone_number;

                    res.send("<script> alert('Login Success!'); location.href='/main_home'; </script>");
                });
            }
        });
    } else if (typeof req.body.join_id != 'undefined') {
        var join_id = req.body.employee_number;
        var name = req.body.name;
        var join_pwd = req.body.join_pwd;
        var join_pwd2 = req.body.join_pwd2;
        var department = '';
        var join_pst = req.body.position;
        var permission = req.body.permission;
        var admin = req.body.admin;
        var smartphone_address = req.body.smartphone_address;

        if (permission)
            permission = 1;
        else
            permission = 0;

        if (admin)
            admin = 1;
        else
            admin = 0;

        if (join_pwd != join_pwd2) {
            res.send("<script> alert('Check Retype-Password!'); history.back(); </script>");
        } else if (smartphone_address.length != 17) {
            res.send("<script> alert('Type Correct Information!'); history.back(); </script>");
        } else {
            pool.id_checkUserRegistered(res, smartphone_address, join_id, function(valid) {
                if (valid) {
                    pool.id_registerUser(res, smartphone_address, join_id, name, join_pwd, department, join_pst, permission, admin);
                } else {
                    res.send("<script> alert('Already Registered!'); history.back(); </script>");
                }
            });
        }
    }
});

module.exports = router;
