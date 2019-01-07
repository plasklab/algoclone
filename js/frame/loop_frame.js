var Loop_frame = function(stmts, cnt) {
  this.type = "loop_frame";
  this.stmts = stmts;
  this.ip = 0; // プログラムポインタ
  this.loop_count = cnt;
}

Loop_frame.prototype.get_loop_count = function() {
  return this.loop_count;
}

Loop_frame.prototype.get_stmts = function() {
  return this.stmts;
}

Loop_frame.prototype.get_stmt = function() {
  return this.stmts[this.ip];
}

Loop_frame.prototype.get_stmts_length = function() {
  return this.stmts.length;
}

Loop_frame.prototype.dec_loop_count = function() {
  this.loop_count--;
}

Loop_frame.prototype.inc_ip = function() {
  this.ip++;
}

Loop_frame.prototype.reset_ip = function() {
  this.ip = 0;
}