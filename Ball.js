import { ballType } from "./index.js";
import { gameState } from "./index.js";
import { updateScoreDisplay } from "./index.js";

export default class Ball {


  constructor(ctx, centerX, centerY, radius, color, balls) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;

    this.balls = balls;
    this.color = color;
    this.rotationAngle = 0;

    this.hasLanded = false;
    this.crossedLineTime = null;

    this.gravity = 0.2;
    this.friction = 0.98;

    //each ball's velocity vector 
    this.velocity = {
      x: 0,
      y: 5,
    }

    //image for each ball
    this.ballImage = new Image();
    this.ballImage.src = 'images/face2.png';
    this.image = this.ballImage;


  }

  //method to draw the ball
  draw() {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotationAngle);

    //draws the ball
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();

    this.ctx.lineWidth = 2;  
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
    this.ctx.drawImage(this.image, -this.radius,  -this.radius * 1.2, this.radius * 2, this.radius * 2);

    this.ctx.restore();
  }

  //method updates the ball's position and checks for collisions 
  update() {
    //add gravity to the vertical velocity
    this.velocity.y += this.gravity;

    //make sure ball can move horizontally
    this.centerX += this.velocity.x;

    this.rotationAngle += (this.velocity.x / this.radius);

    //check for collisions
    this.checkGroundCollision();
    this.checkWallCollision();
    this.checkBallCollision();
  }


  checkGroundCollision() {
    if (this.centerY + this.radius >= this.canvas.height) {
      this.centerY = this.canvas.height - this.radius;
      this.velocity.x *= this.friction;
      this.velocity.y *= -0.1;
      //console.log(this.velocity.y);
      if(!this.hasLanded) {
        console.log("has landed");
        this.hasLanded = true;
      }
    } 
    //keep falling 
    this.centerY += this.velocity.y;
  }


  checkWallCollision() {
    //logic for left wall
    if (this.centerX - this.radius <= 0) {
      // Ensure the ball doesn't go past the left wall
      // Move the ball inside the canvas
      this.centerX = this.radius;  

      // Move to the right after hitting the left wall
      this.velocity.x = Math.abs(this.velocity.x);  
    }

    //logic for right wall
    if (this.centerX + this.radius >= this.canvas.width) {
      //Ensure the ball doesn't go past the right wall
      //Move the ball inside the canvas
      this.centerX = this.canvas.width - this.radius;

      // Move to the left after hitting the right wall
      this.velocity.x = -Math.abs(this.velocity.x);  
    }
  }

  //collision with other balls
  //source: https://myninja.ai/
  //
  checkBallCollision() {
    const ballsToRemove = new Set(); 

    for (let ball of [...this.balls]) {  
      if (ball !== this) {  
       const dx = this.centerX - ball.centerX;  
       const dy = this.centerY - ball.centerY;  
       const distance = Math.sqrt(dx * dx + dy * dy);  
      
       // Check if the distance is less than the sum of the radii (collision)  
        if (distance < this.radius + ball.radius) {  

          if(!this.hasLanded) {
            console.log("has landed");
            this.hasLanded = true;
          }

          //if this ball collides with a ball of the same type
          if (this.color === ball.color) {  
            // Find the midpoint between the two balls  
            const mpX = (this.centerX + ball.centerX) / 2;  
            const mpY = (this.centerY + ball.centerY) / 2;  

            // Check if the balls are not already scheduled for removal  
            if (!ballsToRemove.has(this) && !ballsToRemove.has(ball)) {  
              // Mark the balls for removal  
              ballsToRemove.add(this);  
              ballsToRemove.add(ball);  

              // Spawn a new ball at the midpoint  
              setTimeout(() => {  
                  this.addNextBall(mpX, mpY);  
              }, 100);  
            }  
          }  

          // Normalize the direction of the collision  
          const angle = Math.atan2(dy, dx);  
          const normalX = dx / distance;  
          const normalY = dy / distance;  
          const tangentX = -normalY;  
          const tangentY = normalX;  
        
          // Project velocities onto the tangent and normal vectors  
          const v1n = this.velocity.x * normalX + this.velocity.y * normalY;  
          const v1t = this.velocity.x * tangentX + this.velocity.y * tangentY;  
          const v2n = ball.velocity.x * normalX + ball.velocity.y * normalY;  
          const v2t = ball.velocity.x * tangentX + ball.velocity.y * tangentY;  
        
          // Calculate the new normal velocities after collision  
          const restitution = 0.5; //adjust to change the bounciness
          const massRatio = (ball.radius ** 3) / ((this.radius ** 3) + (ball.radius ** 3));  
          const v1nAfter = (v1n * (1 - massRatio) + 2 * massRatio * v2n) / (1 + massRatio);  
          const v2nAfter = (v2n * (1 - massRatio) + 2 * massRatio * v1n) / (1 + massRatio);  

          const v1nFinal = v1nAfter * restitution;  
          const v2nFinal = v2nAfter * restitution;  
        
          // Convert the new normal velocities back to Cartesian coordinates  
          this.velocity.x = v1nFinal * normalX + v1t * tangentX;  
          this.velocity.y = v1nFinal * normalY + v1t * tangentY;  
          ball.velocity.x = v2nFinal * normalX + v2t * tangentX;  
          ball.velocity.y = v2nFinal * normalY + v2t * tangentY;  
        
          // Ensure balls are not sticking together  
          const overlap = this.radius + ball.radius - distance;  
          this.centerX += normalX * overlap / 2;  
          this.centerY += normalY * overlap / 2;  
        
          ball.centerX -= normalX * overlap / 2;  
          ball.centerY -= normalY * overlap / 2;  
        }  
      }  
    }
    for (let ball of ballsToRemove) {  
      const index = this.balls.indexOf(ball);  
      if (index > -1) {  
        this.balls.splice(index, 1);  
      }  
    }  
  }

  //spawns a new ball in between two balls of the same type
  addNextBall(mpX, mpY) {
    const ballTypes = Object.keys(ballType);
    const currentIndex = ballTypes.findIndex(type => ballType[type].color === this.color);

    //Determine the next type
    const nextIndex = (currentIndex + 1) % ballTypes.length;
    const nextType = ballTypes[nextIndex];

    const nextBall = ballType[nextType];
    //create the new ball
    const newBall = new Ball(this.ctx, mpX, mpY, nextBall.radius, nextBall.color, this.balls);

    //adds the newBall to the balls array
    this.balls.push(newBall);

    //increase the score based on the type's points
    gameState.score += nextBall.points;

    updateScoreDisplay();

    // for debugging
    // console.log(`score: ${gameState.score}` );
    // console.log(`points: ${nextBall.points}`)
  }

  //checks if the ball has landed and is crossing a vertical point
  hasCrossedLine(borderHeight) {
    return this.hasLanded && this.centerY - this.radius <= borderHeight;
  }

  
}