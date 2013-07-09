module.exports = function(app) {
  require('./users')(app);
  require('./tokens')(app);
}
