class GameManager {
    constructor () {
        this.ready = false;
        this.games = [];
        this.availableGames = [GetOthersToFollowGame, SayHiGame];
        this.currentGame = null;
        this.currentGameInstance = null;
        this.swirlLocation = null;
        this.participants = 0;
    }

    terminate (game) {
        if (game.class === this.currentGame) {
            this.currentGame = null;
            this.currentGameInstance = null;
        }
        logger.log('Game terminated:', game.name);
        this.games = this.games.filter( function (other) { return game.class !== other } );
    }

    onReadyToGame() {
        this.games.push(TouchScreenGame);
        this.games.push(TouchParticipantGame);
        this.games.push(SayHiGame);
        this.games.push(GetOthersToFollowGame);
        this.games.push(TouchDotGame);
        // let games = shuffle(this.availableGames);
        // for (let game of games) {
        //     this.games.push(game);
        // }
        this.ready = true;
    }

    onUserJoin(user) {
        if (this.currentGameInstance) {
            this.currentGameInstance.onUserJoin(user);
        }
    }

    onTouchMove(touches) {
        if (this.currentGameInstance) {
            this.currentGameInstance.onTouchMove(touches);
        }
    }

    onTouchClick(touches) {
        if (this.currentGameInstance) {
            this.currentGameInstance.onTouchClick(touches);
        }
    }

    onSwirlUpdate(participants, swirl) {
        swirl[0] *= windowWidth;
        swirl[1] *= windowHeight;
        this.participants = participants;
        this.swirlLocation = swirl;
        if (this.currentGameInstance) {
            this.currentGameInstance.onSwirlUpdate(swirl);
        }
    }

    onSyncGameStart() {
        if (this.currentGameInstance && this.currentGameInstance.onSyncGameStart) {
            this.currentGameInstance.onSyncGameStart();
        }
    }

    onSyncGameCommand(command, data) {
        if (this.currentGameInstance && this.currentGameInstance.onSyncGameStart) {
            this.currentGameInstance.onSyncGameCommand(command, data);
        }
    }

    update() {
        if (this.ready && !this.currentGame) {
            if (this.games.length > 0) {
                this.currentGame = this.games[0];
                this.currentGameInstance = new this.games[0](this, this.games[0]);
            } else if (this.availableGames.length > 0) {
                // this.games.push(shuffle(this.availableGames)[0]);
            }
        }

        if (this.currentGameInstance) this.currentGameInstance.draw();
    }
}


class Game {
    constructor (manager, selfClass) {
        this.manager = manager;
        this.class = selfClass;
        this.listeners = {
            touch: { oneshot: [], repeat: [] },
            move: { oneshot: [], repeat: [] },
            click: { oneshot: [], repeat: [] },
            join: { oneshot: [], repeat: [] },
            swirl: { oneshot: [], repeat: [] },
        }
    }

    _invokeCallbacks(event, data) {
        for (let callback of this.listeners[event].oneshot) {
            callback(data);
        }
        this.listeners[event].oneshot = [];
        for (let callback of this.listeners[event].repeat) {
            callback(data);
        }
    }

    addEventListener(event, callback, oneshot) {
        if (oneshot) {
            this.listeners[event].oneshot.push(callback.bind(this));
        } else {
            this.listeners[event].repeat.push(callback.bind(this));
        }
    }

    terminate() {
        this.manager.terminate(this);
    }

    onUserJoin(user) {
        this._invokeCallbacks('join', user);
    }

    onTouchMove(touches) {
        this._invokeCallbacks('move', touches);
        this._invokeCallbacks('touch', touches);
    }

    onTouchClick(touches) {
        this._invokeCallbacks('click', touches);
        this._invokeCallbacks('touch', touches);
    }

    onSwirlUpdate(swirl) {
        this._invokeCallbacks('swirl', swirl);
    }

    setup() {}
    draw() {}
}

class LocalGame extends Game {
    constructor (manager, selfClass) {
        super(manager, selfClass);
        this.listeners = {
            touch: { oneshot: [], repeat: [] },
            move: { oneshot: [], repeat: [] },
            click: { oneshot: [], repeat: [] },
            join: { oneshot: [], repeat: [] },
            swirl: { oneshot: [], repeat: [] },
        }
        this.setup();
    }
}


class SyncronizedGame extends Game {
    constructor (manager, selfClass) {
        super(manager, selfClass);

        this.listeners.start = { oneshot: [], repeat: [] };
        this.listeners.command = { oneshot: [], repeat: [] };

        logger.log('Starting synced game', this.constructor.name);
        this.addEventListener('start', this.setup.bind(this), true);
        networkManager.startGame(userManager.localUser, this.constructor.name);
        this.prestart();
    }

    onSyncGameStart() {
        this._invokeCallbacks('start', null);
    }

    onSyncGameCommand(command, data) {
        this._invokeCallbacks('command', {
            command: command,
            data: data
        });
    }

    prestart() {}
}

class TouchScreenGame extends LocalGame {
    setup() {
        Promise.delay(this.greet.bind(this), 500)
            // .delay(this.promptToTouch.bind(this), 5000);
        this.learned = {
            click: false,
            doubleClick: false,
            move: false,
        }
    }

    draw() {}

    greet () {
        promptManager.show([
            '哈喽~！欢迎来到这个数字化社交触摸的小实验🤗', 
            'Hello there! Welcome to this little experiment on digitized social touch.'
        ], {
            '下一步 Next': () => { this.promptToTouch(); }
        });
    }

    promptToTouch () {
        promptManager.show([
            '作为开始，你可以试试触摸屏幕的任何位置', 
            'For starters, you can try to touch anywhere on the screen.'
        ], {
            'Okay!': () => { promptManager.clear(); }
        });
        this.addEventListener('touch', this.touched.bind(this), true);
    }

    touched () {
        Promise.delay(this.teachClickAndMove.bind(this), 2000);
    }

    clicked () {
        logger.log('clicked');
        this.learned.click = true;
        if (!this.learned.move) {
            Promise.delay(this.teachMove.bind(this), 3000);
        }
    }

    doubleClicked () {

    }

    moved () {
        logger.log('clicked');
        this.learned.move = true;
        if (!this.learned.click) {
            Promise.delay(this.teachClick.bind(this), 3000);
        }
    }

    teachClickAndMove() {
        promptManager.show([
            '很棒！你既可以点击，也可以用手指或光标划过屏幕，都可以检测到。', 
            'Great! You can both click and drag your finger or mouse across the screen.'
        ], {
            'Okay!': () => { promptManager.clear(); }
        });

        this.addEventListener('click', this.clicked.bind(this), true);
        this.addEventListener('move', this.moved.bind(this), true);
    }

    teachClick () {
        promptManager.show([
            '你也可以在屏幕上单击，会产生小小的波纹', 
            'You can also tap the screen to create a small ripple.'
        ], {
            'Okay!': () => { promptManager.clear(); }
        });
        this.addEventListener('click', this.niceAndTerminate.bind(this), true);
    }

    teachMove () {
        promptManager.show([
            '你还可以在屏幕上拖动手指或光标，划出一条轨迹', 
            'You can also drag your finger or pointer across the screen to draw a curve.'
        ], {
            'Okay!': () => { promptManager.clear(); }
        });
        this.addEventListener('move', this.niceAndTerminate.bind(this), true);
    }

    niceAndTerminate () {
        Promise.delay(this.end.bind(this), 3000);
    }

    end () {
        promptManager.show([
            '非常棒！你已经学会这个实验中需要的所有操作了！☝', 
            'Nice! You now know all the gestures needed in this experiment.'
        ], {
            '赞 Awesome!': () => { 
                promptManager.clear(); 
                userManager.onReadyToJoin();
                Promise.delay(this.terminate.bind(this), 200);
            }
        });
    }
}


class TouchParticipantGame extends LocalGame {
    setup() {
        if (userManager.getNumberOfRemoteUsers() > 0) {
            Promise.delay(this.notify.bind(this), 500);
        } else {
            promptManager.show([
                '这个实验的核心是和其他人的互动。让我们等其他人一会儿……', 
                "The core of this experiment is interacting with others. Let's wait for others to join..."
            ]);
            this.addEventListener('join', this.notify.bind(this), true);
        }
    }

    notify () {
        promptManager.show([
            '看，有其他人在线了👀', 
            "Look! There's someone else on the other side!"
        ]);
        Promise.delay(this.promptToTouch.bind(this), 4000);
    }

    promptToTouch () {
        promptManager.show([
            '当对方触摸屏幕的时候，你的屏幕相应的位置也会亮起。试试点击对方触摸的位置吧。', 
            "When the other person touch the screen, your screen lights up at the same spot. Try touch where they're touching."
        ], {
            '懂了 Got it': () => { promptManager.clear(); }
        });
        this.addEventListener('touch', this.wait.bind(this), true);
    }

    wait() {
        Promise.delay(this.niceAndTerminate.bind(this), 5000);
    }

    niceAndTerminate () {
        promptManager.show([
            '很棒！触摸可以传递很多信息。🤜🤛', 
            'Very good! Touch can convey a lot of information. '
        ], {
            '下一步 Next': () => { 
                promptManager.clear(); 
                Promise.delay(this.terminate.bind(this), 200);
            }
        });
    }
}


class SayHiGame extends LocalGame {
    setup() {
        if (userManager.getNumberOfRemoteUsers() > 0) {
            Promise.delay(this.prompt.bind(this), 20);
        } else {
            promptManager.show(['似乎对面没有人了，让我们稍等一会儿……', "It seems there's no one on the other side. Let's wait a short while..."]);
            this.addEventListener('join', this.prompt.bind(this), true);
        }
    }

    prompt() {
        let remoteUser = userManager.remoteUsers[shuffle(Object.keys(userManager.remoteUsers))[0]];
        promptManager.show([
            '嘿，看到 ' + remoteUser.name + '了吗？跟TA打个招呼，看看对方有什么反应？💡', 
            "Hey! Did you see that " + remoteUser.name + ' is here? How about saying hi? What\'s their reaction?',
            '',
            '当觉得好了的时候，请点击上面的“我做好了”👆', 
            "When you think you've finished, please click the prompt above."
        ], {
            '好的 Cool!': () => { promptManager.clear(); }
        });

        promptManager.showNonblocking([
            '我做好了👌', 
            "I'm done!"
        ], this.end.bind(this));
        // this.addEventListener('touch', this.wait.bind(this), true);
    }

    wait() {
        Promise.delay(this.end.bind(this), 10000);
    }

    end() {
        promptManager.clearNonblocking();
        promptManager.show([
            '赞！👍', 
            "That's a good one!"
        ]);
        Promise.delay(this.terminate.bind(this), 1000);
    }
}


class GetOthersToFollowGame extends SyncronizedGame {
    prestart() {
        if (userManager.getNumberOfRemoteUsers() > 0) {
            promptManager.show([
                '似乎对面还没有准备好，让我们稍等一会儿……⌛️', 
                "It seems the other side is not ready yet. Let's wait a short while..."
            ]);
        } else {
            promptManager.show([
                '似乎对面没有人了，让我们稍等一会儿……⌛️', 
                "It seems there's no one on the other side. Let's wait a short while..."
            ]);
        }
    }

    setup() {
        promptManager.clear();
        this.addEventListener('command', this.command.bind(this));
    }

    command (command) {
        logger.log(command.command, command.data);
        if (command.command === 'elected') this.elected(command);
        else if (command.command === 'follow') this.follow(command);
        else if (command.command === 'stopped') this.stopped(command);
    }

    elected (command) {
        promptManager.show([
            '给你个小挑战：想个办法引起 ' + command.data + ' 的注意，让TA跟随你触摸相同的地方💡', 
            "Here's a little challange: get " + command.data + ' to follow your touch and touch the same spots.',
            '同样，当你觉得可以结束了的时候，可以触摸上面的“我做完了”。',
            'Same as before, when you feel you have finished, please tap the "I\'m done" button above.' 
        ], {
            "开始吧 Let's start": () => { 
                promptManager.clear(); 
            }
        });

        promptManager.showNonblocking([
            '我做好了👌', 
            "I'm done!"
        ], this.nice.bind(this));
    }

    follow (command) {
        promptManager.show([
            '注意看：是不是有谁在示意你做一些事情？是要你做什么呢？🤔', 
            'Note: Is there something that someone is gesturing you to do? What is it?'
        ], {
            "让我看看 Let me see": () => { promptManager.clear(); }
        });
    }

    stopped (command) {
        promptManager.show([
            '好了，先到这里吧～下面只剩最后一个任务了👍', 
            "That was a nice attampt! One more to go..."
        ], {
            "OK!": () => { 
                this.terminate();
            }
        });
    }

    nice() {
        networkManager.notifyGameState(userManager.localUser, 'terminate');
        promptManager.clearNonblocking();
        promptManager.show([
            '好的，很棒！只剩最后一个任务了👍', 
            "That was a nice attampt! One more to go..."
        ], {
            "OK!": () => { 
                this.terminate();
            }
        });
    }
}


class TouchDotGame extends SyncronizedGame {
    prestart() {
        this.swirl = new Swirl(0, 0, false);
        this.touching = false;
        this.totalSuccesses = 0;

        if (userManager.getNumberOfRemoteUsers() > 0) {
            promptManager.show([
                '似乎对面还没有准备好，让我们稍等一会儿……⌛️', 
                "It seems the other side is not ready yet. Let's wait a short while..."
            ]);
        } else {
            promptManager.show([
                '似乎对面没有人了，让我们稍等一会儿……⌛️', 
                "It seems there's no one on the other side. Let's wait a short while..."
            ]);
        }
    }

    setup() {
        promptManager.clear();
        promptManager.show([
            '下面来一个困难一点的：所有人一起合作，触碰屏幕上出现的光点来消除它💡', 
            "Let's try something a bit harder: everyone work together and touch the swirling dots to eliminate them!"
        ], {
            '开始 Let\'s start!': () => { promptManager.clear(); }
        });
        this.addEventListener('command', this.command.bind(this));
    }

    command (command) {
        logger.log(command.command, command.data);
        if (command.command === 'swirl-update') this.updateSwirl(command);
        if (command.command === 'score') this.score(command);
        if (command.command === 'success') this.success(command);
    }

    updateSwirl (command) {
        this.swirl.show = true;
        this.checkTouch = true;
        this.swirl.x = command.data[0] * windowWidth;
        this.swirl.y = command.data[1] * windowHeight;
    }

    score (command) {
        let prompts = [
            ['就是这样！👏', "That's it!"],
            ['很赞！👏', "Awesome!"],
            ['合作非常棒！👏', "Great teamwork!"],
            ['再来一次！👏', "Again!"],
            ['最后一个了！🎉', "Here's the last one!"]
        ]
        promptManager.showNonblocking(prompts[this.totalSuccesses]);
        this.checkTouch = false;
        this.swirl.show = false;
        this.totalSuccesses = command.data;
    }

    success (command) {
        this.swirl.show = false;
        Promise.delay(this.end.bind(this), 500);
    }

    end () {
        promptManager.show([
            '你们的合作太棒了！🎉整个实验到这里就结束了，最后还需要请你填写一个问卷，以便对你这次实验的体验进行总结分析。👀', 
            "Great teamwork! This is the end of the experiment, but please stay a while to fill in the experience assessment questionnaire. "
        ], {
            '去填写 Go to the questionnaire': () => {
                if (ANONYMITY && DRAW_AVATAR && SYNERGY) {
                    window.location.href = V111_LINK;
                } else if (!ANONYMITY && DRAW_AVATAR && SYNERGY) {
                    window.location.href = V100_LINK;
                } else if (ANONYMITY && !DRAW_AVATAR && SYNERGY) {
                    window.location.href = V010_LINK;
                } else if (ANONYMITY && DRAW_AVATAR && !SYNERGY) {
                    window.location.href = V001_LINK;
                }
            }
        });
    }

    draw() {
        this.swirl.draw();
        
        let touching = false;
        for (let touch of userManager.localUser.painter.lastParticles) {
            let dist = distance(touch.x, touch.y, this.swirl.x, this.swirl.y);
            if (dist < 50) {
                touching = true;
                break;
            }
        }

        if (touching && !this.touching) {
            networkManager.notifyGameState(userManager.localUser, 'touching');
        } else if (!touching && this.touching) {
            networkManager.notifyGameState(userManager.localUser, 'not-touching');
        }
        this.touching = touching;
        
    }
}