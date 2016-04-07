/*
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
 */
/** 2016. 04. 07
 * For socket.io test, make it chatting server using socket.io.
 * Source code by
 * http://socket.io/blog/native-socket-io-and-android/
 * https://github.com/socketio/socket.io/blob/master/examples/chat/index.js
 * https://github.com/socketio/socket.io-client-java
 * */
// Setup basic express server
// var express = require('express');
// var app = express();
// var server = require('http').createServer(app);
// var io = require('../..')(server);
// var port = process.env.PORT || 3000;

// server.listen(port, function () {
//     console.log('Server listening at port %d', port);
// });

// Routing
// app.use(express.static(__dirname + '/public'));

// Initialize socket.io
var io = require("socket.io").listen(2070);

// Chatroom
var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});
