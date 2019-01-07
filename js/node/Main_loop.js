var Main_loop = enchant.Class.create({
  initialize: function(n) {
    this.type = "main_loop";
    this.stmts = [];
    this.n = n;
  },

  push_stmt: function(stmt) {
    this.stmts.push(stmt);
  },

  get_stmts: function() {
    return this.stmts;
  },

  get_loop_count: function() {
    return this.n;
  },

  print_stmts: function() {
    console.log(this.type + " : " + this.stmts.length);
    console.log("loop count : " + this.n);
    for (var i = 0; i < this.stmts.length; i++) {
      if (this.stmts[i].type == "main_loop" ||
        this.stmts[i].type == "main_stmts") {
        this.stmts[i].print_stmts();
      } else {
        this.stmts[i].display();
      }
    }
  }
});