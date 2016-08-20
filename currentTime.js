// https://github.com/TooTallNate/node-time
var time = require('time');

var now = new time.Date();

now.setTimezone("Asia/Seoul");

var getCurrentDateTime = function() {
    var localtime = time.localtime(Date.now()/1000);
    // { seconds: 38,
    //   minutes: 7,
    //   hours: 23,
    //   dayOfMonth: 10,
    //   month: 2,
    //   year: 111,
    //   dayOfWeek: 4,
    //   dayOfYear: 68,
    //   isDaylightSavings: false,
    //   gmtOffset: -28800,
    //   timezone: 'PST' }

    var currentMonth = localtime.month + 1;
    var str_currentMonth;

    if (currentMonth < 10)
        str_currentMonth = '0' + currentMonth;

    return new Date().getFullYear() + "-" + str_currentMonth + "-" + localtime.dayOfMonth
        + " " + localtime.hours + ":" + localtime.minutes + ":" + localtime.seconds;
};

var getCurrentTimezoneDateTime = function(datetime) {
    // 0000-00-00 00:00:00
    var spaceSplit = datetime.split(' ');
    var hyphenSplit = spaceSplit[0].split('-');
    var colonSplit = spaceSplit[1].split(':');

    var year = +hyphenSplit[0];
    var month = +hyphenSplit[1];
    var dayOfMonth = +hyphenSplit[2];

    var hour = +colonSplit[0];
    var min = +colonSplit[1];
    var sec = +colonSplit[2];

    // Fri May 13 2016 00:00:00 GMT+0900 (KST)
    var date = time.Date(year, month - 1, dayOfMonth, hour, min, sec, 0, 'Asia/Seoul');
    var dateSplit = date.split(' ');

    year = dateSplit[3];
    month = dateSplit[1];
    dayOfMonth = dateSplit[2];
    var resultTime = dateSplit[4];

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

    return year + "-" + month + "-" + dayOfMonth + ' ' + resultTime;
};

module.exports = now;
module.exports.getCurrentDateTime = getCurrentDateTime;
module.exports.getCurrentTimezoneDateTime = getCurrentTimezoneDateTime;