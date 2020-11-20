class InteractionVisualizer {

    constructor () {
    }

    draw() {
        push();
        strokeWeight(3);
        for (let touch1 of userManager.localUser.touches) {
            for (let user of Object.keys(userManager.remoteUsers)) {
                for (let touch2 of userManager.remoteUsers[user].touches) {
                    let x1 = touch1.x * windowWidth;
                    let y1 = touch1.y * windowHeight;
                    let x2 = touch2.x;
                    let y2 = touch2.y;
                    let dist = distance(x1, y1, x2, y2);
                    let opacity = dist.map(0, 350, 255, 0);
                    stroke(255, 255, 255, opacity);
                    line(x1, y1, x2, y2);
                }
            }
        }
        pop();
    }

}