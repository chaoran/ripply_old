module.exports = {
  up: function() {
    this.createTable('ups', function(t) {
      t.references('user');
      t.references('message', { null: false });
      t.timestamp('createdAt', { null: false });
    });
    this.addIndex('ups', [ 'userId', 'messageId' ], { unique: true });
  },
  down: function() {
    this.dropTable('ups');
  }
};
