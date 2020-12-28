export default class MenuManager {
    constructor({ app, threeManager }) {
        this.threeManager = threeManager;
        this.intersectionManager = threeManager.intersectionManager;
        this.app = app;
        this.DOM = {
            sub: document.querySelector("#subTitle"),
            hover: document.querySelector("#hover"),
            normal: document.querySelector("#normal"),
            pointer: document.querySelector("#pointer"),
        }
        this.state = {
            now: null,
            delta: null,
            vector: new THREE.Vector2(),
            speed: 0.00125,
            lastTick: performance.now(),
            delta: 1,
            cursorArray: [],
            intersects: [],
            canHover: false,

        }
    }
    rotateMenu(state) {
        this.state.now = performance.now();
        if (state.menu.isOpen && this.state.lastTick) {

            this.state.delta = this.state.now - this.state.lastTick;
            if (this.state.delta < (100 / 120))
                return
            this.threeManager.state.projects.rotation.y += (this.state.speed * this.state.delta / 25 * state.menu.direction) * 0.9 + (this.app.state.menu.lerpTo) * 0.1;
            this.app.state.menu.lerpTo = this.app.state.menu.lerpTo * 0.975;
            this.state.lastTick = this.state.now;
        } else {
            this.state.lastTick = this.state.now;
        }
    }
}