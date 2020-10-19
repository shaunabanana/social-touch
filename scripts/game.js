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
        logger.log(game.name);
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
            move: {
                oneshot: [],
                repeat: []
            },
            click: {
                oneshot: [],
                repeat: []
            },
            join: {
                oneshot: [],
                repeat: []
            },
            swirl: {
                oneshot: [],
                repeat: []
            }
        }
        logger.log('Starting', this.constructor.name);
        networkManager.startGame(userManager.localUser, this.constructor.name);
        this.setup();
    }

    onUserJoin(user) {
        for (let callback of this.listeners.join.oneshot) {
            callback(user);
        }
        this.listeners.join.oneshot = [];
        for (let callback of this.listeners.join.repeat) {
            callback(user);
        }
    }

    onTouchMove(touches) {
        for (let callback of this.listeners.move.oneshot) {
            callback(touches);
        }
        this.listeners.move.oneshot = [];
        for (let callback of this.listeners.move.repeat) {
            callback(touches);
        }
    }

    onTouchClick(touches) {
        for (let callback of this.listeners.click.oneshot) {
            callback(touches);
        }
        this.listeners.click.oneshot = [];
        for (let callback of this.listeners.click.repeat) {
            callback(touches);
        }
    }

    onSwirlUpdate(swirl) {
        for (let callback of this.listeners.swirl.oneshot) {
            callback(swirl);
        }
        this.listeners.swirl.oneshot = [];
        for (let callback of this.listeners.swirl.repeat) {
            callback(swirl);
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

    setup() {}
    draw() {}
}

class TouchScreenGame extends Game {
    setup() {
        Promise.delay(this.greet.bind(this), 2000)
            .delay(this.promptToTouch.bind(this), 5000);
    }

    draw() {}

    greet () {
        promptManager.show(['哈喽~！欢迎来到这个数字化社交触摸的小实验🤗', 'Hello there! Welcome to this little experiment on digitized social touch.']);
    }

    promptToTouch () {
        promptManager.show(['作为开始，你可以试试点击屏幕的任何位置', 'For starters, you can try to tap anywhere on screen.']);
        this.addEventListener('move', this.niceAndTerminate.bind(this), true);
        this.addEventListener('click', this.niceAndTerminate.bind(this), true);
    }

    niceAndTerminate () {
        promptManager.show(['非常棒！你已经学会这个实验中唯一需要的操作了！☝', 'Nice! You now know the only required operation in this experiment.']);
        Promise.delay(this.terminate.bind(this), 1000);
    }
}


class TouchParticipantGame extends Game {
    setup() {
        if (userManager.getNumberOfRemoteUsers() > 0) {
            Promise.delay(this.notify.bind(this), 4000);
        } else {
            promptManager.show(['这个实验的核心是和其他人的互动。让我们等其他人一会儿……', "The core of this experiment is interacting with others. Let's wait for others to join..."]);
            this.addEventListener('join', this.notify.bind(this), true);
        }
    }

    notify () {
        promptManager.show(['看，有其他人在线！👀', "Look! There's someone else on the other side!"]);
        Promise.delay(this.promptToTouch.bind(this), 4000);
    }

    promptToTouch () {
        promptManager.show(['你可能会看到对方也在触摸屏幕，试试点击对方触摸的位置吧。', "You may see the other person touch the screen as well. Try touch where they're touching."]);
        this.addEventListener('move', this.niceAndTerminate.bind(this), true);
        this.addEventListener('click', this.niceAndTerminate.bind(this), true);
    }

    niceAndTerminate () {
        promptManager.show(['很棒！触摸可以传递很多信息。🤜🤛', 'Very good! Touch can convey a lot of information. ']);
        Promise.delay(this.terminate.bind(this), 1000);
    }
}


class SayHiGame extends Game {
    setup() {
        if (userManager.getNumberOfRemoteUsers() > 0) {
            Promise.delay(this.prompt.bind(this), 1000);
        } else {
            promptManager.show(['似乎对面没有人了，让我们稍等一会儿……', "It seems there's no one on the other side. Let's wait a short while..."]);
            this.addEventListener('join', this.prompt.bind(this), true);
        }
    }

    prompt() {
        let remoteUser = userManager.remoteUsers[shuffle(Object.keys(userManager.remoteUsers))[0]];
        promptManager.show([
            '嘿，看到 ' + remoteUser.name + '了吗？跟TA打个招呼吧💡', 
            "Hey! Did you see that " + remoteUser.name + ' is here? How about saying hi?'
        ]);
        this.addEventListener('move', this.wait.bind(this), true);
        this.addEventListener('click', this.wait.bind(this), true);
    }

    wait() {
        Promise.delay(this.end.bind(this), 2000);
    }

    end() {
        promptManager.show([
            '赞！👍', 
            "That's a good one!"
        ]);
        Promise.delay(this.terminate.bind(this), 1000);
    }
}


class GetOthersToFollowGame extends Game {
    setup() {
        if (userManager.getNumberOfRemoteUsers() > 0) {
            Promise.delay(this.prompt.bind(this), 4000);
        } else {
            promptManager.show(['似乎对面没有人了，让我们稍等一会儿……', "It seems there's no one on the other side. Let's wait a short while..."]);
            this.addEventListener('join', this.prompt.bind(this), true);
        }
    }

    prompt() {
        let remoteUser = userManager.remoteUsers[shuffle(Object.keys(userManager.remoteUsers))[0]];
        promptManager.show([
            '给你个小挑战：引起 ' + remoteUser.name + ' 的注意，让TA跟随你的触摸💡', 
            "Here's a little challange: get " + remoteUser.name + ' to follow your touch.'
        ]);
        Promise.delay(this.end.bind(this), 15000);
    }

    end() {
        promptManager.show([
            '一次很好的尝试！👍', 
            "That was a nice attampt!"
        ]);
        Promise.delay(this.terminate.bind(this), 1000);
    }
}


class TouchDotGame extends Game {
    setup() {
        this.swirl = new Swirl(0, 0, false);
        
        this.started = false;
        this.checkTouch = false;
        if (userManager.getNumberOfRemoteUsers() > 0) {
            Promise.delay(this.prompt.bind(this), 1000);
        } else {
            promptManager.show(['对面空空如也，让我们稍等别人加入……', "It seems there's no one on the other side. Let's wait a short while..."]);
            this.addEventListener('join', this.prompt.bind(this), true);
        }
        this.totalSuccesses = 0;
    }

    prompt() {
        this.started = true;
        let remoteUser = userManager.remoteUsers[shuffle(Object.keys(userManager.remoteUsers))[0]];
        promptManager.show([
            '下面来一个困难的：所有人一起合作，触碰屏幕上出现的光点来消除它💡', 
            "Let's try something harder: everyone work together and touch the swirling dots to eliminate them!"
        ]);
        this.timer = setInterval(function () {
            networkManager.startGame(userManager.localUser, this.constructor.name);
        }.bind(this), 1000);
        this.checkTouch = true;
    }

    nice () {
        let prompts = [
            ['合作非常棒！👏', "Great teamwork!"],
            ['很赞！👏', "Awesome!"],
            ['非常好！👏', "Very nice!"],
            ['真是合作无间！👏', "You work so well together!"],
            ['棒！👏', "Good!"],
            ['强！👏', "That's great!"],
            ['非常好！👏', "Very nice!"],
        ]
        promptManager.show(prompts[this.totalSuccesses]);
        this.checkTouch = false;
        this.swirl.show = false;
        this.totalSuccesses++;
        if (this.totalSuccesses >= 6) {
            promptManager.show([
                '哇，你们已经很有默契啦~引导到这里就结束了，接下来你们可以随意自由探索，Good luck！🙌', 
                "Wow, you are really in sync! This is the end of the guided tour. You are now free to explore the site. Good luck!"
            ]);
            Promise.delay(this.terminate.bind(this), 1000);
        } else {
            networkManager.notifyScored(userManager.localUser);
        }
        
    }

    draw() {
        // networkManager.startGame(userManager.localUser, this.constructor.name);
        if (this.started && gameManager.swirlLocation 
            && gameManager.swirlLocation[0] !== this.swirl.x 
            && gameManager.swirlLocation[1] !== this.swirl.y) {

            this.swirl.x = gameManager.swirlLocation[0];
            this.swirl.y = gameManager.swirlLocation[1];
            this.swirl.show = true;
            this.checkTouch = true;
        }
        this.swirl.draw();

        if (this.checkTouch) {
            let totalTouching = 0;

            for (let touch of userManager.localUser.painter.lastParticles) {
                let dist = distance(touch.x, touch.y, this.swirl.x, this.swirl.y);
                if (dist < 50) {
                    totalTouching += 1;
                    break;
                }
            }

            for (let uid of Object.keys(userManager.remoteUsers)) {
                let user = userManager.remoteUsers[uid];
                for (let touch of user.painter.lastParticles) {
                    let dist = distance(touch.x, touch.y, this.swirl.x, this.swirl.y);
                    if (dist < 50) {
                        totalTouching += 1;
                        break;
                    }
                }
            }

            if (totalTouching >= gameManager.participants) {
                logger.log('score!');
                this.nice();
            }
        }
        
        
    }
}