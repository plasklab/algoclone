var Arg_end = enchant.Class.create(Terminal_symbol, {
  initialize: function(x, y) {
    Terminal_symbol.call(this, "arg_end");
    this.type = "arg_end";
    this.height = 16;
    this.set_x(x);
    this.set_y(y + this.height + 5);
  },

  copy_block: function(stage, x, y) {
    var end = new Arg_end(x, y);
    end.set_y(y);
    stage.addChild(end);
    return end;
  },

  set_backgroundColor: function(id) {
    var color;
    if (id == 0) {
      color = "palegreen";
    } else if (id == 1) {
      color = "orange";
    } else if (id == 2) {
      color = "hotpink";
    }
    this.backgroundColor = color;
  },
});