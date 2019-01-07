function main_parser (prog) {
  var prog_stack = [];
  prog_stack.push(new Main_stmts());
  var block = prog.next;
  // loopcount : ループのstartとendの対応が取れているか
  var loop_count = 0;
  // args : 関数呼び出しの引数がいくつかを覚えておく
  var args = [];

  while (block != null) {
  // for (var i = 0; i < prog.length; i++) {
    var stmts = prog_stack.pop();
    // var block = prog[i];
    if (block.type == "advance") {
      stmts.push_stmt(new Up());
    } else if (block.type == "rotate_right") {
      stmts.push_stmt(new Rotate_right());
    } else if (block.type == "rotate_left") {
      stmts.push_stmt(new Rotate_left());
    } else if (block.type == "loop_start") {
      prog_stack.push(stmts);
      /* ===== test ====== */
      // block.n = 2;
      /* ================= */
      stmts = new Main_loop(block.n);
      stmts.push_stmt(new Loop_start());
      stmts.stmts[stmts.stmts.length - 1].set_n(block.n);
      loop_count++;
    } else if (block.type == "loop_end") {
      stmts.push_stmt(new Loop_end());
      var p = prog_stack.pop();
      p.push_stmt(stmts);
      stmts = p;
      loop_count--;
    } else if (block.type == "func_id") {
      var fc = new Func_call(block.name);
      if (block.arg_type.length != 0) {
        args.push(block.arg_type.length);
        prog_stack.push(stmts);
        stmts = fc;
      } else {
        stmts.push_stmt(fc);
      }
    } else if (block.type == "arg_start") {
      prog_stack.push(stmts);
      stmts = new Func_arg(block.get_id());
    } else if (block.type == "arg_end") {
      args[args.length - 1]--;
      var fc = prog_stack.pop();
      fc.set_func_args(stmts.get_id(), stmts);
      stmts = fc;
      if (args[args.length - 1] == 0) {
        args.pop();
        var s = prog_stack.pop();
        s.push_stmt(stmts);
        stmts = s;
      }
    } else {
      console.log("main error : なんかよくわからんのが入ってるで : " + block.type);
      return null;
    }
    prog_stack.push(stmts);
    block = block.next;
  }

  if (loop_count != 0) {
    console.log("main error: loop_startとloop_endの対応が取れていない");
    return null;
  }
  return prog_stack.pop();
}

function func_parser (prog, name) {
  var prog_stack = [];
  prog_stack.push(new Func_stmts(name));
  // loopcount : ループのstartとendの対応が取れているか
  var loop_count = 0;
  // args : 関数呼び出しの引数がいくつかを覚えておく
  var args = [];
  // var prog = func_prog.prog;
  var block = prog.next;
  // for (var i = 0; i < prog.length; i++) {
  while (block != null) {
    var stmts = prog_stack.pop();
    // var block = prog[i];
    if (block.type == "advance") {
      stmts.push_stmt(new Up());
    } else if (block.type == "rotate_right") {
      stmts.push_stmt(new Rotate_right());
    } else if (block.type == "rotate_left") {
      stmts.push_stmt(new Rotate_left());
    } else if (block.type == "loop_start") {
      prog_stack.push(stmts);
      // block.n = 5;
      stmts = new Func_loop(block.n);
      stmts.push_stmt(new Loop_start());
      stmts.stmts[stmts.stmts.length - 1].set_n(block.n);
      loop_count++;
    } else if (block.type == "loop_end") {
      stmts.push_stmt(block);
      var p = prog_stack.pop();
      p.push_stmt(stmts);
      stmts = p;
      loop_count--;
    } else if (block.type == "func_id") {
      var fc = new Func_call(block.name);
      if (block.args != 0) {
        args.push(block.args);
        prog_stack.push(stmts);
        stmts = fc;
      } else {
        stmts.push_stmt(fc);
      }
    } else if (block.type == "param") {
      stmts.push_stmt(block);
    } else if (block.type == "arg_start") {
      prog_stack.push(stmts);
      stmts = new Func_arg(block.get_id());
    } else if (block.type == "arg_end") {
      args[args.length - 1]--;
      var fc = prog_stack.pop();
      fc.set_func_args(stmts.get_id(), stmts);
      stmts = fc;
      if (args[args.length - 1] == 0) {
        args.pop();
        var s = prog_stack.pop();
        s.push_stmt(stmts);
        stmts = s;
      }
    } else {
      console.log(func_prog.name + "error : なんかよくわからんのが入ってるで : " + block.type);
      return null;
    }
    prog_stack.push(stmts);
    block = block.next;
  }

  if (loop_count != 0) {
    console.log(func_prog.name + "error: loop_startとloop_endの対応が取れていない");
    return null;
  }
  return prog_stack.pop();
}