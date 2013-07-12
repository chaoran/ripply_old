var redis = require('redis')
  , config = require('../config').redis;

var client = module.exports = redis.createClient(
  config.port, config.host, config
);

process.on('exit', function() {
  client.end();
});
