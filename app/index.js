var express = require('express')
  , config = require('../config').server
  , app = express();

app.configure('development', function() {
  app.use(express.logger('dev'));
});

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.use('/messages', require('./endpoints/messages'));
app.use('/users', require('./endpoints/users'));
app.use('/tokens', require('./endpoints/tokens'));

app.listen(config.port);

module.exports = app;
