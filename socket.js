//http://socket.io/docs/
var port = process.env.PORT || 2070;
var io = require("socket.io").listen(port);

var pool = require("./db");
var logger = require("./logger");

io.on("connection", function(socket) {

    var stringifiedArr;

    var getCurrentDateTime = function() {
        var date = new Date();
        var currentMonth = date.getMonth() + 1;
        var str_currentMonth;
        if (currentMonth < 10)
            str_currentMonth = '0' + currentMonth;

        return date.getFullYear() + "-" + str_currentMonth + "-" + date.getDate()
            + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    };

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
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_gatewayValidation(stringifiedArr, function(id) {
            if (id) {
                pool.soc_smartphoneValidation(stringifiedArr, function (name) {
                    if (name) {
                        pool.soc_registerCommute(stringifiedArr, id, getCurrentDateTime(), function (valid) {
                            if (valid) {
                                socket.emit("answer", {
                                    isSuccess: "true"
                                });

                                logger("socket").info("Circumstance", "New commute record: \n" + stringifiedArr + "\n\tRegister success");
                            }
                            logger("socket").info("Circumstance", "New commute record: \n" + stringifiedArr + "\n\tRegister fail: Database connection problem");
                        });
                    } else {
                        logger("socket").info("Circumstance", "New commute record: \n" + stringifiedArr + "\n\tRegister fail: Unverified smartphone");
                    }
                });
            } else {
                logger("socket").info("Circumstance", "New commute record: \n" + stringifiedArr + "\n\tRegister fail: Unverified gateway");
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
     CoordinateX: '-00',
     CoordinateY: '-00',
     CoordinateZ: '-00'
     }
     */
    socket.on("calibration", function(data) {
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_gatewayValidation(stringifiedArr, function(id) {
            if (id) {
                pool.soc_smartphoneValidation(stringifiedArr, function(name) {
                    if (name) {
                        pool.soc_RSSICalibration(stringifiedArr, id, name, getCurrentDateTime(), function(valid) {
                            if (valid) {
                                socket.emit("answer", {
                                    isSuccess: "true"
                                });

                                logger("socket").info("Calibration", "New calibration data: \n" + stringifiedArr + "\n\tRegister success");
                            }
                            logger("socket").info("Calibration", "New calibration data: \n" + stringifiedArr + "\n\tRegister fail: Database connection problem");
                        });
                    } else {
                        logger("socket").info("Calibration", "New calibration data: \n" + stringifiedArr + "\n\tRegister fail: Unverified smartphone");
                    }
                });
            } else {
                logger("socket").info("Calibration", "New calibration data: \n" + stringifiedArr + "\n\tRegister fail: Unverified gateway");
            }
        });
    });

    /*
     {
     SmartphoneAddress: '00:00:00:00:00:00',
     }
     */
    socket.on("requestEssentialData", function(data) {
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_smartphoneValidation(stringifiedArr, function(name) {
            if (name) {
                pool.soc_getEssentialData(function(data) {
                    if (data) {
                        socket.emit("data", data);
                    }

                    logger("socket").info("RequestData", "Request from user: \n" + stringifiedArr + "\n\tSend success");
                });
            } else {
                logger("socket").info("RequestData", "Request from user: \n" + stringifiedArr + "\n\tSend fail: Unverified smartphone");
            }
        });
    });

    /*
     {
     SmartphoneAddress: '12:11:11:11:11:11'
     }
     */
    socket.on("amIRegistered", function(data) {
        stringifiedArr = pool.soc_analyzeJSON(data);
        var smartphone_address = pool.soc_getSmartphoneAddress(stringifiedArr);

        pool.soc_amIRegistered(smartphone_address, getCurrentDateTime(), function(isRegistered) {
            if (isRegistered) {
                pool.soc_getSmartphoneUserName(stringifiedArr, function(employee_name) {
                    pool.soc_getSmartphoneUserENum(stringifiedArr, function(employee_number) {
                        pool.id_isPermitted(smartphone_address, employee_number, function(permitted) {
                            socket.emit("data", {
                                registered: true,
                                permitted: permitted,
                                name: employee_name,
                                employee_number: employee_number
                            });
                            logger("socket").info("AutoLoginData", "Whether user registered or not: \n" + stringifiedArr + "\n\tSend: " + employee_name + ", " + employee_number); 
                        });
                    });
                });
            } else {
                socket.emit("data", {
                    registered: false
                });
                logger("socket").info("AutoLoginData", "Whether user registered or not: \n" + stringifiedArr + "\n\tSend: Not registered");
            }
        });
    });

    /*
     {
     SmartphoneAddress: '12:11:11:11:11:11',
     Signal: 'SOMETHING'
     }
     */
    socket.on("requestChartData", function(data) {
        stringifiedArr = pool.soc_analyzeJSON(data);
        var signal = pool.soc_getSignal(stringifiedArr);

        switch (signal) {
            case "POPULATION":
                pool.soc_smartphoneValidation(stringifiedArr, function (name) {
                    if (name != undefined) {
                        pool.chart_getPopulOfDepartment(function (chartData) {
                            socket.emit("data", chartData);
                        });
                    } else {
                        socket.emit("data", {
                            registered: "false"
                        });
                    }
                });
                break;
            default:
                break;
        }
    });
});

module.exports = io;