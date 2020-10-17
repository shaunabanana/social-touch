let logger;
let touchDetector;
let networkManager;
let userManager;
let canSend = false;
let touches = [];
let painter;

function setup() {
    createCanvas(windowWidth, windowHeight);
    logger = new Logger();
    touchDetector = new TouchDetector(canvas);
    networkManager = new NetworkManager();
    userManager = new UserManager();
}

function draw() {
    clear();
    touchDetector.update();
    // logger.log(touchDetector.touches.length);
    userManager.updateLocalTouches(touchDetector.touches);
    userManager.draw();
    // if (canSend && detector.touches.length > 0) { 
    //     socket.send(JSON.stringify(detector.touches));
    // }

    logger.draw();
}

function touchStarted(event) {
    userStartAudio();
}