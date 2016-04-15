//http://socket.io/docs/
var port = process.env.PORT || 2070;
var io = require("socket.io").listen(port);

var pool = require("./db");

io.on("connection", function(socket) {

    var stringifiedArr;

    socket.on("call", function(data) {
        console.log(data);
        stringifiedArr = analyzeJSON(data);

        pool.gatewayValidation(stringifiedArr, function(valid) {
            if (valid)
                pool.smartphoneValidation(stringifiedArr, function(valid) {
                    if (valid)
                        pool.registerCommute(stringifiedArr, function(valid) {
                            if (valid)
                                console.log("socket.on success: " + valid);
                        });
                });
        });
    });

    socket.emit("answer", {
        socketCommunication: "Success"
    });
    
});

module.exports = io;