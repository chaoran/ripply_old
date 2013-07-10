module.exports = {
  up: function() {
    this.createTable("clients", function(t) {
      t.string("key", { null: false, limit: 16 });
      t.string("secret", { null: false, limit: 32 });
      t.string("name", { null: false });
      t.boolean("trusted");
    });

    this.addIndex("clients", "key", { unique: true });
  },
  down: function() {
    this.dropTable("clients");
  }
};
