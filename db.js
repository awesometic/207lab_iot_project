/* Connect to database */

//https://github.com/felixge/node-mysql
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'nodejs',
    password        : 'nodejs',
    database        : 'nodejs'
});

/* Closing all the connections in a pool */
exports.poolEnd = function(err) {
    console.end("err: " + err);
    console.end("MySQL connection pool end");
    pool.end();
};

exports.poolEnd = function() {
    console.end("MySQL connection pool end");
    pool.end();
}

/*
var db_connection = mysql.createConnection({
    host      : 'localhost',
    user      : 'nodejs',
    password  : 'nodejs',
    database  : 'nodejs'
});

db_connection.connect();
db_connection.query('select 5 + 5 as solution', function(err, rows, fields) {
    if (err)
        throw err;
    console.log('The solution is: ', rows[0].solution);
});

db_connection.end();
*/

module.exports = pool;
