module.exports = function(app) {
  app.use(require('./users'));
  require('./tokens')(app);
}
