class Touch {
    constructor(x, y, force, id) {
        this.x = x;
        this.y = y;
        this.force = force ? force : 0;
        this.id = id ? id : 0;
        this.age = 0;
    }
}

class TouchDetector {

    constructor(canvas, callbacks) {
        // console.log(canvas);
        this.canvas = canvas;
        this.callbacks = callbacks;
        this.device = getDeviceType();
        this.touches = [];
        this.moved = false;
        this.text = '';

        // if (getDeviceType() === 'desktop')
        this.setupForceDetector();
    }

    setupForceDetector() {
        var supportsMouse = false;
        var supportsTouch = false;
        var supportsPointer = false;
        var supportsTouchForce = false;
        var supportsTouchForceChange = false;

        if (typeof window !== 'undefined') {
            if (typeof Touch !== 'undefined') {
                try {
                    if (Touch.prototype.hasOwnProperty('force') || 'force' in new Touch()) {
                        supportsTouchForce = true;
                    }
                } catch (e) { }
            }

            supportsTouch = 'ontouchstart' in window.document && supportsTouchForce;
            supportsMouse = 'onmousemove' in window.document && 'onwebkitmouseforcechanged' in window.document && !supportsTouch;
            supportsPointer = 'onpointermove' in window.document;
            supportsTouchForceChange = 'ontouchforcechange' in window.document;
        }

        // console.log(supportsTouchForce, supportsMouse, supportsTouch, supportsPointer, supportsTouchForceChange);

        if (supportsMouse) {
            logger.log('Binding force touch');
            this.bindDafault();
        } else if (supportsTouch) {
            logger.log('Binding 3D touch');
            this.bind3DTouch();
        } else {
            if (supportsPointer) {
                logger.log('Binding pointer');
                this.bindPointer();
            }
            logger.log('Binding default');
            this.bindDafault();
        }

        document.body.style.webkitTouchCallout = "none";
        document.body.style.webkitUserSelect = "none";
        document.body.style.khtmlUserSelect = "none";
        document.body.style.MozUserSelect = "none";
        document.body.style.msUserSelect = "none";
        document.body.style.userSelect = "none";
    }
    
    bindDafault () {
        this.canvas.addEventListener('mousedown', function (event) {
            this.moved = false;
            // this.touches = [new Touch(event.offsetX, event.offsetY, 0.5)];
            event.preventDefault();
        }.bind(this), false);

        this.canvas.addEventListener('mousemove', function (event) {
            if (mouseIsPressed) {
                this.moved = true;
                let force = Math.sqrt(event.movementX * event.movementX + event.movementY * event.movementY);
                this.touches = [new Touch(event.offsetX, event.offsetY, force.map(0, 300, 0, 1).constrain(0, 1))];
                userManager.updateLocalTouches(this.touches);
                gameManager.onTouchMove(this.touches);
            }
            event.preventDefault();
        }.bind(this), false);

        this.canvas.addEventListener('mouseup', function (event) {
            if (!this.moved) {
                this.touches = [new Touch(event.offsetX, event.offsetY, 1)];
                gameManager.onTouchClick(this.touches);
            } else {
                this.touches = [];
            }
            userManager.updateLocalTouches(this.touches);
            event.preventDefault();
        }.bind(this), false);
    }

    bindForceTouch () {
        this.canvas.addEventListener('mousedown', function (event) {
            this.moved = false;
            event.preventDefault();
        }.bind(this), false);

        this.canvas.addEventListener('mousemove', function (event) {
            let force = event.webkitForce === 0 ? event.webkitForce : event.webkitForce.map(1, 3, 0, 1);
            if (mouseIsPressed) force = 1;
            this.touches = [new Touch(event.offsetX, event.offsetY, force)];
            userManager.updateLocalTouches(this.touches);
            gameManager.onTouchMove(this.touches);
            event.preventDefault();
        }.bind(this), false);

        this.canvas.addEventListener('mouseup', function (event) {
            if (!this.moved) {
                this.touches = [new Touch(event.offsetX, event.offsetY, 1)];
                gameManager.onTouchClick(this.touches);
            } else {
                this.touches = [];
            }
            userManager.updateLocalTouches(this.touches);
            event.preventDefault();
        }.bind(this), false);
    }

    bindPointer () {
        this.canvas.addEventListener('onpointermove', function (event) {
            // console.log(event);
            event.preventDefault();
        }.bind(this), false);
    }

    bind3DTouch () {
        this.canvas.addEventListener('touchstart', function (event) {
            this.moved = false;
            event.preventDefault();
        }.bind(this), false);

        this.canvas.addEventListener('touchmove', function (event) {
            let touches = [];
            for (let touchEvent of event.touches) {
                touches.push(new Touch(touchEvent.pageX, touchEvent.pageY, touchEvent.force))
            }
            this.touches = touches;
            this.moved = true;
            userManager.updateLocalTouches(this.touches);
            gameManager.onTouchMove(this.touches);
            event.preventDefault();
        }.bind(this), false);

        this.canvas.addEventListener('touchend', function (event) {
            if (!this.moved) {
                let touches = [];
                for (let touchEvent of event.changedTouches) {
                    this.text += '\n' + touchEvent.pageX + ' ' + touchEvent.pageY;
                    touches.push(new Touch(touchEvent.pageX, touchEvent.pageY, 1));
                }
                gameManager.onTouchClick(this.touches);
                this.touches = touches;
            } else {
                this.touches = [];
            }
            userManager.updateLocalTouches(this.touches);
            event.preventDefault();
        }.bind(this), false);
    }

    update () {
        let touchChanged = false;
        for (let i in this.touches) {
            this.touches[i].age ++;
            if (this.touches[i].age > 2 && !mouseIsPressed) {
                this.touches.splice(i, 1);
                touchChanged = true;
            }
        }
        if (touchChanged) userManager.updateLocalTouches(this.touches);
    }

}