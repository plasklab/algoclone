var maps = [];

function loadMap(id) {
    var mapdata;
    switch(id) {
    case 0:
        mapdata = mapdata1();
        break;
    case 1:
        mapdata = mapdata2();
        break;
    case 2:
        mapdata = mapdata3();
        break;
    }

    maps.push(mapdata);
}

/* Local Variables: */
/* indent-tabs-mode: nil */
/* End: */
