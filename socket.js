//http://socket.io/docs/
var port = process.env.PORT || 2070;
var io = require("socket.io").listen(port);

var pool = require("./db");

io.on("connection", function(socket) {

    var stringifiedArr;

    socket.on("call", function(data) {
        console.log("========================================");
        console.log("data receive: ");
        console.log(data);
        stringifiedArr = pool.soc_analyzeJSON(data);

        pool.soc_gatewayValidation(stringifiedArr, function(valid) {
            if (valid) {
                pool.soc_smartphoneValidation(stringifiedArr, function (valid) {
                    if (valid) {
                        pool.soc_registerCommute(stringifiedArr, function (valid) {
                            if (valid) {

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

    socket.emit("answer", {
        socketCommunication: "Success"
    });

});

module.exports = io;