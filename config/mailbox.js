var path = require('path');

module.exports = {
  batch: 30,
  ttl: 30 * 60 * 1000,
  dirname: path.resolve(__dirname, '../db/mailbox')
};
