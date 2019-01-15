var ProgramState = enchant.Class.create({
    initialize: function(map) {
      this.player = { x: map.init_x, y: map.init_y, direction: map.init_direction };
      this.isExecuting = true;
      this.functionStack = []; // array of FunctionFrame
    },
});

var FunctionFrame = enchant.Class.create({
    initialize: function(insns) {
        this.insns = insns; // 対象の関数の body の命令列
                            //（引数ブロックが実引数のブロックに置き換えられるならば既に置き換えられていることを想定）
        this.ip = 0;
    },
});