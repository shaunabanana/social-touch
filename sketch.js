const V111_LINK = 'https://www.wjx.cn/jq/96551773.aspx'
const V001_LINK = 'https://www.wjx.cn/jq/96639705.aspx'
const V010_LINK = 'https://www.wjx.cn/jq/96639669.aspx'
const V100_LINK = 'https://www.wjx.cn/jq/96639620.aspx'

let USER_NAME;

let logger;
let touchDetector;
let networkManager;
let userManager;
let gameManager;
let promptManager;
let interactionVisualizer;

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

    if (!ANONYMITY) {
        USER_NAME = prompt("可以告诉我你的名字吗？\nCould you tell me your name?");
    }

    logger = new Logger();
    touchDetector = new TouchDetector(canvas);
    networkManager = new NetworkManager();
    // networkManager = new NetworkManager('ws://192.168.1.107:8765');
    userManager = new UserManager(USER_NAME);
    gameManager = new GameManager();
    promptManager = new PromptManager();
    interactionVisualizer = new InteractionVisualizer();

    // Show prompt
    promptManager.show([
        '正在连接到服务器……🖥', 
        'Connecting to the server...'
    ]);
}

function draw() {
    clear(); // Clear the canvas
    
    // Update things
    touchDetector.update();
    gameManager.update();

    // Draw things
    userManager.draw();
    if (SYNERGY) interactionVisualizer.draw();
    // logger.draw();
}