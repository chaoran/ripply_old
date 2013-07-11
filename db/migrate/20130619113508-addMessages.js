module.exports = {
  up: function() {
    this.createTable("messages", function(t) {
      t.references("user", { null: false });
      t.string("body", { limit: 140 });
      t.timestamp("createdAt");
    });
  },
  down: function() {
    this.dropTable("messages");
  }
};
