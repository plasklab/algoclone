var Func_map = function() {
  this.spead;
  this.heart;
  this.dia;
  this.clover;
}

Func_map.prototype.set_spead = function(stmts) {
  this.spead = stmts;
}

Func_map.prototype.set_heart = function(stmts) {
  this.heart = stmts;
}

Func_map.prototype.set_dia = function(stmts) {
  this.dia = stmts;
}

Func_map.prototype.set_clover = function(stmts) {
  this.clover = stmts;
}

Func_map.prototype.get_func = function(name) {
  if (name == "spead") return this.spead;
  else if (name == "heart") return this.heart;
  else if (name == "dia") return this.dia;
  else if (name == "clover") return this.clover;
  console.log("error : " + name + " は存在しません");
  return null;
}
