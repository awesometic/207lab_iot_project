// https://github.com/TooTallNate/node-time
var time = require('time');

var now = new time.Date();

now.setTimezone("Asia/Seoul");

var getCurrentDate = function() {
    var localtime = time.localtime(Date.now()/1000);

    var currentMonth = localtime.month + 1;
    var str_currentMonth;

    if (currentMonth < 10)
        str_currentMonth = '0' + currentMonth;

    return new Date().getFullYear() + "-" + str_currentMonth + "-" + localtime.dayOfMonth;
};

var getCurrentDateTime = function() {
    var localtime = time.localtime(Date.now()/1000);

    var currentMonth = localtime.month + 1;
    var str_currentMonth;

    if (currentMonth < 10)
        str_currentMonth = '0' + currentMonth;

    return new Date().getFullYear() + "-" + str_currentMonth + "-" + localtime.dayOfMonth
        + " " + localtime.hours + ":" + localtime.minutes + ":" + localtime.seconds;
};

var convertCurrentTimezoneDateTime = function(datetime) {
    var spaceSplit, colonSplit;
    var year, month, dayOfMonth, hour, min, sec;

    if (String(datetime).length == 39) {
        // Mon Jan 01 1970 00:00:00 GMT+0900 (KST)
        spaceSplit = datetime.split(' ');
        colonSplit = spaceSplit[4].split(':');

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
        spaceSplit = datetime.split(' ');
        var hyphenSplit = spaceSplit[0].split('-');
        colonSplit = spaceSplit[1].split(':');

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

module.exports = now;
module.exports.getCurrentDate = getCurrentDate;
module.exports.getCurrentDateTime = getCurrentDateTime;
module.exports.convertCurrentTimezoneDateTime = convertCurrentTimezoneDateTime;