
class Block {
    constructor(position, color, size = 23) {
        this.position = position;
        this.color = color;
        this.size = size;
    }
}

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const colors = {
    red: "#EB3349",
    blue: "#24C6DC",
    green: "#93EDC7",
    yellow: "#EDDE5D"
};

const arrowHotkeys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

const movementMode = {
    slow: 1,
    fast: 2
}

const blockSize = 23;
const blockMargin = 1;

var canvas = document.querySelector("#tetris-game");
var ctx = canvas.getContext("2d");

document.addEventListener('keydown', function (e) { //add top handler
    if (e.target == canvas) {
        switch (e.keyCode) {
            case arrowHotkeys.left:
                if (!isBorderReached(0, currentBlock.position.x, currentBlock.size) && !isBlockDetectedHorizontally(currentBlock, passedBlocks, true)) {
                    moveBlockHorizontally(currentBlock, true);
                }
                break;
            case arrowHotkeys.right:
                if (!isBorderReached(currentBlock.position.x, canvas.width - blockSize, currentBlock.size) && !isBlockDetectedHorizontally(currentBlock, passedBlocks, false)) {
                    moveBlockHorizontally(currentBlock, false);
                }
                break;
            case arrowHotkeys.down:
                moveBlockDown(currentBlock, movementMode.fast);
                break;
            case arrowHotkeys.up: break;//to do, block rotating
        }
    }
});

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
    passedBlocks = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    changeRecord(score);
    alert("Game over");
}

let currentBlock = new Block(new Position(canvas.width / 2, 0), getRandomBlockColor(colors));
let passedBlocks = [];
let movementSpeed = movementMode.fast;//change later


const defaultScoreEnroll = 3;
let score = 0;

//
document.querySelector("#total-player-score");
changeRecord(score);//for test
//

function drawBlock(block) {
    ctx.beginPath();
    ctx.rect(block.position.x, block.position.y, blockSize, blockSize / 2);
    ctx.fillStyle = block.color;
    ctx.fill();
    ctx.closePath();
}

function drawPassedBlocks(blocks) {
    if (blocks && blocks.length > 0) {
        blocks.forEach(block => {
            drawBlock(block);
        });
    }
}

function getNextBlock() {
    return new Block(new Position(canvas.width / 2, 0), getRandomBlockColor(colors));
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //here should be restoring previously added blocks
    //should be redraw not each time, but window clear every time
    drawPassedBlocks(passedBlocks);

    let verticalBarrier = getVerticalBarrierBlock(currentBlock, passedBlocks);
    if (verticalBarrier) {
        currentBlock.position.y = verticalBarrier.position.y - ((blockSize / 2) + blockMargin);
    }

    if (isBorderReached(currentBlock.position.y, canvas.height, currentBlock.size) || verticalBarrier) {
        passedBlocks.push(currentBlock);
        currentBlock = getNextBlock();

        changeScore();//just for testing score, changing should invoking when line has blocks with one color(move later)

        if (isAnyBlockOnPosition(passedBlocks)) {
            gameOver();
        }
    }

    drawBlock(currentBlock);
    moveBlockDown(currentBlock, movementMode.fast);//to change later
}

function isBlockDetectedHorizontally(currentBlock, passedBlocks, isLeft) {
    let isDetected = false;
    if (passedBlocks && passedBlocks.length > 0) {
        let sameLevelBlocks = passedBlocks.filter(block =>  block.position.y > currentBlock.position.y && currentBlock.position.y + blockSize + 1 > block.position.y);
        let horizontallBlocksBarrier;
        if(isLeft) {
            horizontallBlocksBarrier = sameLevelBlocks.filter(block => currentBlock.position.x > block.position.x  && currentBlock.position.x - blockSize - (blockMargin * 2) < block.position.x);
        } else {
            horizontallBlocksBarrier = sameLevelBlocks.filter(block => currentBlock.position.x < block.position.x  && currentBlock.position.x + blockSize + (blockMargin * 2) > block.position.x);
        }
        if (horizontallBlocksBarrier && horizontallBlocksBarrier.length) {
            isDetected = true;
        }
    }
    return isDetected;
}

function getVerticalBarrierBlock(currentBlock, passedBlocks) {
    let block;
    if (passedBlocks && passedBlocks.length > 0) {
        let blockBorder = passedBlocks.filter(block => currentBlock.position.y + blockSize >= block.position.y && currentBlock.position.x === block.position.x);
        if (blockBorder && blockBorder.length > 0) {
            block = blockBorder[0];
        }
    }
    return block;
}

// When all blocks has same color in line, delete blocks from line + add score
// function isLineOfBlockFilled(passedBlocks, yPosition) {
//     if (passedBlocks && passedBlocks.length > 0) {
//         let isFilled = false;
//         let lineBlocks = passedBlocks.filter(block => block.position.y === yPosition);
//         if(lineBlocks && lineBlocks.length > 0){
//             let lineSize = lineBlocks.reduce((block, res) => res += block.size);
//             console.log(lineSize);
//         }   
//     }
// }

function isAnyBlockOnPosition(passedBlocks) {
    return passedBlocks.some(block => block.position.y > 0 && block.position.y < blockSize);
}

//remind(something wrong here)
function isBorderReached(position, border, blockSize) {
    let borderReached = false;
    if (position >= border - blockSize + blockMargin)
        borderReached = true;
    return borderReached;
}

function moveBlockHorizontally(block, isLeftDirection) {
    if (isLeftDirection) {
        block.position.x -= blockSize + blockMargin;
    } else {
        block.position.x += blockSize + blockMargin;
    }
}

function moveBlockDown(block, movementMode) {
    block.position.y += movementMode;
}

//Color randomizer

function getRandomNumberOnInterval(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBlockColor(colors) {
    var colorKeys = Object.keys(colors);
    var colorIndex = getRandomNumberOnInterval(0, colorKeys.length - 1);
    return Object.values(colors)[colorIndex];
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