class NetworkManager {

    constructor (address) {
        this.address = address ? address : 'wss://shengchen.design:8765';
        // this.address = address ? address : 'ws://192.168.31.10:8765';
        this.ready = false;

        // Start websocket connection
        this.socket = new WebSocket(this.address);
        this.socket.addEventListener('open', this._onWebsocketOpen.bind(this));
        this.socket.addEventListener('message', this._onWebsocketMessage.bind(this));
        this.socket.addEventListener('close', this._onWebsocketClose.bind(this));
        this.socket.addEventListener('error', this._onWebsocketError.bind(this));
    }

    _onWebsocketOpen (event) {
        this.ready = true;
        logger.log('Connected to server.');
        promptManager.clear();
        // userManager.onReadyToJoin();
        gameManager.onReadyToGame();
    }

    _onWebsocketMessage (event) {
        let data = JSON.parse(event.data);
        if (data.message === 'join') {
            logger.log(data.name + ' (' + data.id + ') has joined!');
            userManager.addRemoteUser(data.id, data.name, data.icon);
        } else if (data.message === 'leave') {
            logger.log(data.name + ' (' + data.id + ') has left.');
            userManager.removeRemoteUser(data.id);
        } else if (data.message === 'touch') {
            for (var i = 0; i < data.data.length; i++) {
                data.data[i].x *= windowWidth;
                data.data[i].y *= windowHeight;
            }
            userManager.updateRemoteTouches(data.id, data.data);
        } else if (data.message === 'prompt') {
            promptManager.show(data.data);
        } else if (data.message === 'name') {
            userManager.setName(data.name);
        } else if (data.message === 'icon') {
            userManager.setIcon(data.name);
        } else if (data.message === 'swirl') {
            gameManager.onSwirlUpdate(data.participants, data.data);
        } else if (data.message === 'start') {
            gameManager.onSyncGameStart();
        } else if (data.message === 'command') {
            gameManager.onSyncGameCommand(data.command, data.data);
        }
    }

    _onWebsocketClose (event) {
        if (this.ready) {
            promptManager.show([
                '正在连接到服务器……🖥', 
                'Connecting to the server...'
            ]);
        }
        logger.log('Connection to server is closed. Reconnecting...');
        this.ready = false;
        
        setTimeout(function () {
            this.socket = new WebSocket(this.address);
            this.socket.addEventListener('open', this._onWebsocketOpen.bind(this));
            this.socket.addEventListener('message', this._onWebsocketMessage.bind(this));
            this.socket.addEventListener('close', this._onWebsocketClose.bind(this));
            this.socket.addEventListener('error', this._onWebsocketError.bind(this));
        }.bind(this), 2000);
    }

    _onWebsocketError (event) {
        logger.log('Websocket error.');
        this.socket.close();
        this.ready = false;
    }

    joinRoom (user) {
        if (!this.ready) return;
        this.socket.send(JSON.stringify({
            id: user.id,
            name: user.name,
            message: 'join'
        }))
    }

    publishTouches (user, touches) {
        if (!this.ready) return;
        for (var i = 0; i < touches.length; i++) {
            touches[i].x /= windowWidth;
            touches[i].y /= windowHeight;
        }
        this.socket.send(JSON.stringify({
            id: user.id,
            name: user.name,
            message: 'touch',
            data: touches
        }))
    }

    startGame (user, game) {
        if (!this.ready) return;
        this.socket.send(JSON.stringify({
            id: user.id,
            name: user.name,
            message: 'game',
            data: game
        }))
    }

    notifyGameState (user, data) {
        if (!this.ready) return;
        this.socket.send(JSON.stringify({
            id: user.id,
            message: 'game-update',
            data: data
        }))
    }

}