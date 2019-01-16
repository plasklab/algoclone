var Token = enchant.Class.create({
    initialize: function(type) {
        this.type = type;
    }
});

var TokenForward = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "Forward");
    }
});

var TokenLeft = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "Left");
    }
});

var TokenRight = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "Right");
    }
});

var TokenParam = enchant.class.create(Token, {
    initialize: function() {
        Token.call(this, "Param");
    }
});

var TokenLoop = enchant.Class.create(Token, {
    initialize: function(n) {
        Token.call(this, "Loop");
        this.count = n;    // Loop count (int)
    }
});

var TokenFuncall = enchant.Class.create(Token, {
    initialize: function(name) {
        Token.call(this, "Funcall");
        this.name = name;  // string
    },

    getName: function() {
        return this.name;
    },
});

var TokenBlockEnd = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "End");
    }
});

var TokenBlank = enchant.Class.create(Token, {
    initialize: function() {
        Token.call(this, "Blank");
    }
});

var ASTNode = enchant.Class.create({
    initialize: function(type) {
        this.type = type;
    }
});

var ASTActionNode = enchant.Class.create(ASTNode, {
    initialize: function(act) {  // act in {Forward, Left, Right}
        ASTNode.call(this, "Action");
        this.action = act;
    }
});

var ASTSeqNode = enchant.Class.create(ASTSeqNode, {
    initialize: function(subtrees) {
        ASTNode.call(this, "Sequence");
        this.body = subtrees;  // array
    }
});

var ASTLoopNode = enchant.Class.create(ASTNode, {
    initialize: function(n, body) {
        ASTNode.call(this, "Loop");
        this.count = n;
        this.body = body; // Seq
    }
});

var ASTFuncallNode = enchant.Class.create(ASTNode, {
    initialize: function(name, arg) {
        ASTNode.call(this, "Funcall");
        this.name = name;
        this.arg = arg;   // Seq
    }
});

var ASTParamNode = enchant.Class.create(ASTNode, {
    initialize: function() {
        ASTNode.call(this, "Param");
    }
});

var Program = enchant.Class.create({
    initialize: function() {
        this.functionNames = [];
        this.functionTokens = {};
        this.functionAst = {};
    },

    // name: string
    // body: array of tokens
    add: function(name, body) {
        this.functionNames.push[name];
        var ast = this.parse(body);
        if (ast == undefined)
            return false;
        this.functionTokens[name] = body;
        this.functionAst[name] = ast;
        return true;
    },

    getTokens: function(name) {
        return this.functionTokens[name];
    },

    getAst: function(name) {
        return this.functionAst[name];
    },
    
    getFunctionNames: function() {
        return this.functionNames;
    },

    // private
    parse: function(tokens) {
        var pos = 0;
        var parseSequence = function() {
            var astArray = [];

            while (pos < tokens.length) {
                var t = tokens[pos];
                switch (t.type) {
                case "Blank":
                    return astArray;
                case "Forward":
                case "Left":
                case "Right":
                    astArray.push(new ASTActionNode(t.type));
                    pos++;
                    break;
                case "Param":
                    astArray.push(new ASTParamNode());
                    pos++;
                    break;
                case "Loop":
                    var n = t.count;
                    pos++;
                    var body = parseSequence();
                    if (pos >= tokens.length || tokens[pos].type != "End")
                        throw new Error("parse error");
                    astArray.push(new ASTLoopNode(n, body));
                    pos++;
                case "Funcall":
                    var name = t.name;
                    if (functionNames.indexOf(name) != -1)
                        throw new Error("parse error: risk of infinite loop");
                    pos++;
                    var arg = parseSequence();
                    if (pos >= tokens.length || tokens[pos].type != "End")
                        throw new Error("parse error");
                    astArray.push(new ASTFuncallNode(n, arg));
                    pos++;
                case "End":
                    return astArray;
                }
            }
            return astArray;
        }
        try {
            var toplevel = parseSequence();
            if (pos < tokens.length && pos.type == "End")
                throw new Error("parse error");
            return new ASTSeqNode(toplevel);
        } catch (e) {
            alert("parse error");
            return undefined;
        }
    },
});

/* Local Variables: */
/* indent-tabs-mode: nil */
/* End: */
