/**
 *  Created by Yang Deokgyu a.k.a. Awesometic
 *
 *  This file is to set timezone or to get current server time,
 *  to convert the datetime format to another datetime format for use as intended
 *
 *  */

var time = require('time');

var now = new time.Date();

now.setTimezone("Asia/Seoul");

var getCurrentDateTime = function() {
    return convertDatetimeFormatToSimple(now.toString());
};

var getCurrentDate = function() {
    return convertDatetimeFormatToSimple(now.toString()).split(' ')[0];
};

var getCurrentTimestamp = function() {
    return convertDatetimeFormatToSimple(now.toString()).split(' ')[1];
};

var convertCurrentTimezoneDateTime = function(datetime) {
    var spaceSplit, colonSplit;
    var year, month, dayOfMonth, hour, min, sec;

    if (String(datetime).length == 39) {
        // Mon Jan 01 1970 00:00:00 GMT+0900 (KST)
        spaceSplit = String(datetime).split(' ');
        colonSplit = String(spaceSplit[4]).split(':');

        year = +spaceSplit[3];
        month = spaceSplit[1];
        dayOfMonth = +spaceSplit[2];

        hour = +colonSplit[0];
        min = +colonSplit[1];
        sec = +colonSplit[2];

        switch (month) {
            case "Jan": month = "01"; break;
            case "Feb": month = "02"; break;
            case "Mar": month = "03"; break;
            case "Apr": month = "04"; break;
            case "May": month = "05"; break;
            case "Jun": month = "06"; break;
            case "Jul": month = "07"; break;
            case "Aug": month = "08"; break;
            case "Sep": month = "09"; break;
            case "Oct": month = "10"; break;
            case "Nov": month = "11"; break;
            case "Dec": month = "12"; break;
        }
    } else {
        // 0000-00-00 00:00:00
        spaceSplit = String(datetime).split(' ');
        var hyphenSplit = String(spaceSplit[0]).split('-');
        colonSplit = String(spaceSplit[1]).split(':');

        year = +hyphenSplit[0];
        month = +hyphenSplit[1];
        dayOfMonth = +hyphenSplit[2];

        hour = +colonSplit[0];
        min = +colonSplit[1];
        sec = +colonSplit[2];
    }

    // Mon Jan 01 1970 00:00:00 GMT+0900 (KST)
    var date = time.Date(year, month - 1, dayOfMonth, hour, min, sec, 0, 'Asia/Seoul');
    var dateSpaceSplit = date.split(' ');

    year = dateSpaceSplit[3];
    month = dateSpaceSplit[1];
    dayOfMonth = dateSpaceSplit[2];
    var resultTime = dateSpaceSplit[4];

    switch (month) {
        case "Jan": month = "01"; break;
        case "Feb": month = "02"; break;
        case "Mar": month = "03"; break;
        case "Apr": month = "04"; break;
        case "May": month = "05"; break;
        case "Jun": month = "06"; break;
        case "Jul": month = "07"; break;
        case "Aug": month = "08"; break;
        case "Sep": month = "09"; break;
        case "Oct": month = "10"; break;
        case "Nov": month = "11"; break;
        case "Dec": month = "12"; break;
    }

    // 0000-00-00 00:00:00
    return year + "-" + month + "-" + dayOfMonth + ' ' + resultTime;
};

var convertDatetimeFormatToSimple = function(datetime) {
    if (String(datetime).length > 19) {
        // Mon Jan 01 1970 00:00:00 GMT+0900 (KST)
        var spaceSplit = String(datetime).split(' ');
        var colonSplit = String(spaceSplit[4]).split(':');

        var year = spaceSplit[3];
        var month = spaceSplit[1];
        var dayOfMonth = (spaceSplit[2].length == 2) ? spaceSplit[2] : ('0' + spaceSplit[2]);
        var hour = colonSplit[0];
        var min = colonSplit[1];
        var sec = colonSplit[2];

        switch (month) {
            case "Jan": month = "01"; break;
            case "Feb": month = "02"; break;
            case "Mar": month = "03"; break;
            case "Apr": month = "04"; break;
            case "May": month = "05"; break;
            case "Jun": month = "06"; break;
            case "Jul": month = "07"; break;
            case "Aug": month = "08"; break;
            case "Sep": month = "09"; break;
            case "Oct": month = "10"; break;
            case "Nov": month = "11"; break;
            case "Dec": month = "12"; break;
        }

        return String(year + '-' + month + '-' + dayOfMonth + ' ' + hour + ':' + min + ':' + sec);
    } else if (String(datetime).length == 10) {
        return String(datetime + ' 00:00:00');
    } else {
        return String(datetime);
    }
};

module.exports = now;
module.exports.getCurrentDateTime = getCurrentDateTime;
module.exports.getCurrentDate = getCurrentDate;
module.exports.getCurrentTimestamp = getCurrentTimestamp;
module.exports.convertCurrentTimezoneDateTime = convertCurrentTimezoneDateTime;
module.exports.convertDatetimeFormatToSimple = convertDatetimeFormatToSimple;