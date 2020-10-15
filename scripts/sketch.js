let detector;

function setup() {
    createCanvas(windowWidth, windowHeight);
    // detector = new TouchDetector(canvas);
    console.log(detector);
}

function draw() {
    // background(200);
}

function touchStarted(event) {
    userStartAudio();
    console.log(event);
}