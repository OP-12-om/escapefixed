
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const heartbeat = document.getElementById("heartbeat");
const timerDisplay = document.getElementById("timer");

let doakesImg = new Image();
let dexterImg = new Image();
doakesImg.src = "assets/doakes.png";
dexterImg.src = "assets/dexter.png";

let doakes = { x: 390, y: 290, speed: 3 };
let dexter = { x: -100, y: -100, speed: 1.5 };
let keys = {};
let timer = 0;
let lastHeartbeat = 0;
let stage = "intro"; // intro, cage, tasks, chase, end
let typedCageInput = "";
let taskStates = [false, false, false];
let arrowPresses = new Set();
let ventFallen = false;

let gameInterval = setInterval(() => {
    if (stage !== "end") {
        timer++;
        timerDisplay.textContent = "Time: " + timer + "s";
    }
}, 1000);

document.addEventListener("keydown", e => {
    keys[e.key] = true;

    if (stage === "intro" && e.key === " ") {
        stage = "cage";
    }

    if (stage === "cage" && /^[a-zA-Z]$/.test(e.key)) {
        typedCageInput += e.key.toLowerCase();
        if (typedCageInput.endsWith("escape")) {
            stage = "tasks";
        }
    }

    if (stage === "tasks") {
        let input = e.key.toLowerCase();

        if (!taskStates[0] && input === "1") taskStates[0] = "1";
        else if (taskStates[0] === "1" && input === "4") taskStates[0] = "14";
        else if (taskStates[0] === "14" && input === "2") taskStates[0] = true;

        if (!taskStates[1] && input === "h") taskStates[1] = "h";
        else if (taskStates[1] === "h" && input === "a") taskStates[1] = "ha";
        else if (taskStates[1] === "ha" && input === "r") taskStates[1] = "har";
        else if (taskStates[1] === "har" && input === "r") taskStates[1] = "harr";
        else if (taskStates[1] === "harr" && input === "y") taskStates[1] = true;

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            arrowPresses.add(e.key);
            if (arrowPresses.size === 4) {
                taskStates[2] = true;
            }
        }

        if (taskStates.every(t => t === true)) {
            stage = "chase";
            dexter.x = 800;
            dexter.y = 600;
        }
    }
});
document.addEventListener("keyup", e => keys[e.key] = false);

function drawPlayer(x, y, img) {
    ctx.drawImage(img, x - 20, y - 40, 40, 80);
}

function update() {
    if (stage === "cage" || stage === "tasks" || stage === "chase") {
        if (keys["ArrowUp"]) doakes.y -= doakes.speed;
        if (keys["ArrowDown"]) doakes.y += doakes.speed;
        if (keys["ArrowLeft"]) doakes.x -= doakes.speed;
        if (keys["ArrowRight"]) doakes.x += doakes.speed;
    }

    if (stage === "chase") {
        if (doakes.x < dexter.x) dexter.x -= dexter.speed;
        if (doakes.x > dexter.x) dexter.x += dexter.speed;
        if (doakes.y < dexter.y) dexter.y -= dexter.speed;
        if (doakes.y > dexter.y) dexter.y += dexter.speed;

        const dx = doakes.x - dexter.x;
        const dy = doakes.y - dexter.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (Date.now() - lastHeartbeat > 600 - Math.max(0, 500 - dist * 5)) {
            heartbeat.textContent = heartbeat.textContent === "❤️❤️❤️" ? "💓💓💓" : "❤️❤️❤️";
            lastHeartbeat = Date.now();
        }

        if (dist < 25) {
            stage = "end";
            heartbeat.textContent = "💀";
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#222";
    ctx.fillRect(100, 100, 600, 400); // room background

    if (stage === "cage") {
        ctx.fillStyle = "gray";
        ctx.fillRect(350, 270, 100, 60); // cage box
    }

    drawPlayer(doakes.x, doakes.y, doakesImg);

    if (stage === "chase" || stage === "end") {
        drawPlayer(dexter.x, dexter.y, dexterImg);
    }

    if (taskStates[0] === true && !ventFallen) {
        ctx.fillStyle = "#ccc";
        ctx.fillRect(700, 400, 30, 30); // vent falls
        ventFallen = true;
    }

    if (stage === "end") {
        ctx.fillStyle = "#f00";
        ctx.font = "40px sans-serif";
        ctx.fillText("Dexter killed Doakes.", 250, 300);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
