class User {
    constructor (id, name) {
        this.id = id ? id : nanoid();
        this.name = name ? name : 'Anonymous';
        this.touches = [];
        this.painter = new ParticlePainter();
    }

    updateTouches(touches) {
        this.touches = touches;
        this.painter.update(this.touches);
    }

    draw () {
        this.painter.draw();
    }
}


class UserManager {
    constructor () {
        this.localUser = new User();
        this.remoteUsers = {};
    }

    addRemoteUser (id, name) {
        this.remoteUsers[id] = new User(id, name);
    }

    removeRemoteUser(id) {
        delete this.remoteUsers[id];
    }

    onReadyToJoin() {
        networkManager.joinRoom(this.localUser);
    }

    updateLocalTouches(touches) {
        this.localUser.updateTouches(touches);
        networkManager.publishTouches(this.localUser, touches);
    }

    updateRemoteTouches(id, touches) {
        this.remoteUsers[id].updateTouches(touches);
    }

    draw () {
        this.localUser.draw();
        for (let id of Object.keys(this.remoteUsers)) {
            this.remoteUsers[id].draw();
        }
    }
}