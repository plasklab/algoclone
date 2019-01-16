const BLANK_TOKEN = "b";
const FORWORD_TOKEN = "f";
const LEFT_TOKEN = "l";
const RIGHT_TOKEN = "r";
const LOOP_TOKEN = "L";
const FUNCALL_TOKEN = "F";

var BlockToken = enchant.Class.create({
    initialize: function(type) {
	this.type = type;
    }
});

var BlockTokenBlank = enchant.Class.create(BlockToken, {
    initialize: function() {
        BlockToken.call(this, BLANK_TOKEN);
    }
})

var BlockTokenForward = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, FORWORD_TOKEN);
    }
});

var BlockTokenLeft = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, LEFT_TOKEN);
    }
});

var BlockTokenRight = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, RIGHT_TOKEN);
    }
});

var BlockTokenLoop = enchant.Class.create(BlockToken, {
    initialize: function(n, body) {
	BlockToken.call(this, LOOP_TOKEN);
	this.count = n;    // Loop count (int)
	this.body = body;  // Array of BlockToken
    }
});

var BlockTokenFuncall = enchant.Class.create(BlockToken, {
    initialize: function(name, args) {
	BlockToken.call(this, FUNCALL_TOKEN);
	this.name = name;  // String (dia, spade, heart, clover)
	this.args = args;  // Array of Array of BLockToken
    }
});

var Program = enchant.Class.create({
    initialize: function() {
	this.functionDefs = {};
	this.functionNames = [];
    },

    add: function(name, body) {
	this.functionDefs[name] = body;
	this.functionNames.push[name];
    },

    get: function(name) {
	return this.functionDefs[name];
    },

    getFunctionNames: function() {
	return this.functionNames;
    }
});
