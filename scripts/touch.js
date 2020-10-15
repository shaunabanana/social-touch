class Touch {
    constructor(x, y, force, id) {
        this.x = x;
        this.y = y;
        this.force = force ? force : 0;
        this.id = id ? id : 0;
    }
}

class TouchDetector {

    constructor(canvas) {
        console.log(canvas);
        this.canvas = canvas;
        this.device = getDeviceType();
        this.touches = [];

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
            // only attempt to assign these in a browser environment.
            // on the server, this is a no-op, like the rest of the library
            if (typeof Touch !== 'undefined') {
                // In Android, new Touch requires arguments.
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
            console.log('Binding force touch');
            this.bindForceTouch();
        } else if (supportsTouch) {
            console.log('Binding 3D touch');
            this.bind3DTouch();
        } else {
            if (supportsPointer) {
                console.log('Binding pointer');
                this.bindPointer();
            }
            console.log('Binding default');
            this.bindDafault();
        }
    }
    
    bindDafault () {
        this.canvas.addEventListener('mousemove', function (event) {
            console.log(event);
        }.bind(this));
    }

    bindForceTouch () {
        // this.canvas.addEventListener('webkitmouseforcechanged', function (event) {
        //     console.log(event.webkitForce.map(1, 3, 0, 1));
        // }.bind(this));
        this.canvas.addEventListener('mousemove', function (event) {
            let force = event.webkitForce === 0 ? event.webkitForce : event.webkitForce.map(1, 3, 0, 1);
            if (mousePressed) force = 1;
            this.touches = [new Touch(event.clientX, event.clientY, force)];
            console.log(this.touches);
        }.bind(this));
    }

    bindPointer () {
        this.canvas.addEventListener('onpointermove', function (event) {
            console.log(event);
        }.bind(this));
    }

    bind3DTouch () {}

}