
const EXIT_STATUS_CLEAR = 0;
const EXIT_STATUS_CONFLICTED = 1;
const EXIT_STATUS_NOT_REACHED = 2;

var run = function(main_prog, state, fm, fn_finish_game) {
  state.push_frame(new Main_frame(main_prog.get_stmts()));
  state.fn_finish_game = fn_finish_game;
  eval(state, fm);
}

var pop_and_remove_copy_blocks = function() {
  var head = stage.play.play_progs.pop();
  stage.prog.remove_copy_blocks(head);
};

var remove_all_copy_blocks = function() {
  while (true) {
    var head = stage.play.play_progs.pop();
    if (head === undefined) break;
    stage.prog.remove_copy_blocks(head);
  }
}

var eval = function(state, fm) {
  var current_frame = state.frame_top();
  // console.log(current_frame.type);
  if (current_frame.ip >= current_frame.get_stmts_length()) {
    if (current_frame.type == "main_frame") {
      //stage.play.main_head_highlight_off();
      if (is_clear(state)) {
        finish_game(state, EXIT_STATUS_CLEAR);
        return;
      } else {
        finish_game(state, EXIT_STATUS_NOT_REACHED);
        return;
      }
    } else if (current_frame.type == "loop_frame") {
      current_frame.dec_loop_count();
      if (current_frame.get_loop_count() == 0) {
        state.pop_frame();
        stage.play.play_progs.pop();
        state.frame_top().inc_ip();
      } else {
        current_frame.reset_ip();
      }
    } else {
      var head = stage.play.play_progs.pop();
      stage.prog.remove_copy_blocks(head);
      stage.play.end_func();
      state.pop_frame();
    }
  } else {
    eval_block(current_frame, state, fm);
  }
  if (state.get_collision_flag()) {
    finish_game(state, EXIT_STATUS_CONFLICTED);
    return;
  }
  setTimeout(eval.bind(this), 500, state, fm);
}

var eval_block = function(frame, state, fm) {
  var stmt = frame.get_stmt();
  var name = stmt.type;
  if (name == "advance") {
    console.log("advance");
    go_forward_player(state);
    //stage.play.highlight(frame, state);
    frame.inc_ip();
  } else if (name == "rotate_right") {
    console.log("rotate_right");
    rotate_player_right(state);
    //stage.play.highlight(frame, state);
    frame.inc_ip();
  } else if (name == "rotate_left") {
    console.log("rotate_left");
    rotate_player_left(state);
    //stage.play.highlight(frame, state);
    frame.inc_ip();
  } else if (name == "main_loop" || name == "func_loop") {
    console.log("loop");
    state.push_frame(new Loop_frame(stmt.get_stmts(), stmt.get_loop_count()));
    frame = state.frame_top();
    stage.play.play_progs.push(stage.prog.find_loop_start(frame));
    //stage.play.highlight(frame, state);
    frame.inc_ip();
  } else if (name == "func_call") {
    console.log("func_call : " + stmt.id);
    //stage.play.highlight(frame, state);
    stage.prog.copy_func(stmt.id, stmt.get_args());
    var stmts = fm.get_func(stmt.id);
    state.push_frame(new Func_frame(stmt.id, stmts.get_stmts(), stmt.get_args()));
    frame.inc_ip();
  } else {
    console.log("else : " + name);
    //stage.play.highlight(frame, state);
    frame.inc_ip();
  }
}

var go_forward_player = function(state) {
  state.player.advance(state);
}

var rotate_player_right = function(state) {
  state.player.rotate_right(state);
}

var rotate_player_left = function(state) {
  state.player.rotate_left(state);
}

var exchang_param_arg = function(stmts, args) {
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
  if (stage.player.within(stage.goal, 16)) {
    return true;
  }
  return false;
}


var finish_game = function(state, exit_status) {
  switch (exit_status) {
    case EXIT_STATUS_CLEAR: {
      console.log("result : clear");
      break;
    }
    case EXIT_STATUS_CONFLICTED: {
      console.log("result : conflicted");
      break;
    }
    case EXIT_STATUS_NOT_REACHED: {
      console.log("result : not reached");
      break;
    }
  }
  state.fn_finish_game(exit_status);
}