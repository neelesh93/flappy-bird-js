const cvs = document.getElementById('bird');
const ctx = cvs.getContext('2d');

// Game vars and constants
let frames = 0;
const DEGREE = Math.PI / 180;   // Used to convert degrees to radians

// Load the sprites image
const sprite = new Image();
sprite.src = 'img/sprite.png';

// Load audio
const SCORE_S = new Audio();
const FLAP = new Audio();
const HIT = new Audio();
const SWOOSHING = new Audio();
const DIE = new Audio();

SCORE_S.src = 'audio/sfx_point.wav';
FLAP.src = 'audio/sfx_flap.wav';
HIT.src = 'audio/sfx_hit.wav';
SWOOSHING.src = 'audio/sfx_swooshing.wav';
DIE.src = 'audio/sfx_die.wav';

// Game states
const states = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2,
};

const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29,
};

// Control the game
cvs.addEventListener('click', function (e) {
    switch (states.current) {
        case states.getReady:
            states.current = states.game;
            SWOOSHING.play();
            break;
        case states.game:
            bird.flap();

            FLAP.pause();
            FLAP.currentTime = 0;
            FLAP.play();
            break;
        case states.over:
            // Check if we click on the "start" button on the "game over" sprite
            let rect = cvs.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            let clickY = e.clientY - rect.top;

            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                pipes.reset();
                bird.resetSpeed();
                score.reset();
                states.current = states.getReady;
            }

            break;
    }
});

// Objects
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,

    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
};

const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,

    dx: 2,

    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },

    update: function () {
        if (states.current === states.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
};

const bird = {
    animation: [
        { sX: 276, sY: 112 },
        { sX: 276, sY: 139 },
        { sX: 276, sY: 164 },
        { sX: 276, sY: 139 },
    ],
    frame: 0,

    // sX: 276,
    // sY: 0,
    x: 50,
    y: 150,
    w: 34,
    h: 26,
    radius: 12,

    speed: 0,
    gravity: 0.25,
    jump: 4.6,
    rotation: 0,

    draw: function () {
        let bird = this.animation[this.frame];

        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -(this.w / 2), -(this.h / 2), this.w, this.h);

        ctx.restore();
    },

    flap: function () {
        this.speed = -this.jump;
    },

    update: function () {
        this.period = states.current === states.getReady ? 10 : 5;
        this.frame += frames % this.period === 0 ? 1 : 0;
        this.frame = this.frame % this.animation.length;

        if (states.current === states.getReady) {
            // Reset the game
            this.y = 150;
            this.rotation = 0;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + (this.h / 2) >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - (this.h / 2);

                if (states.current === states.game) {
                    states.current = states.over;
                    DIE.play();
                }
            }

            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }
    },

    resetSpeed: function () {
        this.speed = 0;
    }
};

const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: (cvs.width / 2) - (173 / 2),
    y: 80,

    draw: function () {
        if (states.current == states.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
};

const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: (cvs.width / 2) - (225 / 2),
    y: 90,

    draw: function () {
        if (states.current == states.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
};

const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0,
    },
    bottom: {
        sX: 502,
        sY: 0,
    },

    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            // Top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            // Bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function () {
        if (states.current !== states.game) {
            return;
        }

        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1),
            });
        }

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            let bottomPipeYPos = p.y + this.h + this.gap;

            // Collision detection - top pipe
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                states.current = states.over;
                HIT.play();
            }

            // Collision detection - bottom pipe
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                states.current = states.over;
                HIT.play();
            }

            // Move the pipes to the left
            p.x -= this.dx;

            // Remove the first pipe if it went beyond the screen to the left
            if (p.x + this.w <= 0) {
                this.position.shift();

                score.value += 1;
                score.best = Math.max(score.value, score.best);
                localStorage.setItem('best', score.best);

                SCORE_S.play();
            }
        }
    },

    reset() {
        this.position = [];
    }
};

const score = {
    best: parseInt(localStorage.getItem('best')) || 0,
    value: 0,

    draw: function () {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';

        if (states.current === states.game) {
            ctx.lineWidth = 2;
            ctx.font = '35px Teko';
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50);
        } else if (states.current === states.over) {
            ctx.font = '25px Teko';
            // Current score
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);

            // Best score
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },

    reset() {
        this.value = 0;
    }
};

// Draw the scene
function draw() {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// Update the game state
function update() {
    bird.update();
    fg.update();
    pipes.update();
}

// The game loop
function loop() {
    update();
    draw();

    frames++;

    requestAnimationFrame(loop);
}

// Start the game loop
loop();