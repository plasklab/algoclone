var ExecFrame = enchant.Class.create({
    initialize: function(type, slink, owner, code, start, end) {
	this.type = type;
	this.slink = slink;      // static link (引数を探すのに使う)
	this.dlink = undefined;  // dynamic link
	this.owner = owner;      // code owner (どのフレームのコードを実行するか)
	this.code = code;        // 実行するコード
	this.start = start;      // 実行を表示する最初のトークン
	this.end = end;          // 実行を表示する最後のトークン + 1
	this.pc = undefined;     // 実行中のトークン(LoopやFuncallは開括弧トークン)
    },

    getToken: function() {
	return this.code[this.pc];
    },

    normalAdvancePC: function() {
	if (this.pc == undefined)
	    this.pc = this.start;
	else {
	    var token = this.code[this.pc];
	    switch(token.type) {
	    case "Forward":
	    case "Left":
	    case "Right":
	    case "Param":
	    case "End":
		this.pc++;
		break;
	    case "Funcall":
	    case "Loop":
		this.pc = this.findEnd(this.pc + 1) + 1;
		break;
	    }
	}
    },

    advancePC: function() {
	this.normalAdvancePC();
    },
    
    hasNext: function() {
	return this.pc < this.end;
    },

    isHighlightOnly: function() {
	return false;
    },
    
    // pc 以降で最初の対応していない閉じ括弧の位置を返す．
    // pc はループや関数の内部の位置を想定している．
    findEnd: function(pc) {
	if (pc == undefined)
	    pc = this.pc;
	var nest = 0;
	while (true) {
	    var token = this.code[pc];
	    if (token.type == "Loop" || token.type == "Funcall")
		nest++;
	    else if (token.type == "End") {
		if (nest == 0)		
		    return pc;
		nest--;
	    }
	    pc++;
	}
    },
});

var computeCodeLength = function(code) {
    var pc = 0;
    while (pc < code.length && code[pc].type != "Blank")
        pc++;
    return pc;
};    

// 関数のフレーム
var FunctionFrame = enchant.Class.create(ExecFrame, {
    initialize: function(name, code, arg) {
	ExecFrame.call(this, "FunctionFrame", undefined, this, code, 0,
		       computeCodeLength(code));
	this.name = name;
	this.arg = arg;
    },
});

// ループのフレーム
//   関数や引数のフレーム内のコードを使う．
//   コードに範囲には開き括弧と閉じ括弧を含める．
var LoopFrame = enchant.Class.create(ExecFrame, {
    initialize: function(count, start, owner) {
	ExecFrame.call(this, "LoopFrame", owner, owner,
		       owner.code, start, owner.findEnd(start + 1) + 1);
	this.count = count;
	this.currentIteration = 1;
	this.pc = start;
    },

    ddepth: function() {
	var i = 0;
	for (var f = this; f != undefined; f = f.dlink)
	    i++;
	return i;
    },

    advancePC: function() {
	if (this.pc == this.start)
	    this.pc++;
	else {
	    this.normalAdvancePC();
	    if (this.pc == this.end) {
		if (this.currentIteration++ < this.count)
		    this.pc = this.start;
	    }
	}
    },

//    hasNext: function() {
//	return this.currentIteration < this.count || this.pc < this.end;
//    },

    isHighlightOnly: function() {
	return this.pc == this.start || this.pc == this.end - 1;
    }
});	

// 実引数のフレーム（独自の表示フレーム（ふきだし）を作る場合）
var ArgFrame = enchant.Class.create(ExecFrame, {
    initialize: function(code, slink) {
	ExecFrame.call(this, "ArgFrame", slink, this, code, 0, code.length);
    },
});

// 実引数のフレーム（独自の表示フレーム（ふきだし）を作らない場合）
//   関数や引数のフレーム内のコードを使う．
//   コードの範囲には開き括弧と閉じ括弧を含めない．
var PArgFrame = enchant.Class.create(ExecFrame, {
    initialize: function(start, slink, owner) {
	ExecFrame.call(this, "PArgFrame", slink, owner,
		       owner.code, start, owner.findEnd(start));
    },
});

// インタプリタ
//   view への動作指令はコールバックを使う
//   step が false を返すと実行終了
var Interp = enchant.Class.create({
    initialize: function(program, callbacks) {
	this.program = program;
	this.callbacks = callbacks;
	this.currentFrame = undefined;
	this.callFunction("main", undefined);
    },

    callFunction: function(name, arg) {
	var code = this.program.get(name);
	this.pushFrame(new FunctionFrame(name, code, arg));
    },

    pushFrame: function(frame) {
	frame.dlink = this.currentFrame;
	this.currentFrame = frame;
    },

    popFrame: function() {
	this.currentFrame = this.currentFrame.dlink;
    },

    findArg: function() {
	var frame = this.currentFrame;
	while (frame.type != "FunctionFrame")
	    frame = frame.slink;
	return frame.arg;
    },
    
    step: function() {
	var frame = this.currentFrame;
	frame.advancePC();
	while (!frame.hasNext()) {
	    if (frame.owner == frame) {
		this.callbacks.ret();
		if (frame.dlink == undefined)
		    return false;
		else { 
		    this.popFrame();
		    return true
		}
	    }
	    this.popFrame();
	    frame = this.currentFrame;
	    frame.advancePC();
	}
	var token = frame.getToken();
	
	this.callbacks.highlight(token);
	if (!frame.isHighlightOnly()) {
	    switch (token.type) {
	    case "Forward":
		this.callbacks.forward();
		break;
	    case "Left":
		this.callbacks.left();
		break;
	    case "Right":
		this.callbacks.right();
		break;
	    case "Loop":
		var count = token.count;
		this.pushFrame(new LoopFrame(count, frame.pc, frame.owner));
		break;
	    case "Funcall":
		var name = token.name;
		var arg = {
		    start: frame.pc + 1,
		    end: frame.findEnd(frame.pc + 1),
		    owner: frame.owner,
		    slink: frame,
		};
		this.callFunction(name, arg);
		break;
	    case "Param":
		var arg = this.findArg();
		if (token.createOwnFrame) {
		    var code = [];
		    for (i = arg.start; i < arg.end; i++)
			code.push(arg.owner.code[i]);
		    this.pushFrame(new ArgFrame(code, frame.slink));
		} else
		    this.pushFrame(new PArgFrame(arg.start, arg.slink,
						 arg.owner));
		break;
	    }
	}
	return true;
    },
});
