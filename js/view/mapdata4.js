function mapdata4() {
    var gr;
    var gems;
    var totalGem;
    var init;
    var goal;

    gr = [
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,23,23,23,23,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,6,6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,6,23,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,6,6,23,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,6,6,23,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,6,6,23,23,23,23,23,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7,6,6,6,6,6,6,23,7,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,6,6,23,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,6,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,27,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]
    ];
    gems = [
        [-1,],
        [-1,],
        [-1,],
        [-1,],
        [-1,],
        [-1,],
        [-1,],
        [-1,],
        [-1,],
        [-1,],
    ];
    totalGem = 0;
    init = {x: 2, y: 2, dir: PLAYER_DIRECTION_RIGHT};
    goal = {x: 15, y: 12};
    var md = new MapData("line", gr, gems, totalGem, init, goal)
        
    return md;
}