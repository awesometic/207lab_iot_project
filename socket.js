//http://socket.io/docs/
var port = process.env.PORT || 2070;
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

        pool.soc_smartphoneValidation(smartphoneAddress, function(name) {
            if (name) {
                socket.emit('rsaPublicKey', {
                    publicKey: analyzer.rsa.getPublicKey()
                });
            }
        });
    });

    /*
     {
     BeaconDeviceAddress1: '00:00:00:00:00:00',
     BeaconDeviceAddress2: '00:00:00:00:00:00',
     BeaconDeviceAddress3: '00:00:00:00:00:00',
     BeaconData1: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
     BeaconData2: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
     BeaconData3: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
     SmartphoneAddress: '00:00:00:00:00:00',
     }
     */
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

            pool.soc_gatewayValidation(beaconAddressArr, uuidArr, majorArr, minorArr, function (id) {
                if (id) {
                    pool.soc_smartphoneValidation(smartphoneAddress, function (name) {
                        if (name) {
                            pool.soc_registerCommute(smartphoneAddress, id, currentTime.getCurrentDateTime(), function (valid) {
                                if (valid) {
                                    var contentJsonString = "{ ";
                                    contentJsonString += "\"requestSuccess\":\"" + true + "\"";
                                    contentJsonString += " }";

                                    socket.emit("answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                                    logger("socket").info("Circumstance", "New commute record: \n\tRegister success");
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

    /*
     {
     BeaconDeviceAddress1: '00:00:00:00:00:00',
     BeaconDeviceAddress2: '00:00:00:00:00:00',
     BeaconDeviceAddress3: '00:00:00:00:00:00',
     BeaconData1: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
     BeaconData2: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
     BeaconData3: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
     SmartphoneAddress: '00:00:00:00:00:00',
     CoordinateX: '-00',
     CoordinateY: '-00',
     CoordinateZ: '-00'
     }
     */
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

            pool.soc_gatewayValidation(beaconAddressArr, uuidArr, majorArr, minorArr, function(id) {
                if (id) {
                    pool.soc_smartphoneValidation(smartphoneAddress, function(name) {
                        if (name) {
                            pool.soc_RSSICalibration(coordinateArr, id, name, currentTime.getCurrentDateTime(), function(valid) {
                                if (valid) {
                                    var contentJsonString = "{ ";
                                    contentJsonString += "\"requestSuccess\":\"" + true + "\"";
                                    contentJsonString += " }";

                                    socket.emit("answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                                    logger("socket").info("Calibration", "New calibration data: \n\tRegister success");
                                }
                                logger("socket").info("Calibration", "New calibration data: \n\tRegister fail: Database connection problem");
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

    /*
     {
     SmartphoneAddress: '00:00:00:00:00:00',
     }
     */
    socket.on("requestEssentialData", function(data) {
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("RequestData", "Request from user: received undefined data or empty");
        } else {
            var smartphoneRsaPublicKey = data.rsaPublicKey;
            var contentJson = analyzer.extractContentFromReceivedJson(data);
            var smartphoneAddress = analyzer.getSmartphoneAddress(contentJson);

            pool.soc_smartphoneValidation(smartphoneAddress, function (name) {
                if (name) {
                    pool.soc_getEssentialData(function (data) {

                        if (data) {
                            socket.emit("data", analyzer.encryptSendJson(smartphoneRsaPublicKey, data));
                        }

                        logger("socket").info("RequestData", "Request from user: \n" + smartphoneAddress + "\n\tSend success");
                    });
                } else {
                    logger("socket").info("RequestData", "Request from user: \n" + smartphoneAddress + "\n\tSend fail: Unverified smartphone");
                }
            });
        }
    });

    /*
     {
     SmartphoneAddress: '00:00:00:00:00:00'
     }
     */
    socket.on("amIRegistered", function(data) {
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("amIRegistered", "Whether user registered or not: received undefined data or empty");
        } else {
            var smartphoneRsaPublicKey = data.rsaPublicKey;
            var contentJson = analyzer.extractContentFromReceivedJson(data);
            var smartphoneAddress = analyzer.getSmartphoneAddress(contentJson);

            pool.soc_amIRegistered(smartphoneAddress, currentTime.getCurrentDateTime(), function (isRegistered) {
                if (isRegistered) {
                    pool.soc_getSmartphoneUserName(smartphoneAddress, function (employee_name) {
                        pool.soc_getSmartphoneUserENum(smartphoneAddress, function (employee_number) {
                            pool.id_isPermitted(smartphoneAddress, employee_number, function (permitted) {
                                var contentJsonString = "{ ";
                                contentJsonString += "\"registered\":\"" + true + "\", ";
                                contentJsonString += "\"permitted\":\"" + permitted + "\",";
                                contentJsonString += "\"name\":\"" + employee_name + "\",";
                                contentJsonString += "\"employee_number\":\"" + employee_number + "\"";
                                contentJsonString += " }";

                                socket.emit("data", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                                logger("socket").info("amIRegistered", "Whether user registered or not:\n\tSend: " + employee_name + ", " + employee_number);
                            });
                        });
                    });
                } else {
                    socket.emit("data", {
                        registered: false
                    });
                    logger("socket").info("amIRegistered", "Whether user registered or not:\n\tSend: Not registered");
                }
            });
        }
    });

    /*
     {
     SmartphoneAddress: '00:00:00:00:00:00',
     EmployeeNumber: '00000000',
     Name: 'NAME',
     Password: 'PASSWORD',
     Department: 'DEPARTMENT',
     Position: 'POSITION',
     Permission: 0,
     Admin: 0
     }
     */
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
            var department = analyzer.getDepartment(contentJson);
            var position = analyzer.getPosition(contentJson);
            var permission = analyzer.getPermission(contentJson);
            var admin = analyzer.getAdmin(contentJson);

            pool.id_registerUser(smartphone_address, employee_number, name, password, department, position, permission, admin, function(success) {
                var contentJsonString ="{ ";
                if (success) {
                    contentJsonString += "\"requestSuccess\":\"" + true + "\"";
                    contentJsonString += " }";

                    socket.emit("answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                    logger("socket").info("signupRequest", "New sign-up request: \n" + smartphone_address + "\t" + employee_number + "\t" + name + "\n\tRegister Success");
                } else {
                    contentJsonString += "\"requestSuccess\":\"" + true + "\"";
                    contentJsonString += " }";

                    socket.emit("answer", analyzer.encryptSendJson(smartphoneRsaPublicKey, JSON.parse(contentJsonString)));
                    logger("socket").info("signupRequest", "New sign-up request: \n" + smartphone_address + "\t" + employee_number + "\t" + name + "\n\tRegister Fail");
                }
            });
        }
    });

    /*
     {
     SmartphoneAddress: '00:00:00:00:00:00',
     Signal: 'SOMETHING'
     }
     */
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
                    pool.soc_smartphoneValidation(smartphoneAddress, function (name) {
                        if (name != undefined) {
                            pool.chart_getPopulOfDepartment(function (chartData) {
                                socket.emit("data", analyzer.encryptSendJson(smartphoneRsaPublicKey, chartData));
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