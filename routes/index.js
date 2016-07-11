var express = require('express');
var router = express.Router();

var pool = require("../db");
var logger = require("../logger");

var getCurrentDateTime = function() {
    var date = new Date();
    var currentMonth = date.getMonth() + 1;
    var str_currentMonth;
    if (currentMonth < 10)
        str_currentMonth = '0' + currentMonth;

    return date.getFullYear() + "-" + str_currentMonth + "-" + date.getDate()
        + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
};

/* GET */
var title = "Suwon Univ. 207 Lab - IoT Project";
router.get('/', function(req, res, next) {
    
    res.render('index', {
        title: title
    });

});

/* POST */
router.post("/", function(req, res) {
    
});

module.exports = router;
