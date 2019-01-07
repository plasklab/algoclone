var Rotate_right = enchant.Class.create(Terminal_symbol, {
  initialize: function() {
    Terminal_symbol.call(this, "rotate_right");
    this.image = game.assets[RIGHT];
  },

  create_block: function(stage, x, y) {
    var rr = new Rotate_right();
    rr.set_image(this.image);
    rr.set_x(x);
    rr.set_y(y);
    rr.set_backgroundColor(this.backgroundColor);
    rr.register_move(stage);
    rr.register_append(stage);
    rr.register_above(stage);
    return rr;
  },

  copy_block: function(stage, x, y) {
    var rr = new Rotate_right();
    rr.set_image(this.image);
    rr.set_x(x);
    rr.set_y(y);
    rr.set_backgroundColor(this.backgroundColor);
    stage.addChild(rr);
    return rr;
  }
});