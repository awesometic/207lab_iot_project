var express = require('express');
var router = express.Router();

// Loading database connection file by Yang Deokgyu
var pool = require("../db.js");

/* GET */
router
    .get('/', function(req, res, next) {
        res.render('index', {
            title: 'Express',
            user_id: req.session.user_id
        });
    })

    .get("/login", function(req, res, next) {
        res.render("login", {
            title: "Express",
            user_id: req.session.user_id
        });
    })

    .get("/add_user", function(req, res, next) {
        res.render("add_user", {
            title: "Express",
            user_id: req.session.user_id
        });
    })

    .get("/logout", function(req, res, next) {
        req.session.destroy(function(err) {
            if (err)
                console.error("err", err);
            res.send("<script>alert('Logout Success!'); location.href='/';</script>");
        });
    });

/* POST */
router
    .post("/login", function(req, res) {
        var id = req.body.user;
        var pw = req.body.pass;

        if (id.length == 0 || pw.length == 0) {
            res.send("<script>alert('Fill out all of the textbox fields'); history.back();</script>");
        } else {
            pool.getConnection(function (err, conn) {
                if (err)
                    pool.poolEnd(err);
                conn.query("SELECT count(*) cnt FROM users WHERE id=? and password=MD5(?)", [id, pw], function (err, rows) {
                    if (err)
                        pool.poolEnd(err);
                    var cnt = rows[0].cnt;
                    if (cnt == 1) {
                        req.session.user_id = id;
                        res.send("<script>alert('Login Success!'); location.href='/';</script>");
                    } else {
                        res.send("<script>alert('ID or Password is incorrect!'); history.back();</script>");
                    }
                });
                conn.release();
            });
        }
    })

    .post("/add_user", function(req, res) {
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
                    if (err)
                        pool.poolEnd(err);
                    conn.query("INSERT INTO users (id, password) VALUES (?, MD5(?))", [id, pw], function (err, rows) {
                        if (err)
                            pool.poolEnd(err);
                        res.send("<script>alert('Register Success!'); location.href='/login';</script>");
                    });
                    conn.release();
                });
            }
        }
    });

module.exports = router;
