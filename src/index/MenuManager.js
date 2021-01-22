export default class MenuManager {
    constructor({ app, threeManager }) {
        this.threeManager = threeManager;
        this.app = app;
        this.DOM = {
            sub: document.querySelector("#projectTitle"),
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
            lerpTo: 0

        }
    }
    rotateMenu(state) {
        this.state.now = performance.now();
        if (state.menu.isOpen && this.state.lastTick) {

            this.state.delta = Math.min(10, this.state.now - this.state.lastTick);
            if (this.state.delta < (100 / 120))
                return
            // console.log(this.app.state.menu.lerpTo);
            this.app.state.menu.lerpTo = Math.abs(this.app.state.menu.lerpTo) < 0.000001 ? 0 : this.app.state.menu.lerpTo;
            this.state.lerpTo = this.app.state.menu.lerpTo/*  * 0.1 + this.state.lerpTo * 0.9 */;
            this.threeManager.state.projects.rotation.y += (this.state.speed * this.state.delta / 25 * state.menu.direction) * 0.9 + (this.app.state.menu.lerpTo) * 0.1;
            // this.app.state.menu.lerpTo = this.app.state.menu.lerpTo * 0.975;
            this.app.state.menu.lerpTo
            this.state.lastTick = this.state.now;
        } else {
            this.state.lastTick = this.state.now;
        }
    }
}