var DummyPlayScene = enchant.Class.create(enchant.Scene, {
    initialize: function(mapId, program) {
        enchant.Scene.call(this);
        this.backgroundColor = "white";

        map = game.createMap(mapId);
        this.map = map;
        this.addChild(map);

        this.engine = new Interp(program, {
            highlight: function(token) {
                console.log("highlight: "+token.type);
            },
            forward: function() {
                console.log("forward");
            },
            left: function() {
                console.log("left");
            },
            right: function() {
                console.log("right");
            }
        });

        var btnEdit = new Button("Edit");
        btnEdit.x = 32;
        btnEdit.y = map.y + map.height + 10;
        btnEdit.addEventListener("touchstart", function() {
            game.popScene();
        });
        this.addChild(btnEdit);

        var btnStep = new Button("Step");
        btnStep.x = 32;
        btnStep.y = map.y + map.height + 10 + 30;
        btnStep.engine = this.engine;
        btnStep.addEventListener("touchstart", function() {
            if (!this.engine.step())
                this.scene.removeChild(this);
        });
        this.addChild(btnStep);
    },
});


/* Local Variables: */
/* indent-tabs-mode: nil */
/* End: */
