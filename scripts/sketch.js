let logger;
let touchDetector;
let networkManager;
let userManager;
let gameManager;
let promptManager;

let bearIcon;
let birdIcon;
let buffaloIcon;
let catIcon;

function preload() {
    bearIcon = loadImage('assets/Bear.png');
    birdIcon = loadImage('assets/Bird.png');
    buffaloIcon = loadImage('assets/Buffalo.png');
    catIcon = loadImage('assets/Cat.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    logger = new Logger();
    touchDetector = new TouchDetector(canvas);
    // networkManager = new NetworkManager();
    networkManager = new NetworkManager('ws://192.168.1.107:8765');
    userManager = new UserManager();
    gameManager = new GameManager();
    promptManager = new PromptManager();
}

function draw() {
    clear(); // Clear the canvas
    
    // Update things
    touchDetector.update();
    gameManager.update();

    // Draw things
    userManager.draw();
    // logger.draw();
}

function touchStarted(event) {
    userStartAudio();
}