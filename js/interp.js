var run = function(main_prog, state, fm) {
  state.push_frame(new Main_frame(main_prog.get_stmts()));
  eval(state, fm);
}

var eval = function(state, fm) {
  var current_frame = state.frame_top();
  // console.log(current_frame.type);
  if (current_frame.ip >= current_frame.get_stmts_length()) {
    if (current_frame.type == "main_frame") {
      // stage.play.highlight(state);
      stage.play.main_head_highlight_off();
      if (is_clear(state)) {
        console.log("goal");
        return;
      } else {
        console.log("retry");
        return;
      }
    } else if (current_frame.type == "loop_frame") {
      current_frame.dec_loop_count();
      console.log(current_frame.get_loop_count());
      stage.play.loop_end_highlight_off(state);
      if (current_frame.get_loop_count() == 0) {
        state.pop_frame();
        state.frame_top().inc_ip();
      } else {
        current_frame.reset_ip();
      }
    } else {
      var head = stage.play.play_progs.pop();
      stage.prog.remove_copy_blocks(head);
      state.pop_frame();
    }
  } else {
    stage.play.highlight(state);
    eval_block(current_frame, state, fm);
  }
  if (state.get_collision_flag()) {
    console.log("retry");
    return;
  }
  setTimeout(eval.bind(this), 500, state, fm);
}

var eval_block = function(frame, state, fm) {
  // console.log(frame);
  var stmt = frame.get_stmt();
  // console.log(stmt);
  var name = stmt.type;
  if (name == "advance") {
    console.log("advance");
    go_forward_player(state);
    frame.inc_ip();
  } else if (name == "rotate_right") {
    console.log("rotate_right");
    rotate_player_right(state);
    frame.inc_ip();
  } else if (name == "rotate_left") {
    console.log("rotate_left");
    rotate_player_left(state);
    frame.inc_ip();
  } else if (name == "main_loop" || name == "func_loop") {
    console.log("loop");
    state.push_frame(new Loop_frame(stmt.get_stmts(), stmt.get_loop_count()));
    frame = state.frame_top();
    frame.inc_ip();
  } else if (name == "func_call") {
    console.log("func_call : " + stmt.id);
    stage.prog.copy_func(stmt.id, stmt.get_args());
    var stmts = fm.get_func(stmt.id);
    exchang_param_arg(stmts.get_stmts(), stmt.get_args());
    state.push_frame(new Func_frame(stmt.id, stmts.get_stmts()));
    frame.inc_ip();
  } else {
    console.log("else : " + name);
    frame.inc_ip();
  }
}

var go_forward_player = function(state) {
  // console.log("go_forward_player");
  state.player.advance(state);
}

var rotate_player_right = function(state) {
  // console.log("rotate_player_right");
  state.player.rotate_right(state);
}

var rotate_player_left = function(state) {
  // console.log("rotate_player_left")
  state.player.rotate_left(state);
}

var exchang_param_arg = function(stmts, args) {
  // console.log("exchang_param_arg");
  for (var i = 0; i < stmts.length; i++) {
    if (stmts[i].type == "param") {
      var arg = args[stmts[i].id];
      stmts.splice(i, 1);
      var k = i;
      for (var j = 0; j < arg.get_stmts_length(); j++) {
        stmts.splice(i, 0, arg.get_stmt(j));
        i++;
      }
      i = k;
    } else if (stmts[i].type == "func_loop") {
      exchang_param_arg(stmts[i].get_stmts(), args);
    } else if (stmts[i] == "func_stmts") {
      exchang_param_arg(stmts[i].get_stmts(), args);
    }
  }
}

var is_clear = function(state) {
  // console.log("is_clear");
  if (stage.player.within(stage.goal, 16)) {
    return true;
  }
  return false;
}