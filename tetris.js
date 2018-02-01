
const blockSize = 20;

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
    slowMode:1,
    fastMode:3
}

var canvas = document.querySelector("#tetris-game");
var ctx = canvas.getContext("2d");

document.addEventListener('keydown', function (e) { //add top-bottom handlers
    if (e.target == canvas) {
        switch (e.keyCode) {
            case arrowHotkeys.left:
                currentBlock.position.x -= blockSize;
                break;
            case arrowHotkeys.right:
                currentBlock.position.x += blockSize;
                break;
            case arrowHotkeys.down:
                currentBlock.movementSpeed = movementMode.fastMode;
                break;
        }
    }
});

document.addEventListener('keyup', function (e) {
    if (e.target == canvas) {
        if(e.keyCode === arrowHotkeys.down) {
            currentBlock.movementSpeed = movementMode.slowMode;
        }
    }
});

let currentBlock = {
    position: {
        x: canvas.width / 2,
        y: 0
    },
    color: getRandomBlockColor(colors),
    movementSpeed: movementMode.slowMode
};

let drawInterval = null;

function play() {
    drawInterval = setInterval(draw, 40);
    canvas.focus();
}

function stop() {
    clearInterval(drawInterval)
}

function drawBlock(currentBlock) {
    ctx.beginPath();
    ctx.rect(currentBlock.position.x, currentBlock.position.y, blockSize, blockSize / 2);
    ctx.fillStyle = currentBlock.color;
    ctx.fill();
    ctx.closePath();
}

function setBlockInitialPosition() {
    currentBlock.position.x = canvas.width / 2;
    currentBlock.position.y = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isBorderReached(currentBlock.position, canvas.height)) {
        setBlockInitialPosition();
        currentBlock.color = getRandomBlockColor(colors);
    }
    drawBlock(currentBlock);
    currentBlock.position.y = currentBlock.position.y + movementMode.slowMode;
}


function isBorderReached(position, border) {
    let borderReached = false;
    if (position.y >= border - blockSize)
        borderReached = true;
    return borderReached;
}

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