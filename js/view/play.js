var Play = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y, stage) {
    enchant.Sprite.call(this, 32, 32);
    this.image = game.assets[PLAY];
    this.type = "play";
    this.x = x;
    this.y = y;
    this.register_play(stage);
    // 実行中のブロックの管理
    this.play_progs = [];
  },

  play: function(stage) {
    var prog = stage.prog;
    var fm = new Func_map();
    var main = main_parser(prog.main_head);
    var main_head = prog.copy_blocks(stage, prog.main_head, stage.map.x + stage.map.width + 20, 10, "gray");
    this.play_progs.push(main_head);
    fm.set_spead(func_parser(prog.s_head, "spead"));
    fm.set_heart(func_parser(prog.h_head, "heart"));
    fm.set_dia(func_parser(prog.d_head, "dia"));
    fm.set_clover(func_parser(prog.c_head, "clover"));
    run(main, new State(stage.player), fm);
  },

  register_play: function(stage) {
    this.addEventListener("touchstart", function() {
      if (!stage.prog.is_append()) {
        return;
      }
      stage.play_flag = true;
      stage.remove();
      stage.prog.move_blocks(stage.map.x + stage.map.width + 20);
      game.height += stage.prog.get_total_height();
      console.log("=============== play ===============");
      this.play(stage);
    });
  },

  main_head_highlight_off: function() {
    var node = this.play_progs.pop();
    while (node.next != null) {
      node = node.next;
      if (node.type != "arg_start" && node.type != "arg_end") {
        node.backgroundColor = "silver";
      }
    }
  },

  loop_end_highlight_off: function(state) {
    var frame_i = state.stack_frame.length - 1;
    var frame = state.get_index_frame(frame_i);
    var total_ip = 0;
    while (frame.type == "loop_frame") {
      total_ip += frame.ip;
      frame_i--;
      frame = state.get_index_frame(frame_i);
    }
    total_ip += frame.ip;
    var head = this.play_progs[this.play_progs.length - 1];
    var i = 0;
    while (i < total_ip) {
      head = head.next;
      if (head.type != "arg_start" && head.type != "arg_end") {
        i++;
      }
    }
    if (total_ip != 0) {
      head.backgroundColor = "silver";
    }
  },

  highlight: function(state) {
    var frame_i = state.stack_frame.length - 1;
    var frame = state.get_index_frame(frame_i);
    var total_ip = 0;
    var loop_flag = false;
    while (frame.type == "loop_frame") {
      loop_flag = true;
      total_ip += frame.ip;
      frame_i--;
      frame = state.get_index_frame(frame_i);
    }
    total_ip += frame.ip;
    var head = this.play_progs[this.play_progs.length - 1];
    var i = 0;
    while (i < total_ip) {
      head = head.next;
      if (!loop_flag) {
        if (head.type == "loop_start") {
          head = this.get_loop_end_next(head);
        }
      }
      if (head.type != "arg_start" && head.type != "arg_end") {
        i++;
      }
    }
    if (total_ip != 0) {
      head.backgroundColor = "silver";
    }
    head = head.next;
    if (head != null) {
      head.backgroundColor = "yellow";
    }
  },

  get_loop_end_next: function(head) {
    var loop_nest = 1;
    while (loop_nest != 0) {
      head = head.next;
      if (head.type == "loop_start") {
        loop_nest++;
      } else if (head.type == "loop_end") {
        loop_nest--;
      }
    }
    return head;
  },
})