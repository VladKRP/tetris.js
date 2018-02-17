/** @constant {Array<Array<Array<number>>>} */
const shapeTypes = [
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

/** @constant {Object} */
const colors = {
    red: "#EB3349",
    blue: "#24C6DC",
    green: "#93EDC7",
    yellow: "#EDDE5D",
    grey:"#808080",
    purple:"#808080"
};

/** @constant {Object} */
const hotkeys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

/** @constant {Object} */
const movementMode = {
    slow: 0.2,
    fast: 0.5
};

/** @constant {number}*/
const blockSize = 24;

/** @constant {number} */
const blockMargin = 1;

/**
 *Позиция в двумерной системе координат
*/
class Position {
    /**
     * @param  {number} x  позиция по оси х
     * @param  {number} y  позиция по оси y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/**
 *Блок, как отдельная часть фигуры
*/
class Block {
    /**
     * @param  {Position} position  координаты в двумерной системе
     * @param  {string} color  цвет блока
     * @param  {number} size  размер блока
     */
    constructor(position, color, size) {
        this.position = position;
        this.color = color;
        this.size = size;
    }
}

/**
 *Фигурка в тетрисе
*/
class Shape {
    /**
     * @param  {array} shapeType  тип фигуры
     * @param  {Position} position верхний левый угол фигуры
     * @param  {number} color  цвет фигурки
     * @param  {number} blockSize  размер блоков в фигуре
     * @param  {number} blockMargin  отступ между блоками
     */
    constructor(shapeType, position, color, blockSize, blockMargin) {
        this.blocks = [];
        this.color = color || "";
        this.shapeType = shapeType || [];
        this.position = position || new Position(0, 0);
        this.blockSize = blockSize || 0;
        this.blockMargin = blockMargin || 0;
        this.create();
    }
    /**
     *Генерация фигуры из отдельныз блоков
     */
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
    /**
     * Поворот фигуры
     */
    rotate() {
        let reversedMatrix = this.shapeType.reverse();
        this.shapeType = reversedMatrix[0].map((col, i) => reversedMatrix.map(row => row[i]));
        this.create();
    }

    /**
     * Изменение координат всей фигуры
     * @param  {Position} position  координаты фигуры
     */
    changePosition(position) {
        this.position = position;
        this.create();
    }

    /**
     * Получение наименьшей координаты фигуры по оси y
     * @returns {number} y
     */
    _getTopCoordinate() {
        return Math.min(...this.blocks.map(block => block.position.y));
    }

    /**
     * Получение блоков с наименьшей координатой фигуры по оси y
     * @returns {Array<Block>} верхние блоки 
     */
    get TopBlocks(){
        return this.blocks.filter(block => block.position.y === this._getTopCoordinate());
    }

    /**
     * Получение наивысшей координаты по оси y
     * @returns {number} y
     */
    _getBottomCoordinate() {
        return Math.max(...this.blocks.map(block => block.position.y));
    }

     /**
     * Получение блоков с наивысшей координатой по оси y
     * @returns {Array<Block>} нижние блоки 
     */
    get BottomBlocks(){
        let xCoordinates = [...new Set(this.blocks.map(block => block.position.x))];
        let bottomBlocksCoord = xCoordinates.map(x => new Position(x, Math.min(...this.blocks.filter(block => block.position.x === x).map(block => block.position.y))));
        return this.blocks.filter(block => bottomBlocksCoord.filter(bbcoord => bbcoord.x === block.position.x && bbcoord.y === block.position.y));
    }

    /**
     * Получение наименьшей координаты по оси х
     * @returns {number} x
     */
    _getLeftCoordinate() {
        return Math.min(...this.blocks.map(block => block.position.x));
    }

    /**
     * Получение блоков с наименьшей координатой по оси х
     * @returns {Array<Block>} левые блоки 
     */
    get LeftBlocks() {
        return this.blocks.filter(block => block.position.x === this._getLeftCoordinate());
    }

       /**
     * Получение наибольшей координаты по оси х
     * @returns {number} x
     */
    _getRightCoordinate() {
        return Math.max(...this.blocks.map(block => block.position.x));
    }

      /**
     * Получение блоков с гаибольшей координатой по оси х
     * @returns {Array<Block>} правые блоки 
     */
    get RightBlocks() {
        return this.blocks.filter(block => block.position.x === this._getRightCoordinate());
    }
}

/**
 * Представляет собой класс для изменения положения фигуры
 */
class ShapeMovement{
    /**
     * @param  {Shape} shape фигура
     */
    constructor(shape){
        this.shape = shape;
    }
    
    /**
     * Смещение фигуры влево
     */
    moveLeft() {
        this.shape.changePosition(new Position(this.shape.position.x -= this.shape.blockSize + this.shape.blockMargin, this.shape.position.y));
    }   
    
    /**
     * Смещение фигуры вправо
     */
    moveRight() {
        this.shape.changePosition(new Position(this.shape.position.x += this.shape.blockSize + this.shape.blockMargin, this.shape.position.y));
    }
    
    /**
     * Смещение фигуры вниз
     * @param  {number} movementMode скорость смещения
     */
    moveDown(movementMode) {
        this.shape.changePosition(new Position(this.shape.position.x, this.shape.position.y += movementMode));
    }
    
}


/** @global */
var canvas = document.querySelector("#tetris-game");
/** @global */
let canvasCenter = canvas.width / 2.0 + blockMargin;
/** @global */
var ctx = canvas.getContext("2d");

/** @global */
let currentShape = new Shape(getRandomShapeType(shapeTypes), new Position(canvasCenter, 0), getRandomColor(colors), blockSize, blockMargin);
/** @global */
let movementSpeed = movementMode.fast;
/** @global */
let passedBlocks = [];
/** @global */
let blocksInLine = 12;
/** @global */
let drawInterval = null;
/** @global */
const defaultScoreEnroll = 10;
/** @global */
let score = 0;

document.querySelector("#total-player-score");
changeRecord(score);

/**
 * Запуск игры
 */
function play() {
    drawInterval = setInterval(startGameCycle, 15);
    let btn = document.querySelector("#play-btn");
    btn.setAttribute("disabled", "");
    canvas.focus();
}

/**
 * Главный игровой цикл с отрисовкой, движением фигуры вниз и проверкой на преграды снизу
 */
function startGameCycle(){
    draw();
    if (isShapeReachBottomBorder(currentShape, canvas.height) || hasVerticalBlockBarriers(currentShape, passedBlocks)) {
        currentShape.blocks.forEach(block => passedBlocks.push(block));
        currentShape = getNextShape();
        clearLines();
        if (passedBlocks.some(block => block.position.y >= 0 && block.position.y <= (block.size + blockMargin) / 2.0))
            gameOver();
    }
    let shapeMovement = new ShapeMovement(currentShape);
    shapeMovement.moveDown(movementMode.fast);
}

/**
 * Остановка игры
 */
function stop() {
    clearInterval(drawInterval);
    let btn = document.querySelector("#play-btn");
    btn.removeAttribute("disabled");
}

/**
 * Конец игры
 */
function gameOver() {
    stop();
    passedBlocks = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    changeScore(0);
    alert("Game over");
}

/**
 * Получение следующей случайной фигуры
 */
function getNextShape() {
    return new Shape(getRandomShapeType(shapeTypes), new Position(canvasCenter, 0), getRandomColor(colors), blockSize, blockMargin);
}

/**
 * Глобальный обработчик событий (нажатие игровых клавиш)
 * @param  {number} 'keydown' - код нажатой клавиши
 */
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
                let rotatedShape = new Shape();
                Object.assign(rotatedShape,currentShape);
                rotatedShape.rotate();
                if (!isShapeReachLeftBorder(rotatedShape) && !isShapeReachRightBorder(rotatedShape))
                    currentShape = rotatedShape;
                break;
            }
        }
    }
});

/**
 * Проверка достигнута ли левая граница игрового экрана
 * @param  {Shape} shape - текущая фигура
 * @returns  {Boolean} возвращает True, если достигнут левый бок игрового экрана, иначе False
 */

function isShapeReachLeftBorder(shape) {
    return shape.blocks.some(block => 0 >= block.position.x - shape.blockSize);
}

/**
 * Проверка достигнута ли правая граница игрового экрана
 * @param  {Shape} shape - текущая фигура
 * @returns  {Boolean} возвращает True, если достигнут правый бок игрового экрана, иначе False
 */
function isShapeReachRightBorder(shape) {
    return shape.blocks.some(block => canvas.width <= block.position.x + shape.blockSize);
}


/**
 * Проверка достигнут ли низ игрового экрана
 * @param  {Shape} shape  текущая фигура
 * @returns  {Boolean} возвращает True, если достигнут низ игрового экрана, иначе False
 */
function isShapeReachBottomBorder(shape, border) {
    return shape.blocks.some(block => block.position.y === border - (shape.blockSize + shape.blockMargin) / 2.0);
}

/**
 * Отрисовка блока
 * @param  {Block} block  текущий блок
 */
function drawBlock(block) {
    ctx.beginPath();
    ctx.rect(block.position.x, block.position.y, block.size, block.size / 2.0);
    ctx.fillStyle = block.color;
    ctx.fill();
    ctx.closePath();
}
/**
 * Отрисовка фигуры
 * @param  {Shape} shape  текущая фигура
 */
function drawShape(shape) {
    if (shape) {
        shape.blocks.forEach(block => drawBlock(block));
    }
}

/**
 * Отрисовка прошедших блоков
 * @param  {Block[]} passedBlocks  массив прошедших блоков 
 */
function drawPassedBlocks(passedBlocks) {
    if (passedBlocks && passedBlocks.length) {
        passedBlocks.forEach(block => drawBlock(block));
    }
}
/**
 * Отрисовка прошедших блоков и текущей фигуры
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //here should be restoring previously added blocks
    //should be redraw not each time, but window clear every time
    drawPassedBlocks(passedBlocks);
    drawShape(currentShape);
}

/**
 * Проверка на блоки преграждающие фигуре дальнейшее вертикальное движение
 * @param  {Shape} shape  фигура для которой проверяются преграды
 * @param  {Block[]} passedBlocks  прошедшие блоки(преграды)
 * @returns {Boolean} возвращает True, если снизу имеются преграды ввиде блоков, иначе False
 */
function hasVerticalBlockBarriers(shape, passedBlocks) {
    let shapeHorizontalCoordinates = shape.blocks.filter(block => block.position.x);
    let bottomBlocks = shape.BottomBlocks;
    var barriers = passedBlocks.filter(block => bottomBlocks.some(bblock => bblock.position.x == block.position.x && bblock.position.y + (block.size + blockMargin) / 2.0 === block.position.y));
    return barriers && barriers.length;
}

/**
 * Проверка на блоки блокирующие смещение фигуры влево
 * @param  {Shape} shape фигура для которой проверяются преграды
 * @param  {Block[]} passedBlocks прошедшие блоки(преграды)
 * @returns {Boolean} возвращает True, если слева имеются преграды ввиде блоков, иначе False
 */
function hasLeftBlockBarriers(shape, passedBlocks) {
    let shapeLeftBlocks = shape.LeftBlocks;
    let bottomLeftBlock = Math.max(...shapeLeftBlocks.map(block => block.position.y));
    let leftBarriers = passedBlocks
        .filter(block => block.position.x + shape.blockSize + shape.blockMargin === shapeLeftBlocks[0].position.x)
        .filter(block => block.position.y >= bottomLeftBlock && block.position.y - (shape.blockSize + shape.blockMargin)/ 2.0 <= bottomLeftBlock);
    return leftBarriers && leftBarriers.length;
}

/**
 * Проверка на блоки блокирующие смещение фигуры вправо
 * @param  {Shape} shape фигура для которой проверяются преграды
 * @param  {Block[]} passedBlocks прошедшие блоки(преграды)
 * @returns {Boolean} возвращает True, если справа имеются преграды ввиде блоков, иначе False
 */
function hasRightBlockBarriers(shape, passedBlocks) {
    let shapeRightBlocks = shape.RightBlocks;
    let bottomRightBlock = Math.max(...shapeRightBlocks.map(block => block.position.y));
    let rightBarriers = passedBlocks
        .filter(block => block.position.x - shape.blockSize - shape.blockMargin === shapeRightBlocks[0].position.x)
        .filter(block => block.position.y >= bottomRightBlock && block.position.y - (shape.blockSize + shape.blockMargin) / 2.0 <= bottomRightBlock);
    return rightBarriers && rightBarriers.length;
}

/**
 * Удаление линии полностью заполненной блоками
 */
function clearLines() {
    let lines = [...new Set(passedBlocks.map(block => block.position.y))];
    lines.forEach(line => {
        let lineBlocks = passedBlocks.filter(block => block.position.y === line);
        
        if (isAllBlocksInLine(lineBlocks)) {
            let aboveLineBlocks  = passedBlocks.filter(block => block.position.y < line);     
            let belowLineBlocks =  passedBlocks.filter(block => block.position.y > line);
            aboveLineBlocks = getMovedDownBlocks(aboveLineBlocks);
            passedBlocks = belowLineBlocks.concat(aboveLineBlocks);
            score += defaultScoreEnroll;
            changeScore(score);
        }
    });
}

/**
 * Проверка заполненна ли линия блоками
 * @param  {Array<Block>} lineBlocks блоки с одинаковыми координатами по оси y
 */
function isAllBlocksInLine(lineBlocks) {
    return lineBlocks.length == blocksInLine;
}

/**
 * Получение блоков смещенных вниз
 * @param  {Array<Block>} aboveLineBlocks блоки находящиеся над удаленной линией
 * @returns {Array<Block>} блоки смещенные вниз
 */
function getMovedDownBlocks(aboveLineBlocks) {
    aboveLineBlocks.forEach(block => block.position.y += (block.size + blockMargin) / 2.0);
    return aboveLineBlocks;
}


/**
 * Генерация случайного числа на интервале
 * @param  {number} min максимальное число
 * @param  {number} max минимальное число
 * @returns {number} случайное число
 */
function getRandomNumberOnInterval(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Генератор случайного цвета фигуры
 * @param  {colors} colors набор цветов фигур в игре
 * @returns {string} случайный цвет
 */
function getRandomColor(colors) {
    var colorKeys = Object.keys(colors);
    var colorIndex = getRandomNumberOnInterval(0, colorKeys.length - 1);
    return Object.values(colors)[colorIndex];
}

/**
 * Генератор случайного типа фигуры
 * @param  {Array<Array<number[]>>} shapeTypes типы фигур имеющихся в игре
 * @returns {Array<number[]>} случайный тип фигуры
 */
function getRandomShapeType(shapeTypes) {
    var shapeIndex = getRandomNumberOnInterval(0, shapeTypes.length - 1);
    return shapeTypes[shapeIndex];
}

/**
 * Изменение значения DOM элемента связанного с очками в конкретной игре
 * @param  {number} score очки
 */
function changeScore(score) {
    let scoreElement = document.querySelector("#player-score");
    scoreElement.innerHTML = score;
}
/**
 * Изменение рекорда в localStorage и DOM элементе связанным с рекордом
 * @param  {number} score очки
 */
function changeRecord(score) {
    if (!localStorage.userRecord || localStorage.userRecord < score) {
        localStorage.setItem("userRecord", score);
    }
    document.querySelector("#record-player-score").innerHTML = localStorage.userRecord;
}