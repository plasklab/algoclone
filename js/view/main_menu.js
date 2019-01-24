
var gameMode = undefined; //   "env" | "subst" | "argf"


var MenuButton = enchant.Class.create(enchant.Group, {
  initialize: function(text, width, height) {
    enchant.Group.call(this);
    
    this.width = width;
    this.height = height;

    this.colorObj = new enchant.Sprite(this.width, this.height);
    this.colorObj.backgroundColor = "white";
    console.log(this.colorObj);
    this.addChild(this.colorObj);

    this.label = new Label(text);
    this.label.width = width;
    this.label.height = height;
    this.label.textAlign = "center";
    this.label.y = 4;
    this.addChild(this.label);
  },

  setColor: function(c) {
    this.colorObj.backgroundColor = c;
  },

  setFont: function(f) {
    this.label.font = f;
  }
});

var MainMenu = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);
    
    var stageId = undefined;

    this.btnStart = new Button("Start");
    this.btnStart.moveTo(40, 300);
    this.btnStart.addEventListener("touchstart", function(e) {
      if (stageId == undefined) return;
      if (gameMode == undefined) return;
      console.log("stageId="+stageId);
      editScene = new EditScene(stageId);
      game.pushScene(editScene);
//	editScene.display();
    });
    this.addChild(this.btnStart);

    
    var COLOR_OFF = "#ADD8E6";
    var COLOR_ON ="#00BFFF";

    // Select stage buttons
    var NUM_OF_STAGES = 13;
    
    this.labelStage = new Label("Stage");
    this.labelStage.x = 80;
    this.labelStage.y = 50;
    this.labelStage.font = "32px cursive";
    this.addChild(this.labelStage);

    var mainMenu = this;
    this.btnListStageSelect = [];
    for (var i = 0; i < NUM_OF_STAGES; i++) {
      //var row = Math.floor(i / 6);
      //var col = i % 6;
      var row = 0;
      var col = i;
      var btn = new MenuButton(i+"", 24, 24);
      btn.setFont("21px cursive");
      btn.stageId = i;
      btn.x = 80+(col*28);
      btn.y = 90+(row*80);
      btn.addEventListener("touchstart", function(e) {
        stageId = this.stageId;
        for (var j = 0; j < NUM_OF_STAGES; j++) {
          mainMenu.btnListStageSelect[j].setColor(COLOR_OFF);
        }
        this.setColor(COLOR_ON);
      });
      btn.setColor(COLOR_OFF);
      this.btnListStageSelect.push(btn);
      this.addChild(btn);
    }



    this.labelGameMode = new Label("GameMode");
    this.labelGameMode.x = 80;
    this.labelGameMode.y = 140;
    this.labelGameMode.font = "32px cursive";
    this.addChild(this.labelGameMode);

    var mode = ["env", "subst", "argf"];
    this.btnListGameMode = [];
    for (var i = 0; i < mode.length; i++) {
      var btn = new MenuButton(mode[i], 64, 28);
      btn.setFont("21px cursive");
      btn.x = 80+(i*68);
      btn.y = 180;
      btn.modeName = mode[i];
      btn.setColor(COLOR_OFF);
      btn.addEventListener("touchstart", function(e) {
        gameMode = this.modeName;
        for (var j = 0; j < mainMenu.btnListGameMode.length; j++) {
          mainMenu.btnListGameMode[j].setColor(COLOR_OFF);
        }
        this.setColor(COLOR_ON);
      });
      this.btnListGameMode.push(btn);
      this.addChild(btn);
    }
  },
});
