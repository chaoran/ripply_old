var env = process.env.NODE_ENV || 'development';

module.exports = {
  database: require('./database')[env],
  security: require('./security')[env]
};
