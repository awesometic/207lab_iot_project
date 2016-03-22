var express = require('express');
var router = express.Router();

// Loading database connection file by Yang Deokgyu
var pool = require("../db.js");

// https://github.com/caolan/async
// Async is a utility module which provides straight-forward,
// powerful functions for working with asynchronous JavaScript
var async = require("async");

/* GET */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express',
        user_id: req.session.user_id
    });
});

router.get("/login", function(req, res, next) {
    res.render("login", {
        title: "Express",
        user_id: req.session.user_id
    });
});

router.get("/add_user", function(req, res, next) {
    res.render("add_user", {
        title: "Express",
        user_id: req.session.user_id
    });
});

router.get("/logout", function(req, res, next) {
    req.session.destroy(function(err) {
        if (err)
            console.error("err", err);
        res.send("<script>alert('Logout Success!'); location.href='/';</script>");
    });
});

/* POST */
router.post("/login", function(req, res) {
    var id = req.body.user;
    var pw = req.body.pass;

    if (id.length == 0 || pw.length == 0) {
        res.send("<script>alert('Fill out all of the textbox fields'); history.back();</script>");
    } else {
        pool.getConnection(function (err, conn) {
            var cnt;
            if (err) {
                console.error(err);
            }

            conn.query("SELECT count(*) cnt FROM users WHERE id=?", [id], function (err, rows) {
                if (err) {
                    console.error(err);
                } else {
                    cnt = rows[0].cnt;
                    if (cnt == 0) {
                        res.send("<script>alert('Unregistered ID!'); history.back();</script>");
                    }
                }
                conn.release();
            });
        });

        pool.getConnection(function (err, conn) {
            conn.query("SELECT count(*) cnt FROM users WHERE id=? and password=MD5(?)", [id, pw], function (err, rows) {
                if (err) {
                    console.error(err);
                } else {
                    var cnt = rows[0].cnt;
                    if (cnt == 1) {
                        req.session.user_id = id;
                        res.send("<script>alert('Login Success!'); location.href='/';</script>");
                    } else {
                        res.send("<script>alert('Password incorrect!'); history.back();</script>");
                    }
                    conn.release();
                }
            });
        });
    }
});

router.post("/add_user", function(req, res) {
    var id = req.body.user;
    var pw = req.body.pass;
    var pw2 = req.body.pass2;

    if (id.length == 0 || pw.length == 0 || pw2.length == 0) {
        res.send("<script>alert('Fill out all of the textbox fields!'); history.back();</script>");
    } else {
        if (pw != pw2) {
            res.send("<script>alert('Check Retype-Password!'); history.back();</script>");
        } else {
            pool.getConnection(function (err, conn) {
                if (err) {
                    console.error(err);
                }
                conn.query("INSERT INTO users (id, password) VALUES (?, MD5(?))", [id, pw], function (err, rows) {
                    if (err) {
                        console.error(err);
                    } else {
                        res.send("<script>alert('Register Success!'); location.href='/login';</script>");
                    }
                    conn.release();
                });
            });
        }
    }
});

module.exports = router;
