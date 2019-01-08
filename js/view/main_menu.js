var MainMenu = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);
    console.log("TEST MainMenu");

    this.btnSelectGameMode = new Button("env");

    this.btnSelectGameMode.moveTo(10, 90);
    this.btnSelectGameMode.addEventListener("touchstart", function(e) {
      // 0 <= stage_id <= 12
      var stage_id = 3;
      stage = new Stage(stage_id);
      game.pushScene(stage);
      stage.display();
    });
    this.addChild(this.btnSelectGameMode);
  },
});