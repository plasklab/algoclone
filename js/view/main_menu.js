var MainMenu = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);
    
    var stageId = undefined;

    this.btnStart = new Button("Start");
    this.btnStart.moveTo(40, 300);
    this.btnStart.addEventListener("touchstart", function(e) {
      if (stageId == undefined) return;
      console.log("stageId="+stageId);
      editScene = new EditScene(stageId);
      game.pushScene(editScene);
//	editScene.display();
    });
    this.addChild(this.btnStart);


    // Select stage buttons
    var NUM_OF_STAGES = 13;
    this.btnListStageSelect = [];
    for (var i = 0; i < NUM_OF_STAGES; i++) {
      var row = Math.floor(i / 6);
      var col = i % 6;
      var btn = new Button("Stage "+i);
      btn.stageId = i;
      btn.moveTo(80+(col*90), 90+(row*80));
      btn.addEventListener("touchstart", function(e) {
        stageId = this.stageId;
      });
      this.btnListStageSelect.push(btn);
      this.addChild(btn);
    }
  },
});
