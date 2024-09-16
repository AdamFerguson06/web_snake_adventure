const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty');
const gameModeSelect = document.getElementById('gameMode');
const difficultyLabel = document.getElementById('difficultyLabel');
const gameSpeedSelect = document.getElementById('gameSpeed');
const difficultyGroup = document.getElementById('difficultyGroup');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameOver = false;
let lastMoveTime = 0;
let moveInterval = 100; // Default move interval (medium difficulty)
const directionQueue = [];
const directionCooldown = 50;
let lastDirectionChangeTime = 0;

const eatSound = new Audio('/static/audio/eat.mp3');
const gameOverSound = new Audio('/static/audio/gameover.mp3');

const difficultySpeeds = {
    easy: 150,
    medium: 100,
    hard: 50
};

const obstacles = [];
const obstacleCount = {
    easy: 5,
    medium: 10,
    hard: 15
};

const gameSpeeds = {
    slow: 150,
    medium: 100,
    fast: 50
};

function updateDifficultyLabel() {
    if (gameModeSelect.value === 'noObstacles') {
        difficultyLabel.textContent = 'Game Speed:';
    } else {
        difficultyLabel.textContent = 'Difficulty:';
    }
}

function updateGameControls() {
    if (gameModeSelect.value === 'noObstacles') {
        difficultyGroup.style.display = 'none';
    } else {
        difficultyGroup.style.display = 'block';
    }
}

function createObstacles() {
    obstacles.length = 0;
    if (gameModeSelect.value === 'withObstacles') {
        const count = obstacleCount[difficultySelect.value];
        while (obstacles.length < count) {
            const obstacle = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            if (
                !snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) &&
                !(food.x === obstacle.x && food.y === obstacle.y)
            ) {
                obstacles.push(obstacle);
            }
        }
    }
}

function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    createFood();
    createObstacles();
    dx = 0;
    dy = 0;
    score = 0;
    gameOver = false;
    scoreElement.textContent = score;
    restartBtn.style.display = 'none';
    lastMoveTime = 0;
    lastDirectionChangeTime = 0;
    directionQueue.length = 0;
    updateGameSpeed();
    updateGameControls();
    main();
}

function updateDifficulty() {
    const difficulty = difficultySelect.value;
    moveInterval = difficultySpeeds[difficulty];
    createObstacles();
}

function updateGameSpeed() {
    moveInterval = gameSpeeds[gameSpeedSelect.value];
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    drawObstacles();
}

function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function updateDirection() {
    const currentTime = Date.now();
    if (currentTime - lastDirectionChangeTime >= directionCooldown && directionQueue.length > 0) {
        const newDirection = directionQueue.shift();
        if (
            (newDirection.dx === 0 && newDirection.dy === -dy) ||
            (newDirection.dy === 0 && newDirection.dx === -dx)
        ) {
            return;
        }
        dx = newDirection.dx;
        dy = newDirection.dy;
        lastDirectionChangeTime = currentTime;
    }
}

function moveSnake() {
    updateDirection();
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        createFood();
        eatSound.play();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    if (
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y) ||
        obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)
    ) {
        gameOver = true;
        gameOverSound.play();
        restartBtn.style.display = 'inline-block';
    }
}

function main() {
    if (gameOver) return;

    const currentTime = Date.now();
    if (currentTime - lastMoveTime >= moveInterval) {
        moveSnake();
        checkCollision();
        drawGame();
        lastMoveTime = currentTime;
    }

    requestAnimationFrame(main);
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            directionQueue.push({ dx: 0, dy: -1 });
            break;
        case 'ArrowDown':
            directionQueue.push({ dx: 0, dy: 1 });
            break;
        case 'ArrowLeft':
            directionQueue.push({ dx: -1, dy: 0 });
            break;
        case 'ArrowRight':
            directionQueue.push({ dx: 1, dy: 0 });
            break;
    }
});

restartBtn.addEventListener('click', startGame);
gameSpeedSelect.addEventListener('change', updateGameSpeed);
difficultySelect.addEventListener('change', createObstacles);
gameModeSelect.addEventListener('change', () => {
    updateGameControls();
    startGame();
});

createFood();
updateGameSpeed();
updateGameControls();
main();
