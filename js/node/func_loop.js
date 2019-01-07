var Func_loop = function(n) {
  this.type = "func_loop";
  this.stmts = [];
  this.n = n;
}

Func_loop.prototype.push_stmt = function(stmt) {
  this.stmts.push(stmt);
}

Func_loop.prototype.get_stmts = function() {
  return this.stmts;
}

Func_loop.prototype.get_loop_count = function() {
  return this.n;
}

Func_loop.prototype.print_stmts = function() {
  console.log(this.type + " : " + this.stmts.length);
  console.log("loop count : " + this.n);
  for (var i = 0; i < this.stmts.length; i++) {
    if (this.stmts[i].type == "func_loop" ||
      this.stmts[i].type == "func_stmts") {
      this.stmts[i].print_stmts();
    } else {
      this.stmts[i].display();
    }
  }
}