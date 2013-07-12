var neutron = require('neutron')
  , Reporter = neutron.Reporter
  , redis = require('./lib/redis')

neutron.loadTasks();

namespace('redis', function() {
  task('flush', { async: true }, function() {
    var reporter = new Reporter('flush', 'redis:' + redis.port);

    redis.flushall(reporter.report(function(err) {
      if (err) fail(err);
      else complete();
    }));
  });
});

jake.addListener('complete', function () {
  process.exit();
});
