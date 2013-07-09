var app = require('../app')
  , env = app.settings.env
  , config = require('../config/server')[env];

app.listen(config.port);

