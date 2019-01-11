
var ControlPanel = function(scene) {
  this.targetScene = scene;

  // 実行画面から編集画面に戻るボタン
  this.btnTransitionToEditingMode = new Button("Edit");
  this.btnTransitionToEditingMode.moveTo(10, 380);
  var isEnabledChangingModeButton = false;
  this.btnTransitionToEditingMode.addEventListener("touchstart", function() {
    if (!isEnabledChangingModeButton) return;
    console.log("btnTransitionToEditingMode is touched");
  });

  this.enableChangingModeButton = function(callback) {
    isEnabledChangingModeButton = true;
    this.targetScene.addChild(this.btnTransitionToEditingMode);
    this.btnTransitionToEditingMode.addEventListener("touchstart", function() {
      if (!isEnabledChangingModeButton) return;
      console.log("btnTransitionToEditingMode is touched");
      callback();
      isEnabledChangingModeButton = false;
      //this.targetScene.removeChild(this.btnTransitionToEditingMode);
    });
  };

  this.disableChangingModeButton = function() {
    isEnabledChangingModeButton = false;
    this.targetScene.removeChild(this.btnTransitionToEditingMode);
  };
};