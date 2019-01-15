var PlayScene = enchant.Class.create(enchant.Scene, {
    initialize: function(mapId, program) {
	enchant.Scene.call(this);
	this.backgroundColor = "white";

	map = game.createMap(mapId);
	this.map = map;
	this.addChild(map);

	var btnEdit = new Button("Edit");
	btnEdit.x = 32;
	btnEdit.y = map.y + map.height + 10;
	btnEdit.addEventListener("touchstart", function() {
	    game.popScene();
	});
	this.addChild(btnEdit);
    },
});
