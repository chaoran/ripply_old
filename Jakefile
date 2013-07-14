var neutron = require('neutron')
  , Reporter = neutron.Reporter
  , redis = require('./lib/redis')
  , config = require('./config')

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

namespace('mailbox', function() {
  task('clear', { async: true }, function() {
    var dirname = config.mailbox.dirname;
    var reporter = new Reporter('rm', dirname);

    jake.exec('rm -rf ' + dirname, reporter.report(function(err) {
      if (err) fail(err);
      else complete();
    }));
  });
});

jake.addListener('complete', function () {
  process.exit();
});
