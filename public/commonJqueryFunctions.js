var commonFunc = function() {
    return {
        clarifyResponsedJsonArr : function(json) {
            return JSON.parse(JSON.stringify(json)
                .replace(/\\/g, '')
                .replace(/\"\[/g, '\[')
                .replace(/\]\"/g, '\]'));
        },
        // http://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript
        msecToTimeDuration : function(durationMsec) {
            // Pad to 2 or 3 digits, default is 2
            function pad(n, z) {
                z = z || 2;
                return ('00' + n).slice(-z);
            }

            var ms = durationMsec % 1000;
            durationMsec = (durationMsec - ms) / 1000;
            var secs = durationMsec % 60;
            durationMsec = (durationMsec - secs) / 60;
            var mins = durationMsec % 60;
            var hrs = (durationMsec - mins) / 60;

            return ((hrs < 10) ? pad(hrs) : hrs) + ':' + pad(mins) + ':' + pad(secs);// + '.' + pad(ms, 3);
        }
    }
}();