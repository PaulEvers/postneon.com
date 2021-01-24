export default class KeyManager {
    constructor() {
        this._s = {
            flyCam: {
                velocity: 0.5,
                direction: { x: 0, y: 0, z: 0 },
                stopMove: true,
                keysPressed: []
            }
        }
    }
    initKey() {
        function keyAction() {
            if (this._s.flycam.stopMove) {
                this._s.flycam.stopMove = false;
                moveCamera(this._s.flycam.direction);
            }
        }
        document.body.addEventListener("keydown", function (event) {
            if (!this.app._s.menu.isOpen) {
                if (this._s.flycam.keysPressed.indexOf(event.code) == -1) {
                    this._s.flycam.keysPressed.push(event.code);
                    if (event.key === "ArrowUp" || event.code === "KeyW") {
                        this._s.flycam.direction.x = -1;
                        keyAction();
                    }
                    if (event.key === "ArrowDown" || event.code === "KeyS") {
                        this._s.flycam.direction.x = 1;
                        keyAction();
                    }
                    if (event.key === "ArrowLeft" || event.code === "KeyA") {
                        this._s.flycam.direction.y = -1;
                        keyAction();
                    }
                    if (event.key === "ArrowRight" || event.code === "KeyD") {
                        this._s.flycam.direction.y = 1;
                        keyAction();
                    }
                    if (event.code === "KeyQ") {
                        this._s.flycam.direction.z = -1;
                        keyAction();
                    }
                    if (event.code === "KeyE") {
                        this._s.flycam.direction.z = 1;
                        keyAction();
                    }
                }
            }
        })
        document.body.onkeyup = function (event) {
            this._s.flycam.keysPressed.splice(this._s.flycam.keysPressed.indexOf(event.code), 1);
            if (!this._s.flycam.stopMove && this._s.flycam.keysPressed.length == 0) {
                this._s.flycam.stopMove = true;
            }
            if (event.key === "ArrowUp" || event.code === "KeyW") {
                if ((this._s.flycam.keysPressed.indexOf("KeyS") == -1)) {
                    this._s.flycam.direction.x = 0
                } else {
                    this._s.flycam.direction.x = 1;
                }
            }
            if (event.key === "ArrowDown" || event.code === "KeyS") {
                if ((this._s.flycam.keysPressed.indexOf("KeyW") == -1)) {
                    this._s.flycam.direction.x = 0;
                } else {
                    this._s.flycam.direction.x = -1;
                }
            }
            if (event.key === "ArrowLeft" || event.code === "KeyA") {
                if ((this._s.flycam.keysPressed.indexOf("KeyD") == -1)) {
                    this._s.flycam.direction.y = 0;
                } else {
                    this._s.flycam.direction.y = 1;
                }
            }
            if (event.key === "ArrowRight" || event.code === "KeyD") {
                if ((this._s.flycam.keysPressed.indexOf("KeyA") == -1)) {
                    this._s.flycam.direction.y = 0;
                } else {
                    this._s.flycam.direction.y = -1;
                }
            }
            if (event.code === "KeyQ") {
                if ((this._s.flycam.keysPressed.indexOf("KeyE") == -1)) {
                    this._s.flycam.direction.z = 0;
                } else {
                    this._s.flycam.direction.y = 1;
                }
            }
            if (event.code === "KeyE") {
                if ((this._s.flycam.keysPressed.indexOf("KeyQ") == -1)) {
                    this._s.flycam.direction.z = 0;
                } else {
                    this._s.flycam.direction.y = -1;
                }
            }
        }
    }




    moveCamera() {
        if (!this._s.flycam.stopMove) {
            requestAnimationFrame(() => { moveCamera() });
        }

        this.threeManager.camera.translateZ(this._s.flycam.velocity * this._s.flycam.direction.x);
        this.threeManager.translateX(this._s.flycam.velocity * this._s.flycam.direction.y);
        this.threeManager.translateY(this._s.flycam.velocity * this._s.flycam.direction.z);
    }
}