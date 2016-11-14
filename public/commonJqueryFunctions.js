var commonFunc = function() {
    return {
        clarifyResponsedJsonArr : function(json) {
            return JSON.parse(JSON.stringify(json)
                .replace(/\\/g, '')
                .replace(/\"\[/g, '\[')
                .replace(/\]\"/g, '\]'));
        },
        // http://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
        msecToTimeDuration : function(durationMsec) {
            var milliseconds = parseInt((durationMsec % 1000) / 100)
                , seconds = parseInt((durationMsec / 1000) % 60)
                , minutes = parseInt((durationMsec / (1000 * 60)) % 60)
                , hours = parseInt((durationMsec / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return hours + ":" + minutes + ":" + seconds;//+ "." + milliseconds;
        },
        msecToTimeDurationSimple : function(durationMsec) {
            var seconds = (millisec / 1000).toFixed(1);
            var minutes = (millisec / (1000 * 60)).toFixed(1);
            var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
            var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

            if (seconds < 60) {
                return seconds + " 초";
            } else if (minutes < 60) {
                return minutes + " 분";
            } else if (hours < 24) {
                return hours + " 시간";
            } else {
                return days + " 일"
            }
        }
    }
}();