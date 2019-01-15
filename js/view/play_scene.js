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

		this.state = new ProgramState(map);
		this.engine = new ExecutionEngine(map, program);

		// execute program
		this.execNextStep();
	},
	execNextStep: function() {
		// engine.execStep は，this.state を更新してから下のメソッドのどれかを実行する
		this.engine.execStep(this.state, {
			front: function() { /* キャラクタを前に移動 */ },
			right: function() { /* キャラクタを右に回転 */ },
			left: function() { /* キャラクタを左に回転 */ },
			callFunc: function() { /* 関数呼び出し */ },
			// ...
			end: function(status) { // the game is over.
				switch (status) {
					case END_STATUS_GOAL: { break; }
					case END_STATUS_NOT_GOAL: { break; }
					case END_STATUS_COLLIDED: { break; }
					default: console.log("error");
				}
			}, 
		});

		if (this.state.isExecuting) {
			// 1秒後（？）に this.execNextStep(); する
		} else {
			// 実行が何らかの理由で終わった時
		}
	},
});
