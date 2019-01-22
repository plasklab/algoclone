var Token = enchant.Class.create({
    initialize: function(type) {
        this.type = type;
    }
});

var TokenForward = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "Forward");
    },

    clone: function() {
        return new TokenForward();
    }
});

var TokenLeft = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "Left");
    },

    clone: function() {
        return new TokenLeft();
    }
});

var TokenRight = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "Right");
    },
    
    clone: function() {
        return new TokenRight();
    }
});


var TokenParam = enchant.Class.create(Token, {
    // createOwnFrame: bool  If this creates its own frame for execution.
    initialize: function(createOwnFrame) {
        Token.call(this, "Param");
        this.createOwnFrame = createOwnFrame;
    },
    
    clone: function() {
        return new TokenParam(this.createOwnFrame);
    }
});

var TokenLoop = enchant.Class.create(Token, {
    initialize: function(n) {
        Token.call(this, "Loop");
        this.count = n;    // Loop count (int)
    },

    clone: function() {
        return new TokenLoop(this.count);
    }
});

var TokenFuncall = enchant.Class.create(Token, {
    initialize: function(name) {
        Token.call(this, "Funcall");
        this.name = name;  // string
    },

    clone: function() {
        return new TokenFuncall(this.name);
    }
});

var TokenFuncallE = enchant.Class.create(Token, {
    initialize: function(name) {
        Token.call(this, "FuncallE");
        this.name = name;
    },

    clone: function() {
        return new TokenFuncallE(this.name);
    }
});

var TokenBlockEnd = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "End");
    },

    clone: function() {
        return new TokenBlockEnd();
    },
});

var TokenBlank = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "Blank");
    },

    clone: function() {
        return new TokenBlank();
    },
});

var Program = enchant.Class.create({
    initialize: function() {
        this.functionNames = [];
        this.functionBody = {};
    },

    // name: string
    // body: array of tokens
    add: function(name, body) {
        this.functionNames.push[name];
        if (!this.checkProgram(body, name == "main")) {
            this.functionNames.pop();
            return false;
        }
        this.functionBody[name] = body;
        return true;
    },

    get: function(name) {
        return this.functionBody[name];
    },

    getFunctionNames: function() {
        return this.functionNames;
    },

    computeCodeLength: function(code) {
        var pc = 0;
        while (pc < code.length && code[pc].type != "Blank")
            pc++;
        return pc;
    },
    
    // private
    checkProgram: function(program, isMain) {
        var nest = 0;
        for (var i = 0; i < program.length; i++) {
            var token = program[i];
            if (token.type == "Blank")
                break;
            else if (token.type == "Loop" || token.type == "Funcall")
                nest++;
            else if (token.type == "End") {
                if (nest > 0)
                    nest--;
                else
                    return false;
            } else if (token.type == "Param") {
                if (isMain)
                    return false;
            }
        }
        return nest == 0;
    }
});


/* Local Variables: */
/* indent-tabs-mode: nil */
/* End: */
