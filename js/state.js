var State = enchant.Class.create({
  initialize: function(player) {
    this.player = player;
    this.collision_flag = false;
    this.stack_frame = [];
  },

  get_collision_flag: function() {
    return this.collision_flag;
  },

  push_frame: function(frame) {
    this.stack_frame.push(frame);
  },

  pop_frame: function() {
    return this.stack_frame.pop();
  },

  frame_top: function() {
    return this.stack_frame[this.stack_frame.length - 1];
  },

  get_index_frame: function(index) {
    if (index >= this.stack_frame.length) {
      return null;
    }
    return this.stack_frame[index];
  },
});