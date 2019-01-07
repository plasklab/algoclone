create_map = function (map_0, map_1, map_col, init_x, init_y, init_d, g_x, g_y) {
  var map = new Map(16, 16);
  map.image = game.assets[MAP];
  map.loadData(map_0, map_1);
  map.collisionData = map_col;

  map.init_x = init_x;
  map.init_y = init_y;
  map.init_direction = init_d;
  map.goal_x = g_x;
  map.goal_y = g_y;
  return map;
}