var Rotate_left = enchant.Class.create(Terminal_symbol, {
  initialize: function() {
    Terminal_symbol.call(this, "rotate_left");
    this.image = game.assets[LEFT];
  },

  create_block: function(stage, x, y) {
    var rl = new Rotate_left();
    rl.set_image(this.image);
    rl.set_x(x);
    rl.set_y(y);
    rl.set_backgroundColor(this.backgroundColor);
    rl.register_move(stage);
    rl.register_append(stage);
    rl.register_above(stage);
    return rl;
  },

  copy_block: function(stage, x, y) {
    var rl = new Rotate_left();
    rl.set_image(this.image);
    rl.set_x(x);
    rl.set_y(y);
    rl.set_backgroundColor(this.backgroundColor);
    stage.addChild(rl);
    return rl;
  },
});