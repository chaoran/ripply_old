module.exports = {
  up: function() {
    this.createTable('users', function(t) {
      t.string('username', { null: false });
      t.string('passwordHash', { null: false });
      t.string('passwordSalt', { null: false });

      t.string('name');
      t.string('bio');

      t.timestamp('createdAt');
    });

    this.addIndex('users', 'username', { unique: true });
  },
  down: function() {
    this.dropTable('users');
  }
};
