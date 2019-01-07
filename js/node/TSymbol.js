var Terminal_symbol = enchant.Class.create(enchant.Sprite, {
  initialize: function(type) {
    enchant.Sprite.call(this, 32, 32);
    this.type = type;
    /* 画面出力用のデータ */
    this.x;
    this.y;
    this.backgroundColor;
    /* 複製したnodeを管理する */
    this.node;
    /* 連結リスト */
    this.prev = null;
    this.next = null;
    // 移動前のブロックのx, y座標を保存
    this.keep_x;
    this.keep_y;
  },

  /* 画面出力用のデータのsetter */
  set_block: function(x, y, color, stage) {
    this.set_x(x);
    this.set_y(y);
    this.set_backgroundColor(color);
    this.register_init_move(stage);
    this.register_init_block_append(stage);
  },

  set_image: function(img) {
    this.image = img;
  },

  set_x: function(x) {
    this.x = x;
  },

  set_y: function(y) {
    this.y = y;
  },

  set_backgroundColor: function(color) {
    this.backgroundColor = color;
  },

  move: function(node) {
    if (node.type == "head") {
      node = node.next;
    }
    while (node != null) {
      var prev = node.prev;
      node.x = prev.x;
      node.y = prev.y + prev.height + 5;
      node = node.next;
    }
  },

  copy_move: function(node) {
    if (node.type == "head") {
      node = node.next;
    }
    while (node != null) {
      var prev = node.prev;
      node.x = prev.x;
      node.y = prev.y + prev.height + 5;
      if (node.type == "arg_start") {
        node.y -= 5;
      }
      node = node.next;
    }
  },

  /* 連結リスト */
  set_next: function(node) {
    this.next = node;
  },

  set_prev: function(node) {
    this.prev = node;
  },

  append: function(node) {
    if (this.next != null) {
      var n = this.next;
      node.set_next(n);
      n.set_prev(node);
    }
    this.set_next(node);
    this.next.set_prev(this);
  },

  delete: function() {
    if (this.next != null) {
      this.next.set_prev(this.prev);
    }
    this.prev.set_next(this.next);
    this.next = null;
    this.prev = null;
  },

  block_delete: function(e) {
    console.log("block_delete");
    var prev = this.prev;
    var next = this.next;
    if (prev != null && next != null) {
      if (e.x > prev.x + prev.width + 5 ||
          e.x < prev.x - 5 || e.y < prev.y ||
          e.y > next.y + next.height) {
        this.delete();
        this.move(prev);
        return true;
      }
    } else if (prev != null) {
      if (e.x > prev.x + prev.width + 5 ||
          e.x < prev.x - 5 || e.y < prev.y) {
        this.delete();
        this.move(prev);
        return true;
      }
    }
    this.move(this);
    return false;
  },

  block_append: function(stage, e) {
    var prog = stage.prog;
    if (prog.is_x_main_head_inside(e.x)) {
      if (prog.is_y_main_head_inside(this, e.y)) {
        return true;
      }
    }
    if (prog.is_x_s_head_inside(e.x)) {
      if (prog.is_y_s_head_inside(this, e.y)) {
        return true;
      }
    }
    if (prog.is_x_h_head_inside(e.x)) {
      if (prog.is_y_h_head_inside(this, e.y)) {
        return true;
      }
    }
    if (prog.is_x_d_head_inside(e.x)) {
      if (prog.is_y_d_head_inside(this, e.y)) {
        return true;
      }
    }
    if (prog.is_x_c_head_inside(e.x)) {
      if (prog.is_y_c_head_inside(this, e.y)) {
        return true;
      }
    }
    return false;
  },

  /* コンソール出力用 */
  display: function() {
    console.log(this.type);
  },

  /* イベントリスナ登録 */
  /* ブロックを作成し作成したブロックを移動させるイベント */
  register_init_move: function(stage) {
    this.addEventListener("touchmove", function(e) {
      var node = this.node;
      if (stage.is_touch) {
        node = this.create_block(stage, e.x, e.y);
        stage.addChild(node);
        this.node = node;
        stage.is_touch = false;
      }
      node.x = e.x;
      node.y = e.y;
    });
  },

  /* 作成したブロックを追加するためのイベント */
  register_init_block_append: function(stage) {
    this.addEventListener("touchend", function(e) {
      console.log("init_block_append : " + this.node.type);
      stage.is_touch = true;
      if (this.node.block_append(stage, e)) {
        return true;
      }
      stage.removeChild(this.node);
      return false;
    });
  },

  // クリックされた時に最前面にする
  register_above: function(stage) {
    this.addEventListener("touchstart", function() {
      if (stage.play_flag) return;
      stage.addChild(this);
      this.keep_x = this.x;
      this.keep_y = this.y;
    });
  },

  register_move: function(stage) {
    this.addEventListener("touchmove", function(e) {
      if (stage.play_flag) return;
      this.x = e.x;
      this.y = e.y;
    });
  },

  /* 連結リスト挿入用 */
  register_append: function(stage) {
    this.addEventListener("touchend", function(e) {
      if (stage.play_flag) return;
      console.log("appen : " + this.type);
      if (!this.block_delete(e)) {
        console.log("false");
        return false;
      }
      if (this.keep_x + this.width + 5 > e.x &&
          this.keep_x - 5 < e.x &&
          this.keep_y + this.height < e.y) {
        e.y -= this.height + 5;
      }
      if (this.block_append(stage, e)) {
        return true;
      }
      stage.removeChild(this);
      return false;
    });
  },
});