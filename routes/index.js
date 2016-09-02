var express = require('express');
var router = express.Router();

var pool = require("../db");
var logger = require("../logger");

// session will be expired in 1 hour
var cookieExpires = 3600000;

/* GET */
var title = "Suwon Univ. 207 Lab - IoT Project";
router.get('/', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {

            pool.id_getCompanyName(function (companyName) {
                res.render('dashboard', {
                    title: title,
                    userInfo: userInfoRow,
                    companyName: companyName
                });
            });
        });
    } else {
        res.render('index', {
            title: title
        });
    }

});

router.get('/signup', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {

            pool.id_getCompanyName(function (companyName) {
                res.render('dashboard', {
                    title: title,
                    userInfo: userInfoRow,
                    companyName: companyName
                });
            });
        });
    } else {
        res.render('signup', {
            title: title
        });
    }

});

router.get('/dashboard', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {

            pool.id_getCompanyName(function (companyName) {
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

router.get('/permission', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {

                pool.id_getNotPermittedUserList(function(deniedUserListRows) {
                    res.render('permission', {
                        title: title,
                        userInfo: userInfoRow,
                        companyName: companyName,
                        deniedUserListRows: deniedUserListRows
                    });
                });
            });
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/service_management', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {

                res.render('service_management', {
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

router.get('/d3chart1', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function (userInfoRow) {
            if (userInfoRow.permission == 0) {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else {
                pool.id_getCompanyName(function (companyName) {

                    res.render('d3chart1', {
                        title: title,
                        userInfo: userInfoRow,
                        companyName: companyName
                    });

                });
            }
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
            if (userInfoRow.permission == 0) {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else {
                pool.id_getCompanyName(function (companyName) {

                    res.render('d3chart2', {
                        title: title,
                        userInfo: userInfoRow,
                        companyName: companyName
                    });

                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/commute_table', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            if (userInfoRow.permission == 0) {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else {
                pool.id_getCompanyName(function (companyName) {
                    pool.chart_getCircumstanceTable(function (circumstanceListRows) {
                        res.render('commute_table', {
                            title: title,
                            userInfo: userInfoRow,
                            companyName: companyName,
                            circumstanceListRows: circumstanceListRows
                        });
                    });
                });
            }
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
    var signup_smartphone_address = "NO DATA";

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

router.post('/member', function(req, res, next) {
    var controlFlag = req.body.user_control_flag;

    switch (controlFlag) {
        case "modify":
            var modified_name = req.body.modified_name;
            var selected_employee_number = req.body.employee_number;
            var selected_smartphone_address = req.body.smartphone_address;
            var modified_department = req.body.modified_department;
            var modified_position = req.body.modified_position;
            var modified_admin = req.body.modified_admin;

            if (typeof selected_employee_number === 'undefined' || typeof selected_smartphone_address === 'undefined') {
                res.send("<script>alert('Cannot find any user information'); history.go(-1);</script>");
            } else {
                pool.id_getUserInfo(selected_smartphone_address, function(userInfo) {
                    if (typeof modified_name === 'undefined')
                        modified_name = userInfo.name;
                    if (typeof modified_department === 'undefined')
                        modified_department = userInfo.department;
                    if (typeof modified_position === 'undefined')
                        modified_position = userInfo.position;

                    if (typeof modified_admin === 'undefined')
                        modified_admin = 0;
                    else
                        modified_admin = 1;

                    pool.id_modifyUser(selected_smartphone_address, selected_employee_number, modified_name, null,
                        modified_department, modified_position, modified_admin, function (valid) {
                            if (valid) {
                                res.send("<script>alert('Modify Success!'); location.href='/member';</script>");
                            } else {
                                res.send("<script>alert('Server error'); history.go(-1);</script>");
                            }
                        });
                });
            }
            break;

        case "delete":
            var deleted_smartphone_address = req.body.smartphone_address;

            if (typeof deleted_smartphone_address === 'undefined') {
                res.send("<script>alert('Cannot find any user information'); history.go(-1);</script>");
            } else {
                pool.id_getUserInfo(deleted_smartphone_address, function(userInfo) {

                    pool.id_deleteUser(deleted_smartphone_address, userInfo.employee_number, function (valid) {
                        if (valid) {
                            res.send("<script>alert('Delete Success!'); location.href='/member';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });
                });
            }
            break;

        default:
            res.send("<script>alert('Server error'); history.go(-1);</script>");
            break;
    }

});

router.post('/workplace', function(req, res, next) {
    var controlFlag = req.body.workplace_control_flag;

    switch (controlFlag) {
        case "add":
            var name_workplace = req.body.name_workplace;
            var location_workplace = req.body.location_workplace;
            var lat_lon = req.body.lat_lon;

            // TODO: delete below line
            lat_lon = '0, 0';

            var latitude = +lat_lon.split(', ')[0];
            var longitude = +lat_lon.split(', ')[1];

            pool.id_registerWorkplace(name_workplace, location_workplace, latitude, longitude, function(valid) {
                if (valid) {
                    res.send("<script>alert('Add Success!'); location.href='/workplace';</script>");
                } else {
                    res.send("<script>alert('Server error'); history.go(-1);</script>");
                }
            });

            break;

        case "modify":
            var selected_id_workplace = req.body.id;
            var modified_name = req.body.modified_name;
            var modified_location = req.body.modified_location;

            if (typeof selected_id_workplace === 'undefined') {
                res.send("<script>alert('Cannot find any workplace information'); history.go(-1);</script>");
            } else {
                pool.id_getWorkplaceInfo(selected_id_workplace, function(workplaceInfo) {
                    if (typeof modified_name === 'undefined')
                        modified_name = workplaceInfo.name;
                    if (typeof modified_location === 'undefined')
                        modified_location = workplaceInfo.department;

                    pool.id_modifyWorkplace(selected_id_workplace, modified_name, modified_location,
                        workplaceInfo.coordinateX, workplaceInfo.coordinateY, workplaceInfo.coordinateZ,
                        workplaceInfo.thresholdX, workplaceInfo.thresholdY, workplaceInfo.thresholdZ,
                        workplaceInfo.latitude, workplaceInfo.longitude, workplaceInfo.beacon_set, function (valid) {
                            if (valid) {
                                res.send("<script>alert('Modify Success!'); location.href='/workplace';</script>");
                            } else {
                                res.send("<script>alert('Server error'); history.go(-1);</script>");
                            }
                        });
                });
            }
            break;

        case "delete":
            var deleted_id_workplace = req.body.id_workplace;

            if (typeof deleted_id_workplace === 'undefined') {
                res.send("<script>alert('Cannot find any workplace information'); history.go(-1);</script>");
            } else {
                pool.id_getWorkplaceInfo(deleted_id_workplace, function(workplaceInfo) {

                    pool.id_deleteWorkplace(deleted_id_workplace, function (valid) {
                        if (valid) {
                            res.send("<script>alert('Delete Success!'); location.href='/workplace';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });
                });
            }
            break;

        default:
            res.send("<script>alert('Server error'); history.go(-1);</script>");
            break;
    }
});

router.post('/beacon', function(req, res, next) {
    var controlFlag = req.body.beacon_control_flag;

    switch (controlFlag) {
        case "add":
            var beacon_address = req.body.beacon_address;
            var uuid = req.body.uuid;
            var major = req.body.major;
            var minor = req.body.minor;

            pool.id_registerBeacon(beacon_address, uuid, major, minor, function(valid) {
                if (valid) {
                    res.send("<script>alert('Add Success!'); location.href='/beacon';</script>");
                } else {
                    res.send("<script>alert('Server error'); history.go(-1);</script>");
                }
            });
            break;

        case "modify":
            var selected_beacon_address = req.body.beacon_address;
            var modified_uuid = req.body.uuid;
            var modified_major = req.body.major;
            var modified_minor = req.body.minor;

            if (typeof selected_beacon_address === 'undefined') {
                res.send("<script>alert('Cannot find any beacon information'); history.go(-1);</script>");
            } else {
                pool.id_getBeaconInfo(selected_beacon_address, function(beaconInfo) {
                    if (typeof modified_uuid === 'undefined')
                        modified_uuid = beaconInfo.UUID;
                    if (typeof modified_major === 'undefined')
                        modified_major = beaconInfo.major;
                    if (typeof modified_minor === 'undefined')
                        modified_minor = beaconInfo.minor;

                    pool.id_modifyBeacon(selected_beacon_address, modified_uuid, modified_major, modified_minor, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Modify Success!'); location.href='/beacon';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });
                });
            }
            break;

        case "delete":
            var deleted_beacon_address = req.body.beacon_address;

            if (typeof deleted_beacon_address === 'undefined') {
                res.send("<script>alert('Cannot find any beacon information'); history.go(-1);</script>");
            } else {
                pool.id_getBeaconInfo(deleted_beacon_address, function(beaconInfo) {

                    pool.id_deleteBeacon(deleted_beacon_address, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Delete Success!'); location.href='/beacon';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });
                });
            }
            break;

        default:
            res.send("<script>alert('Server error'); history.go(-1);</script>");
            break;
    }
});

router.post('/permission', function(req, res, next) {
    var controlFlag = req.body.user_control_flag;

    switch (controlFlag) {
        case "modify":
            var modified_name = req.body.modified_name;
            var selected_employee_number = req.body.employee_number;
            var selected_smartphone_address = req.body.smartphone_address;
            var modified_department = req.body.modified_department;
            var modified_position = req.body.modified_position;
            var modified_admin = req.body.modified_admin;

            if (typeof selected_employee_number === 'undefined' || typeof selected_smartphone_address === 'undefined') {
                res.send("<script>alert('Cannot find any user information'); history.go(-1);</script>");
            } else {
                pool.id_getUserInfo(selected_smartphone_address, function(userInfo) {
                    if (typeof modified_name === 'undefined')
                        modified_name = userInfo.name;
                    if (typeof modified_department === 'undefined')
                        modified_department = userInfo.department;
                    if (typeof modified_position === 'undefined')
                        modified_position = userInfo.position;

                    if (typeof modified_admin === 'undefined')
                        modified_admin = 0;
                    else
                        modified_admin = 1;

                    pool.id_modifyUser(selected_smartphone_address, selected_employee_number, modified_name, null,
                        modified_department, modified_position, modified_admin, function (valid) {
                            if (valid) {
                                res.send("<script>alert('Modify Success!'); location.href='/permission';</script>");
                            } else {
                                res.send("<script>alert('Server error'); history.go(-1);</script>");
                            }
                        });
                });
            }
            break;

        case "delete":
            var deleted_smartphone_address = req.body.smartphone_address;

            if (typeof deleted_smartphone_address === 'undefined') {
                res.send("<script>alert('Cannot find any user information'); history.go(-1);</script>");
            } else {
                pool.id_getUserInfo(deleted_smartphone_address, function(userInfo) {

                    pool.id_deleteUser(deleted_smartphone_address, userInfo.employee_number, function (valid) {
                        if (valid) {
                            res.send("<script>alert('Delete Success!'); location.href='/permission';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });
                });
            }
            break;

        case "permit":
            if (typeof req.body.toGivePermissionUsersJsonArrStr === 'undefined') {
                res.send("<script>alert('No users checked'); location.href='/permission';</script>");
            } else {
                var toGivePermissionUsersJsonArr = JSON.parse(req.body.toGivePermissionUsersJsonArrStr);

                var toGivePermissionUsersArr = [];
                for (var i = 0; i < toGivePermissionUsersJsonArr.length; i++) {
                    toGivePermissionUsersArr.push(toGivePermissionUsersJsonArr[i].smartphone_address);
                }

                pool.id_permitUsers(toGivePermissionUsersArr, function(valid) {
                    if (valid) {
                        res.send("<script>alert('Modify Success!'); location.href='/permission';</script>");
                    } else {
                        res.send("<script>alert('Server error'); history.go(-1);</script>");
                    }
                });
            }
            break;

        default:
            res.send("<script>alert('Server error'); history.go(-1);</script>");
            break;
    }

});

module.exports = router;
