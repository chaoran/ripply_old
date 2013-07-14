var path = require('path')
  , env = process.env.NODE_ENV || 'development';

module.exports = {
  mysql: require('./mysql')[env],
  redis: require('./redis')[env],
  server: {
    port: (env === 'production') ? 80 : 3000
  },
  mailbox: {
    ttl: 60 * 60 * 1000,
    batch: 30,
    dirname: path.resolve(__dirname, '../db/mailbox')
  },
  session: {
    live: 30 * 60 * 1000
  },
  bcrypt: {
    strength: (env === 'test') ? 3 : 10
  }
};
