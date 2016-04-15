var express = require('express');
var router = express.Router();

var pool = require("../db");

/* GET */
var title = "Suwon Univ. 207 Lab - IoT Project";
router.get('/', function(req, res, next) {
    console.log("========================================");
    console.log("Session at index page");
    console.log(req.session);
    console.log("========================================");
    res.render('index', {
        title: title,
        employee_number: req.session.employee_number,
        smartphone_address: req.session.smartphone_address
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
        employee_number: req.session.employee_number,
        smartphone_address: req.session.smartphone_address
    });
});

router.get("/add_workplace", function(req, res, next) {
    res.render("add_workplace", {
        title: title,
        employee_number: req.session.employee_number,
        smartphone_address: req.session.smartphone_address
    });
});

router.get("/circumstance", function(req, res, next) {
    res.render("circumstance", {
        title: title,
        employee_number: req.session.employee_number,
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
router.post("/login", function(req, res) {
    var employee_number = req.body.employee_number;
    var password = req.body.password;

    pool.id_loginValidation(res, employee_number, password, function(valid) {
        if (valid) {
            pool.id_getSmartphoneAddress(res, employee_number, function(smartphone_number) {
                req.session.employee_number = employee_number;
                req.session.smartphone_address = smartphone_number;

                res.send("<script> alert('Login Success!'); location.href='/'; </script>");
            });
        }
    });
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
        pool.id_checkRegistered(res, smartphone_address, employee_number, function(valid) {
            if (valid) {
                pool.id_registerUser(res, smartphone_address, employee_number, name, password, department, position, permission);
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
        pool.id_registerWorkplace(res, name_workplace, location_workplace, uuid, gateway_address);
    }
});

module.exports = router;
