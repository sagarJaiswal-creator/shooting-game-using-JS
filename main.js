// making canvas fit the screen
const canvas = document.querySelector("canvas");
const score = document.querySelector("#score");
const startGameBtn = document.querySelector("#startGameBtn");
const startGameMainDiv = document.querySelector(".startGameMainDiv");
const bigScore = document.querySelector("#bigScore");

// creating contex
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// creating player
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
//     ctx.beginPath();
//     ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
//     ctx.fillStyle = this.color;
//     ctx.fill();
    
    
      var playerImage = new Image();
    playerImage.src = "graphics/spacestation.png";
    ctx.drawImage(
      playerImage,
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
    
    
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    
      var enemyImage = new Image();
    enemyImage.src = "graphics/enemy.png";
    ctx.drawImage(
      enemyImage,
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
    
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99;
class Particles {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

class Stars {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}


const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 30, "blue");
let projectiles = [];
let enemies = [];
let particles = [];
let initScore = 0;

function init() {
  player = new Player(x, y, 30, "blue");
  projectiles = [];
  enemies = [];
  particles = [];
  initScore = 0;
  score.innerHtml = 0;
}

function spwanStars() {
  for (let i = 0; i <= 10; i++) {
    let radie = Math.random() * 5;
    let xCoordinate = Math.random() * canvas.width;
    let yCoordinate = Math.random() * canvas.height;

    const star = new Stars(xCoordinate, yCoordinate, radie, "white");
    star.draw();
  }
}


function spwanEnemy() {
  setInterval((event) => {
    const radius = Math.random() * (30 - 8) + 8;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360},50%,50%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  spwanStars();
  player.draw();

  // adding particles on each frame at collison
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, index) => {
    projectile.update();

    // removing projectile after it reaches the end of the screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    // end game
    if (dist - enemy.radius - player.radius < 1) {
       var audio2 = new Audio("sounds/explode2.wav");
      audio2.play(); //player hit sound
      cancelAnimationFrame(animationId);
      startGameMainDiv.style.display = "flex";
      bigScore.innerHTML = initScore;
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      // when projectile touches enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        
        var audio1 = new Audio("sounds/explode1.wav");
        audio1.play(); //when bullet hit the target
        //  adding particle on collision
        for (let i = 0; i < Math.random() * enemy.radius * 2; i++) {
          particles.push(
            new Particles(
              projectile.x,
              projectile.y,
              Math.random() * 3,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        // reducing enemy size on colsion if radius in greater than 10
        if (enemy.radius - 10 > 10) {
          initScore += 100;
          gsap.to(enemy, {
            radius: (enemy.radius -= 10),
          });

          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          //removing enemies and projectiles
          initScore += 250;
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
        score.innerHTML = initScore;
      }
    });
  });
}

addEventListener("click", (event) => {
    var audio = new Audio("sounds/lazer7.mp3");
  audio.play(); //lazer fire sound
  
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});
startGameBtn.addEventListener("click", function (event) {
  init();
  startGameMainDiv.style.display = "none";
  animate();
  spwanEnemy();
});
