class User {
    constructor (id, name) {
        this.id = id ? id : nanoid();
        this.name = name ? name : '';
        this.touches = [];
        this.painter = new ParticlePainter();
    }

    updateLocalTouches(touches) {
        this.touches = touches;
        this.painter.update(this.touches);
        // networkManager.publishTouches(this, this.touches);
    }

    draw () {
        this.painter.draw();
    }
}


class UserManager {
    constructor () {
        this.localUser = new User();
        this.remoteUsers = [];
    }

    addRemoteUser (id, name) {
        this.remoteUsers.push(new User(id, name));
    }

    removeRemoteUser(id) {
        for (var i = 0; i < this.remoteUsers.length; i++) {
            if (this.remoteUsers[i].id === id) {
                this.remoteUsers.splice(i, 1);
                return;
            }
        }
    }

    onReadyToJoin() {
        networkManager.joinRoom(this.localUser);
    }

    updateLocalTouches(touches) {
        this.localUser.updateLocalTouches(touches);
    }

    draw () {
        this.localUser.draw();
        for (let remoteUser of this.remoteUsers) {
            remoteUser.draw();
        }
    }
}