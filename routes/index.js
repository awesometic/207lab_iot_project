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
    var employee_number = req.session.employee_number;
    var smartphone_address = req.session.smartphone_address;
    var admin = req.session.admin;

    res.render('index', {
        title: title,
        page: "index",
        employee_number: employee_number,
        smartphone_address: smartphone_address,
        admin: admin
    });

});

router.get('/log', function(req, res, next) {
    var employee_number = req.session.employee_number;
    var smartphone_address = req.session.smartphone_address;
    var admin = req.session.admin;

    if (typeof employee_number != "undefined" || typeof smartphone_address != "undefined") {
        pool.id_getCircumstance(getCurrentDateTime(), smartphone_address, function (rows) {
            pool.chart_getPopulOfDepartment(function (departItems) {
                res.render("index", {
                    title: title,
                    page: "log",
                    employee_number: employee_number,
                    smartphone_address: smartphone_address,
                    admin: admin,
                    rows: rows,
                    departItems: departItems
                });
            });
        });
    } else {
        res.send("<script> location.href='/'; </script>");
    }
});

router.get('/management', function(req, res, next) {
    var employee_number = req.session.employee_number;
    var smartphone_address = req.session.smartphone_address;
    var admin = req.session.admin;

    if (typeof employee_number != "undefined" || typeof smartphone_address != "undefined") {
        pool.id_getUserList(function(userListRows) {
            pool.id_getWorkplaceList(employee_number, admin, function(workplaceListRows) {
                pool.id_getBeaconList(employee_number, admin, function(beaconListRows) {
                    res.render("index", {
                        title: title,
                        page: "management",
                        employee_number: employee_number,
                        smartphone_address: smartphone_address,
                        userlist: userListRows,
                        workplacelist: workplaceListRows,
                        beaconlist: beaconListRows,
                        admin: admin
                    });
                });
            });
        });
    } else {
        res.send("<script> location.href='/'; </script>");
    }
});

router.get("/logout", function(req, res, next) {
    req.session.destroy(function(err) {
        if (err)
            console.error("err", err);
        res.send("<script> location.href='/';</script>");
    });
});

router.get('/developer', function(req, res, next) {
    var employee_number = req.session.employee_number;
    var smartphone_address = req.session.smartphone_address;
    var admin = req.session.admin;

    if (typeof employee_number != "undefined" || typeof smartphone_address != "undefined") {
        pool.id_checkAdmin(employee_number, smartphone_address, function(isAdmin) {
            if (isAdmin) {
                res.render('developer/index', {
                    title: title,
                    page: "developer/index",
                    employee_number: employee_number,
                    smartphone_address: smartphone_address,
                    admin: admin
                });
            } else {
                res.send(
                    "<script>" +
                    "alert('Permission denied!');" +
                    "history.go(-1);" +
                    "</script>"
                );
            }
        });
    } else {
        res.send("<script> location.href='/'; </script>");
    }
});

router.get('/developer/socket', function(req, res, next) {
    var employee_number = req.session.employee_number;
    var smartphone_address = req.session.smartphone_address;
    var admin = req.session.admin;

    if (typeof employee_number != "undefined" || typeof smartphone_address != "undefined") {
        pool.id_checkAdmin(employee_number, smartphone_address, function(isAdmin) {
            if (isAdmin) {
                pool.id_getUserList(function(userList) {
                    if (typeof userList !== 'undefined') {
                        pool.id_getDepartmentList(function (departmentList) {
                            if (typeof departmentList !== 'undefined') {
                                pool.id_getPositionList(function (positionList) {
                                    if (typeof positionList !== 'undefined') {
                                        res.render('developer/socket', {
                                            title: title,
                                            page: "developer/socket",
                                            employee_number: employee_number,
                                            smartphone_address: smartphone_address,
                                            userList: userList,
                                            departmentList: departmentList,
                                            positionList: positionList,
                                            admin: admin
                                        });
                                    } else {
                                        res.send(
                                            "<script>" +
                                            "alert('There\\'s no available position!');" +
                                            "</script>"
                                        );
                                    }
                                });
                            } else {
                                res.send(
                                    "<script>" +
                                    "alert('There\\'s no available department!');" +
                                    "</script>"
                                );
                            }
                        });
                    } else {
                        res.send(
                            "<script>" +
                            "alert('There\\'s no selectable user!');" +
                            "</script>"
                        );
                    }
                });
            } else {
                res.send(
                    "<script>" +
                    "alert('Permission denied!');" +
                    "history.go(-1);" +
                    "</script>"
                );
            }
        });
    } else {
        res.send("<script> location.href='/'; </script>");
    }
});

router.get('/developer/database', function(req, res, next) {
    var employee_number = req.session.employee_number;
    var smartphone_address = req.session.smartphone_address;
    var admin = req.session.admin;

    if (typeof employee_number != "undefined" || typeof smartphone_address != "undefined") {
        pool.id_checkAdmin(employee_number, smartphone_address, function(isAdmin) {
            if (isAdmin) {
                res.render('developer/database', {
                    title: title,
                    page: "developer/database",
                    employee_number: employee_number,
                    smartphone_address: smartphone_address,
                    admin: admin
                });
            } else {
                res.send(
                    "<script>" +
                    "alert('Permission denied!');" +
                    "history.go(-1);" +
                    "</script>"
                );
            }
        });
    } else {
        res.send("<script> location.href='/'; </script>");
    }
});

/* POST */
router.post("/", function(req, res) {
    if (typeof req.body.employee_number != 'undefined') {
        var employee_number = req.body.employee_number;
        var pass = req.body.pass;

        pool.id_loginValidation(employee_number, pass, function (result) {
            if (result == "unregistered")
                res.send("<script> alert('Unregistered Employee!'); history.back(); </script>");
            else if (result == "wrong password")
                res.send("<script> alert('Check your password!'); history.back(); </script>");
            else {
                pool.id_getSmartphoneAddress(employee_number, function (smartphone_number) {
                    req.session.employee_number = employee_number;
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

router.post("/developer/socket", function(req, res) {
    var employee_number = req.session.employee_number;
    var smartphone_address = req.session.smartphone_address;
    var admin = req.session.admin;

    var sel_department = req.body.sel_department;
    var sel_position = req.body.sel_position;
    var check_permission = req.body.check_permission;
    var check_admin = req.body.check_admin;

    if (sel_department == "All")
        sel_department = '';
    if (sel_position == "All")
        sel_position = '';
    if (typeof check_permission === "undefined")
        check_permission = 0;
    else
        check_permission = 1;
    if (typeof check_admin === "undefined")
        check_admin = 0;
    else
        check_admin = 1;

    console.log(sel_department + " " + sel_position + " " + check_permission + " " + check_admin);

    if (typeof employee_number != "undefined" || typeof smartphone_address != "undefined") {
        pool.id_checkAdmin(employee_number, smartphone_address, function(isAdmin) {
            if (isAdmin) {
                pool.id_getUserListCond(sel_department, sel_position, check_permission, check_admin, function(userList) {
                    if (typeof userList !== 'undefined') {
                        pool.id_getDepartmentList(function (departmentList) {
                            if (typeof departmentList !== 'undefined') {
                                pool.id_getPositionList(function (positionList) {
                                    if (typeof positionList !== 'undefined') {
                                        res.render('developer/socket', {
                                            title: title,
                                            page: "developer/socket",
                                            employee_number: employee_number,
                                            smartphone_address: smartphone_address,
                                            userList: userList,
                                            departmentList: departmentList,
                                            positionList: positionList,
                                            admin: admin
                                        });
                                    } else {
                                        res.send(
                                            "<script>" +
                                            "alert('There\\'s no available position!');" +
                                            "</script>"
                                        );
                                    }
                                });
                            } else {
                                res.send(
                                    "<script>" +
                                    "alert('There\\'s no available department!');" +
                                    "</script>"
                                );
                            }
                        });
                    } else {
                        res.send(
                            "<script>" +
                            "alert('There\\'s no selectable user!');" +
                            "</script>"
                        );
                    }
                });
            } else {
                res.send(
                    "<script>" +
                    "alert('Permission denied!');" +
                    "history.go(-1);" +
                    "</script>"
                );
            }
        });
    } else {
        res.send("<script> location.href='/'; </script>");
    }
});

module.exports = router;
