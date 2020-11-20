class Particle {
    
    constructor (x, y, scale, opacity, r, g, b) {
        this.x = x;
        this.y = y;
        this.scale = scale ? scale : 0;
        this.opacity = opacity ? opacity : 15;
        this.r = r ? r : 220;
        this.g = g ? g : 100;
        this.b = b ? b : 255;
        this.age = 0;

        this.maxAge = 30;
    }

    delete () {
        if (this.manager) {
            this.manager.delete(this);
        }
    }

    draw (dontAge) {
        push();
        blendMode(ADD);
        strokeWeight(1);

        stroke(this.r, this.g, this.b, this.opacity);
        noFill();
        circle(this.x, this.y, this.scale * 100 + 30 + this.age / this.maxAge * 30);
        
        fill(this.r, this.g, this.b, this.opacity * 2 * (1 - this.age / this.maxAge));
        stroke(this.r, this.g, this.b, this.opacity * 2);
        circle(this.x, this.y, this.scale * 100 + 20 + this.age / this.maxAge * 30);
        
        pop();

        if (!dontAge) {
            this.age++;
            if (this.age >= this.maxAge) this.delete();
        }
    }
}


class Swirl {

    constructor (x, y, show) {
        this.particles = [];
        this.x = x;
        this.y = y;
        this.show = show;
        this.angle = 0;
        this.radius = 5;
        this.lastTime = 0;
    }

    addParticle (particle) {
        particle.manager = this;
        this.particles.push(particle);
    }

    delete (particle) {
        for (var i in this.particles) {
            if (particle === this.particles[i]) {
                this.particles.splice(i, 1);
                return;
            }
        }
    }

    update () {
        if (!this.show) return;
        if (millis() - this.lastTime > 30) {
            let x = this.x + cos(this.angle) * this.radius;
            let y = this.y + sin(this.angle) * this.radius;
            this.addParticle(new Particle(x, y, 0.3, 5, 150, 255, 255));
            this.angle += 0.6;
            if (this.angle > TWO_PI) this.angle = 0;
            this.lastTime = millis();
        }
        
    }

    draw () {
        this.update();
        for (var particle of this.particles) {
            particle.draw();
        }
    }

}


class ParticlePainter {

    constructor (user, r, g, b, opacity) {
        this.r = r ? r : 255;
        this.g = g ? g : 255;
        this.b = b ? b : 255;
        this.opacity = opacity ? opacity : 15;
        this.particles = [];
        this.lastParticles = [];
        this.user = user;
    }

    addParticle (particle) {
        particle.manager = this;
        this.particles.push(particle);
    }

    delete (particle) {
        for (var i in this.particles) {
            if (particle === this.particles[i]) {
                this.particles.splice(i, 1);
            }
        }
    }

    update (touches) {
        let lastParticles = [];
        for (let touch of touches) {
            this.addParticle(new Particle(touch.x, touch.y, touch.force, 15, this.r, this.g, this.b));
            lastParticles.push(new Particle(touch.x, touch.y, 0.5, this.opacity, this.r, this.g, this.b));
        }
        if (lastParticles.length > 0) {
            this.lastParticles = lastParticles;
        }
    }

    draw () {
        // console.log(this.particles);
        for (var particle of this.particles) {
            particle.draw();
        }

        for (var particle of this.lastParticles) {
            particle.draw(true);
        }

        
    }

}