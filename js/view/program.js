var BlockToken = enchant.Class.create({
    initialize: function(type) {
	this.type = type;
    }
});

var BlockTokenForward = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, "f");
    }
});

var BlockTokenLeft = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, "l");
    }
});

var BlockTokenRight = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, "r");
    }
});

var BlockTokenLoop = enchant.Class.create(BlockToken, {
    initialize: function(n, body) {
	BlockToken.call(this, "L");
	this.count = n;    // Loop count (int)
	this.body = body;  // Array of BlockToken
    }
});

var BlockTokenFuncall = enchant.Class.create(BlockToken, {
    initialize: function(name, args) {
	BlockToken.call(this, "F");
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
