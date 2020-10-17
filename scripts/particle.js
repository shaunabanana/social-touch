class Particle {
    
    constructor (x, y, scale) {
        this.x = x;
        this.y = y;
        this.scale = scale ? scale : 0;
        this.age = 0;

        this.maxAge = 30;
    }

    delete () {
        if (this.manager) {
            this.manager.delete(this);
        }
    }

    draw () {
        push();
        strokeWeight(1);

        stroke(255, 255, 255, 15);
        noFill();
        circle(this.x, this.y, this.scale * 100 + 30 + this.age / this.maxAge * 30);
        
        fill(255, 255, 255, 30 * (1 - this.age / this.maxAge));
        stroke(255, 255, 255, 30);
        circle(this.x, this.y, this.scale * 100 + 20 + this.age / this.maxAge * 30);
        
        pop();
        this.age++;
        if (this.age >= this.maxAge) this.delete();
    }
}


class ParticlePainter {

    constructor () {
        this.particles = [];
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
        for (let touch of touches) {
            this.addParticle(new Particle(touch.x, touch.y, touch.force));
        }
    }

    draw () {
        // console.log(this.particles);
        for (var particle of this.particles) {
            particle.draw();
        }
    }

}