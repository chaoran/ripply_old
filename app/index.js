var express = require('express')
  , app = module.exports = express();

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

app.configure('test', function() {
  app.use(express.errorHandler());
});

require('./routes')(app);
