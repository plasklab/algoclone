var Stage = enchant.Class.create(enchant.Scene, {
  initialize: function(id) {
    enchant.Scene.call(this);
    this.map = this.set_map(id);
    this.player = new Player(this.map.init_x, this.map.init_y, this.map.init_direction);
    this.goal = new Goal(this.map.goal_x, this.map.goal_y);
    this.blocks = this.set_blocks();
    this.play = new Play(this.blocks[this.blocks.length - 1].x, this.set_y(this.blocks[this.blocks.length - 1]), this);
    this.prog = new Prog(this.blocks[0].x + this.blocks[0].height + 20);
    // is_touch : ブロックを作れるタイミングを管理
    this.is_touch = true;
    // play_flag : プログラムを実行しているか管理
    this.play_flag = false;
  },

  set_map: function(id) {
    if (id == 0) {
      return add_map_1();
    } else if (id == 1) {
      return add_map_2();
    } else if (id == 2) {
      return add_map_3();
    } else if (id == 3) {
      return add_map_4();
    } else if (id == 4) {
      return add_map_5();
    } else if (id == 5) {
      return add_map_6();
    } else if (id == 6) {
      return add_map_7();
    } else if (id == 7) {
      return add_map_8();
    } else if (id == 8) {
      return add_map_9();
    } else if (id == 9) {
      return add_map_10();
    } else if (id == 10) {
      return add_map_11();
    } else if (id == 11) {
      return add_map_12();
    } else if (id == 12) {
      return add_map_13();
    }
    return null;
  },

  set_blocks: function() {
    var b = [];
    var map_x = this.map.x + this.map.width + 10;
    b.push(new Up());
    b[0].set_block(map_x, 10, "silver", this);
    b.push(new Rotate_right());
    b[1].set_block(map_x, this.set_y(b[0]), "silver", this);
    b.push(new Rotate_left());
    b[2].set_block(map_x, this.set_y(b[1]), "silver", this);
    b.push(new Loop());
    b[3].set_block(map_x, this.set_y(b[2]), this);
    b.push(new Func_id("spead"));
    b[4].set_block(map_x, this.set_y(b[3]), "silver", this);
    b.push(new Func_id("heart"));
    b[5].set_block(map_x, this.set_y(b[4]), "silver", this);
    b.push(new Func_id("dia"));
    b[6].set_block(map_x, this.set_y(b[5]), "silver", this);
    b.push(new Func_id("clover"));
    b[7].set_block(map_x, this.set_y(b[6]), "silver", this);
    b.push(new Param(0));
    b[8].set_block(map_x, this.set_y(b[7]), "aquamarine", this);
    b.push(new Param(1));
    b[9].set_block(map_x, this.set_y(b[8]), "gold", this);
    b.push(new Param(2));
    b[10].set_block(map_x, this.set_y(b[9]), "pink", this);
    return b;
  },

  set_y: function(b) {
    return b.y + b.height + 5;
  },

  display: function() {
    this.display_heads();
    this.display_blocks();
    this.display_play();
    this.display_map();
    this.display_goal();
    this.display_player();
  },

  remove: function() {
    this.remove_blocks();
    this.remove_play();
  },

  display_blocks: function() {
    for (var i = 0; i < this.blocks.length; i++) {
      if (i == 3) {
        this.blocks[i].loop_addChild(this);
        continue;
      }
      this.addChild(this.blocks[i]);
    }
  },

  remove_blocks: function() {
    for (var i = 0; i < this.blocks.length; i++) {
      if (i == 3) {
        this.blocks[i].remove_block(this);
        continue;
      }
      this.removeChild(this.blocks[i]);
    }
  },

  display_play: function() {
    this.addChild(this.play);
  },

  remove_play: function() {
    this.removeChild(this.play);
  },

  display_heads: function() {
    this.addChild(this.prog.main_space);
    this.addChild(this.prog.s_space);
    this.addChild(this.prog.s_head);
    this.addChild(this.prog.h_space);
    this.addChild(this.prog.h_head);
    this.addChild(this.prog.d_space);
    this.addChild(this.prog.d_head);
    this.addChild(this.prog.c_space);
    this.addChild(this.prog.c_head);
  },

  display_map: function() {
    this.addChild(this.map);
  },

  display_player: function() {
    this.addChild(this.player);
  },

  display_goal: function() {
    this.addChild(this.goal);
  },
});