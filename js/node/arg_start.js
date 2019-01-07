var Arg_start = enchant.Class.create(Terminal_symbol, {
  initialize: function(id, x, y) {
    Terminal_symbol.call(this, "arg_start");
    this.type = "arg_start";
    this.height = 16;
    this.id = id;
    this.set_x(x);
    this.set_y(y);
  },

  copy_block: function(stage, x, y) {
    var start = new Arg_start(this.id, x, y);
    start.arg = new Sprite(32, start.height);
    start.arg.x = start.x;
    start.arg.y = start.y;
    start.arg.id = this.id;
    start.register_arg_move();
    start.set_backgroundColor();
    stage.addChild(start.arg);
    stage.addChild(start);
    return start;
  },

  set_backgroundColor: function() {
    var color;
    var b_color;
    if (this.id == 0) {
      color = "palegreen";
      b_color = "aquamarine";
    } else if (this.id == 1) {
      color = "orange";
      b_color = "gold";
    } else if (this.id == 2) {
      color = "hotpink";
      b_color = "pink";
    }

    this.backgroundColor = color;
    this.arg.backgroundColor = b_color;
  },

  register_arg_move: function() {
    this.arg.addEventListener("enterframe", function() {
      this.arg.x = this.x;
      this.arg.y = this.y;
    }.bind(this));
  },

  get_id: function() {
    return this.id;
  },
});