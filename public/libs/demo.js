/**
 * Created by Awesometic on 2017-02-14.
 */

var pool = require("./db");
var logger = require('./logger');
var schedule = require('node-schedule');
var async = require('async');
var currentTime = require('./currentTime');

var demo = demo || (function() {

        var reservedCircumstanceDictionary = {};

        var registerCron = null;
        var generateCron = null;

        var registerProcedure = function() {
            var currentDatetime = currentTime.getCurrentDateTime();

            if (typeof reservedCircumstanceDictionary !== "undefined" && reservedCircumstanceDictionary != null) {
                if (currentDatetime in reservedCircumstanceDictionary) {
                    var circumstanceData = reservedCircumstanceDictionary[currentDatetime];
                    var datetime = circumstanceData.getDatetime();
                    var smartphoneAddress = circumstanceData.getSmartphoneAddress();
                    var workplaceId = circumstanceData.getWorkplaceId();
                    var commuteStatus = circumstanceData.getCommuteStatus();

                    pool.registerCommute(smartphoneAddress, workplaceId, commuteStatus, datetime, function (valid) {
                        if (valid) {
                            logger("demo").info("registerProcedure: register scheduled circumstance data success: " + circumstanceData.toString());
                        } else {
                            logger("demo").info("registerProcedure: register scheduled circumstance data fail: " + circumstanceData.toString());
                        }
                    });

                    delete reservedCircumstanceDictionary[currentDatetime];
                }
            }
        };

        var generateProcedure = function() {
            logger("demo").info("generateProcedure: begin generating circumstance data");

            generateCircumstanceData(function(generatedCircumstanceDataDictionary) {
                reservedCircumstanceDictionary = generatedCircumstanceDataDictionary;
            });
        };

        var start = function() {
            logger("demo").info("start: start DEMO");
            logger("demo").info("start: generate today circumstance data");
            generateProcedure();

            if (registerCron == null) {
                logger("demo").info("start: start register cron service");
                registerCron = schedule.scheduleJob('*/1 * * * * *', function() {
                    registerProcedure();
                });
            }

            if (generateCron == null) {
                logger("demo").info("start: start generate cron service");
                generateCron = schedule.scheduleJob('0 1 * * *', function() {
                    generateProcedure();
                });
            }

            return null;
        };

        var stop = function() {
            logger("demo").info("stop: stop DEMO");

            if (registerCron != null) {
                logger("demo").info("stop: stop register cron service");
                registerCron.cancel();
            }

            if (generateCron != null) {
                logger("demo").info("stop: stop generate cron service");
                generateCron.cancel();
            }

            reservedCircumstanceDictionary = null;
            registerCron = null;
            generateCron = null;

            return null;
        };

        var status = function() {
            return (registerCron != null || generateCron != null);
        };

        var generateCircumstanceData = function (callback) {
            pool.getUserList(function (rawUserListRows) {
                pool.getWorkplaceList(function (rawWorkplaceListRows) {
                    logger("demo").info("generateCircumstanceData: rawUserListRows.length: " + rawUserListRows.length);
                    logger("demo").info("generateCircumstanceData: rawWorkplaceListRows.length: " + rawWorkplaceListRows.length);
                    if (rawUserListRows.length > 0 && rawWorkplaceListRows.length > 0) {

                        var generatedCircumstanceDataDictionary = {};

                        var userList = [];
                        var workplaceList = [];

                        var i;
                        for (i = 0; i < rawUserListRows.length; i++) {
                            userList.push(rawUserListRows[i].smartphone_address);
                        }

                        for (i = 0; i < rawWorkplaceListRows.length; i++) {
                            workplaceList.push(rawWorkplaceListRows[i].id_workplace);
                        }

                        logger("demo").info("generateCircumstanceData: userList.toString(): " + userList.toString());
                        logger("demo").info("generateCircumstanceData: workplaceList.toString(): " + workplaceList.toString());
                        for (var userIdx = 0; userIdx < userList.length; userIdx++) {
                            var randomTimeArr = [];
                            var commuteCount = Math.floor(Math.random() * 10);
                            commuteCount = (commuteCount % 2 == 0) ? commuteCount : commuteCount + 1;

                            logger("demo").info("generateCircumstanceData: userIdx / commuteCount: " + userIdx + " / " + commuteCount);

                            var commute;
                            var LOWESTHOURASSECOND = 8 * 3600;
                            var HIGHESTHOURASSECOND = 22 * 3600;

                            var currentTimeSplit = currentTime.getCurrentTimestamp().split(':');
                            var currentTimeHour = currentTimeSplit[0];
                            var currentTimeMin = currentTimeSplit[1];
                            var currentTimeSec = currentTimeSplit[2];
                            var currentTimeAsSecond = (currentTimeHour * 3600) + (currentTimeMin * 60) + parseInt(currentTimeSec);
                            logger("demo").info("generateCircumstanceData: currentTimeSplit / currentTimeAsSecond: " + currentTimeSplit.toString() + " / " + currentTimeAsSecond);

                            for (commute = 0; commute < commuteCount; commute++) {
                                var randomRawTime =
                                    (LOWESTHOURASSECOND > currentTimeAsSecond)
                                        ? Math.floor((Math.random() * (HIGHESTHOURASSECOND - LOWESTHOURASSECOND + 1)) + LOWESTHOURASSECOND)
                                        : Math.floor((Math.random() * (HIGHESTHOURASSECOND - currentTimeAsSecond + 1)) + currentTimeAsSecond);
                                randomTimeArr.push(randomRawTime);
                            }

                            randomTimeArr.sort();
                            logger("demo").info("generateCircumstanceData: userIdx / randomTimeArr Contents:" + userIdx + " / " + randomTimeArr.toString());

                            var timestampHour;
                            var timestampMin;
                            var timestampSec;
                            for (commute = 0; commute < commuteCount; commute++) {
                                // new Date(0) returns 1970-01-01 00:00:00, not 09:00:00 so that no need to subtract 32400000 milliseconds which is equal to 9 hours
                                var createdTimeStampSplit = (new Date(randomTimeArr[commute] * 1000/* - 32400000*/)).toString().split(' ')[4].split(':');
                                timestampHour = createdTimeStampSplit[0];
                                timestampMin = createdTimeStampSplit[1];
                                timestampSec = createdTimeStampSplit[2];

                                logger("demo").info("generateCircumstanceData: commute / timestampHour:timestampMin:timestampSec: " + commute + " / " + timestampHour + ":" + timestampMin + ":" + timestampSec);
                                randomTimeArr[commute] = timestampHour + ":" + timestampMin + ":" + timestampSec;
                            }

                            logger("demo").info("generateCircumstanceData: userIdx / randomTimeArr Contents:" + userIdx + " / " + randomTimeArr.toString());

                            var smartphoneAddress = userList[userIdx];

                            var isEnter = false;
                            var previousWorkplace = -1;
                            for (commute = 0; commute < commuteCount; commute++) {
                                var circumstanceData = new CircumstanceData();

                                circumstanceData.setDatetime(currentTime.getCurrentDate() + " " + randomTimeArr[commute]);
                                circumstanceData.setSmartphoneAddress(smartphoneAddress);

                                if (isEnter == false) {
                                    var workplace = workplaceList[Math.floor(Math.random() * workplaceList.length)];
                                    circumstanceData.setWorkplaceId(workplace);
                                    circumstanceData.setCommuteStatus(true);

                                    previousWorkplace = workplace;
                                    isEnter = true;
                                } else {
                                    circumstanceData.setWorkplaceId(previousWorkplace);
                                    circumstanceData.setCommuteStatus(false);

                                    isEnter = false;
                                }

                                logger("demo").info("generateCircumstanceData: userIdx / commute / circumstanceData: " + userIdx + " / " + commute + " / " + circumstanceData.toString());
                                generatedCircumstanceDataDictionary[currentTime.getCurrentDate() + " " + randomTimeArr[commute]] = circumstanceData;
                            }
                        }

                        if (typeof callback === "function") {
                            callback(generatedCircumstanceDataDictionary);
                        }
                    } else {
                        if (typeof callback === "function") {
                            callback(null);
                        }
                    }
                });
            });
        };

        return {
            "start": start,
            "stop" : stop,
            "status" : status
        }

    })();

function CircumstanceData() {

    var datetime = "";
    var smartphoneAddress ="";
    var workplaceId = 0;
    var commuteStatus = false;

    var setDatetime = function (_datetime) {
        datetime = _datetime;
    };

    var setSmartphoneAddress = function (_smartphoneAddress) {
        smartphoneAddress = _smartphoneAddress;
    };

    var setWorkplaceId = function (_workplaceId) {
        workplaceId = _workplaceId;
    };

    var setCommuteStatus = function (_commuteStatus) {
        commuteStatus = _commuteStatus;
    };

    var getDatetime = function () {
        return datetime;
    };

    var getSmartphoneAddress = function () {
        return smartphoneAddress;
    };

    var getWorkplaceId = function () {
        return workplaceId;
    };

    var getCommuteStatus = function () {
        return commuteStatus;
    };

    var toString = function() {
        return datetime + " / " + smartphoneAddress + " / " + workplaceId + " / " + ((commuteStatus) ? "true" : "false");
    };

    return {
        "setDatetime"           : setDatetime,
        "setSmartphoneAddress"  : setSmartphoneAddress,
        "setWorkplaceId"        : setWorkplaceId,
        "setCommuteStatus"      : setCommuteStatus,
        "getDatetime"           : getDatetime,
        "getSmartphoneAddress"  : getSmartphoneAddress,
        "getWorkplaceId"        : getWorkplaceId,
        "getCommuteStatus"      : getCommuteStatus,
        "toString"              : toString
    }

}

module.exports = demo;