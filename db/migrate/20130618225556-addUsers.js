module.exports = {
  up: function() {
    this.createTable('users', function(t) {
      t.string('email', { null: false });
      t.string('name', { null: false });
      t.string('passwordHash', { null: false });
      t.string('passwordSalt', { null: false });
    });
    this.addIndex('users', 'email', { unique: true });
  },
  down: function() {
    this.dropTable('users');
  }
};
