var gridSize = 50;
var map = new Array(4);
for (let i = 0; i < map.length; i++) {
    map[i] = new Array(4);
}

function draw() {
    var useDot = document.querySelector("input");

    var canvas = document.querySelector("canvas");
    var c = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var w = canvas.width;
    var h = canvas.height;
    var xOffset = Math.round(w / 2 - (map.length * gridSize) / 2);
    var yOffset = Math.round(h / 2 - (map[0].length * gridSize) / 2);
    var isPanning = false;
    var isPlacing = false;
    var isErasing = false;
    document.oncontextmenu = new Function("return false;");
    var lastMousePos = { x: 0, y: 0 };
    var dotSize = 0.15;
    var useDotGrid = true;

    var grid = new Image();
    grid.src = "./assets/grid-line.png";

    var dot = new Image();
    dot.src = "./assets/dot.png";

    var tile = new Image();
    tile.src = "./assets/tile.png";

    function Update() {
        c.clearRect(0, 0, canvas.width, canvas.height);

        for (var x = 0; x < canvas.width / gridSize + 4; x++) {
            for (var y = 0; y < canvas.height / gridSize + 4; y++) {
                c.globalAlpha = 0.2;
                if (useDotGrid)
                    c.drawImage(
                        dot,
                        -2 * gridSize + (xOffset % gridSize) + x * gridSize - gridSize * 0.5 * dotSize,
                        -2 * gridSize + (yOffset % gridSize) + y * gridSize - gridSize * 0.5 * dotSize,
                        gridSize * dotSize,
                        gridSize * dotSize,
                    );
                else
                    c.drawImage(
                        grid,
                        -2 * gridSize + (xOffset % gridSize) + x * gridSize - gridSize * 0.5,
                        -2 * gridSize + (yOffset % gridSize) + y * gridSize - gridSize * 0.5,
                        gridSize,
                        gridSize,
                    );
                c.globalAlpha = 1;
            }
        }

        for (var x = 0; x <= map.length; x++) {
            for (var y = 0; y <= map[0].length; y++) {
                if (useDotGrid)
                    c.drawImage(
                        dot,
                        xOffset + x * gridSize - gridSize * 0.5 * dotSize,
                        yOffset + y * gridSize - gridSize * 0.5 * dotSize,
                        gridSize * dotSize,
                        gridSize * dotSize,
                    );
                else
                    c.drawImage(
                        grid,
                        xOffset + x * gridSize - gridSize * 0.5,
                        yOffset + y * gridSize - gridSize * 0.5,
                        gridSize,
                        gridSize,
                    );
            }
        }

        for (var x = 0; x < map.length; x++) {
            for (var y = 0; y < map[0].length; y++) {
                if (map[x][y] != null && map[x][y] != 0) {
                    c.drawImage(tile, xOffset + x * gridSize, yOffset + y * gridSize, gridSize, gridSize);
                }
            }
        }
    }
    useDot.addEventListener("mousedown", function(e) {
        e.preventDefault();
        if (useDot.checked) useDotGrid = false;
        else useDotGrid = true;
        Update();
    });

    window.addEventListener("resize", function(e) {
        handleResize();
        Update();
    });

    canvas.addEventListener("mousedown", function(e) {
        handleClick(e);
        Update();
    });

    canvas.addEventListener("wheel", function(e) {
        handleWheel(e);
        Update();
    });

    canvas.addEventListener("mousemove", function(e) {
        handleMouseMove(e);
        Update();
    });

    canvas.addEventListener("mouseup", function(e) {
        handleMouseUp(e);
        Update();
    });

    let up = document.getElementById("up");
    let down = document.getElementById("down");
    let left = document.getElementById("left");
    let right = document.getElementById("right");

    up.addEventListener("mousedown", function(e) {
        changeMapSize(0, 1);
        Update();
    });

    down.addEventListener("mousedown", function(e) {
        changeMapSize(0, -1);
        Update();
    });

    right.addEventListener("mousedown", function(e) {
        changeMapSize(1, 0);
        Update();
    });

    left.addEventListener("mousedown", function(e) {
        changeMapSize(-1, 0);
        Update();
    });

    function changeMapSize(relativeX, relativeY) {
        let newMap = new Array(map.length + Math.abs(relativeX));
        for (let i = 0; i < newMap.length; i++) {
            newMap[i] = new Array(map[0].length + Math.abs(relativeY));
            for (let j = 0; j < newMap[i].length; j++) {
                if (i < map.length && j < map[0].length) newMap[i][j] = map[i][j];
                else newMap[i][j] = 0;
            }
        }
        map = newMap;
        if (relativeX < 0) setMapOffset(1, 0);
        if (relativeY > 0) setMapOffset(0, 1);
    }

    function setMapOffset(x, y) {
        let newMap = new Array(map.length);
        for (let i = 0; i < newMap.length; i++) {
            newMap[i] = new Array(map[0].length);
            for (let j = 0; j < newMap[i].length; j++) {
                if (i - x >= 0 && j - y >= 0 && i - x < map.length && j - y < map[0].length)
                    newMap[i][j] = map[i - x][j - y];
            }
        }
        xOffset -= x * gridSize;
        yOffset -= y * gridSize;
        map = newMap;
    }

    function handleResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var w = canvas.width;
        var h = canvas.height;
    }

    function handleWheel(e) {
        var before = {
            x: lastMousePos.x - xOffset,
            y: lastMousePos.y - yOffset,
            gsize: gridSize,
        };
        if (gridSize - e.deltaY < 5) gridSize = 5;
        else if (gridSize - e.deltaY > 300) gridSize = 300;
        else gridSize -= e.deltaY;
        var after = {
            xDif: (before.x * gridSize) / before.gsize,
            yDif: (before.y * gridSize) / before.gsize,
            gsize: gridSize,
        };
        xOffset += Math.round(before.x - after.xDif);
        yOffset += Math.round(before.y - after.yDif);
    }

    function handleMouseUp(e) {
        if (e.which == 2) isPanning = false;
        else if (e.which == 1) isPlacing = false;
        else if (e.which == 3) isErasing = false;
    }

    function handleMouseMove(e) {
        var isPanningOutOfBound = false;
        if (isPanning) {
            //TODO : Changer le bug des bords x et y
            if (
                xOffset - (lastMousePos.x - e.pageX) > w ||
                xOffset - (lastMousePos.x - e.pageX) < -map.length * gridSize ||
                yOffset - (lastMousePos.y - e.pageY) > h ||
                yOffset - (lastMousePos.y - e.pageY) < -map[0].length * gridSize
            ) {
                return;
            } else {
                xOffset -= lastMousePos.x - e.pageX;
                yOffset -= lastMousePos.y - e.pageY;
            }
            ///////////////////////////////////
        } else if (isPlacing) {
            var mapX = (e.pageX - xOffset - ((e.pageX - xOffset) % gridSize)) / gridSize;
            var mapY = (e.pageY - yOffset - ((e.pageY - yOffset) % gridSize)) / gridSize;
            if (
                mapX >= 0 &&
                mapX < map.length &&
                mapY >= 0 &&
                mapY < map[0].length &&
                (map[mapX][mapY] == null || map[mapX][mapY] == 0)
            ) {
                map[mapX][mapY] = 1;
            }
        } else if (isErasing) {
            var mapX = (e.pageX - xOffset - ((e.pageX - xOffset) % gridSize)) / gridSize;
            var mapY = (e.pageY - yOffset - ((e.pageY - yOffset) % gridSize)) / gridSize;
            if (
                mapX >= 0 &&
                mapX < map.length &&
                mapY >= 0 &&
                mapY < map[0].length &&
                map[mapX][mapY] != null &&
                map[mapX][mapY] != 0
            ) {
                map[mapX][mapY] = 0;
            }
        }
        if (!isPanningOutOfBound) lastMousePos = { x: e.pageX, y: e.pageY };
    }

    function handleClick(e) {
        if (e.which == 1) {
            isPlacing = true;
            var mapX = (e.pageX - xOffset - ((e.pageX - xOffset) % gridSize)) / gridSize;
            var mapY = (e.pageY - yOffset - ((e.pageY - yOffset) % gridSize)) / gridSize;
            if (
                mapX >= 0 &&
                mapX < map.length &&
                mapY >= 0 &&
                mapY < map[0].length &&
                (map[mapX][mapY] == null || map[mapX][mapY] == 0)
            ) {
                map[mapX][mapY] = 1;
            }
        } else if (e.which == 2) {
            isPanning = true;
        } else if (e.which == 3) {
            isErasing = true;
            var mapX = (e.pageX - xOffset - ((e.pageX - xOffset) % gridSize)) / gridSize;
            var mapY = (e.pageY - yOffset - ((e.pageY - yOffset) % gridSize)) / gridSize;
            if (
                mapX >= 0 &&
                mapX < map.length &&
                mapY >= 0 &&
                mapY < map[0].length &&
                map[mapX][mapY] != null &&
                map[mapX][mapY] != 0
            ) {
                map[mapX][mapY] = 0;
            }
        }
        lastMousePos = { x: e.pageX, y: e.pageY };
    }
}
