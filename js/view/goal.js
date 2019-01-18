var Goal = enchant.Class.create(enchant.Sprite, {
  initialize: function(posX, posY) {
    enchant.Sprite.call(this, 16, 16);
    this.image = game.assets[GOAL];
    this.x = posX*MAP_BLOCK_SIZE;
    this.y = posY*MAP_BLOCK_SIZE;
  },
})