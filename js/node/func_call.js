var Func_call = enchant.Class.create({
  initialize: function(id) {
    this.type = "func_call";
    this.id = id;
    this.func_args = [];
  },

  set_func_args: function(index, arg) {
    this.func_args[index] = arg;
  },

  get_args: function() {
    return this.func_args;
  },

  display: function() {
    console.log("func_call : " + this.id);
    for (var i = 0; i < this.func_args.length; i++) {
      this.func_args[i].display();
    }
  },
});