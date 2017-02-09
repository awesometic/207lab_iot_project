/**
 *  Created by Yang Deokgyu a.k.a. Awesometic
 *
 *  This file is to communicate with the Android devices via internet
 *  All of the communicated data is encrypted by RSA and AES algorithms
 *
 *  */

//http://socket.io/docs/
var port = process.env.PORT || 20700;
var io = require("socket.io").listen(port);

var pool = require("./db");
var logger = require('./logger');
var schedule = require('node-schedule');
var async = require('async');
var currentTime = require('./currentTime');

var analyzer = require('./analyzer');

io.on("connection", function(socket) {
    // Send a new RSA public key to all socket connected smartphone at everyday midnight
    schedule.scheduleJob('0 1 * * *', function() {
        socket.emit('rsaPublicKey', {
            publicKey: analyzer.rsa.getPublicKey()
        });
    });

    // Send a current RSA public key to socket connected smartphone without validation of smartphone
    socket.on('requestRsaPublicKeyWithoutSmartphoneAddress', function() {
        socket.emit('rsaPublicKey', {
            publicKey: analyzer.rsa.getPublicKey()
        });
    });

    socket.on('requestRsaPublicKey', function(data) {
        var smartphoneAddress = analyzer.getSmartphoneAddress(data);

        pool.smartphoneValidation(smartphoneAddress, function(name) {
            if (name) {
                socket.emit('rsaPublicKey', {
                    publicKey: analyzer.rsa.getPublicKey()
                });
            }
        });
    });

    socket.on("circumstance", function(data) {
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("circumstance", "New commute record: received undefined data or empty");
        } else {
            var smartphoneRsaPublicKey = data.rsaPublicKey;
            var contentJson = analyzer.extractContentFromReceivedJson(data);
            var smartphoneAddress = analyzer.getSmartphoneAddress(contentJson);
            var beaconAddressArr = analyzer.getBeaconAddressArray(contentJson);
            var uuidArr = analyzer.getUuidArray(contentJson);
            var majorArr = analyzer.getMajorArray(contentJson);
            var minorArr = analyzer.getMinorArray(contentJson);
            var commuteStatus = analyzer.getCommuteStatus(contentJson);

            pool.gatewayValidation(beaconAddressArr, uuidArr, majorArr, minorArr, function (id) {
                if (id) {
                    pool.smartphoneValidation(smartphoneAddress, function (name) {
                        if (name) {
                            pool.registerCommute(smartphoneAddress, id, commuteStatus, currentTime.getCurrentDateTime(), function (valid) {
                                if (valid) {
                                    var contentJsonString = "{ ";
                                    contentJsonString += "\"requestSuccess\":\"" + true + "\"";
                                    contentJsonString += " }";

                                    socket.emit("circumstance_answer",
                                        analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));

                                    logger("socket").info("Circumstance", "New commute record: \n\tRegister success - " + commuteStatus);
                                } else {
                                    logger("socket").info("Circumstance", "New commute record: \n\tRegister fail: Database connection problem");
                                }
                            });
                        } else {
                            logger("socket").info("Circumstance", "New commute record: \n\tRegister fail: Unverified smartphone");
                        }
                    });
                } else {
                    logger("socket").info("Circumstance", "New commute record: \n\tRegister fail: Unverified gateway");
                }
            });
        }
    });

    socket.on("circumstance_overdue", function(data) {
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("circumstance_overdue", "New commute record: received undefined data or empty");
        } else {
            var smartphoneRsaPublicKey = data.rsaPublicKey;
            var contentJson = analyzer.extractContentFromReceivedJson(data);
            var smartphoneDatetime = analyzer.getSmartphoneDatetime(contentJson);
            var smartphoneAddress = analyzer.getSmartphoneAddress(contentJson);
            var beaconAddressArr = analyzer.getBeaconAddressArray(contentJson);
            var uuidArr = analyzer.getUuidArray(contentJson);
            var majorArr = analyzer.getMajorArray(contentJson);
            var minorArr = analyzer.getMinorArray(contentJson);
            var commuteStatus = analyzer.getCommuteStatus(contentJson);

            pool.gatewayValidation(beaconAddressArr, uuidArr, majorArr, minorArr, function (id) {
                if (id) {
                    pool.smartphoneValidation(smartphoneAddress, function (name) {
                        if (name) {
                            pool.registerCommute(smartphoneAddress, id, commuteStatus, smartphoneDatetime, function (valid) {
                                if (valid) {
                                    var contentJsonString = "{ ";
                                    contentJsonString += "\"requestSuccess\":\"" + true + "\"";
                                    contentJsonString += " }";

                                    socket.emit("circumstance_overdue_answer",
                                        analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));

                                    logger("socket").info("circumstance_overdue", "New commute record: \n\tRegister success - " + commuteStatus);
                                } else {
                                    logger("socket").info("circumstance_overdue", "New commute record: \n\tRegister fail: Database connection problem");
                                }
                            });
                        } else {
                            logger("socket").info("circumstance_overdue", "New commute record: \n\tRegister fail: Unverified smartphone");
                        }
                    });
                } else {
                    logger("socket").info("circumstance_overdue", "New commute record: \n\tRegister fail: Unverified gateway");
                }
            });
        }
    });

    socket.on("calibration", function(data) {
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("calibration", "New calibration data: received undefined data or empty");
        } else {
            var smartphoneRsaPublicKey = data.rsaPublicKey;
            var contentJson = analyzer.extractContentFromReceivedJson(data);
            var smartphoneAddress = analyzer.getSmartphoneAddress(contentJson);
            var beaconAddressArr = analyzer.getBeaconAddressArray(contentJson);
            var uuidArr = analyzer.getUuidArray(contentJson);
            var majorArr = analyzer.getMajorArray(contentJson);
            var minorArr = analyzer.getMinorArray(contentJson);
            var coordinateArr = analyzer.getCoordinateArray(contentJson);
            var thresholdArr = analyzer.getThresholdArray(contentJson);

            pool.gatewayValidation(beaconAddressArr, uuidArr, majorArr, minorArr, function(id) {
                if (id) {
                    pool.smartphoneValidation(smartphoneAddress, function(name) {
                        if (name) {
                            pool.RSSICalibration(coordinateArr, thresholdArr, id, name, currentTime.getCurrentDateTime(), function(valid) {
                                if (valid) {
                                    var contentJsonString = "{ ";
                                    contentJsonString += "\"requestSuccess\":\"" + true + "\"";
                                    contentJsonString += " }";

                                    socket.emit("calibration_answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                                    logger("socket").info("Calibration", "New calibration data: \n\tRegister success");
                                } else {
                                    logger("socket").info("Calibration", "New calibration data: \n\tRegister fail: Database connection problem");
                                }
                            });
                        } else {
                            logger("socket").info("Calibration", "New calibration data: \n\tRegister fail: Unverified smartphone");
                        }
                    });
                } else {
                    logger("socket").info("Calibration", "New calibration data: \n\tRegister fail: Unverified gateway");
                }
            });
        }
    });

    socket.on("requestEssentialData", function(data) {
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("RequestData", "Request from user: received undefined data or empty");
        } else {
            var smartphoneRsaPublicKey = data.rsaPublicKey;
            var contentJson = analyzer.extractContentFromReceivedJson(data);
            var smartphoneAddress = analyzer.getSmartphoneAddress(contentJson);

            pool.smartphoneValidation(smartphoneAddress, function (name) {
                if (name) {
                    pool.getEssentialData(function (data) {

                        if (data) {
                            socket.emit("requestEssentialData_answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, data));
                            logger("socket").info("RequestData", "Request from user: \n" + smartphoneAddress + "\n\tSend success");
                        } else {
                            logger("socket").info("RequestData", "Request from user: \n" + smartphoneAddress + "\n\tSend fail");
                        }

                    });
                } else {
                    logger("socket").info("RequestData", "Request from user: \n" + smartphoneAddress + "\n\tSend fail: Unverified smartphone");
                }
            });
        }
    });

    socket.on("amIRegistered", function(data) {
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("amIRegistered", "Whether user registered or not: received undefined data or empty");
        } else {
            var smartphoneRsaPublicKey = data.rsaPublicKey;
            var contentJson = analyzer.extractContentFromReceivedJson(data);
            var smartphoneAddress = analyzer.getSmartphoneAddress(contentJson);

            pool.amIRegistered(smartphoneAddress, currentTime.getCurrentDateTime(), function (isRegistered) {
                if (isRegistered) {
                    pool.getSmartphoneUserName(smartphoneAddress, function (employee_name) {
                        pool.getSmartphoneUserENum(smartphoneAddress, function (employee_number) {
                            pool.isPermitted(smartphoneAddress, employee_number, function (permitted) {
                                var contentJsonString = "{ ";
                                contentJsonString += "\"registered\":\"" + true + "\", ";
                                contentJsonString += "\"permitted\":\"" + permitted + "\",";
                                contentJsonString += "\"name\":\"" + employee_name + "\",";
                                contentJsonString += "\"employee_number\":\"" + employee_number + "\"";
                                contentJsonString += " }";

                                socket.emit("amIRegistered_answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                                logger("socket").info("amIRegistered", "Whether user registered or not:\n\tSend: " + employee_name + ", " + employee_number);
                            });
                        });
                    });
                } else {
                    pool.getDepartmentList(function (departmentListRows) {
                        pool.getPositionList(function (positionListRows) {
                            var contentJsonString = "{ ";
                            contentJsonString += "\"registered\":\"" + false + "\", ";
                            contentJsonString += "\"departmentListJsonArr\":" + JSON.stringify(departmentListRows) + ", ";
                            contentJsonString += "\"positionListJsonArr\":" + JSON.stringify(positionListRows);
                            contentJsonString += " }";

                            socket.emit("amIRegistered_answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                            logger("socket").info("amIRegistered", "Whether user registered or not:\n\tSend: Not registered");
                        });
                    });
                }
            });
        }
    });

    socket.on("signupRequest", function(data) {
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("signupRequest", "New sign-up request: received undefined data or empty");
        } else {
            var smartphoneRsaPublicKey = data.rsaPublicKey;
            var contentJson = analyzer.extractContentFromReceivedJson(data);
            var smartphone_address = analyzer.getSmartphoneAddress(contentJson);
            var employee_number = analyzer.getEmployeeNumber(contentJson);
            var name = analyzer.getName(contentJson);
            var password = analyzer.getPassword(contentJson);
            var id_department = analyzer.getDepartment(contentJson);
            var id_position = analyzer.getPosition(contentJson);
            var permission = analyzer.getPermission(contentJson);
            var admin = analyzer.getAdmin(contentJson);

            pool.registerUser(smartphone_address, employee_number, name, password, id_department, id_position, permission, admin, function(success) {
                var contentJsonString ="{ ";
                if (success) {
                    contentJsonString += "\"requestSuccess\":\"" + true + "\"";
                    contentJsonString += " }";

                    socket.emit("signupRequest_answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                    logger("socket").info("signupRequest", "New sign-up request: \n" + smartphone_address + "\t" + employee_number + "\t" + name + "\n\tRegister Success");
                } else {
                    contentJsonString += "\"requestSuccess\":\"" + false + "\"";
                    contentJsonString += " }";

                    socket.emit("signupRequest_answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                    logger("socket").info("signupRequest", "New sign-up request: \n" + smartphone_address + "\t" + employee_number + "\t" + name + "\n\tRegister Fail");
                }
            });
        }
    });

    socket.on("requestChartData", function(data) {
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("requestChartData", "Request Chart Data: received undefined data or empty");
        } else {
            var smartphoneRsaPublicKey = data.rsaPublicKey;
            var contentJson = analyzer.extractContentFromReceivedJson(data);
            var smartphoneAddress = analyzer.getSmartphoneAddress(contentJson);
            var signal = analyzer.getSignal(contentJson);

            switch (signal) {
                // Population of each department
                case "POPULATION":
                    pool.smartphoneValidation(smartphoneAddress, function (name) {
                        if (name != undefined) {
                            pool.getPopulOfDepartment(function (chartData) {
                                socket.emit("requestChartData_answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, chartData));
                            });
                        } else {
                            var contentJsonString = "{ ";
                            contentJsonString += "\"registered\":\"" + false + "\"";
                            contentJsonString += " }";

                            socket.emit("data", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                        }
                    });
                    break;

                case "TODAYCOMMUTEINFO":
                    pool.smartphoneValidation(smartphoneAddress, function (name) {
                        if (name != undefined) {
                            var searchDate = currentTime.getCurrentDate();
                            var searchDateStart = searchDate + ' 00:00:00';
                            var searchDateEnd = searchDate + ' 23:59:59';

                            pool.getTodayCommuteInfo(searchDateStart, searchDateEnd, function (chartData) {
                                socket.emit("requestTodayCommuteInfo_answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, chartData));
                            });
                        } else {
                            var contentJsonString = "{ ";
                            contentJsonString += "\"registered\":\"" + false + "\"";
                            contentJsonString += " }";

                            socket.emit("data", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                        }
                    });
                    break;

                case "AVGCOMMUTEINFO":
                    pool.smartphoneValidation(smartphoneAddress, function (name) {
                        if (name != undefined) {
                            var oneMonthAgoDate = new Date();
                            oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);
                            oneMonthAgoDate.setHours(0, 0, 0);

                            var todayEndDate = new Date();
                            todayEndDate.setHours(23, 59, 59);

                            pool.getCommuteInfo(oneMonthAgoDate, todayEndDate, function (chartData) {
                                socket.emit("requestAvgCommuteInfo_answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, chartData));
                            });
                        } else {
                            var contentJsonString = "{ ";
                            contentJsonString += "\"registered\":\"" + false + "\"";
                            contentJsonString += " }";

                            socket.emit("data", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                        }
                    });
                    break;

                default:
                    break;
            }
        }
    });

});

module.exports = io;