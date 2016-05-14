//http://socket.io/docs/
var port = process.env.PORT || 2070;
var io = require("socket.io").listen(port);

var pool = require("./db");

io.on("connection", function(socket) {

    var stringifiedArr;

    /*
     {
     BeaconDeviceAddress1: '00:00:00:00:00:00',
     BeaconDeviceAddress2: '00:00:00:00:00:00',
     BeaconDeviceAddress3: '00:00:00:00:00:00',
     BeaconData1: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
     BeaconData2: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
     BeaconData3: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
     SmartphoneAddress: '00:00:00:00:00:00',
     DateTime: '0000/00/00 00:00:00'
     }
     */
    socket.on("circumstance", function(data) {
        console.log("========================================");
        console.log("-- Receive New Commute Record --");
        console.log(data);
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_gatewayValidation(stringifiedArr, function(id) {
            if (id) {
                pool.soc_smartphoneValidation(stringifiedArr, function (name) {
                    if (name) {
                        pool.soc_registerCommute(stringifiedArr, id, function (valid) {
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
     DateTime: '0000/00/00 00:00:00',
     CoordinateX: '-00',
     CoordinateY: '-00',
     CoordinateZ: '-00'
     }
     */
    socket.on("calibration", function(data) {
        console.log("========================================");
        console.log("-- Receive New Calibration Data --");
        console.log(data);
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_gatewayValidation(stringifiedArr, function(id) {
            if (id) {
                pool.soc_smartphoneValidation(stringifiedArr, function(name) {
                    if (name) {
                        pool.soc_RSSICalibration(stringifiedArr, id, name, function(valid) {
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
     DateTime: '0000/00/00 00:00:00'
     }
     */
    socket.on("requestRSSI", function(data) {
        console.log("========================================");
        console.log("-- Receive Request Current Each RSSI Coordinate --");
        console.log(data);
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_smartphoneValidation(stringifiedArr, function(name) {
            if (name) {
                pool.soc_getRSSI(function(rows) {
                    if (rows) {
                        socket.emit("RSSIs", rows);
                    }
                    console.log("========================================");
                });
            } else {
                console.log("========================================");
            }
        });
    });
});

module.exports = io;