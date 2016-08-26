var express = require('express');
var router = express.Router();

var pool = require("../db");
var logger = require("../logger");

// session will be expired in 1 hour
var cookieExpires = 3600000;

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
        title: title
    });

});

router.get('/signup', function(req, res, next) {

    res.render('signup', {
        title: title
    });

});

router.get('/dashboard', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {

                res.render('dashboard', {
                    title: title,
                    userInfo: userInfoRow,
                    companyName: companyName
                });

            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/profile', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {

                res.render('profile', {
                    title: title,
                    userInfo: userInfoRow,
                    companyName: companyName
                });

            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/member', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {
                pool.id_getUserList(function(userListRows) {
                    res.render('member', {
                        title: title,
                        userInfo: userInfoRow,
                        companyName: companyName,
                        userListRows: userListRows
                    });
                });

            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/workplace', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {
                pool.id_getWorkplaceList(function(workplaceListRows) {
                    res.render('workplace', {
                        title: title,
                        userInfo: userInfoRow,
                        companyName: companyName,
                        workplaceListRows: workplaceListRows
                    });
                });
            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/beacon', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {
                pool.id_getBeaconList(function(beaconListRows) {
                    res.render('beacon', {
                        title: title,
                        userInfo: userInfoRow,
                        companyName: companyName,
                        beaconListRows: beaconListRows
                    });
                });
            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/managework', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {

                res.render('managework', {
                    title: title,
                    userInfo: userInfoRow,
                    companyName: companyName
                });

            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/permission', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {

                res.render('permission', {
                    title: title,
                    userInfo: userInfoRow,
                    companyName: companyName
                });

            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/logout', function(req, res, next) {
    req.session.destroy(function(err) {
        if (err)
            console.error("err", err);
        res.send("<script> location.href='/';</script>");
    });
});

router.get('/d3chart1', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {

                res.render('d3chart1', {
                    title: title,
                    userInfo: userInfoRow,
                    companyName: companyName
                });

            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/d3chart2', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {

                res.render('d3chart2', {
                    title: title,
                    userInfo: userInfoRow,
                    companyName: companyName
                });

            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

/* POST */
router.post("/", function(req, res) {
    var signin_id = req.body.signin_id;
    var signin_pw = req.body.signin_pw;

    pool.id_loginValidation(signin_id, signin_pw, function(valid) {

        if (valid == "unregistered") {
            // If employee number is unregistered
            res.send("<script>alert('Unregistered user!'); history.go(-1);</script>");
        } else if (valid == "wrong password") {
            // If typed password is wrong
            res.send("<script>alert('Check your password!'); history.go(-1);</script>");
        } else if (typeof valid !== "undefined") {
            // Login success
            pool.id_getSmartphoneAddress(signin_id, function (smartphone_address) {
                req.session.user_employee_id = signin_id;
                req.session.user_smartphone_address = smartphone_address;
                req.session.user_admin = valid;
                req.session.cookie.expires = new Date(Date.now() + cookieExpires);

                res.send("<script>location.href='/dashboard';</script>");
            });
        } else {
            res.send("<script>alert('Server error'); history.go(-1);</script>");
        }
    });
});

router.post('/signup', function(req, res, next) {
    var signup_id = req.body.signup_id;
    var signup_pw = req.body.signup_pw;
    var signup_pw_confirm = req.body.signup_pw_confirm;
    var signup_name = req.body.signup_name;
    var signup_department = req.body.signup_department;
    var signup_position = req.body.signup_position;
    var signup_smartphone_address = req.body.signup_smartphone_address;

    if (signup_pw != signup_pw_confirm) {
        res.send("<script>alert('Check confirmation password!'); history.go(-1);</script>");
    } else {
        pool.id_checkUserRegistered(signup_smartphone_address, signup_id, function (valid) {
            if (valid) {
                pool.id_registerUser(signup_smartphone_address, signup_id, signup_name, signup_pw, signup_department, signup_position, 0, 0, function (valid) {
                    if (valid) {
                        res.send("<script>alert('Register success!'); location.href='/';</script>");
                    } else {
                        res.send("<script>alert('Server error'); history.go(-1);</script>");
                    }
                });
            } else {
                res.send("<script>alert('Already registered user identification!'); history.go(-1);</script>");
            }
        });
    }
});

router.post('/profile', function(req, res, next) {
    var modified_password = req.body.password;
    var modified_password_confirm = req.body.password_confirm;

    if (modified_password.length != 0 && (modified_password != modified_password_confirm)) {
        res.send("<script>alert('Check confirmation password!'); history.go(-1);</script>");
    } else if (modified_password.length == 0) {
        res.send("<script>alert('To change your password, fill out the form'); history.go(-1);</script>");
    } else {
        pool.id_getUserInfo(req.session.user_smartphone_address, function(userInfo) {
            pool.id_modifyUser(req.session.user_smartphone_address, req.session.user_employee_id, userInfo.name, modified_password, userInfo.department, userInfo.position, userInfo.admin, function (valid) {
                if (valid) {
                    res.send("<script>alert('Modify Success!'); location.href='/dashboard';</script>");
                } else {
                    res.send("<script>alert('Server error'); history.go(-1);</script>");
                }
            });
        });
    }
});

module.exports = router;
