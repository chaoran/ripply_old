module.exports = {
  up: function() {
    this.createTable("tokens", function(t) {
      t.references("client", { null: false });
      t.references("user", { null: false });
      t.string("accessToken", { limit: 24 });
      t.string("refreshToken", { limit: 24 });
      t.string("permissions", { limit: 64 });
      t.boolean("expired");

      t.timestamp("createdAt", { null: false });
      t.timestamp("updatedAt", { null: false });
    });

    this.addIndex("tokens", 'accessToken', { unique: true });
    this.addIndex("tokens", 'refreshToken', { unique: true });
  },
  down: function() {
    this.dropTable("authorizations");
  }
};
