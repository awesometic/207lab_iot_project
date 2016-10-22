var express = require('express');
var router = express.Router();

var async = require('async');
var pool = require("../db");
var logger = require("../logger");

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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    callback(null, userInfo);
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.id_getUserList(function (userListRows) {
                    callback(null, userInfo, companyName, userListRows);
                });
            },
            function (userInfo, companyName, userListRows, callback) {
                pool.id_getDepartmentList(function (departmentListRows) {
                    callback(null, userInfo, companyName, userListRows, departmentListRows);
                });
            },
            function (userInfo, companyName, userListRows, departmentListRows, callback) {
                pool.id_getPositionList(function (positionListRows) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.id_getWorkplaceList(function (workplaceListRows) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.id_getBeaconList(function (beaconListRows) {
                    callback(null, userInfo, companyName, beaconListRows);
                });
            },
            function (userInfo, companyName, beaconListRows, callback) {
                pool.id_getWorkplaceList(function (workplaceListRows) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.id_getNotPermittedUserList(function (deniedUserListRows) {
                    callback(null, userInfo, companyName, deniedUserListRows);
                });
            },
            function (userInfo, companyName, deniedUserListRows, callback) {
                pool.id_getDepartmentList(function (departmentListRows) {
                    callback(null, userInfo, companyName, deniedUserListRows, departmentListRows);
                });
            },
            function (userInfo, companyName, deniedUserListRows, departmentListRows, callback) {
                pool.id_getPositionList(function (positionListRows) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.id_getDepartmentList(function (departmentListRows) {
                    callback(null, userInfo, companyName, departmentListRows);
                });
            },
            function (userInfo, companyName, departmentListRows, callback) {
                pool.id_getPositionList(function (positionListRows) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.id_getWorkStartTime(function (workStartTime) {
                    callback(null, userInfo, companyName, workStartTime);
                });
            },
            function (userInfo, companyName, workStartTime, callback) {
                pool.id_getWorkEndTime(function (workEndTime) {
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

router.get('/circumstance/d3charts/heatmap', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
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

router.get('/management/database_access/commute_table', function(req, res, next) {
    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                if (typeof req.query.start_date !== 'undefined' && typeof req.query.end_date !== 'undefined') {
                    var startDate = req.query.start_date;
                    var endDate = req.query.end_date;

                    pool.chart_getCircumstanceTable(startDate, endDate, function (circumstanceListRows) {
                        callback(null, userInfo, companyName, circumstanceListRows);
                    });
                } else {
                    pool.chart_getCircumstanceTable(function (circumstanceListRows) {
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
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    if (userInfo.permission == 0) {
                        callback('NOT PERMITTED');
                    } else {
                        callback(null, userInfo);
                    }
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            },
            function (userInfo, companyName, callback) {
                pool.chart_getTodayComeInTime(function(allTodayComeInTime) {
                    callback(null, userInfo, companyName, allTodayComeInTime);
                });
            },
            function (userInfo, companyName, allTodayComeInTime, callback) {
                pool.chart_getTodayComeOutTime(function(allTodayComeOutTime) {
                    callback(null, userInfo, companyName, allTodayComeInTime, allTodayComeOutTime);
                });
            },
            function (userInfo, companyName, allTodayComeInTime, allTodayComeOutTime, callback) {
                pool.chart_getTodayWorkTime(function(allTodayWorkingTime) {
                    callback(null, userInfo, companyName, allTodayComeInTime, allTodayComeOutTime, allTodayWorkingTime);
                });
            },
            function (userInfo, companyName, allTodayComeInTime, allTodayComeOutTime, allTodayWorkingTime, callback) {
                pool.chart_getAvgComeInTime(oneMonthAgoDate, todayEndDate, function(allAvgComeInTime) {
                    callback(null, userInfo, companyName, allTodayComeInTime, allTodayComeOutTime, allTodayWorkingTime, allAvgComeInTime);
                });
            },
            function (userInfo, companyName, allTodayComeInTime, allTodayComeOutTime, allTodayWorkingTime, allAvgComeInTime, callback) {
                pool.chart_getAvgComeOutTime(oneMonthAgoDate, todayEndDate, function(allAvgComeOutTime) {
                    callback(null, userInfo, companyName, allTodayComeInTime, allTodayComeOutTime, allTodayWorkingTime, allAvgComeInTime, allAvgComeOutTime);
                });
            },
            function (userInfo, companyName, allTodayComeInTime, allTodayComeOutTime, allTodayWorkingTime, allAvgComeInTime, allAvgComeOutTime, callback) {
                pool.chart_getAvgWorkTime(oneMonthAgoDate, todayEndDate, function(allAvgWorkingTime) {
                    callback(null, userInfo, companyName, allTodayComeInTime, allTodayComeOutTime, allTodayWorkingTime, allAvgComeInTime, allAvgComeOutTime, allAvgWorkingTime);
                });
            }
        ], function (err, userInfo, companyName, allTodayComeInTime, allTodayComeOutTime, allTodayWorkingTime, allAvgComeInTime, allAvgComeOutTime, allAvgWorkingTime) {
            if (err == 'NOT PERMITTED') {
                res.send("<script>alert('서비스 이용 권한이 없습니다'); location.href='/';</script>");
            } else if (err) {
                console.log(err);
            } else {
                res.render('home/circumstance/commute_result', {
                    title: title,
                    userInfo: userInfo,
                    companyName: companyName,
                    allTodayComeInTime: allTodayComeInTime,
                    allTodayComeOutTime: allTodayComeOutTime,
                    allTodayWorkingTime: allTodayWorkingTime,
                    allAvgComeInTime: allAvgComeInTime,
                    allAvgComeOutTime: allAvgComeOutTime,
                    allAvgWorkingTime: allAvgWorkingTime
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

router.get('/dashboard_deprecated', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function (companyName) {
                res.render('dashboard_deprecated', {
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

router.get('/profile_deprecated', function(req, res, next) {
    var userEmployeeId = req.session.user_employee_id;
    var userSmartphoneAddress = req.session.user_smartphone_address;

    if (typeof userEmployeeId != "undefined" || typeof userSmartphoneAddress != "undefined") {
        pool.id_getUserInfo(userSmartphoneAddress, function(userInfoRow) {
            pool.id_getCompanyName(function(companyName) {

                res.render('profile_deprecated', {
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

// router.post('/home/dashboard', function(req, res, next) {
//     var modified_password = req.body.password;
//     var modified_password_confirm = req.body.password_confirm;
//
//     if (modified_password.length != 0 && (modified_password != modified_password_confirm)) {
//         res.send("<script>alert('Check confirmation password!'); history.go(-1);</script>");
//     } else if (modified_password.length == 0) {
//         res.send("<script>alert('To change your password, fill out the form'); history.go(-1);</script>");
//     } else {
//         pool.id_getUserInfo(req.session.user_smartphone_address, function(userInfo) {
//             pool.id_modifyUser(req.session.user_smartphone_address, req.session.user_employee_id, userInfo.name, modified_password, userInfo.department, userInfo.position, userInfo.admin, function (valid) {
//                 if (valid) {
//                     res.send("<script>alert('Modify Success!'); location.href='home/dashboard';</script>");
//                 } else {
//                     res.send("<script>alert('Server error'); history.go(-1);</script>");
//                 }
//             });
//         });
//     }
// });

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

            pool.id_checkUserRegistered(signup_smartphone_address, signup_id, function (valid) {
                if (valid) {
                    pool.id_registerUser(signup_smartphone_address, signup_id, signup_name, signup_pw, signup_department, signup_position, 0, 0, function (valid) {
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

            console.log(modified_department + ", " + modified_position);

            if (typeof selected_employee_number === 'undefined' || typeof selected_smartphone_address === 'undefined') {
                res.send("<script>alert('Cannot find any user information'); history.go(-1);</script>");
            } else {
                pool.id_getUserInfo(selected_smartphone_address, function(userInfo) {
                    console.log(JSON.stringify(userInfo));
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

                    pool.id_modifyUser(selected_smartphone_address, selected_employee_number, modified_name, null,
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
                pool.id_getUserInfo(deleted_smartphone_address, function(userInfo) {

                    pool.id_deleteUser(deleted_smartphone_address, userInfo.employee_number, function (valid) {
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

            pool.id_registerWorkplace(name_workplace, location_workplace, latitude, longitude, function(valid) {
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
                pool.id_getWorkplaceInfo(deleted_id_workplace, function (workplaceInfo) {
                    if (workplaceInfo.beacon_set == 0) {
                        pool.id_deleteWorkplace(deleted_id_workplace, function (valid) {
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

            pool.soc_getBeaconsCountOfWorkplace(add_id_workplace, function(beaconsCountOfWorkplace) {
                if (beaconsCountOfWorkplace < 3 || add_id_workplace == -1) {
                    pool.id_checkBeaconRegistered(add_beacon_address, function(valid) {
                        if (valid) {
                            pool.id_registerBeacon(add_beacon_address, add_uuid, add_major, add_minor, add_id_workplace, function (valid) {
                                if (valid) {
                                    pool.soc_getBeaconsCountOfWorkplace(add_id_workplace, function(afterBeaconsCountOfWorkplace) {
                                        pool.id_getWorkplaceInfo(add_id_workplace, function(workplaceInfo) {
                                            if (afterBeaconsCountOfWorkplace == 3) {
                                                pool.id_modifyWorkplace(add_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
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
                pool.id_getBeaconInfo(selected_beacon_address, function (beaconInfo) {
                    if (typeof modified_uuid === 'undefined')
                        modified_uuid = beaconInfo.UUID;
                    if (typeof modified_major === 'undefined')
                        modified_major = beaconInfo.major;
                    if (typeof modified_minor === 'undefined')
                        modified_minor = beaconInfo.minor;

                    pool.id_modifyBeacon(selected_beacon_address, modified_uuid, modified_major, modified_minor, modified_id_workplace, function (valid) {
                        if (valid) {
                            if (modified_id_workplace == -1) {
                                pool.soc_getBeaconsCountOfWorkplace(current_id_workplace, function (afterBeaconsCountOfWorkplace) {
                                    pool.id_getWorkplaceInfo(current_id_workplace, function (workplaceInfo) {
                                        if (afterBeaconsCountOfWorkplace == 3) {
                                            pool.id_modifyWorkplace(current_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
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
                                            pool.id_modifyWorkplace(current_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
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
                                pool.soc_getBeaconsCountOfWorkplace(modified_id_workplace, function (afterBeaconsCountOfWorkplace) {
                                    pool.id_getWorkplaceInfo(modified_id_workplace, function (workplaceInfo) {
                                        if (afterBeaconsCountOfWorkplace == 3) {
                                            pool.id_modifyWorkplace(modified_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
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
                                            pool.id_modifyWorkplace(modified_id_workplace, workplaceInfo.name_workplace, workplaceInfo.location_workplace,
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
                pool.id_getBeaconInfo(deleted_beacon_address, function(beaconInfo) {
                    if (beaconInfo.id_workplace == -1) {
                        pool.id_deleteBeacon(deleted_beacon_address, function (valid) {
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
                pool.id_getUserInfo(selected_smartphone_address, function(userInfo) {
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

                    pool.id_modifyUser(selected_smartphone_address, selected_employee_number, modified_name, null,
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
                pool.id_getUserInfo(deleted_smartphone_address, function(userInfo) {

                    pool.id_deleteUser(deleted_smartphone_address, userInfo.employee_number, function (valid) {
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

                pool.id_permitUsers(toGivePermissionUsersArr, function(valid) {
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

    pool.id_getUserInfo(smartphoneAddress, function(userInfo) {
        if (userInfo.admin) {
            switch (controlFlag) {
                case "department_add":
                    var name = req.body.department_name;

                    pool.id_addDepartment(name, function(valid) {
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

                    pool.id_modifyDepartment(id, name, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Modify Success!'); location.href='/management/position_department';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });

                    break;

                case "department_delete":
                    var id = req.body.id_department;

                    pool.id_deleteDepartment(id, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Delete Success!'); location.href='/management/position_department';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });

                    break;

                case "position_add":
                    var name = req.body.position_name;

                    pool.id_addPosition(name, function(valid) {
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

                    pool.id_modifyPosition(id, name, function(valid) {
                        if (valid) {
                            res.send("<script>alert('Modify Success!'); location.href='/management/position_department';</script>");
                        } else {
                            res.send("<script>alert('Server error'); history.go(-1);</script>");
                        }
                    });

                    break;

                case "position_delete":
                    var id = req.body.id_position;

                    pool.id_deletePosition(id, function(valid) {
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

    pool.id_getUserInfo(smartphoneAddress, function(userInfo) {
        if (userInfo.admin) {
            switch (controlFlag) {
                case "company_name":
                    var newCompanyName = req.body.new_company_name;

                    pool.id_editCompanyName(newCompanyName, function(valid) {
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

                    pool.id_editWorkStartEndTime(workStartTime, workEndTime, function(valid) {
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

module.exports = router;
