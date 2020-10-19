class User {
    constructor (id, name, icon) {
        this.id = id ? id : nanoid();
        this.name = name ? name : 'Anonymous';
        this.icon = icon ? icon : 'Anonymous';
        this.touches = [];
        this.painter = new ParticlePainter(this);
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
        this.icons = {};
        this.icons['Anonymous Bear'] = bearIcon;
        this.icons['Anonymous Bird'] = birdIcon;
        this.icons['Anonymous Buffalo'] = buffaloIcon;
        this.icons['Anonymous Cat'] = catIcon;
    }

    getNumberOfRemoteUsers() {
        return Object.keys(this.remoteUsers).length;
    }

    addRemoteUser (id, name) {
        logger.log(name);
        this.remoteUsers[id] = new User(id, name, this.icons[name]);
        gameManager.onUserJoin(this.remoteUsers[id]);
    }

    removeRemoteUser(id) {
        delete this.remoteUsers[id];
    }

    onReadyToJoin() {
        networkManager.joinRoom(this.localUser);
    }

    setNameIcon(name) {
        this.localUser.name = name + ' (You)';
        this.localUser.icon = this.icons[name];
        console.log(this.icons[name]);
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