var Up = enchant.Class.create(Terminal_symbol, {
  initialize: function() {
    Terminal_symbol.call(this, "advance");
    this.image = game.assets[ADVANCE];
  },

  create_block: function(stage, x, y) {
    var up = new Up();
    up.set_image(this.image);
    up.set_x(x);
    up.set_y(y);
    up.set_backgroundColor(this.backgroundColor);
    up.register_move(stage);
    up.register_append(stage);
    up.register_above(stage);
    return up;
  },

  copy_block: function(stage, x, y) {
    var up = new Up();
    up.set_image(this.image);
    up.set_x(x);
    up.set_y(y);
    up.set_backgroundColor(this.backgroundColor);
    stage.addChild(up);
    return up;
  },
});