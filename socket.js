//http://socket.io/docs/
var port = process.env.PORT || 2070;
var io = require("socket.io").listen(port);

var pool = require("./db");

io.on("connection", function(socket) {

    var stringifiedArr;
    
    var date = new Date();
    var currentMonth = date.getMonth() + 1;
    var str_currentMonth;
    if (currentMonth < 10)
        str_currentMonth = '0' + currentMonth;
    var currentDate = date.getFullYear() + "-" + str_currentMonth + "-" + date.getDate()
        + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

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
        console.log("========================================");
        console.log("-- New Commute Record --");
        console.log(data);
        stringifiedArr = pool.soc_analyzeJSON(data);

        // console.log(pool.soc_getSmartphoneAddress(stringifiedArr));
        // console.log(pool.soc_getBeaconAddressArr(stringifiedArr));
        // console.log(pool.soc_getUUIDArr(stringifiedArr));
        // console.log(pool.soc_getMajorArr(stringifiedArr));
        // console.log(pool.soc_getMinorArr(stringifiedArr));
        // console.log(pool.soc_getDatetime(stringifiedArr));

        pool.soc_gatewayValidation(stringifiedArr, function(id) {
            if (id) {
                pool.soc_smartphoneValidation(stringifiedArr, function (name) {
                    if (name) {
                        pool.soc_registerCommute(stringifiedArr, id, currentDate, function (valid) {
                            if (valid) {
                                socket.emit("answer", {
                                    isSuccess: "true"
                                });
                            }
                            console.log("========================================");
                        });
                    } else {
                        console.log("========================================");
                    }
                });
            } else {
                console.log("========================================");
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
        console.log("========================================");
        console.log("-- New Calibration Data --");
        console.log(data);
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_gatewayValidation(stringifiedArr, function(id) {
            if (id) {
                pool.soc_smartphoneValidation(stringifiedArr, function(name) {
                    if (name) {
                        pool.soc_RSSICalibration(stringifiedArr, id, name, currentDate, function(valid) {
                            if (valid) {
                                socket.emit("answer", {
                                    isSuccess: "true"
                                });
                            }
                            console.log("========================================");
                        });
                    } else {
                        console.log("========================================");
                    }
                });
            } else {
                console.log("========================================");
            }
        });
    });

    /*
     {
     SmartphoneAddress: '00:00:00:00:00:00',
     }
     */
    socket.on("requestEssentialData", function(data) {
        console.log("========================================");
        console.log("-- Request Current Each RSSI Coordinate and Beacon MAC Address --");
        console.log(data);
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_smartphoneValidation(stringifiedArr, function(name) {
            if (name) {
                pool.soc_getEssentialData(function(data) {
                    if (data) {
                        socket.emit("data", data);
                    }
                    console.log("========================================");
                });
            } else {
                console.log("========================================");
            }
        });
    });

    /*
     {
     SmartphoneAddress: '12:11:11:11:11:11'
     }
     */
    socket.on("amIRegistered", function(data) {
        console.log("========================================");
        console.log("-- Am I Registered? - from unknown Android Application User --");
        console.log(data);
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_amIRegistered(stringifiedArr, currentDate, function(isRegistered) {
            if (isRegistered) {
                pool.soc_getSmartphoneUserName(stringifiedArr, function(name) {
                    pool.soc_getSmartphoneUserENum(stringifiedArr, function(employee_number) {
                        socket.emit("data", {
                            registered: "true",
                            name: name,
                            employee_number: employee_number
                        });
                        console.log("========================================");
                    });
                });
            } else {
                socket.emit("data", {
                    registered: "false"
                });
                console.log("========================================");
            }
        });
    });
});

module.exports = io;