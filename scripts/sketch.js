let logger;
let touchDetector;
let networkManager;
let userManager;
let gameManager;

function setup() {
    createCanvas(windowWidth, windowHeight);
    logger = new Logger();
    touchDetector = new TouchDetector(canvas);
    networkManager = new NetworkManager();
    // networkManager = new NetworkManager('ws://127.0.0.1:8765');
    userManager = new UserManager();
    gameManager = new GameManager();
}

function draw() {
    clear(); // Clear the canvas
    
    // Update things
    touchDetector.update();

    // Draw things
    userManager.draw();
    logger.draw();
}

function touchStarted(event) {
    userStartAudio();
}