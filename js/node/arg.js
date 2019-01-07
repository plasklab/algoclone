var Arg = enchant.Class.create(enchant.Sprite, {
  initialize: function(id, func, node, stage) {
    enchant.Sprite.call(this, 32, 16 * 2);
    this.x = func.x; 
    this.y = func.y + func.height;
    this.backgroundColor;
    this.id = id;
    this.func = func;
    this.start = new Arg_start(id, this.x, this.y);
    this.end = new Arg_end(this.x, this.y);
    this.set_backgroundColor();
    this.register_move(node);
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

    this.start.backgroundColor = color;
    this.end.backgroundColor = color;
    this.backgroundColor = b_color;
  },

  arg_addChild: function(stage) {
    stage.addChild(this);
    stage.addChild(this.start);
    stage.addChild(this.end);
  },

  arg_removeChild: function(stage) {
    stage.removeChild(this);
    stage.removeChild(this.start);
    stage.removeChild(this.end);
  },

  arg_append: function(node) {
    node.append(this.end);
    node.append(this.start);
    node.move(node);
  },

  arg_delete: function(node) {
    this.start.delete();
    this.end.delete();
    node.move(node);
  },

  register_move: function(node) {
    this.addEventListener("enterframe", function() {
      this.height = (this.end.y + this.end.height) - this.start.y;
      this.x = node.x;
      this.y = node.y + node.height;
      this.start.x = this.x;
      this.start.y = this.y;
      this.end.x = this.x;
      this.end.y = this.y + this.height - this.end.height;
    });
  }
});