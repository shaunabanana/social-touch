class Touch {
    constructor(x, y, force, id) {
        this.x = x;
        this.y = y;
        this.force = force ? force : 0;
        this.id = id ? id : 0;
    }
}

class TouchDetector {

    constructor(canvas, callbacks) {
        console.log(canvas);
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

        console.log(supportsTouchForce, supportsMouse, supportsTouch, supportsPointer, supportsTouchForceChange);

        if (supportsMouse) {
            this.text = '\nBinding force touch';
            this.bindForceTouch();
        } else if (supportsTouch) {
            this.text = '\nBinding 3D touch';
            this.bind3DTouch();
        } else {
            if (supportsPointer) {
                this.text = '\nBinding pointer';
                this.bindPointer();
            }
            this.text += '\nBinding default';
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
            this.touches = [new Touch(event.offsetX, event.offsetY, 0.5)];
            event.preventDefault();
        }.bind(this), false);

        this.canvas.addEventListener('mousemove', function (event) {
            if (mouseIsPressed) {
                this.moved = true;
                let force = Math.sqrt(event.movementX * event.movementX + event.movementY * event.movementY);
                this.touches = [new Touch(event.offsetX, event.offsetY, force.map(0, 300, 0, 1).constrain(0, 1))];
            }
            event.preventDefault();
        }.bind(this), false);

        this.canvas.addEventListener('mouseup', function (event) {
            if (!this.moved) {
                this.text += '\nclick';
            }
            this.touches = [];
            event.preventDefault();
        }.bind(this), false);
    }

    bindForceTouch () {
        this.canvas.addEventListener('mousemove', function (event) {
            let force = event.webkitForce === 0 ? event.webkitForce : event.webkitForce.map(1, 3, 0, 1);
            if (mousePressed) force = 1;
            this.touches = [new Touch(event.offsetX, event.offsetY, force)];
            console.log(this.touches);
            event.preventDefault();
        }.bind(this), false);
    }

    bindPointer () {
        this.canvas.addEventListener('onpointermove', function (event) {
            console.log(event);
            event.preventDefault();
        }.bind(this), false);
    }

    bind3DTouch () {
        this.canvas.addEventListener('touchmove', function (event) {
            let touches = [];
            for (let touchEvent of event.touches) {
                touches.push(new Touch(touchEvent.pageX, touchEvent.pageY, touchEvent.force))
            }
            this.touches = touches;
            console.log(this.touches);
            event.preventDefault();
        }.bind(this), false);
    }


    draw() {
        text(this.text, 20, 20);
        for (var touch of this.touches) {
            circle(touch.x, touch.y, touch.force * 100 + 20);
        }
    }

}