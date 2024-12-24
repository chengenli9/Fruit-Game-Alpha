
export default class Player {
  constructor(ctx, centerX, centerY, radius, color) {
    this.ctx = ctx;
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.color = color;

    this.playerImage = new Image();
    this.playerImage.src = 'images/face2.png';
    this.image = this.playerImage;
  }

  draw() {
    //draws the ball
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();

    this.ctx.drawImage(this.image, this.centerX - this.radius   ,this.centerY - this.radius / 2  , this.radius * 2, this.radius * 2);
    
  }

  
}