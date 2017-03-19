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
            reservedCircumstanceDictionary = {};

            // 퇴근시간~24시일 경우 데이터 생성하지 않기
            pool.getWorkEndTime(function(workEndTimestamp) {
                workEndTimestamp = '1970-01-01 ' + workEndTimestamp;
                var currentTimestamp = '1970-01-01 ' + currentTime.getCurrentTimestamp();

                var workEndTimeMsec = new Date(workEndTimestamp).getTime();
                var currentTimeMsec = new Date(currentTimestamp).getTime();

                // 데모를 시작한 시간이 퇴근 시간 전이라면 출퇴근 데이터 생성
                if (workEndTimeMsec > currentTimeMsec) {
                    logger("demo").info("generateProcedure: begin generating circumstance data");
                    generateCircumstanceData(function(generatedCircumstanceDataDictionary) {
                        reservedCircumstanceDictionary = generatedCircumstanceDataDictionary;
                    });
                }
            });
        };

        var start = function() {
            logger("demo").info("start: start DEMO");
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

            if (reservedCircumstanceDictionary != null
                && Object.keys(reservedCircumstanceDictionary).length > 0) {
                var leftKeys = Object.keys(reservedCircumstanceDictionary);
                var keyIdx;

                // 사용자별로 바로 다음에 등록될 출퇴근 데이터가 퇴근이면 현재 시간으로 퇴근시키기
                // 사용자 분류
                var userListArr = [];
                for (keyIdx in leftKeys) {
                    var smartphoneAddress = reservedCircumstanceDictionary[leftKeys[keyIdx]].getSmartphoneAddress();
                    if (userListArr.indexOf(smartphoneAddress) === -1) {
                        userListArr.push(smartphoneAddress);
                    }
                }

                // 사용자별로 바로 다음 출퇴근 데이터 추출
                for (var userIdx = 0; userIdx < userListArr.length; userIdx++) {
                    var circumstanceDataDatetimeMsecArr = [];
                    var circumstanceDataArr = [];

                    for (keyIdx in leftKeys) {
                        var circumstanceData = reservedCircumstanceDictionary[leftKeys[keyIdx]];
                        if (userListArr[userIdx] == circumstanceData.getSmartphoneAddress()) {
                            circumstanceDataArr.push(circumstanceData);
                            circumstanceDataDatetimeMsecArr.push(circumstanceData.getDatetimeMsec());
                        }
                    }

                    // 바로 다음 출퇴근 데이터가 퇴근이면 현재 시간으로 퇴근
                    // 마이크로초를 정렬해 바로 다음에 수행될 출퇴근 데이터의 Datetime 추출
                    circumstanceDataDatetimeMsecArr.sort(function(a,b) { return  a-b });
                    var nextDatetime = currentTime.getCurrentDate() + ' ' + currentTime.convertCurrentTimezoneDateTime(new Date(circumstanceDataDatetimeMsecArr[0])).split(' ')[1];

                    // 추출한 Datetime으로 다음 수행될 출퇴근 데이터 추출
                    var nextCircumstanceData;
                    for (var circumstanceDataIdx = 0; circumstanceDataIdx < circumstanceDataArr.length; circumstanceDataIdx++) {
                        if (circumstanceDataArr[circumstanceDataIdx].getDatetime() == nextDatetime) {
                            nextCircumstanceData = circumstanceDataArr[circumstanceDataIdx];
                        }
                    }

                    // 추출한 출퇴근 데이터의 출퇴근 정보가 퇴근이면 현재 시간으로 퇴근 등록
                    if (nextCircumstanceData.getCommuteStatus() == false) {
                        var datetime = currentTime.getCurrentDateTime();
                        var smartphoneAddress = nextCircumstanceData.getSmartphoneAddress();
                        var workplaceId = nextCircumstanceData.getWorkplaceId();
                        var commuteStatus = nextCircumstanceData.getCommuteStatus();

                        pool.registerCommute(smartphoneAddress, workplaceId, commuteStatus, datetime, function (valid) {
                            if (valid) {
                                logger("demo").info("stop: register scheduled circumstance data in advance with current timestamp success: " + circumstanceData.toString());
                            } else {
                                logger("demo").info("stop: register scheduled circumstance data in advance with current timestamp fail: " + circumstanceData.toString());
                            }
                        });
                    }
                }
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
                            if (rawWorkplaceListRows[i].beacon_set == 1) {
                                workplaceList.push(rawWorkplaceListRows[i].id_workplace);
                            }
                        }

                        logger("demo").info("generateCircumstanceData: userList.toString(): " + userList.toString());
                        logger("demo").info("generateCircumstanceData: workplaceList.toString(): " + workplaceList.toString());
                        for (var userIdx = 0; userIdx < userList.length; userIdx++) {
                            var randomTimeArr = [];
                            var randomTimeMsecArr = [];
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
                                randomTimeMsecArr.push(randomRawTime * 1000);
                            }

                            randomTimeMsecArr.sort(function(a,b) { return  a-b });
                            logger("demo").info("generateCircumstanceData: userIdx / randomTimeMsecArr Contents:" + userIdx + " / " + randomTimeMsecArr.toString());

                            var timestampHour;
                            var timestampMin;
                            var timestampSec;
                            for (commute = 0; commute < commuteCount; commute++) {
                                // new Date(0) returns 1970-01-01 00:00:00, not 09:00:00 so that no need to subtract 32400000 milliseconds which is equal to 9 hours
                                var createdTimeStampSplit = (new Date(randomTimeMsecArr[commute]/* - 32400000*/)).toString().split(' ')[4].split(':');
                                timestampHour = createdTimeStampSplit[0];
                                timestampMin = createdTimeStampSplit[1];
                                timestampSec = createdTimeStampSplit[2];

                                logger("demo").info("generateCircumstanceData: commute / timestampHour:timestampMin:timestampSec: " + commute + " / " + timestampHour + ":" + timestampMin + ":" + timestampSec);
                                randomTimeArr.push(timestampHour + ":" + timestampMin + ":" + timestampSec);
                            }

                            logger("demo").info("generateCircumstanceData: userIdx / randomTimeArr Contents:" + userIdx + " / " + randomTimeArr.toString());

                            var smartphoneAddress = userList[userIdx];

                            var isEnter = false;
                            var previousWorkplace = -1;
                            for (commute = 0; commute < commuteCount; commute++) {
                                var circumstanceData = new CircumstanceData();

                                circumstanceData.setDatetime(currentTime.getCurrentDate() + " " + randomTimeArr[commute]);
                                circumstanceData.setDatetimeMsec(randomTimeMsecArr[commute]);
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
    var datetimeMsec = 0;
    var smartphoneAddress ="";
    var workplaceId = 0;
    var commuteStatus = false;

    var setDatetime = function (_datetime) {
        datetime = _datetime;
    };

    var setDatetimeMsec = function (_datetimeMsec) {
        datetimeMsec = _datetimeMsec;
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

    var getDatetimeMsec = function () {
        return datetimeMsec;
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
        return datetime + " / " + datetimeMsec + " / " +  smartphoneAddress + " / " + workplaceId + " / " + ((commuteStatus) ? "true" : "false");
    };

    return {
        "setDatetime"           : setDatetime,
        "setDatetimeMsec"       : setDatetimeMsec,
        "setSmartphoneAddress"  : setSmartphoneAddress,
        "setWorkplaceId"        : setWorkplaceId,
        "setCommuteStatus"      : setCommuteStatus,
        "getDatetime"           : getDatetime,
        "getDatetimeMsec"       : getDatetimeMsec,
        "getSmartphoneAddress"  : getSmartphoneAddress,
        "getWorkplaceId"        : getWorkplaceId,
        "getCommuteStatus"      : getCommuteStatus,
        "toString"              : toString
    }

}

module.exports = demo;