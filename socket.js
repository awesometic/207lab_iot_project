//http://socket.io/docs/
var io = require("socket.io").listen(2070);

// Reference: http://playgroundblog.tistory.com/145
// Reference: https://nodesource.com/blog/understanding-socketio/
// Reference: http://stackoverflow.com/questions/20979800/send-byte-array-in-node-js-to-server

// We'll communicate using json object
// Reference: http://stackoverflow.com/questions/25615313/javascript-byte-array-to-json-and-back

// There's java library that is made for socket.io
// http://socket.io/blog/native-socket-io-and-android/
// https://github.com/socketio/socket.io-client-java

// Making left stuffs after android app that can communicate via socket that is made
io.on("connection", function(socket) {
    socket.emit("an event", {
        MyNameIs: "Node.js"
    });

    socket.on("other event", function(data) {
        console.log(data);
    });

    socket.on("disconnect", function() {
        io.emit("user disconnected");
    })
});

module.exports = io;
