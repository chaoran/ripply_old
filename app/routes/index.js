module.exports = function(app) {
  app.use('/messages', require('./messages'));
  app.use('/users', require('./users'));
  require('./tokens')(app);
}
