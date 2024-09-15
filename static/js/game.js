const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty');

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

function startGame() {
    snake = [{ x: 10, y: 10 }];
    createFood();
    dx = 0;
    dy = 0;
    score = 0;
    gameOver = false;
    scoreElement.textContent = score;
    restartBtn.style.display = 'none';
    lastMoveTime = 0;
    lastDirectionChangeTime = 0;
    directionQueue.length = 0;
    updateDifficulty();
    main();
}

function updateDifficulty() {
    const difficulty = difficultySelect.value;
    moveInterval = difficultySpeeds[difficulty];
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
            // Prevent reversing direction
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
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
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
difficultySelect.addEventListener('change', updateDifficulty);

createFood();
updateDifficulty();
main();
