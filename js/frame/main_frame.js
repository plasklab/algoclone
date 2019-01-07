var Main_frame = function(stmts) {
  this.type = "main_frame";
  this.stmts = stmts;
  this.ip = 0; // プログラムポインタ
}

Main_frame.prototype.get_stmts_length = function() {
  return this.stmts.length;
}

Main_frame.prototype.get_stmts = function() {
  return this.stmts;
}

Main_frame.prototype.get_stmt = function() {
  // console.log(this.stmts);
  return this.stmts[this.ip];
}

Main_frame.prototype.inc_ip = function() {
  this.ip++;
}