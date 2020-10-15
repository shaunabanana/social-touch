let detector;
let socket;
let canSend = false;
let touches = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    detector = new TouchDetector(canvas);
    console.log(detector);

    socket = new WebSocket('ws://localhost:8765');

    // Connection opened
    socket.addEventListener('open', function (event) {
        canSend = true;
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        touches = JSON.parse(event.data);
    });
}

function draw() {
    background(200);
    detector.draw();
    for (let touch of touches) {
        circle(touch.x, touch.y, touch.force * 100 + 20);
    }
    if (canSend && detector.touches.length > 0) { 
        socket.send(JSON.stringify(detector.touches));
    }
}

function touchStarted(event) {
    userStartAudio();
}