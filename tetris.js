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

    getTopCoordinate() {
        return Math.min(...this.blocks.map(block => block.position.y));
    }

    get TopBlocks(){
        return this.blocks.filter(block => block.position.y === this.getTopCoordinate());
    }

    getBottomCoordinate() {
        return Math.max(...this.blocks.map(block => block.position.y));
    }

    get BottomBlocks(){
        return this.blocks.filter(block => block.position.y === this.getBottomCoordinate());
    }

    getLeftCoordinate() {
        return Math.min(...this.blocks.map(block => block.position.x));
    }

    get LeftBlocks() {
        return this.blocks.filter(block => block.position.x === this.getLeftCoordinate());
    }

    getRightCoordinate() {
        return Math.max(...this.blocks.map(block => block.position.x));
    }

    get RightBlocks() {
        return this.blocks.filter(block => block.position.x === this.getRightCoordinate());
    }
}

class ShapeMovement{
    constructor(shape){
        this.shape = shape;
    }
    
    moveLeft() {
        this.shape.changePosition(new Position(this.shape.position.x -= this.shape.blockSize + this.shape.blockMargin, this.shape.position.y));
    }   
    
    moveRight() {
        this.shape.changePosition(new Position(this.shape.position.x += this.shape.blockSize + this.shape.blockMargin, this.shape.position.y));
    }
    
    moveDown(movementMode) {
        this.shape.changePosition(new Position(this.shape.position.x, this.shape.position.y += movementMode));
    }
    
}

const colors = {
    red: "#EB3349",
    // blue: "#24C6DC",
    green: "#93EDC7",
    yellow: "#EDDE5D",
    // grey:"#808080",
    purple:"#808080"
};

const hotkeys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

const movementMode = {
    slow: 0.2,
    fast: 0.5
};

const blockSize = 24;
const blockMargin = 1;

var canvas = document.querySelector("#tetris-game");
let canvasCenter = canvas.width / 2.0 + blockMargin;
var ctx = canvas.getContext("2d");

let blocksInLine = 12;

let drawInterval = null;

const defaultScoreEnroll = 3;
let score = 0;

document.querySelector("#total-player-score");
changeRecord(score);

let currentShape = new Shape(getRandomShape(shapeTypes), new Position(canvasCenter, 0), getRandomColor(colors), blockSize, blockMargin);
let movementSpeed = movementMode.fast;
let passedBlocks = [];

function play() {
    drawInterval = setInterval(startGameCycle, 15);
    let btn = document.querySelector("#play-btn");
    btn.setAttribute("disabled", "");
    canvas.focus();
}

function startGameCycle(){
    draw();
    if (isShapeReachBottomBorder(currentShape, canvas.height) || hasVerticalBlockBarriers(currentShape, passedBlocks)) {
        currentShape.blocks.forEach(block => passedBlocks.push(block));
        currentShape = getNextShape();
        clearLines();
        if (passedBlocks.some(block => block.position.y === 0))
            gameOver();
            //console.table(currentShape.blocks.map(block => block.position.y));
    }
    let shapeMovement = new ShapeMovement(currentShape);
    shapeMovement.moveDown(movementMode.fast);
}

function stop() {
    clearInterval(drawInterval);
    let btn = document.querySelector("#play-btn");
    btn.removeAttribute("disabled");
}

function gameOver() {
    stop();
    passedBlocks = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    changeScore(0);
    alert("Game over");
}

function getNextShape() {
    return new Shape(getRandomShape(shapeTypes), new Position(canvasCenter, 0), getRandomColor(colors), blockSize, blockMargin);
}

document.addEventListener('keydown', function (e) {
    if (e.target == canvas) {
        let shapeMovement = new ShapeMovement(currentShape);
        switch (e.keyCode) {
            case hotkeys.left:
                if (!isShapeReachLeftBorder(currentShape) && !hasLeftBlockBarriers(currentShape, passedBlocks))
                    shapeMovement.moveLeft();
                break;
            case hotkeys.right:
                if (!isShapeReachRightBorder(currentShape) && !hasRightBlockBarriers(currentShape, passedBlocks))
                    shapeMovement.moveRight();
                break;
            case hotkeys.up: {
                if (!isShapeReachLeftBorder(currentShape) && !isShapeReachRightBorder(currentShape))
                    currentShape.rotate();
                break;
            }
        }
    }
});

//border detections

function isShapeReachLeftBorder(shape) {
    return shape.blocks.some(block => 0 >= block.position.x - shape.blockSize);
}

function isShapeReachRightBorder(shape) {
    return shape.blocks.some(block => canvas.width <= block.position.x + shape.blockSize);
}

function isShapeReachBottomBorder(shape, border) {
    return shape.blocks.some(block => block.position.y === border - (shape.blockSize + shape.blockMargin) / 2.0);
}

class TetrisDraw{

    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    drawBlock(block) {
        this.ctx.beginPath();
        this.ctx.rect(block.position.x, block.position.y, block.size, block.size / 2.0);
        this.ctx.fillStyle = block.color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawShape(shape) {
        if (shape) {
            shape.blocks.forEach(block => drawBlock(block));
        }
    }

    drawPassedBlocks(passedBlocks) {
        if (passedBlocks && passedBlocks.length) {
            passedBlocks.forEach(block => drawBlock(block));
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        //here should be restoring previously added blocks
        //should be redraw not each time, but window clear every time
        drawPassedBlocks(passedBlocks);
        drawShape(currentShape);
    
        if (isShapeReachBottomBorder(currentShape, canvas.height) || hasVerticalBlockBarriers(currentShape, passedBlocks)) {
            currentShape.blocks.forEach(block => passedBlocks.push(block));
            currentShape = getNextShape();
            clearLines();
            if (passedBlocks.some(block => block.position.y > 0 && block.position.y <= block.size + block.blockMargin))
                gameOver();
        }
        moveShapeDown(currentShape, movementMode.fast);
    }



}

//drawing

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
}

// blocks detection

function hasVerticalBlockBarriers(shape, passedBlocks) {
    let shapeHorizontalCoordinates = shape.blocks.filter(block => block.position.x);
    let bottomBlocks = shape.BottomBlocks;
    var barriers = passedBlocks.filter(block => bottomBlocks.some(bblocks =>  
        bblocks.position.x === block.position.x && bblocks.position.y + (blockSize + blockMargin) / 2.0 === block.position.y));
    return barriers && barriers.length;
}

function hasLeftBlockBarriers(shape, passedBlocks) {
    let shapeLeftBlocks = shape.LeftBlocks;
    let bottomLeftBlock = Math.max(...shapeLeftBlocks.map(block => block.position.y));
    let leftBarriers = passedBlocks
        .filter(block => block.position.x + shape.blockSize + shape.blockMargin === shapeLeftBlocks[0].position.x)
        .filter(block => block.position.y >= bottomLeftBlock && block.position.y - (shape.blockSize + shape.blockMargin) * shapeLeftBlocks.length / 2.0 <= bottomLeftBlock);
    return leftBarriers && leftBarriers.length;
}

function hasRightBlockBarriers(shape, passedBlocks) {
    let shapeRightBlocks = shape.RightBlocks;
    let bottomRightBlock = Math.max(...shapeRightBlocks.map(block => block.position.y));
    let rightBarriers = passedBlocks
        .filter(block => block.position.x - shape.blockSize - shape.blockMargin === shapeRightBlocks[0].position.x)
        .filter(block => block.position.y >= bottomRightBlock && block.position.y - (shape.blockSize + shape.blockMargin) * shapeRightBlocks.length / 2.0 <= bottomRightBlock);
    return rightBarriers && rightBarriers.length;
}

//clear line logic

function clearLines() {
    let lines = [...new Set(passedBlocks.map(block => block.position.y))];
    lines.forEach(line => {
        let lineBlocks = passedBlocks.filter(block => block.position.y === line);
        if (isAllBlocksInLineHasSameColor(lineBlocks)) {
            let aboveLineBlocks  = passedBlocks.filter(block => block.position.y < line);       
            passedBlocks = getMovedDownBlocks(aboveLineBlocks, line).concat(passedBlocks.filter(block => block.position.y > line));
            score += 10;
            changeScore(score);
        }
    });
}

function isAllBlocksInLineHasSameColor(lineBlocks) {
    return lineBlocks.length == blocksInLine && lineBlocks.every(block => block.color === lineBlocks[0].color);
}

function getMovedDownBlocks(blocks, line) {
    return blocks.forEach(block => block.position.y += (block.size + blockMargin) / 2.0);
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

function changeScore(score) {
    let scoreElement = document.querySelector("#player-score");
    scoreElement.innerHTML = score;
}

function changeRecord(score) {
    if (!localStorage.userRecord || localStorage.userRecord < score) {
        localStorage.setItem("userRecord", score);
    }
    document.querySelector("#record-player-score").innerHTML = localStorage.userRecord;
}