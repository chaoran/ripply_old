var mysql = require('mysql')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../config/database')[env];

var pool = mysql.createPool(config);

pool.connect = pool.getConnection;
pool.connected = function(func) {
  if (func.length < 2) throw new Error(
    '.connected() expects at least two arguments: conn, callback.'
  );

  return function() {
    var that = this
      , args = [].slice.call(arguments)
      , callback = args.pop();
    pool.connect(function(err, conn) {
      if (err) return callback(err);
      args.unshift(conn);
      args.push(function() {
        conn.end();
        if (callback) callback.apply(global, arguments);
        else if (arguments[0] instanceof Error) throw arguments[0];
      });
      func.apply(that, args);
    });
  }
};

module.exports = pool;
