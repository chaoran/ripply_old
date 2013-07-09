var express = require('express')
  , routes = require('./routes')
  , app = express();

app.configure('development', function() {
  app.use(express.logger('dev'));
});

app.configure(function(){
  app.use(express.bodyParser());
  routes(app);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

module.exports = app;
