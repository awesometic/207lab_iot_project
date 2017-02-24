var express = require('express');
var router = express.Router();

var async = require('async');
var currentTime = require('../public/libs/currentTime');
var pool = require("../public/libs/db");
var logger = require("../public/libs/logger");

// DEMO
var demo = require('../public/libs/demo');
var fs = require('fs');

// session will be expired in 1 hour
var cookieExpires = 3600000;

var title = 'Suwon Univ. 207 Lab - "Janus" IoT Project';

/* GET */
router.get('/', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        res.send("<script>location.href='/dashboard';</script>");
    } else {
        res.render('index', {
            title: title
        });
    }
});

router.get('/dashboard', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    callback(null, userInfo);
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            }
        ], function (err, userInfo, companyName) {
            if (err) {
                console.log(err);
            } else {
                res.render('home/dashboard', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/management/database_access/member', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.getUserList(function (userListRows) {
                    callback(null, userInfo, companyName, userListRows);
                });
            },
            function (userInfo, companyName, userListRows, callback) {
                pool.getDepartmentList(function (departmentListRows) {
                    callback(null, userInfo, companyName, userListRows, departmentListRows);
                });
            },
            function (userInfo, companyName, userListRows, departmentListRows, callback) {
                pool.getPositionList(function (positionListRows) {
                    callback(null, userInfo, companyName, userListRows, departmentListRows, positionListRows);
                });
            }
        ], function (err, userInfo, companyName, userListRows, departmentListRows, positionListRows) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/management/database_access/member', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName,
                    userListRows: userListRows,
                    departmentListRows: departmentListRows,
                    positionListRows: positionListRows
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/management/database_access/workplace', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.getWorkplaceList(function (workplaceListRows) {
                    callback(null, userInfo, companyName, workplaceListRows);
                });
            }
        ], function (err, userInfo, companyName, workplaceListRows) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/management/database_access/workplace', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName,
                    workplaceListRows: workplaceListRows
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/management/database_access/beacon', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.getBeaconList(function (beaconListRows) {
                    callback(null, userInfo, companyName, beaconListRows);
                });
            },
            function (userInfo, companyName, beaconListRows, callback) {
                pool.getWorkplaceList(function (workplaceListRows) {
                    callback(null, userInfo, companyName, beaconListRows, workplaceListRows);
                });
            }
        ], function (err, userInfo, companyName, beaconListRows, workplaceListRows) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/management/database_access/beacon', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName,
                    beaconListRows: beaconListRows,
                    workplaceListRows: workplaceListRows
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/management/permission', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.getNotPermittedUserList(function (deniedUserListRows) {
                    callback(null, userInfo, companyName, deniedUserListRows);
                });
            },
            function (userInfo, companyName, deniedUserListRows, callback) {
                pool.getDepartmentList(function (departmentListRows) {
                    callback(null, userInfo, companyName, deniedUserListRows, departmentListRows);
                });
            },
            function (userInfo, companyName, deniedUserListRows, departmentListRows, callback) {
                pool.getPositionList(function (positionListRows) {
                    callback(null, userInfo, companyName, deniedUserListRows, departmentListRows, positionListRows);
                });
            }
        ], function (err, userInfo, companyName, deniedUserListRows, departmentListRows, positionListRows) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/management/permission', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName,
                    deniedUserListRows: deniedUserListRows,
                    departmentListRows: departmentListRows,
                    positionListRows: positionListRows
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/management/position_department', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.getDepartmentList(function (departmentListRows) {
                    callback(null, userInfo, companyName, departmentListRows);
                });
            },
            function (userInfo, companyName, departmentListRows, callback) {
                pool.getPositionList(function (positionListRows) {
                    callback(null, userInfo, companyName, departmentListRows, positionListRows);
                });
            }
        ], function (err, userInfo, companyName, departmentListRows, positionListRows) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/management/position_department', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName,
                    departmentListRows: departmentListRows,
                    positionListRows: positionListRows
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/service_environment', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.getWorkStartTime(function (workStartTime) {
                    callback(null, userInfo, companyName, workStartTime);
                });
            },
            function (userInfo, companyName, workStartTime, callback) {
                pool.getWorkEndTime(function (workEndTime) {
                    callback(null, userInfo, companyName, workStartTime, workEndTime);
                });
            }
        ], function (err, userInfo, companyName, workStartTime, workEndTime) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/service_environment', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName,
                    workStartTime: workStartTime,
                    workEndTime: workEndTime
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/demo', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.admin == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            }
        ], function (err, userInfo, companyName) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/demo', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

/** routing for d3chart pages
 router.get('/circumstance/d3charts/heatmap', function(req, res, next) {
 var employee_number = req.session.user_employee_id;
 var smartphone_address = req.session.user_smartphone_address;

 if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
 async.waterfall([
 function (callback) {
 pool.getUserInfo(smartphone_address, function (userInfo) {
 if (userInfo.permission == 0) {
 callback('NOT PERMITTED');
 } else {
 callback(null, userInfo);
 }
 });
 },
 function (userInfo, callback) {
 pool.getCompanyName(function (companyName) {
 callback(null, userInfo, companyName);
 });
 }
 ], function (err, userInfo, companyName) {
 if (err == 'NOT PERMITTED') {
 res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
 } else if (err) {
 console.log(err);
 } else {
 res.render('home/circumstance/d3charts/heatmap', {
 title: title,
 userInfo: userInfo,
 companyName: companyName
 });
 }
 });
 } else {
 res.send("<script>location.href='/';</script>");
 }
 });

 router.get('/circumstance/d3charts/line', function(req, res, next) {
 var employee_number = req.session.user_employee_id;
 var smartphone_address = req.session.user_smartphone_address;

 if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
 async.waterfall([
 function (callback) {
 pool.getUserInfo(smartphone_address, function (userInfo) {
 if (userInfo.permission == 0) {
 callback('NOT PERMITTED');
 } else {
 callback(null, userInfo);
 }
 });
 },
 function (userInfo, callback) {
 pool.getCompanyName(function (companyName) {
 callback(null, userInfo, companyName);
 });
 }
 ], function (err, userInfo, companyName) {
 if (err == 'NOT PERMITTED') {
 res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
 } else if (err) {
 console.log(err);
 } else {
 res.render('home/circumstance/d3charts/line', {
 title: title,
 userInfo: userInfo,
 companyName: companyName
 });
 }
 });
 } else {
 res.send("<script>location.href='/';</script>");
 }
 });

 router.get('/circumstance/d3charts/bar', function(req, res, next) {
 var employee_number = req.session.user_employee_id;
 var smartphone_address = req.session.user_smartphone_address;

 if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
 async.waterfall([
 function (callback) {
 pool.getUserInfo(smartphone_address, function (userInfo) {
 if (userInfo.permission == 0) {
 callback('NOT PERMITTED');
 } else {
 callback(null, userInfo);
 }
 });
 },
 function (userInfo, callback) {
 pool.getCompanyName(function (companyName) {
 callback(null, userInfo, companyName);
 });
 }
 ], function (err, userInfo, companyName) {
 if (err == 'NOT PERMITTED') {
 res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
 } else if (err) {
 console.log(err);
 } else {
 res.render('home/circumstance/d3charts/bar', {
 title: title,
 userInfo: userInfo,
 companyName: companyName
 });
 }
 });
 } else {
 res.send("<script>location.href='/';</script>");
 }
 });

 router.get('/circumstance/d3charts/bubble', function(req, res, next) {
 var employee_number = req.session.user_employee_id;
 var smartphone_address = req.session.user_smartphone_address;

 if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
 async.waterfall([
 function (callback) {
 pool.getUserInfo(smartphone_address, function (userInfo) {
 if (userInfo.permission == 0) {
 callback('NOT PERMITTED');
 } else {
 callback(null, userInfo);
 }
 });
 },
 function (userInfo, callback) {
 pool.getCompanyName(function (companyName) {
 callback(null, userInfo, companyName);
 });
 }
 ], function (err, userInfo, companyName) {
 if (err == 'NOT PERMITTED') {
 res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
 } else if (err) {
 console.log(err);
 } else {
 res.render('home/circumstance/d3charts/bubble', {
 title: title,
 userInfo: userInfo,
 companyName: companyName
 });
 }
 });
 } else {
 res.send("<script>location.href='/';</script>");
 }
 });

 router.get('/circumstance/d3charts/dashboard', function(req, res, next) {
 var employee_number = req.session.user_employee_id;
 var smartphone_address = req.session.user_smartphone_address;

 if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
 async.waterfall([
 function (callback) {
 pool.getUserInfo(smartphone_address, function (userInfo) {
 if (userInfo.permission == 0) {
 callback('NOT PERMITTED');
 } else {
 callback(null, userInfo);
 }
 });
 },
 function (userInfo, callback) {
 pool.getCompanyName(function (companyName) {
 callback(null, userInfo, companyName);
 });
 }
 ], function (err, userInfo, companyName) {
 if (err == 'NOT PERMITTED') {
 res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
 } else if (err) {
 console.log(err);
 } else {
 res.render('home/circumstance/d3charts/dashboard', {
 title: title,
 userInfo: userInfo,
 companyName: companyName
 });
 }
 });
 } else {
 res.send("<script>location.href='/';</script>");
 }
 });

 router.get('/circumstance/d3charts/gantt', function(req, res, next) {
 var employee_number = req.session.user_employee_id;
 var smartphone_address = req.session.user_smartphone_address;

 if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
 async.waterfall([
 function (callback) {
 pool.getUserInfo(smartphone_address, function (userInfo) {
 if (userInfo.permission == 0) {
 callback('NOT PERMITTED');
 } else {
 callback(null, userInfo);
 }
 });
 },
 function (userInfo, callback) {
 pool.getCompanyName(function (companyName) {
 callback(null, userInfo, companyName);
 });
 }
 ], function (err, userInfo, companyName) {
 if (err == 'NOT PERMITTED') {
 res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
 } else if (err) {
 console.log(err);
 } else {
 res.render('home/circumstance/d3charts/gantt', {
 title: title,
 userInfo: userInfo,
 companyName: companyName
 });
 }
 });
 } else {
 res.send("<script>location.href='/';</script>");
 }
 });
 */

router.get('/management/database_access/commute_table', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                if (typeof req.query.start_date !== 'undefined' && typeof req.query.end_date !== 'undefined') {
                    var startDate = req.query.start_date;
                    var endDate = req.query.end_date;

                    pool.getCircumstanceTable(startDate, endDate, function (circumstanceListRows) {
                        callback(null, userInfo, companyName, circumstanceListRows);
                    });
                } else {
                    pool.getCircumstanceTable(function (circumstanceListRows) {
                        callback(null, userInfo, companyName, circumstanceListRows);
                    });
                }
            }
        ], function (err, userInfo, companyName, circumstanceListRows) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/management/database_access/commute_table', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName,
                    circumstanceListRows: circumstanceListRows
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

router.get('/circumstance/commute_result', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    var oneMonthAgoDate = new Date();
    oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);
    oneMonthAgoDate.setHours(0, 0, 0);

    var todayEndDate = new Date();
    todayEndDate.setHours(23, 59, 59);

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            }
        ], function (err, userInfo, companyName) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/circumstance/commute_result', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName
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

    pool.loginValidation(signin_id, signin_pw, function(valid) {

        if (valid == "unregistered") {
            // If employee number is unregistered
            res.send("<script>alert('Unregistered user!'); history.go(-1);</script>");
        } else if (valid == "wrong password") {
            // If typed password is wrong
            res.send("<script>alert('Check your password!'); history.go(-1);</script>");
        } else if (typeof valid !== "undefined") {
            // Login success

            pool.getSmartphoneAddress(signin_id, function (smartphone_address) {
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

router.post('/management/database_access/member', function(req, res, next) {
    var controlFlag = req.body.user_control_flag;

    switch (controlFlag) {
        case "add":
            var signup_id = req.body.employee_number;
            var signup_pw = req.body.employee_number;
            var signup_name = req.body.name;
            var signup_smartphone_address = req.body.smartphone_address;
            var signup_department = req.body.department;
            var signup_position = req.body.position;

            pool.checkUserRegistered(signup_smartphone_address, signup_id, function (valid) {
                if (valid) {
                    pool.registerUser(signup_smartphone_address, signup_id, signup_name, signup_pw, signup_department, signup_position, 0, 0, function (valid) {
                        if (valid) {
                            res.send("<script>alert('Register success!'); location.href='/management/database_access/member';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });
                } else {
                    res.send("<script>alert('Already registered user identification!'); history.go(-1);</script>");
                }
            });
            break;

        case "modify":
            var modified_name = req.body.name;
            var selected_employee_number = req.body.employee_number;
            var selected_smartphone_address = req.body.smartphone_address;
            var modified_department = req.body.department;
            var modified_position = req.body.position;
            var modified_admin = req.body.admin;

            if (typeof selected_employee_number === 'undefined' || typeof selected_smartphone_address === 'undefined') {
                res.send("<script>alert('Cannot find any user information'); history.go(-1);</script>");
            } else {
                pool.getUserInfo(selected_smartphone_address, function(userInfo) {
                    if (typeof modified_name === 'undefined')
                        modified_name = userInfo.name;
                    if (typeof modified_department === 'undefined')
                        modified_department = userInfo.id_department;
                    if (typeof modified_position === 'undefined')
                        modified_position = userInfo.id_position;

                    if (typeof modified_admin === 'undefined')
                        modified_admin = 0;
                    else
                        modified_admin = 1;

                    pool.modifyUser(selected_smartphone_address, selected_employee_number, modified_name, null,
                        modified_department, modified_position, modified_admin, function (valid) {
                            if (valid) {
                                res.send("<script>alert('Modify Success!'); location.href='/management/database_access/member';</script>");
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
                pool.getUserInfo(deleted_smartphone_address, function(userInfo) {

                    pool.deleteUser(deleted_smartphone_address, userInfo.employee_number, function (valid) {
                        if (valid) {
                            res.send("<script>alert('Delete Success!'); location.href='/management/database_access/member';</script>");
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

router.post('/management/database_access/workplace', function(req, res, next) {
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

            pool.registerWorkplace(name_workplace, location_workplace, latitude, longitude, function(valid) {
                if (valid) {
                    res.send("<script>alert('Add Success!'); location.href='/management/database_access/workplace';</script>");
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
                pool.getWorkplaceInfo(selected_id_workplace, function(workplaceInfo) {
                    if (typeof modified_name === 'undefined')
                        modified_name = workplaceInfo.name;
                    if (typeof modified_location === 'undefined')
                        modified_location = workplaceInfo.department;

                    pool.modifyWorkplace(selected_id_workplace, modified_name, modified_location,
                        workplaceInfo.coordinateX, workplaceInfo.coordinateY, workplaceInfo.coordinateZ,
                        workplaceInfo.thresholdX, workplaceInfo.thresholdY, workplaceInfo.thresholdZ,
                        workplaceInfo.latitude, workplaceInfo.longitude, workplaceInfo.beacon_set, function (valid) {
                            if (valid) {
                                res.send("<script>alert('Modify Success!'); location.href='/management/database_access/workplace';</script>");
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
                pool.getWorkplaceInfo(deleted_id_workplace, function (workplaceInfo) {
                    if (workplaceInfo.beacon_set == 0) {
                        pool.deleteWorkplace(deleted_id_workplace, function (valid) {
                            if (valid) {
                                res.send("<script>alert('Delete Success!'); location.href='/management/database_access/workplace';</script>");
                            } else {
                                res.send("<script>alert('Server error'); history.go(-1);</script>");
                            }
                        });
                    } else {
                        res.send("<script>alert('비콘이 속한 장소는 삭제할 수 없습니다!'); location.href='/management/database_access/workplace';</script>");
                    }
                });
            }
            break;

        default:
            res.send("<script>alert('Server error'); history.go(-1);</script>");
            break;
    }
});

router.post('/management/database_access/beacon', function(req, res, next) {
    var controlFlag = req.body.beacon_control_flag;

    switch (controlFlag) {
        case "add":
            var add_beacon_address = req.body.beacon_address;
            var add_uuid = req.body.uuid;
            var add_major = req.body.major;
            var add_minor = req.body.minor;
            var add_id_workplace = req.body.id_workplace;

            pool.getBeaconsCountOfWorkplace(add_id_workplace, function(beaconsCountOfWorkplace) {
                if (beaconsCountOfWorkplace < 3 || add_id_workplace == -1) {
                    pool.checkBeaconRegistered(add_beacon_address, function(valid) {
                        if (valid) {
                            pool.registerBeacon(add_beacon_address, add_uuid, add_major, add_minor, add_id_workplace, function (valid) {
                                if (valid) {
                                    pool.getBeaconsCountOfWorkplace(add_id_workplace, function(afterBeaconsCountOfWorkplace) {
                                        pool.getWorkplaceInfo(add_id_workplace, function(workplaceInfo) {
                                            if (afterBeaconsCountOfWorkplace == 3) {
                                                pool.modifyWorkplace(add_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
                                                    workplaceInfo.coordinateX, workplaceInfo.coordinateY, workplaceInfo.coordinateZ,
                                                    workplaceInfo.thresholdX, workplaceInfo.thresholdY, workplaceInfo.thresholdZ,
                                                    workplaceInfo.latitude, workplaceInfo.longitude, 1, function (valid) {
                                                        if (valid) {
                                                            res.send("<script>alert('Add Success!'); location.href='/management/database_access/beacon';</script>");
                                                        } else {
                                                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                                                        }
                                                    });
                                            } else {
                                                if (valid) {
                                                    res.send("<script>alert('Add Success!'); location.href='/management/database_access/beacon';</script>");
                                                } else {
                                                    res.send("<script>alert('Server error'); history.go(-1);</script>");
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    res.send("<script>alert('Server error'); history.go(-1);</script>");
                                }
                            });
                        } else {
                            res.send("<script>alert('Already registered!'); history.go(-1);</script>");
                        }
                    });
                } else {
                    res.send("<script>alert('해당 장소에는 더 이상 비콘을 추가할 수 없습니다!'); history.go(-1);</script>");
                }
            });
            break;

        case "modify":
            var selected_beacon_address = req.body.beacon_address;
            var modified_uuid = req.body.uuid;
            var modified_major = req.body.major;
            var modified_minor = req.body.minor;
            var current_id_workplace = req.body.id_workplace;
            var modified_id_workplace = req.body.modified_id_workplace;

            if (typeof selected_beacon_address === 'undefined') {
                res.send("<script>alert('Cannot find any beacon information'); history.go(-1);</script>");
            } else {
                pool.getBeaconInfo(selected_beacon_address, function (beaconInfo) {
                    if (typeof modified_uuid === 'undefined')
                        modified_uuid = beaconInfo.UUID;
                    if (typeof modified_major === 'undefined')
                        modified_major = beaconInfo.major;
                    if (typeof modified_minor === 'undefined')
                        modified_minor = beaconInfo.minor;

                    pool.modifyBeacon(selected_beacon_address, modified_uuid, modified_major, modified_minor, modified_id_workplace, function (valid) {
                        if (valid) {
                            if (modified_id_workplace == -1) {
                                pool.getBeaconsCountOfWorkplace(current_id_workplace, function (afterBeaconsCountOfWorkplace) {
                                    pool.getWorkplaceInfo(current_id_workplace, function (workplaceInfo) {
                                        if (afterBeaconsCountOfWorkplace == 3) {
                                            pool.modifyWorkplace(current_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
                                                workplaceInfo.coordinateX, workplaceInfo.coordinateY, workplaceInfo.coordinateZ,
                                                workplaceInfo.thresholdX, workplaceInfo.thresholdY, workplaceInfo.thresholdZ,
                                                workplaceInfo.latitude, workplaceInfo.longitude, 1, function (valid) {
                                                    if (valid) {
                                                        res.send("<script>alert('Modify Success!'); location.href='/management/database_access/beacon';</script>");
                                                    } else {
                                                        res.send("<script>alert('Server error'); history.go(-1);</script>");
                                                    }
                                                });
                                        } else {
                                            pool.modifyWorkplace(current_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
                                                workplaceInfo.coordinateX, workplaceInfo.coordinateY, workplaceInfo.coordinateZ,
                                                workplaceInfo.thresholdX, workplaceInfo.thresholdY, workplaceInfo.thresholdZ,
                                                workplaceInfo.latitude, workplaceInfo.longitude, 0, function (valid) {
                                                    if (valid) {
                                                        res.send("<script>alert('Modify Success!'); location.href='/management/database_access/beacon';</script>");
                                                    } else {
                                                        res.send("<script>alert('Server error'); history.go(-1);</script>");
                                                    }
                                                });
                                        }
                                    });
                                });
                            } else {
                                async.waterfall([
                                    function(callback) {
                                        pool.getBeaconsCountOfWorkplace(modified_id_workplace, function (afterBeaconsCountOfWorkplace) {
                                            pool.getWorkplaceInfo(modified_id_workplace, function (workplaceInfo) {
                                                if (afterBeaconsCountOfWorkplace == 3) {
                                                    pool.modifyWorkplace(modified_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
                                                        workplaceInfo.coordinateX, workplaceInfo.coordinateY, workplaceInfo.coordinateZ,
                                                        workplaceInfo.thresholdX, workplaceInfo.thresholdY, workplaceInfo.thresholdZ,
                                                        workplaceInfo.latitude, workplaceInfo.longitude, 1, function (valid) {
                                                            callback((valid) ? null : false);
                                                        });
                                                } else {
                                                    pool.modifyWorkplace(modified_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
                                                        workplaceInfo.coordinateX, workplaceInfo.coordinateY, workplaceInfo.coordinateZ,
                                                        workplaceInfo.thresholdX, workplaceInfo.thresholdY, workplaceInfo.thresholdZ,
                                                        workplaceInfo.latitude, workplaceInfo.longitude, 0, function (valid) {
                                                            callback((valid) ? null : false);
                                                        });
                                                }
                                            });
                                        });
                                    },
                                    function(callback) {
                                        pool.getBeaconsCountOfWorkplace(current_id_workplace, function (afterBeaconsCountOfWorkplace) {
                                            pool.getWorkplaceInfo(current_id_workplace, function (workplaceInfo) {
                                                if (afterBeaconsCountOfWorkplace == 3) {
                                                    pool.modifyWorkplace(current_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
                                                        workplaceInfo.coordinateX, workplaceInfo.coordinateY, workplaceInfo.coordinateZ,
                                                        workplaceInfo.thresholdX, workplaceInfo.thresholdY, workplaceInfo.thresholdZ,
                                                        workplaceInfo.latitude, workplaceInfo.longitude, 1, function (valid) {
                                                            callback((valid) ? null : false);
                                                        });
                                                } else {
                                                    pool.modifyWorkplace(current_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
                                                        workplaceInfo.coordinateX, workplaceInfo.coordinateY, workplaceInfo.coordinateZ,
                                                        workplaceInfo.thresholdX, workplaceInfo.thresholdY, workplaceInfo.thresholdZ,
                                                        workplaceInfo.latitude, workplaceInfo.longitude, 0, function (valid) {
                                                            callback((valid) ? null : false);
                                                        });
                                                }
                                            });
                                        });
                                    }
                                ], function(err) {
                                    if (err == null) {
                                        res.send("<script>alert('Modify Success!'); location.href='/management/database_access/beacon';</script>");
                                    } else {
                                        res.send("<script>alert('Server error'); history.go(-1);</script>");
                                    }
                                });
                            }
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
                pool.getBeaconInfo(deleted_beacon_address, function(beaconInfo) {
                    if (beaconInfo.id_workplace == -1) {
                        pool.deleteBeacon(deleted_beacon_address, function (valid) {
                            if (valid) {
                                res.send("<script>alert('Delete Success!'); location.href='/management/database_access/beacon';</script>");
                            } else {
                                res.send("<script>alert('Server error'); history.go(-1);</script>");
                            }
                        });
                    } else {
                        res.send("<script>alert('먼저 비콘이 속한 장소를 \"미정\"으로 바꿔주세요!'); location.href='/management/database_access/beacon';</script>");
                    }
                });
            }
            break;

        default:
            res.send("<script>alert('Server error'); history.go(-1);</script>");
            break;
    }
});

router.post('/management/permission', function(req, res, next) {
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
                pool.getUserInfo(selected_smartphone_address, function(userInfo) {
                    if (typeof modified_name === 'undefined')
                        modified_name = userInfo.name;
                    if (typeof modified_department === 'undefined')
                        modified_department = userInfo.id_department;
                    if (typeof modified_position === 'undefined')
                        modified_position = userInfo.id_position;

                    if (typeof modified_admin === 'undefined')
                        modified_admin = 0;
                    else
                        modified_admin = 1;

                    pool.modifyUser(selected_smartphone_address, selected_employee_number, modified_name, null,
                        modified_department, modified_position, modified_admin, function (valid) {
                            if (valid) {
                                res.send("<script>alert('Modify Success!'); location.href='/management/permission';</script>");
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
                pool.getUserInfo(deleted_smartphone_address, function(userInfo) {

                    pool.deleteUser(deleted_smartphone_address, userInfo.employee_number, function (valid) {
                        if (valid) {
                            res.send("<script>alert('Delete Success!'); location.href='/management/permission';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });
                });
            }
            break;

        case "permit":
            if (typeof req.body.toGivePermissionUsersJsonArrStr === 'undefined') {
                res.send("<script>alert('No users checked'); location.href='/management/permission';</script>");
            } else {
                var toGivePermissionUsersJsonArr = JSON.parse(req.body.toGivePermissionUsersJsonArrStr);

                var toGivePermissionUsersArr = [];
                for (var i = 0; i < toGivePermissionUsersJsonArr.length; i++) {
                    toGivePermissionUsersArr.push(toGivePermissionUsersJsonArr[i].smartphone_address);
                }

                pool.permitUsers(toGivePermissionUsersArr, function(valid) {
                    if (valid) {
                        res.send("<script>alert('Modify Success!'); location.href='/management/permission';</script>");
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

router.post('/management/position_department', function(req, res, next) {
    var controlFlag = req.body.control_flag;
    var smartphoneAddress = req.body.smartphone_address;

    pool.getUserInfo(smartphoneAddress, function(userInfo) {
        if (userInfo.admin) {
            switch (controlFlag) {
                case "department_add":
                    var name = req.body.department_name;

                    pool.addDepartment(name, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Add Success!'); location.href='/management/position_department';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });

                    break;

                case "department_modify":
                    var id = req.body.id_department;
                    var name = req.body.department_name;

                    pool.modifyDepartment(id, name, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Modify Success!'); location.href='/management/position_department';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });

                    break;

                case "department_delete":
                    var id = req.body.id_department;

                    pool.deleteDepartment(id, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Delete Success!'); location.href='/management/position_department';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });

                    break;

                case "position_add":
                    var name = req.body.position_name;

                    pool.addPosition(name, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Add Success!'); location.href='/management/position_department';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });

                    break;

                case "position_modify":
                    var id = req.body.id_position;
                    var name = req.body.position_name;

                    pool.modifyPosition(id, name, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Modify Success!'); location.href='/management/position_department';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });

                    break;

                case "position_delete":
                    var id = req.body.id_position;

                    pool.deletePosition(id, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Delete Success!'); location.href='/management/position_department';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });

                    break;

                default:
                    res.send("<script>alert('Server error'); history.go(-1);</script>");
                    break;
            }
        } else {
            res.send("<script>alert('권한이 없습니다!'); history.go(-1);</script>");
        }
    });
});

router.post('/service_environment', function(req, res, next) {
    var controlFlag = req.body.control_flag;
    var smartphoneAddress = req.body.smartphone_address;

    pool.getUserInfo(smartphoneAddress, function(userInfo) {
        if (userInfo.admin) {
            switch (controlFlag) {
                case "company_name":
                    var newCompanyName = req.body.new_company_name;

                    pool.editCompanyName(newCompanyName, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Modify Success!'); location.href='/service_environment';</script>");
                        } else {
                            res.send("<script>alert('Server error'); location.href='/service_environment';</script>");
                        }
                    });
                    break;

                case "work_start_end_time":
                    var workStartTime = req.body.work_start_time;
                    var workEndTime = req.body.work_end_time;

                    pool.editWorkStartEndTime(workStartTime, workEndTime, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Modify Success!'); location.href='/service_environment';</script>");
                        } else {
                            res.send("<script>alert('Server error'); location.href='/service_environment';</script>");
                        }
                    });
                    break;

                default:
                    res.send("<script>alert('Server error'); history.go(-1);</script>");
                    break;
            }
        } else {
            res.send("<script>alert('권한이 없습니다!'); history.go(-1);</script>");
        }
    });
});

router.post('/demo', function(req, res, next) {
    var controlFlag = req.body.control_flag;
    var smartphoneAddress = req.body.smartphone_address;

    pool.getUserInfo(smartphoneAddress, function(userInfo) {
        if (userInfo.admin) {
            switch (controlFlag) {
                case "on":

                    break;

                case "off":

                    break;

                default:
                    res.send("<script>alert('Server error'); history.go(-1);</script>");
                    break;
            }
        } else {
            res.send("<script>alert('권한이 없습니다!'); history.go(-1);</script>");
        }
    });
});

/* POST for getting data using Jquery. Not provided as accessible web page */
router.post('/post/chart/dashboard', function(req, res, next) {
    var smartphone_address = req.body.smartphone_address;

    var oneMonthAgoDate = new Date();
    oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);
    oneMonthAgoDate.setHours(0, 0, 0);

    var todayEndDate = new Date();
    todayEndDate.setHours(23, 59, 59);

    var companyName;
    var datasetPieChart = '[ ';
    var datasetBarChart = '[ ';

    async.waterfall([
        function (callback) {
            pool.getUserInfo(smartphone_address, function (userInfo) {
                if (userInfo.permission == 0) {
                    callback('NOT PERMITTED');
                } else {
                    callback(null);
                }
            });
        },
        function (callback) {
            pool.getCompanyName(function (_companyName) {
                companyName = _companyName;

                callback(null);
            });
        },
        function (callback) {
            pool.getDepartmentList(function (departmentList) {
                pool.getCommuteInfo(oneMonthAgoDate, todayEndDate, function (commuteInfoJson) {
                    var avgWorkingTimeArr = [];
                    var minWorkingTimeArr = [];
                    var maxWorkingTimeArr = [];
                    var avgOverWorkingTimeArr = [];
                    var totalAvgWorkingTime = 0;
                    var totalAvgOverWorkingTime = 0;
                    var totalPopulation = 0;

                    for (var i = 0; i < commuteInfoJson.departmentList.length; i++) {
                        var name = commuteInfoJson.departmentList[i].name;
                        var id = commuteInfoJson.departmentList[i].id_department;
                        var avgWorkingTime = Math.floor(commuteInfoJson.departmentList[i].avgWorkingTime / 1000);
                        var minWorkingTime = Math.floor(commuteInfoJson.departmentList[i].minWorkingTime / 1000);
                        var maxWorkingTime = Math.floor(commuteInfoJson.departmentList[i].maxWorkingTime / 1000);
                        var avgOverWorkingTime = Math.floor(commuteInfoJson.departmentList[i].avgOverWorkingTime / 1000);

                        if (avgWorkingTime > 0)
                            avgWorkingTimeArr.push(avgWorkingTime);
                        if (minWorkingTime > 0)
                            minWorkingTimeArr.push(minWorkingTime);
                        if (maxWorkingTime > 0)
                            maxWorkingTimeArr.push(maxWorkingTime);
                        if (avgOverWorkingTime > 0)
                            avgOverWorkingTimeArr.push(avgOverWorkingTime);

                        datasetPieChart += '{ "category":"' + name + '", ';
                        datasetPieChart += '"measure":' + avgWorkingTime + ' }';

                        if (i < commuteInfoJson.departmentList.length - 1) {
                            datasetPieChart += ',';
                        }

                        datasetBarChart += '{ "group":"' + name + '", "category":"평균", "measure":' + avgWorkingTime + '},';
                        datasetBarChart += '{ "group":"' + name + '", "category":"최저", "measure":' + minWorkingTime + '},';
                        datasetBarChart += '{ "group":"' + name + '", "category":"최고", "measure":' + maxWorkingTime + '},';
                        datasetBarChart += '{ "group":"' + name + '", "category":"초과 평균", "measure":' + avgOverWorkingTime + '},';

                        for (var i = 0; i < departmentList.length; i++) {
                            if (departmentList[i].id == id) {
                                datasetBarChart += '{ "group":"' + name + '", "category":"총 인원", "measure":' + departmentList[i].population + '},';

                                break;
                            }
                        }
                    }

                    for (var i = 0; i < avgWorkingTimeArr.length; i++) {
                        totalAvgWorkingTime += avgWorkingTimeArr[i];
                    }

                    for (var i = 0; i < avgOverWorkingTimeArr.length; i++) {
                        totalAvgOverWorkingTime += avgOverWorkingTimeArr[i];
                    }

                    for (var i = 0; i < departmentList.length; i++) {
                        totalPopulation += departmentList[i].population;
                    }

                    datasetBarChart += '{ "group":"All", "category":"평균", "measure":' + Math.floor(totalAvgWorkingTime / avgWorkingTimeArr.length) + '}, ';
                    datasetBarChart += '{ "group":"All", "category":"최저", "measure":' + minWorkingTimeArr.sort()[0] + '}, ';
                    datasetBarChart += '{ "group":"All", "category":"최고", "measure":' + maxWorkingTimeArr.sort()[maxWorkingTimeArr.length - 1] + '}, ';
                    datasetBarChart += '{ "group":"All", "category":"초과 평균", "measure":' + Math.floor(totalAvgOverWorkingTime / avgOverWorkingTimeArr.length) + '}, ';
                    datasetBarChart += '{ "group":"All", "category":"총 인원", "measure":' + totalPopulation + '} ';

                    callback(null);
                });
            });
        }
    ], function (err) {
        if (err != null) {
            switch (err) {
                case 'NOT PERMITTED':
                    break;

                default:
                    console.log(err);
                    break;
            }
        } else {
            datasetPieChart += ' ]';
            datasetBarChart += ' ]';

            res.json({
                companyName: companyName,
                datasetPieChart: datasetPieChart,
                datasetBarChart: datasetBarChart
            });
        }
    });
});

router.post('/post/todayCommuteInfo', function(req, res, next) {
    var smartphone_address = req.body.smartphone_address;
    var searchDate, searchDateStart, searchDateEnd;

    if (typeof req.body.searchDate === 'undefined') {
        searchDate = currentTime.getCurrentDate();
    } else {
        searchDate = req.body.searchDate;
    }

    searchDateStart = searchDate + ' 00:00:00';
    searchDateEnd = searchDate + ' 23:59:59';

    async.waterfall([
        function (callback) {
            pool.getUserInfo(smartphone_address, function (userInfo) {
                if (userInfo.permission == 0) {
                    callback('NOT PERMITTED');
                } else {
                    callback(null);
                }
            });
        },
        function (callback) {
            pool.getTodayCommuteInfo(searchDateStart, searchDateEnd, function (todayCommuteInfo) {
                callback(null, todayCommuteInfo);
            });
        }
    ], function (err, todayCommuteInfo) {
        if (err != null) {
            switch (err) {
                case 'NOT PERMITTED':
                    break;

                default:
                    console.log(err);
                    break;
            }
        } else {
            res.json({
                todayCommuteInfo: todayCommuteInfo
            });
        }
    });
});

router.post('/post/commuteInfo', function(req, res, next) {
    var smartphone_address = req.body.smartphone_address;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    async.waterfall([
        function (callback) {
            pool.getUserInfo(smartphone_address, function (userInfo) {
                if (userInfo.permission == 0) {
                    callback('NOT PERMITTED');
                } else {
                    callback(null);
                }
            });
        },
        function (callback) {
            pool.getCommuteInfo(startDate, endDate, function(avgCommuteInfo) {
                callback(null, avgCommuteInfo);
            });
        }
    ], function (err, avgCommuteInfo) {
        if (err != null) {
            switch (err) {
                case 'NOT PERMITTED':
                    break;

                default:
                    console.log(err);
                    break;
            }
        } else {
            res.json({
                avgCommuteInfo: avgCommuteInfo
            });
        }
    });
});

router.post('/post/demo-status', function(req, res, next) {
    var smartphone_address = req.body.smartphone_address;

    async.waterfall([
        function (callback) {
            pool.getUserInfo(smartphone_address, function (userInfo) {
                if (userInfo.admin == 0) {
                    callback('NOT PERMITTED');
                } else {
                    callback(null);
                }
            });
        }
    ], function (err) {
        if (err != null) {
            switch (err) {
                case 'NOT PERMITTED':
                    break;

                default:
                    console.log(err);
                    break;
            }
        } else {
            res.json({
                status: demo.status()
            });
        }
    });
});

router.post('/post/demo-log', function(req, res, next) {
    var smartphone_address = req.body.smartphone_address;

    async.waterfall([
        function (callback) {
            pool.getUserInfo(smartphone_address, function (userInfo) {
                if (userInfo.admin == 0) {
                    callback('NOT PERMITTED');
                } else {
                    callback(null);
                }
            });
        },
        function (callback) {
            var path = './logs/' + currentTime.getCurrentDate() + '_demo.log';

            fs.stat(path, function (err, stats) {
                if (err) {
                    logger("demo").info("/post/demo-log: fs.stat() err.code: " + err.code);
                    callback('FILE IS NOT EXISTED');
                } else {
                    fs.readFile(path, 'utf8', function(err, data) {
                        if (err) {
                            callback('ERROR: ' + err);
                        } else {
                            callback(null, data.replace(/\n/g, '<br>'));
                        }
                    });
                }
            });
        }
    ], function (err, log) {
        if (err != null) {
            switch (err) {
                case 'NOT PERMITTED':
                    break;

                case 'FILE IS NOT EXISTED':
                    break;

                default:
                    console.log(err);
                    break;
            }
        } else {
            res.json({
                log: log
            });
        }
    });
});

router.post('/post/demo-switch', function(req, res, next) {
    var smartphone_address = req.body.smartphone_address;
    var operation = req.body.operation;

    async.waterfall([
        function (callback) {
            pool.getUserInfo(smartphone_address, function (userInfo) {
                if (userInfo.admin == 0) {
                    callback('NOT PERMITTED');
                } else {
                    callback(null);
                }
            });
        },
        function (callback) {
            var currentDemoStatus = demo.status();

            if (operation == 'ON' && !currentDemoStatus) {
                demo.start();
                callback(null);
            } else if (operation == 'OFF' && currentDemoStatus) {
                demo.stop();
                callback(null);
            } else {
                callback('OPERATION ERROR');
            }
        }
    ], function (err) {
        if (err != null) {
            switch (err) {
                case 'NOT PERMITTED':
                    break;

                case 'OPERATION ERROR':
                    break;

                default:
                    console.log(err);
                    break;
            }
        } else {
            res.json({
                status: demo.status()
            });
        }
    });
});

module.exports = router;
