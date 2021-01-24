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
        this._s = {
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
    rotateMenu(_s) {
        this._s.now = performance.now();
        if (_s.menu.isOpen && this._s.lastTick) {

            this._s.delta = Math.min(10, this._s.now - this._s.lastTick);
            if (this._s.delta < (100 / 120))
                return
            // console.log(this.app._s.menu.lerpTo);
            this.app._s.menu.lerpTo = Math.abs(this.app._s.menu.lerpTo) < 0.000001 ? 0 : this.app._s.menu.lerpTo;
            this._s.lerpTo = this.app._s.menu.lerpTo/*  * 0.1 + this._s.lerpTo * 0.9 */;
            this.threeManager._s.projects.rotation.y += (this._s.speed * this._s.delta / 25 * _s.menu.direction) * 0.9 + (this.app._s.menu.lerpTo) * 0.1;
            // this.app._s.menu.lerpTo = this.app._s.menu.lerpTo * 0.975;
            this.app._s.menu.lerpTo
            this._s.lastTick = this._s.now;
        } else {
            this._s.lastTick = this._s.now;
        }
    }
}