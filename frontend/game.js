const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('scoreValue');
const speedValue = document.getElementById('speedValue');
const restartBtn = document.getElementById('restartBtn');
const highscoreList = document.getElementById('highscoreList');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];
let velocity = { x: 1, y: 0 };
let apple = { x: 15, y: 15 };
let score = 0;
let gameSpeed = 8;
let gameInterval;
let isGameOver = false;

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === 'w') setDirection(0, -1);
  if (e.key === 'ArrowDown' || e.key === 's') setDirection(0, 1);
  if (e.key === 'ArrowLeft' || e.key === 'a') setDirection(-1, 0);
  if (e.key === 'ArrowRight' || e.key === 'd') setDirection(1, 0);
});

restartBtn.addEventListener('click', startGame);

function setDirection(x, y) {
  if (velocity.x === -x || velocity.y === -y) return;
  velocity = { x, y };
}

function startGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  velocity = { x: 1, y: 0 };
  apple = randomPosition();
  score = 0;
  gameSpeed = 8;
  isGameOver = false;
  scoreValue.textContent = score;
  speedValue.textContent = gameSpeed;

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 1000 / gameSpeed);
}

function randomPosition() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

function gameLoop() {
  if (isGameOver) return;
  update();
  draw();
}

function update() {
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score += 10;
    gameSpeed = Math.min(16, gameSpeed + 0.5);
    apple = randomPosition();
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000 / gameSpeed);
  } else {
    snake.pop();
  }

  scoreValue.textContent = score;
  speedValue.textContent = Math.round(gameSpeed);
}

function draw() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#16a34a';
  snake.forEach((segment, index) => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    if (index === 0) {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
      ctx.fillStyle = '#16a34a';
    }
  });

  ctx.fillStyle = '#f87171';
  ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2);
}

function endGame() {
  isGameOver = true;
  clearInterval(gameInterval);
  setTimeout(() => {
    const name = prompt('Game over! Enter your name for the high score board:');
    if (name) saveHighScore(name, score);
  }, 100);
}

async function saveHighScore(name, score) {
  try {
    const response = await fetch('/api/highscores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score })
    });
    if (!response.ok) throw new Error('Unable to save score');
    await loadHighScores();
  } catch (error) {
    console.error(error);
  }
}

async function loadHighScores() {
  try {
    const response = await fetch('/api/highscores');
    const data = await response.json();
    highscoreList.innerHTML = data.scores.map(score => `<li>${score.name}: ${score.score}</li>`).join('');
  } catch (error) {
    highscoreList.innerHTML = '<li>Unable to load scores</li>';
  }
}

startGame();
loadHighScores();
