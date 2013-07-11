module.exports = function(app) {
  app.use('/messages', require('./messages'));
  app.use(require('./users'));
  require('./tokens')(app);
}
