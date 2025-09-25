const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');

// Responsive canvas
function resizeCanvas() {
  canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth - 20;
  canvas.height = window.innerHeight > 500 ? 500 : window.innerHeight - 100;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Paddle
const paddleWidth = 100, paddleHeight = 20;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - 40;

// Ball
const ballRadius = 15;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballDX = 4, ballDY = -3;
let ballColor = "#fff";

// Game state
let rightPressed = false, leftPressed = false;
let score = 0;
let lives = 3;
let gameOver = false;

// Sounds
const hitSound = document.getElementById("hit-sound");
const gameOverSound = document.getElementById("gameover-sound");

// Scale effect
function scaleByDepth(y) {
  const minScale = 0.6, maxScale = 1.2;
  return minScale + (maxScale - minScale) * (y / canvas.height);
}

// Background
function drawBackground() {
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#001f3f");
  gradient.addColorStop(1, "#0074D9");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Paddle
function drawPaddle() {
  const scale = scaleByDepth(paddleY);
  ctx.save();
  ctx.translate(paddleX + paddleWidth/2, paddleY + paddleHeight/2);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#0ff";
  ctx.fillRect(-paddleWidth/2, -paddleHeight/2, paddleWidth, paddleHeight);
  ctx.restore();
}

// Ball
function drawBall() {
  const scale = scaleByDepth(ballY);
  ctx.save();
  ctx.translate(ballX, ballY);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}

// HUD
function drawHUD() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Lives: " + lives, canvas.width - 100, 30);
}

// Draw all
function draw() {
  drawBackground();
  drawPaddle();
  drawBall();
  drawHUD();

  if (gameOver) {
    ctx.font = "40px Arial";
    ctx.fillStyle = "#f00";
    ctx.fillText("Game Over!", canvas.width/2 - 120, canvas.height/2);
  }
}

// Update
function update() {
  if (gameOver) return;

  // Paddle movement
  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 8;
  if (leftPressed && paddleX > 0) paddleX -= 8;

  // Ball movement
  ballX += ballDX;
  ballY += ballDY;

  // Walls
  if (ballX < ballRadius || ballX > canvas.width - ballRadius) ballDX *= -1;
  if (ballY < ballRadius) ballDY *= -1;

  // Paddle hit
  if (
    ballY + ballRadius > paddleY &&
    ballY + ballRadius < paddleY + paddleHeight &&
    ballX > paddleX &&
    ballX < paddleX + paddleWidth
  ) {
    ballDY = -Math.abs(ballDY);
    score++;
    ballColor = `hsl(${Math.random()*360}, 80%, 60%)`;

    hitSound.currentTime = 0;
    hitSound.play();

    // Difficulty increase
    if (score % 5 === 0) {
      ballDX *= 1.1;
      ballDY *= 1.1;
    }
  }

  // Missed ball
  if (ballY > canvas.height - ballRadius) {
    lives--;
    if (lives <= 0) {
      gameOverSound.play();
      gameOver = true;
      restartBtn.style.display = "inline-block"; // show restart button
    } else {
      resetBall();
    }
  }
}

// Reset ball position
function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballDX = 4 * (Math.random() > 0.5 ? 1 : -1);
  ballDY = -3;
  ballColor = "#fff";
}

// Restart game
function restartGame() {
  score = 0;
  lives = 3;
  gameOver = false;
  resetBall();
  restartBtn.style.display = "none"; // hide button
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Keyboard
document.addEventListener("keydown", e => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

// Mobile controls (finger drag)
canvas.addEventListener("touchmove", e => {
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  paddleX = touchX - paddleWidth / 2;
  if (paddleX < 0) paddleX = 0;
  if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
});

// Restart button
restartBtn.addEventListener("click", restartGame);

gameLoop();
