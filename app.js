//http://expressjs.com/en/4x/api.html
var express = require('express');

// https://nodejs.org/api/path.html
// This module contains utilities for handling and transforming file paths
var path = require('path');
// https://github.com/expressjs/serve-favicon
// https://en.wikipedia.org/wiki/Favicon
// A favicon is a visual cue that client software, like browsers, use to identify a site
var favicon = require('serve-favicon');
// https://github.com/expressjs/morgan
// HTTP request logger middleware for node.js
var logger = require('morgan');
// https://github.com/expressjs/cookie-parser
// Parse Cookie header and populate req.cookies with an object keyed by the cookie names
var cookieParser = require('cookie-parser');
// https://github.com/expressjs/body-parser
// Node.js body parsing middleware
var bodyParser = require('body-parser');
// https://github.com/expressjs/session
var session = require("express-session");

// Include socket.io loading file by Yang Deokgyu
var io = require("./socket");
var io2 = require("./socket-chat.js");

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false
}));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
