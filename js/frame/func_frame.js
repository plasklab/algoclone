var Func_frame = function(name, stmts, args) {
  this.type = "func_frame";
  this.name = name;
  this.stmts = stmts;
  this.ip = 0; // プログラムポインタ
  this.args = args;
  this.args_ip = 0; // 引数のプログラムポインタ
}

Func_frame.prototype.get_stmts_length = function() {
  return this.stmts.length;
}

Func_frame.prototype.get_stmts = function() {
  return this.stmts;
}

Func_frame.prototype.inc_ip = function() {
  var stmt = this.stmts[this.ip];
  if (stmt.type == "param") {
    this.args_ip++;
    var arg = this.args[stmt.id];
    if (this.args_ip == arg.stmts.length) {
      this.args_ip = 0;
      this.ip++;
    }
    return;
  }
  this.ip++;
}

Func_frame.prototype.get_stmt = function() {
  var stmt = this.stmts[this.ip];
  if (stage.arg_play.length != 0) {
    var id = stage.arg_play.pop();
  }
  if (stmt.type == "param") {
    if (id != stmt.id) {
      id = stmt.id
    }
    stage.arg_play.push(id);
    var arg = this.args[stmt.id];
    return arg.stmts[this.args_ip];
  }
  return this.stmts[this.ip];
}