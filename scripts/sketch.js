let detector;

function setup() {
    createCanvas(windowWidth, windowHeight);
    detector = new TouchDetector(canvas);
    console.log(detector);
}

function draw() {
    background(200);
    detector.draw();
}

function touchStarted(event) {
    userStartAudio();
}