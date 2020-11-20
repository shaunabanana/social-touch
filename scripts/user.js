class User {
    constructor (id, name, icon, local) {
        this.id = id ? id : nanoid();
        this.name = name ? name : '';
        this.icon = icon ? icon : null;
        this.touches = [];
        this.painter = local ? new ParticlePainter(this, 255, 100, 255, 25) : new ParticlePainter(this);
        this.avatarX = windowWidth / 2;
        this.avatarY = windowHeight / 2;
        this.avatarGoalX = windowWidth / 2;
        this.avatarGoalY = windowHeight / 2;
    }

    updateTouches(touches) {
        this.touches = touches;
        this.painter.update(this.touches);

        if (touches.length > 0) {
            let x = 0, y = 0;
            for (let touch of touches) {
                x += touch.x;
                y += touch.y;
            }
            this.avatarGoalX = x / touches.length;
            this.avatarGoalY = y / touches.length;
        }
    }

    draw () {
        this.painter.draw();

        if (DRAW_AVATAR) {
            this.avatarX = 0.8 * this.avatarX + 0.2 * this.avatarGoalX;
            this.avatarY = 0.8 * this.avatarY + 0.2 * this.avatarGoalY;

            // for (var particle of this.painter.lastParticles) {
            //     if (this.painter.lastParticles.length > 0 && this.painter.particles.length < 20) {
            push();
            fill(255, 255, 255, 255);
            textAlign(CENTER, CENTER);
            text(this.name, this.avatarX, this.avatarY + 50);
            if (this.icon) {
                tint(255, 70);
                image(this.icon, this.avatarX - 30, this.avatarY - 30, 60, 60);
            }
            pop();
            //     }
            // }
        }
    }
}


class UserManager {
    constructor (userName) {
        let userId = localStorage.getItem('USER_ID');
        userId = userId ? userId : nanoid();
        localStorage.setItem('USER_ID', userId);
        
        this.localUser = new User(userId, userName, null, true);
        logger.log('The local user id is:', userId);
        this.remoteUsers = {};
        this.icons = {};
        this.icons['Anonymous Bear'] = bearIcon;
        this.icons['Anonymous Bird'] = birdIcon;
        this.icons['Anonymous Buffalo'] = buffaloIcon;
        this.icons['Anonymous Cat'] = catIcon;
        this.localTouches = [];
    }

    getNumberOfRemoteUsers() {
        return Object.keys(this.remoteUsers).length;
    }

    addRemoteUser (id, name, icon) {
        logger.log(name);
        this.remoteUsers[id] = new User(id, name, this.icons[icon]);
        gameManager.onUserJoin(this.remoteUsers[id]);
    }

    removeRemoteUser(id) {
        delete this.remoteUsers[id];
    }

    onReadyToJoin() {
        networkManager.joinRoom(this.localUser);
        networkManager.publishTouches(this.localUser, this.localTouches);
    }

    setName(name) {
        this.localUser.name = name + ' (You)';
    }

    setIcon(name) {
        this.localUser.icon = this.icons[name];
    }

    updateLocalTouches(touches) {
        this.localUser.updateTouches(touches);
        networkManager.publishTouches(this.localUser, touches);

        if (touches.length > 0) {
            this.localTouches = touches;
        }
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