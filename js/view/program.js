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

var Program = enchant.Class.create({
    initialize: function() {
        this.functionNames = [];
        this.functionTokens = {};
    },

    // name: string
    // body: array of tokens
    add: function(name, body) {
        this.functionNames.push[name];
        this.functionBody[name] = body;
        return true;
    },

    get: function(name) {
        return this.functionBody[name];
    },

    getFunctionNames: function() {
        return this.functionNames;
    },

});

/* Local Variables: */
/* indent-tabs-mode: nil */
/* End: */
