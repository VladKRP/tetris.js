let shapeTypes = [
    [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
    ],
    [
        [0, 0, 1],
        [0, 0, 1],
        [0, 1, 1]
    ],
    [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0]
    ],
    [
        [0, 0, 1],
        [0, 1, 1],
        [0, 0, 1]
    ]

];

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Block {
    constructor(position, color, size) {
        this.position = position;
        this.color = color;
        this.size = size;
    }
}

class Shape {

    constructor(shapeType, position, color, blockSize, blockMargin) {
        this.blocks = [];
        this.color = color || "";
        this.shapeType = shapeType || [];
        this.position = position || new Position(0, 0);
        this.blockSize = blockSize || 0;
        this.blockMargin = blockMargin || 0;
        this.create();
    }

    create() {
        this.blocks = [];
        for (var i = 0; i < this.shapeType.length; i++) {
            for (var j = 0; j < this.shapeType[i].length; j++) {
                if (this.shapeType[i][j])
                    this.blocks.push(
                        new Block(
                            new Position(
                                this.position.x + (this.blockSize + this.blockMargin) * j,
                                this.position.y + (i * (this.blockSize + this.blockMargin) / 2.0)
                            ), this.color, this.blockSize)
                    );
            }
        }
    }

    rotate() {
        let reversedMatrix = this.shapeType.reverse();
        this.shapeType = reversedMatrix[0].map((col, i) => reversedMatrix.map(row => row[i]));
        this.create();
    }

    changePosition(position) {
        this.position = position;
        this.create();
    }
}

const colors = {
    red: "#EB3349",
    blue: "#24C6DC",
    // green: "#93EDC7",
    // yellow: "#EDDE5D",
    // grey:"#808080",
    // purple:"#808080"
};

const hotkeys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

const movementMode = {
    slow: 1,
    fast: 1.3
};

const blockSize = 24;
const blockMargin = 1;

var canvas = document.querySelector("#tetris-game");
let canvasCenter = canvas.width / 2.0 + blockMargin;
var ctx = canvas.getContext("2d");

let blocksInLine = canvas.width / (blockSize + blockMargin);


let drawInterval = null;

const defaultScoreEnroll = 3;
let score = 0;

document.querySelector("#total-player-score");
changeRecord(score);

let currentShape = new Shape(getRandomShape(shapeTypes), new Position(canvasCenter, 0), getRandomColor(colors), blockSize, blockMargin);
let movementSpeed = movementMode.fast;
let passedBlocks = [];

function play() {
    drawInterval = setInterval(draw, 40);
    let btn = document.querySelector("#play-btn");
    btn.setAttribute("disabled","");
    canvas.focus();
}

function stop() {
    clearInterval(drawInterval);
    let btn = document.querySelector("#play-btn");
    btn.removeAttribute("disabled");
}

function gameOver() {
    stop();
    score = 0;
    passedBlocks = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    changeRecord(score);
    alert("Game over");
}

function getNextShape() {
    return new Shape(getRandomShape(shapeTypes), new Position(canvasCenter, 0), getRandomColor(colors), blockSize, blockMargin);
}

document.addEventListener('keydown', function (e) {
    if (e.target == canvas) {
        switch (e.keyCode) {
            case hotkeys.left:
                if (!isShapeReachLeftBorder(currentShape) && !hasHorizontalBarriers(currentShape, passedBlocks, true))
                    moveShapeLeft(currentShape);
                break;
            case hotkeys.right:
                if (!isShapeReachRightBorder(currentShape)  && !hasHorizontalBarriers(currentShape, passedBlocks, false))
                    moveShapeRight(currentShape);
                break;
            case hotkeys.up: {
                if (!isShapeReachLeftBorder(currentShape)  && !isShapeReachRightBorder(currentShape) )
                    currentShape.rotate();
                break;
            }
        }
    }
});

function isShapeReachLeftBorder(shape) {
    return shape.blocks.some(block => 0 >= block.position.x - shape.blockSize);
}

function moveShapeLeft(shape) {
    shape.changePosition(new Position(shape.position.x -= shape.blockSize + shape.blockMargin, shape.position.y));
}

function isShapeReachRightBorder(shape) {
    return shape.blocks.some(block => canvas.width <= block.position.x + shape.blockSize);
}

function moveShapeRight(shape) {
    shape.changePosition(new Position(shape.position.x += shape.blockSize + shape.blockMargin, shape.position.y));
}

function isShapeReachBottomBorder(shape, border) {
    return shape.blocks.some(block => block.position.y >= border - (shape.blockSize / 2.0) - shape.blockMargin);
}

function moveShapeDown(shape, movementMode) {
    shape.changePosition(new Position(shape.position.x, shape.position.y += movementMode));
}

function drawBlock(block) {
    ctx.beginPath();
    ctx.rect(block.position.x, block.position.y, block.size, block.size / 2.0);
    ctx.fillStyle = block.color;
    ctx.fill();
    ctx.closePath();
}

function drawShape(shape) {
    if (shape) {
        shape.blocks.forEach(block => drawBlock(block));
    }
}

function drawPassedBlocks(passedBlocks) {
    if (passedBlocks && passedBlocks.length) {
        passedBlocks.forEach(block => drawBlock(block));
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //here should be restoring previously added blocks
    //should be redraw not each time, but window clear every time
    drawPassedBlocks(passedBlocks);
    drawShape(currentShape);

    if (isShapeReachBottomBorder(currentShape, canvas.height) || hasVerticalBlockBarriers(currentShape, passedBlocks)) {
        currentShape.blocks.forEach(block => passedBlocks.push(block));
        currentShape = getNextShape();
        clearLines();
        if(passedBlocks.some(block => block.position.y > 0 && block.position.y <= block.size + block.blockMargin))//don't work
            gameOver();
    }
    moveShapeDown(currentShape, movementMode.fast);
}

// function drawGrid() {
//     for (var i = 0; i < canvas.height; i += ((blockSize + blockMargin) / 2.0)) {
//         for (var j = 1; j < canvas.width; j += blockSize + blockMargin) {
//             drawBlock(new Block(new Position(j, i), "#e5e5e5", blockSize));
//         }
//     }
// }


function getShapeLowestBlocksPosition(shape) {
    let shapeBlocksHorizontalCoordinates = [...new Set(shape.blocks.map(block => block.position.x))];
    return shapeBlocksHorizontalCoordinates.map(x => {
        return new Position(x, Math.max(...shape.blocks.filter(block => block.position.x === x).map(block => block.position.y)));
    });
}

function getVerticalBarriersBlocks(passedBlocks, positions) {
    return passedBlocks.filter(block => positions.some(bposition => bposition.x === block.position.x && block.position.y >= bposition.y && block.position.y - (blockSize / 2.0) - blockMargin <= bposition.y));
}

function hasVerticalBlockBarriers(shape, passedBlocks) {
    let hasBarriers = false;
    var lowestBlocksPosition = getShapeLowestBlocksPosition(shape);
    var barriers = getVerticalBarriersBlocks(passedBlocks, lowestBlocksPosition);
    if (barriers && barriers.length)
        hasBarriers = true;
    return hasBarriers;
}

function hasHorizontalBarriers(shape, passedBlocks, isLeft) {//refactor
    let hasBarrier = false;
    if (isLeft) {
        let shapeMinHorizontalPosition = Math.min(...shape.blocks.map(block => block.position.x));
        let shapeMinVerticalPosition = Math.min(...shape.blocks.map(block => block.position.y));
        let minPositionBlocks = shape.blocks.filter(block => block.position.x === shapeMinHorizontalPosition);
        let height = minPositionBlocks.length * shape.blockSize + minPositionBlocks.length * shape.blockMargin;
        let horizontalBarriers = passedBlocks
            .filter(block => block.position.x < shapeMinHorizontalPosition && block.position.x + shape.blockSize + shape.blockMargin >= shapeMinHorizontalPosition)
            .filter(block => block.position.y > shapeMinVerticalPosition && block.position.y <= shapeMinVerticalPosition + height);
        if (horizontalBarriers && horizontalBarriers.length)
            hasBarrier = true;
    } else {
        let shapeMaxHorizontalPosition = Math.max(...shape.blocks.map(block => block.position.x));
        var shapeMinVerticalPosition = Math.min(...shape.blocks.map(block => block.position.y));
        var maxPositionBlocks = shape.blocks.filter(block => block.position.x === shapeMaxHorizontalPosition);
        var height = maxPositionBlocks.length * shape.blockSize + maxPositionBlocks.length * shape.blockMargin;
        var horizontalBarriers = passedBlocks
            .filter(block => block.position.x >= shapeMaxHorizontalPosition && block.position.x - shape.blockSize - shape.blockMargin <= shapeMaxHorizontalPosition)
            .filter(block => block.position.y >= shapeMaxHorizontalPosition && block.position.y <= shapeMaxHorizontalPosition + height);

    }
    return hasBarrier;
}

function getLineBlocks(passedBlocks, line) {
    return passedBlocks.filter(block => block.position.y >= line && block.position.y - block.size - blockMargin <= line);
}

function clearLines() {
    let lines = [...new Set(passedBlocks.map(block => block.position.y))];
    lines.forEach(line => {
        let lineBlocks = getLineBlocks(passedBlocks, line);
        if (isAllBlocksInLineHasSameColor(lineBlocks)) {
            console.log("yep");
            let clearedLines = passedBlocks.filter(block => block.position.y < line);
            passedBlocks = getMovedDownBlocks(clearedLines, line);
            score += 10;
            changeScore(score);
        }
    });
}

function isAllBlocksInLineHasSameColor(lineBlocks) {
    let blocksHasSameColor = false;
    if (lineBlocks.length == blocksInLine && lineBlocks.every(block => block.color === lineBlocks[0].color)) {
        blocksHasSameColor = true;
    }
    return blocksHasSameColor;
}


function getMovedDownBlocks(passedBlocks, line) {
    let blocks = passedBlocks.filter(block => block.position.y > line);
    blocks.forEach(block => block.position.y -= block.size + block.blockMargin);
    return blocks;
}


//Random

function getRandomNumberOnInterval(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor(colors) {
    var colorKeys = Object.keys(colors);
    var colorIndex = getRandomNumberOnInterval(0, colorKeys.length - 1);
    return Object.values(colors)[colorIndex];
}

function getRandomShape(shapeTypes) {
    var shapeIndex = getRandomNumberOnInterval(0, shapeTypes.length - 1);
    return shapeTypes[shapeIndex];
}

//Score logic

function changeScore() {
    score += defaultScoreEnroll;
    let scoreElement = document.querySelector("#player-score");
    scoreElement.innerHTML = score;
}

function changeRecord(score) {
    if (!localStorage.userRecord || localStorage.userRecord < score) {
        localStorage.setItem("userRecord", score);
    }
    document.querySelector("#record-player-score").innerHTML = localStorage.userRecord;
}

function clearScore() {
    score = 0;
}