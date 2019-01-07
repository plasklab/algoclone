var Func_stmts = function(name) {
  this.type = "func_stmts";
  this.name = name;
  this.stmts = [];
}

Func_stmts.prototype.push_stmt = function(stmt) {
  this.stmts.push(stmt);
}

Func_stmts.prototype.get_stmts = function() {
  return this.stmts;
}

Func_stmts.prototype.print_stmts = function() {
  console.log(this.type + " : " + this.stmts.length);
  for (var i = 0; i < this.stmts.length; i++) {
    if (this.stmts[i].type == "func_stmts" ||
      this.stmts[i].type == "func_loop") {
      this.stmts[i].print_stmts();
    } else {
      this.stmts[i].display();
    }
  }
}