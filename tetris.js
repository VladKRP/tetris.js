
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

const colors = {
    red: "#EB3349",
    blue: "#24C6DC",
    green: "#93EDC7",
    yellow: "#EDDE5D",
    grey:"#808080",
    purple:"#808080"
};

const hotkeys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

const movementMode = {
    slow: 1,
    fast: 2
}

const blockSize = 24;
const blockMargin = 1;

var canvas = document.querySelector("#tetris-game");
var ctx = canvas.getContext("2d");


let drawInterval = null;

function play() {
    //issue when typing on button a lot of time
    drawInterval = setInterval(draw, 40);
    canvas.focus();
}

function stop() {
    clearInterval(drawInterval);
}

function gameOver() {
    stop();
    score = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    changeRecord(score);
    alert("Game over");
}

let canvasCenter = canvas.width / 2.0 + blockMargin;
let movementSpeed = movementMode.fast; //change later



class Shape {

    constructor(shapeType, position,  color, blockSize, blockMargin) {
        this.blocks = [];
        this.color = color || "";
        this.shapeType = shapeType || [];
        this.position = position || new Position(0,0);
        this.blockSize = blockSize || 0;
        this.blockMargin = blockMargin || 0;
    }

    create(){
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

    rotate(){
        this.shapeType = this.shapeType.map((col, i) => this.shapeType.map(row => row[i]));
        this.create();
    }

    changePosition(position){
        this.position = position;
        this.create();
    }
}


function moveShapeDown(shape, movementMode) {
    shape.changePosition(new Position(shape.position.x, shape.position.y += movementMode));
}

function moveShapeHorizontally(shape, isLeftDirection) {
    if (isLeftDirection) {
        shape.changePosition(new Position(shape.position.x -= blockSize + blockMargin, shape.position.y));
    } else {
        shape.changePosition(new Position(shape.position.x += blockSize + blockMargin, shape.position.y));
    }
}

let currentShape = new Shape(getRandomShape(shapeTypes), new Position(canvasCenter, 0), getRandomColor(colors), blockSize, blockMargin);
currentShape.create();

let passedShapes = [];


const defaultScoreEnroll = 3;
let score = 0;

//
document.querySelector("#total-player-score");
changeRecord(score); //for test
//


function drawBlock(block) {
    ctx.beginPath();
    ctx.rect(block.position.x, block.position.y, block.size, block.size / 2.0);
    ctx.fillStyle = block.color;
    ctx.fill();
    ctx.closePath();
}

function drawShape(shape) {
    if (shape && shape.blocks && shape.blocks.length) {
        shape.blocks.forEach(block => drawBlock(block));
    }
}

function drawPassedShapes(shapes) {
    if (shapes && shapes.length) {
        shapes.forEach(shape => drawShape(shape));
    }
}

function drawGrid() {
    for (var i = 0; i < canvas.height; i += ((blockSize + blockMargin) / 2.0)) {
        for (var j = 1; j < canvas.width; j += blockSize + blockMargin) {
            drawBlock(new Block(new Position(j, i), "#e5e5e5", blockSize));
        }
    }
}

function getNextShape() {
    var shape = new Shape(getRandomShape(shapeTypes), new Position(canvasCenter, 0), getRandomColor(colors), blockSize, blockMargin);
    shape.create();
    return shape;
}

document.addEventListener('keydown', function (e) { //add top handler
    if (e.target == canvas) {
        switch (e.keyCode) {
            case hotkeys.left:
                if (!isShapeReachHorizontalBorder(currentShape, blockSize, true) && !hasHorizontalBarriers(currentShape, passedShapes, true))//check horizontal blocks
                    moveShapeHorizontally(currentShape, true);
                break;
            case hotkeys.right:
                if (!isShapeReachHorizontalBorder(currentShape, blockSize, false))
                    moveShapeHorizontally(currentShape, false);
                break;

            case hotkeys.up:{
                if (!isShapeReachHorizontalBorder(currentShape, blockSize, false) && !isShapeReachHorizontalBorder(currentShape, blockSize, true))
                    currentShape.rotate();
                break; //to do, block rotating
            }
            
        }
    }

});

function isShapeReachHorizontalBorder(shape, blockSize, isLeftBorder) {
    let isBorderReached = false;
    if (isLeftBorder) {
        if (shape.blocks.some(block => 0 >= block.position.x - blockSize))
            isBorderReached = true;
    } else {
        if (shape.blocks.some(block => block.position.x + blockSize >= canvas.width))
            isBorderReached = true;
    }
    return isBorderReached;
}

function isShapeReachBottomBorder(shape, border, blockSize) {
    let borderReached = false;
    if (shape.blocks.some(block => block.position.y >= border - blockSize))
        borderReached = true;
    return borderReached;
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    //here should be restoring previously added blocks
    //should be redraw not each time, but window clear every time
    drawPassedShapes(passedShapes);
    drawShape(currentShape);

    if (isShapeReachBottomBorder(currentShape, canvas.height - blockMargin, (blockSize / 2.0)) || hasVerticalBarriers(currentShape, passedShapes)) {
        passedShapes.push(currentShape);
        currentShape = getNextShape();
    }
    
    moveShapeDown(currentShape, movementMode.fast);
}

function getPassedBlocks(passedShapes){
    let blocks = passedShapes.map(x => x.blocks);
    return blocks.reduce((x,y) => x.concat(y), []);
}

function getShapeLowestVerticalBlocks(shape){
    let shapeBlocksCoordinates = [...new Set(shape.blocks.map(block => block.position.x))];
    var blocksWithLowestVerticalPosition = shapeBlocksCoordinates.map(x => {
        return new Object(x, Math.max(...shape.blocks.filter(block => block.position.x === x).map(block => block.position.y)));
    });
    return shape.blocks.filter(block => 
        blocksWithLowestVerticalPosition.some(lblock => 
            lblock.x === block.position.x && lblock.position.y === block.position.y));
}

function hasVerticalBarriers(shape, passedShapes) {
    let hasBarriers = false;
    var lowestBlocks = getShapeLowestVerticalBlocks(shape);
    console.log(lowestBlocks);
    if (passedShapes && passedShapes.length) {
        let verticalBarriers =  getPassedBlocks(passedShapes)
                                    .filter(block => shapeBlocksCoordinates.some(coord => block.position.x === coord));
        console.table(verticalBarriers);
        let barriersMinVerticalCoord = Math.min(...verticalBarriers.map(block => block.position.y));      
        console.table("min" + barriersMinVerticalCoord);
                                    // .filter(block => {
                                    //     return blocksWithHighestVerticalPosition.every(position => {
                                    //             return position < block.position.y && position + (blockSize / 2.0) + blockMargin >=  block.position.y;
                                    //         })
                                    //     });
        // if(verticalBarriers && verticalBarriers.length)
        //     hasBarriers = true;
    }
    return hasBarriers;
}

function hasHorizontalBarriers(shape, passedShapes, isLeft){
    let hasBarrier = false;
    if(isLeft){
        let shapeMinHorizontalPosition = Math.min(...shape.blocks.map(block => block.position.x));
        let shapeMinVerticalPosition = Math.min(...shape.blocks.map(block => block.position.y));
        let minPositionBlocks = shape.blocks.filter(block => block.position.x === shapeMinHorizontalPosition);
        let height = minPositionBlocks.length * shape.blockSize + minPositionBlocks.length * shape.blockMargin;
        let horizontalBarriers = getPassedBlocks(passedShapes)
                                             .filter(block => block.position.x < shapeMinHorizontalPosition && block.position.x + blockSize + blockMargin >= shapeMinHorizontalPosition)
                                             .filter(block => block.position.y > shapeMinVerticalPosition && block.position.y <= shapeMinVerticalPosition + height );
        
                                             console.table(horizontalBarriers);
        if(horizontalBarriers && horizontalBarriers.length)
            hasBarrier = true;
    } else {
        let shapeMaxHorizontalPosition = Math.max(...shape.map(block => block.position.x));
        var shapeMinVerticalPosition = Math.min(...shape.blocks.map(block => block.position.y));
        var maxPositionBlocks = shape.blocks.filter(block => block.position.x === shapeMaxHorizontalPosition);
        var height = minPositionBlocks.length * shape.blockSize + minPositionBlocks.length * shape.blockMargin;
        var horizontalBarriers = getPassedBlocks(passedShapes)
                                             .filter(block => block.position.x > shapeMaxHorizontalPosition && block.position.x - blockSize - blockMargin < shapeMaxHorizontalPosition)
                                             .filter(block => block.position.y > shapeMaxHorizontalPosition && block.position.y <= shapeMaxHorizontalPosition + height );
        
    }
    return hasBarrier;
}

// function isBlockDetectedHorizontally(currentBlock, passedBlocks, isLeft) {
//     let isDetected = false;
//     if (passedBlocks && passedBlocks.length > 0) {
//         let sameLevelBlocks = passedBlocks.filter(block => block.position.y > currentBlock.position.y && currentBlock.position.y + blockSize + 1 > block.position.y);
//         let horizontallBlocksBarrier;
//         if (isLeft) {
//             horizontallBlocksBarrier = sameLevelBlocks.filter(block => currentBlock.position.x > block.position.x && currentBlock.position.x - blockSize - (blockMargin * 2) < block.position.x);
//         } else {
//             horizontallBlocksBarrier = sameLevelBlocks.filter(block => currentBlock.position.x < block.position.x && currentBlock.position.x + blockSize + (blockMargin * 2) > block.position.x);
//         }
//         if (horizontallBlocksBarrier && horizontallBlocksBarrier.length) {
//             isDetected = true;
//         }
//     }
//     return isDetected;
// }


//When all blocks has same color in line, delete blocks from line + add score
// function isAllBlockHasSameColor(passedBlocks, yPosition) {
//     if (passedBlocks && passedBlocks.length > 0) {
//         let isFilled = false;
//         let lineBlocks = passedBlocks.filter(block => block.position.y === yPosition);
//         if (lineBlocks && lineBlocks.length > 0) {
//             let lineSize = lineBlocks.reduce((block, res) => res += block.size);
//             console.log(lineSize);
//         }
//     }
// }

// function isAnyBlockOnPosition(passedBlocks) {
//     return passedBlocks.some(block => block.position.y > 0 && block.position.y < blockSize - blockMargin * 2);
// }

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