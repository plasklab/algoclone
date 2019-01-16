var ExecFrame = enchant.Class.create({
    initialize: function(type, slink, owner, code, start, end) {
	this.type = type;
	this.slink = slink;
	this.dlink = undefined;
	this.owner = owner;   // code owner
	this.code = code;
	this.start = start;
	this.end = end;
	this.pc = undefined;
	this.nextPC = start;
    },

    getNextToken: function() {
	this.pc = this.nextPC;
	if (this.pc == this.end)
	    return undefined;
	return this.code[this.pc];
    },

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

    incPC: function() {
	this.nextPC = this.pc + 1;
    },

    jumpToEnd: function() {
	this.nextPC = this.findEnd(this.pc + 1) + 1;
    }
});

var computeCodeLength = function(code) {
    var pc = 0;
    while (pc < code.length && code[pc].type != "Blank")
        pc++;
    return pc;
};    

var FunctionFrame = enchant.Class.create(ExecFrame, {
    initialize: function(name, code, arg) {
	ExecFrame.call(this, "FunctionFrame", undefined, this, code, 0,
		       computeCodeLength(code));
	this.name = name;
	this.arg = arg;
    },
});

var LoopFrame = enchant.Class.create(ExecFrame, {
    initialize: function(count, start, owner) {
	ExecFrame.call(this, "LoopFrame", owner, owner,
		       owner.code, start, owner.findEnd(start + 1) + 1);
	this.count = count;
	this.currentIteration = 1;
	this.nextPC = start + 1;
    },

    rewindPC: function() {
	if (this.currentIteration++ >= this.count)
	    this.nextPC = this.end;
	else
	    this.nextPC = this.start + 1;
    }
});	

var ArgFrame = enchant.Class.create(ExecFrame, {
    initialize: function(code, slink) {
	ExecFrame.call(this, "ArgFrame", slink, this, code, 0, code.length);
    },
});

var PArgFrame = enchant.Class.create(ExecFrame, {
    initialize: function(start, slink, owner) {
	ExecFrame.call(this, "PArgFrame", slink, owner,
		       owner.code, start, owner.findEnd(start));
    },
});

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
	var token = frame.getNextToken();
	while (token == undefined) {
	    if (frame.type == "FunctionFrame" && frame.name == "main")
		return false;
	    this.popFrame();
	    frame = this.currentFrame;
	    token = frame.getNextToken();
	}

	this.callbacks.highlight(token);
	switch (token.type) {
	case "Forward":
	    this.callbacks.forward();
	    frame.incPC();
	    break;
	case "Left":
	    this.callbacks.left();
	    frame.incPC();
	    break;
	case "Right":
	    this.callbacks.right();
	    frame.incPC();
	    break;
	case "Loop":
	    if (!(frame.type == "LoopFrame" && frame.pc == 0)) {
		var count = token.count;
		this.pushFrame(new LoopFrame(count, frame.pc, frame.owner));
		frame.jumpToEnd();
	    } else
		frame.incPC();
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
	    frame.jumpToEnd();
	    break;
	case "Param":
	    var arg = this.findArg();
	    if (token.createOwnFrame) {
		var code = [];
		for (i = arg.start; i < arg.end; i++)
		    code.push(arg.owner.code[i]);
		this.pushFrame(new ArgFrame(code, frame.slink));
	    } else
		this.pushFrame(new PArgFrame(arg.start, arg.slink, arg.owner));
	    frame.incPC();
	    break;
	case "End":
	    if (frame.type == "LoopFrame") {
		this.callbacks.highlight(frame.code[0]);
		frame.rewindPC();
	    }
	    break;
	}
	return true;
    },
});
