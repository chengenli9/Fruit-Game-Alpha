import Player from "./Player.js";
import Ball from "./Ball.js";
import Queue from "./Queue.js";

const canvas = document.getElementById('game');
const ballWindow = document.getElementById('ball-window');
const ctx1 = canvas.getContext("2d");
const ctx2 = ballWindow.getContext("2d");
const scoreDisplay = document.getElementById('score');

const popupDisplay = document.getElementById('popup');
const openBtn = document.getElementById('guide-btn');
const closeBtn = document.getElementById('close-popup');
const restartBtn = document.getElementById('restart-btn');

openBtn.addEventListener('click', openPopup);
closeBtn.addEventListener('click', closePopup);
restartBtn.addEventListener('click', resetGameState);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("click", handleMouseClick);


//ctx1 dimensions 
const GAME_WIDTH = 600;
const GAME_HEIGHT = 850;

//ctx2 dimensions
const BALL_WINDOW_WIDTH = 200;
const BALL_WINDOW_HEIGHT = 200;

//position of the red line
const LINE_HEIGHT = 100;

let ballRadius = 20;
let ballColor;

//player variable 
let player;

//keep track of game score
export const gameState = {
  score: 0, 
  gameOver: false
}

let initPlayerX = GAME_WIDTH / 2;
let initPlayerY = ballRadius * 2;


const ballQueue = new Queue();
const MAX_QUEUE_SIZE = 10;

const balls = []; //Array of different balls

export const ballType = {
  blueberry: {
    color: "darkBlue",
    radius: 15,
    points: 100
  },
  cherry: {
    color: "red",
    radius: 20,
    points: 20
  },
  grape: {
    color: "purple",
    radius: 30,
    points: 30,
  },
  orange: {
    color: "orange",
    radius: 50,
    points: 40,
  },
  peach: {
    color: "Pink",
    radius: 70,
    points: 50
  },
  cantaloupe: {
    color: "lime",
    radius: 90,
    points: 60
  },
  watermelon: {
    color: "green",
    radius: 110,
    points: 70
  },
  durian: {
    color: "yellow",
    radius: 150,
    points: 80
  },
  jackfruit: {
    color: "lightYellow",
    radius: 200,
    points: 90
  }
}


const coolDownTime = 700; //for click delay
let lastClickTime = 0; //for click delay



function openPopup() {
  popupDisplay.classList.add("open-popup");
}

function closePopup() {
  popupDisplay.classList.remove("open-popup");
}


function drawCanvas() {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  ctx1.fillStyle = "mintcream";
  ctx1.fillRect(0, 0, canvas.width, canvas.height);

  ctx1.beginPath();
  ctx1.moveTo(0, LINE_HEIGHT);
  ctx1.lineTo(600, LINE_HEIGHT);
  ctx1.strokeStyle = "red";

  // Draw the Path
  ctx1.stroke();
}

export function updateScoreDisplay() {
  scoreDisplay.innerHTML = `${gameState.score}`;
}


function updateBallWindow() {
  ballWindow.width = BALL_WINDOW_WIDTH;
  ballWindow.height = BALL_WINDOW_HEIGHT;

  //ctx2.fillRect(0, 0, ballWindow.width, ballWindow.height);

  if (ballQueue.size() > 1) {
    // Access the second ball in the queue
    const nextBall = ballQueue.getItem(1); // New helper function in Queue
    
    let displayBall = new Player(ctx2, ballWindow.width / 2, ballWindow.height / 2, nextBall.radius, nextBall.color);

    displayBall.draw();

  }
}

function createPlayer() {
  const currentBall = ballQueue.peek();
  
  player = new Player(ctx1, initPlayerX, initPlayerY, currentBall.radius, currentBall.color);
}

function initQueue() {
  while (ballQueue.size() < MAX_QUEUE_SIZE) {
    const newBall = createBall();
    ballQueue.enqueue(newBall);
  }

  createPlayer();
}

function createBall() {
  let randomBallType = Math.floor(Math.random() * 4);

  switch(randomBallType) {
    case 0:
      ballRadius = ballType.blueberry.radius;
      ballColor = ballType.blueberry.color;
      break;
    case 1:
      ballRadius = ballType.cherry.radius;
      ballColor = ballType.cherry.color;
      break;
    case 2: 
      ballRadius = ballType.grape.radius;
      ballColor = ballType.grape.color;
      break;
    case 3:
      ballRadius = ballType.orange.radius;
      ballColor = ballType.orange.color;
      break;
    default:
      break;
  }

  return new Ball(ctx1, initPlayerX, initPlayerY, ballRadius, ballColor, balls);
}

//move the player around with cursor
function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;


  player.centerX = Math.max(player.radius, Math.min(mouseX, canvas.width - player.radius));

  //update the default x position to current mouse position
  initPlayerX = player.centerX;
}

//click to drop ball
function handleMouseClick() {
  
  const currentTime = Date.now();
  //add delay between each click
  if (currentTime - lastClickTime >= coolDownTime) {
    
    //take the ball infront of the queue
    const currentBall = ballQueue.peek();

    //copy the currentBall into a new ball to be drawn
    const newBall = new Ball(ctx1, player.centerX, player.centerY, currentBall.radius, currentBall.color, balls);

    //add a new ball to the array
    balls.push(newBall);

    //erase the ball already dropped
    ballQueue.dequeue();

    //fill the queue back up
    initQueue();

    lastClickTime = currentTime;

  }
  
}


function checkIfGameOver(ball) {
  if (ball.hasCrossedLine(LINE_HEIGHT)) {
    if (!ball.crossedLineTime) {
      ball.crossedLineTime = Date.now();
    } else if (Date.now() - ball.crossedLineTime > 2000) {  
      return true;  
    }  
  } else {  
    ball.crossedLineTime = null;  
  }  
  return false;  
}

function resetGameState() {
  gameState.gameOver = false;
  gameState.score = 0;
  updateScoreDisplay();

  balls = [];

  ctx1.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.clearRect(0, 0, canvas.width, canvas.height);
 
}


function animate() {
  window.requestAnimationFrame(animate);

  ctx1.clearRect(0, 0, canvas.width, canvas.height); 
  drawCanvas(); 

  ctx2.clearRect(0, 0, ballWindow.width, ballWindow.height);
  updateBallWindow();

  player.draw();

  //draws a new ball
  for (let ball of balls) {
    ball.draw();
    ball.update();

    if(checkIfGameOver(ball)) {
      alert("Game Over");
      resetGameState();
    }
    
  }

  ctx2.clearRect(0, 0, ballWindow.width, ballWindow.height);
  updateBallWindow();
}

initQueue();
createPlayer();
drawCanvas();
animate();

//console.log(ballQueue);


