//http://socket.io/docs/
var io = require("socket.io").listen(2070);

// Reference: http://playgroundblog.tistory.com/145
// Reference: https://nodesource.com/blog/understanding-socketio/
// Reference: http://stackoverflow.com/questions/20979800/send-byte-array-in-node-js-to-server

// We'll communicate using json object
// Reference: http://stackoverflow.com/questions/25615313/javascript-byte-array-to-json-and-back

// Making left stuffs after android app that can communicate via socket is made
io.sockets.on("connection", function(socket) {
    socket.on("call", function(data) {
        console.log(data);
        socket.emit("answer", "hi");
    });

});

module.exports = io;
