var Main_stmts = enchant.Class.create({
  initialize: function() {
    this.type = "main_stmts";
    this.stmts = [];
  },

  push_stmt: function(stmt) {
    this.stmts.push(stmt);
  },

  get_stmts: function() {
    return this.stmts;
  },

  print_stmts: function() {
    console.log(this.type + " : " + this.stmts.length);
    for (var i = 0; i < this.stmts.length; i++) {
      if (this.stmts[i].type == "main_loop" ||
      this.stmts[i].type == "main_stmts") {
        this.stmts[i].print_stmts();
      } else {
        this.stmts[i].display();
      }
    }
  },
});