var Func_frame = function(name, stmts) {
  this.type = "func_frame";
  this.name = name;
  this.stmts = stmts;
  this.ip = 0; // プログラムポインタ
}

Func_frame.prototype.get_stmts_length = function() {
  return this.stmts.length;
}

Func_frame.prototype.get_stmts = function() {
  return this.stmts;
}

Func_frame.prototype.inc_ip = function() {
  this.ip++;
}

Func_frame.prototype.get_stmt = function() {
  return this.stmts[this.ip];
}