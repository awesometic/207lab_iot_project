//http://socket.io/docs/
var port = process.env.PORT || 2070;
var io = require("socket.io").listen(port);

var pool = require("./db");
var logger = require('./logger');
var nodeRsa = require('./rsa');
var schedule = require('node-schedule');

// Encrypt JSON using public key by smartphone
var encryptJson = function(data, smartphonePublicKey) {

};

// Decrypt RSA encrypted JSON
var decryptJson = function(encryptedJson) {
    var stringifiedEncryptedJson;
    stringifiedEncryptedJson = JSON.stringify(encryptedJson);
    stringifiedEncryptedJson = stringifiedEncryptedJson
        .replace(/\{/g, "")
        .replace(/\}/g, "");
    var stringifiedEncryptedJsonEntityArray = stringifiedEncryptedJson.split(",");

    var stringifiedDecryptedJson = "{ ";
    for (var i = 0; i < stringifiedEncryptedJsonEntityArray.length; i++) {
        stringifiedDecryptedJson += "\"";
        stringifiedDecryptedJson += nodeRsa.decryptRsa(stringifiedEncryptedJsonEntityArray[i].split("\"")[1]);
        stringifiedDecryptedJson += "\"";
        stringifiedDecryptedJson += " : ";
        stringifiedDecryptedJson += "\"";
        stringifiedDecryptedJson += nodeRsa.decryptRsa(stringifiedEncryptedJsonEntityArray[i].split("\"")[3]);
        stringifiedDecryptedJson += "\"";

        if (i != stringifiedEncryptedJsonEntityArray.length - 1)
            stringifiedDecryptedJson += ", ";
    }
    stringifiedDecryptedJson += " }";

    var decryptedJson = JSON.parse(stringifiedDecryptedJson);

    console.log("--------------------------------------------------");
    console.log("Encrypted JSON: \n" + JSON.stringify(encryptedJson));
    console.log("Decrypted JSON: \n" + JSON.stringify(decryptedJson));
    console.log("--------------------------------------------------");

    return decryptedJson;
};

// Mining the data from JSON formatted data
var getBeaconAddressArray = function(json) {
    var beaconAddressArray = [ json.BeaconDeviceAddress1, json.BeaconDeviceAddress2, json.BeaconDeviceAddress3 ];

    return beaconAddressArray;
};

var getUuidArray = function(json) {
    var uuidArray = new Array();

    uuidArray.push(json.BeaconData1.replace(/ /g, "").substr(0, 32));
    uuidArray.push(json.BeaconData2.replace(/ /g, "").substr(0, 32));
    uuidArray.push(json.BeaconData3.replace(/ /g, "").substr(0, 32));
    
    return uuidArray;
};

var getMajorArray = function(json) {
    var majorArray = new Array();

    majorArray.push(json.BeaconData1.replace(/ /g, "").substr(32, 4));
    majorArray.push(json.BeaconData2.replace(/ /g, "").substr(32, 4));
    majorArray.push(json.BeaconData3.replace(/ /g, "").substr(32, 4));

    return majorArray;
};

var getMinorArray = function(json) {
    var minorArray = new Array();
    
    minorArray.push(json.BeaconData1.replace(/ /g, "").substr(36, 4));
    minorArray.push(json.BeaconData2.replace(/ /g, "").substr(36, 4));
    minorArray.push(json.BeaconData3.replace(/ /g, "").substr(36, 4));

    return minorArray;
};

var getSmartphoneAddress = function(json) {
    return json.SmartphoneAddress;
};

var getCoordinateArray = function(json) {
    var coordinateArray = new Array();

    coordinateArray.push(parseInt(json.CoordinateX));
    coordinateArray.push(parseInt(json.CoordinateY));
    coordinateArray.push(parseInt(json.CoordinateZ));

    return coordinateArray;
};

var getSignal = function(json) {
    return json.Signal;
};

var getEmployeeNumber = function(json) {
    return json.EmployeeNumber;
};

var getName = function(json) {
    return json.Name;
};

var getPassword = function(json) {
    return json.Password;
};

var getDepartment = function(json) {
    return json.Department;
};

var getPosition = function(json) {
    return json.Position;
};

var getPermission = function(json) {
    return json.Permission;
};

var getAdmin = function(json) {
    return json.Admin;
};

io.on("connection", function(socket) {

    var stringifiedArr;

    // To get server's current time
    var getCurrentDateTime = function() {
        var date = new Date();
        var currentMonth = date.getMonth() + 1;
        var str_currentMonth;
        if (currentMonth < 10)
            str_currentMonth = '0' + currentMonth;

        return date.getFullYear() + "-" + str_currentMonth + "-" + date.getDate()
            + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    };

    // Send a new RSA public key to all socket connected smartphone at everyday midnight
    schedule.scheduleJob('0 1 * * *', function() {
        socket.emit('rsaPublicKey', {
            publicKey: nodeRsa.getPublicKey()
        });
    });

    // Send a current RSA public key to socket connected smartphone without validation of smartphone
    socket.on('requestRsaPublicKeyWithoutSmartphoneAddress', function() {
        socket.emit('rsaPublicKey', {
            publicKey: nodeRsa.getPublicKey()
        });
    });

    socket.on('requestRsaPublicKey', function(data) {
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_smartphoneValidation(stringifiedArr, function(name) {
           if (name) {
               socket.emit('rsaPublicKey', {
                   publicKey: nodeRsa.getPublicKey()
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
                            } else {
                                logger("socket").info("Circumstance", "New commute record: \n" + stringifiedArr + "\n\tRegister fail: Database connection problem");
                            }
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
        if (typeof data === "undefined" || JSON.stringify(data).replace(/\{/g, "").replace(/\}/g, "").length == 0) {
            logger("socket").info("RequestData", "Request from user: received empty or undefined data");
        } else {
            var decryptedJson = decryptJson(data);
            var smartphoneAddress = getSmartphoneAddress(decryptedJson);

            pool.soc_smartphoneValidation(smartphoneAddress, function (name) {
                if (name) {
                    pool.soc_getEssentialData(function (data) {
                        if (data) {
                            socket.emit("data", data);
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
        stringifiedArr = pool.soc_analyzeJSON(data);
        var smartphone_address = pool.soc_getSmartphoneAddress(stringifiedArr);

        pool.soc_amIRegistered(smartphone_address, getCurrentDateTime(), function(isRegistered) {
            if (isRegistered) {
                pool.soc_getSmartphoneUserName(smartphone_address, function(employee_name) {
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
        stringifiedArr = pool.soc_analyzeJSON(data);
        var smartphone_address = pool.soc_getSmartphoneAddress(stringifiedArr);
        var employee_number = pool.soc_getEmployeeNumber(stringifiedArr);
        var name = pool.soc_getName(stringifiedArr);
        var password = pool.soc_getPassword(stringifiedArr);
        var department = pool.soc_getDepartment(stringifiedArr);
        var position = pool.soc_getPosition(stringifiedArr);
        var permission = pool.soc_getPermission(stringifiedArr);
        var admin = pool.soc_getAdmin(stringifiedArr);

        pool.id_registerUser(smartphone_address, employee_number, name, password, department, position, permission, admin, function(success) {
            if (success) {
                socket.emit("answer", {
                    requestSuccess: true
                });
                logger("socket").info("signupRequest", "New sign-up request: \n" + smartphone_address + "\t" + employee_number + "\t" + name + "\n\tRegister Success");
            } else {
                socket.emit("answer", {
                    requestSuccess: false
                });
                logger("socket").info("signupRequest", "New sign-up request: \n" + smartphone_address + "\t" + employee_number + "\t" + name + "\n\tRegister Fail");
            }
        });
    });

    /*
     {
     SmartphoneAddress: '00:00:00:00:00:00',
     Signal: 'SOMETHING'
     }
     */
    socket.on("requestChartData", function(data) {
        stringifiedArr = pool.soc_analyzeJSON(data);
        var signal = pool.soc_getSignal(stringifiedArr);

        switch (signal) {

            // Population of each department
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