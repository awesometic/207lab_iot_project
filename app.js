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

// Include db.js to access to database
var pool = require('./db');

// Include async to calling functions consequently
var async = require('async');

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
app.use(express.static(path.join(__dirname, 'node_modules/admin-lte')));

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

        var employee_number = req.session.user_employee_id;
        var smartphone_address = req.session.user_smartphone_address;

        if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
            async.waterfall([
                function (callback) {
                    pool.id_getUserInfo(smartphone_address, function (userInfo) {
                        callback(null, userInfo);
                    });
                },
                function (userInfo, callback) {
                    pool.id_getCompanyName(function (companyName) {
                        callback(null, userInfo, companyName);
                    });
                }
            ], function (error, userInfo, companyName) {
                if (error) {
                    console.log(error);
                } else {
                    res.render('error', {
                        message: err.message,
                        error: err,
                        title: 'Janus - error page',
                        userInfo: userInfo,
                        companyName: companyName
                    });
                }
            });
        } else {
            res.send("<script>location.href='/';</script>");
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    var employee_number = req.session.user_employee_id;
    var smartphone_address = req.session.user_smartphone_address;

    if (typeof employee_number != 'undefined' || typeof smartphone_address != 'undefined') {
        async.waterfall([
            function (callback) {
                pool.id_getUserInfo(smartphone_address, function (userInfo) {
                    callback(null, userInfo);
                });
            },
            function (userInfo, callback) {
                pool.id_getCompanyName(function (companyName) {
                    callback(null, userInfo, companyName);
                });
            }
        ], function (error, userInfo, companyName) {
            if (error) {
                console.log(error);
            } else {
                res.render('error', {
                    message: err.message,
                    error: err,
                    title: 'Janus - error page',
                    userInfo: userInfo,
                    companyName: companyName
                });
            }
        });
    } else {
        res.send("<script>location.href='/';</script>");
    }
});

module.exports = app;
