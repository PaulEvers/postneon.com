export default class KeyManager {
    constructor() {
        this.__ = {
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
            if (this.__.flycam.stopMove) {
                this.__.flycam.stopMove = false;
                moveCamera(this.__.flycam.direction);
            }
        }
        document.body.addEventListener("keydown", function (event) {
            if (!this.app.__.menu.isOpen) {
                if (this.__.flycam.keysPressed.indexOf(event.code) == -1) {
                    this.__.flycam.keysPressed.push(event.code);
                    if (event.key === "ArrowUp" || event.code === "KeyW") {
                        this.__.flycam.direction.x = -1;
                        keyAction();
                    }
                    if (event.key === "ArrowDown" || event.code === "KeyS") {
                        this.__.flycam.direction.x = 1;
                        keyAction();
                    }
                    if (event.key === "ArrowLeft" || event.code === "KeyA") {
                        this.__.flycam.direction.y = -1;
                        keyAction();
                    }
                    if (event.key === "ArrowRight" || event.code === "KeyD") {
                        this.__.flycam.direction.y = 1;
                        keyAction();
                    }
                    if (event.code === "KeyQ") {
                        this.__.flycam.direction.z = -1;
                        keyAction();
                    }
                    if (event.code === "KeyE") {
                        this.__.flycam.direction.z = 1;
                        keyAction();
                    }
                }
            }
        })
        document.body.onkeyup = function (event) {
            this.__.flycam.keysPressed.splice(this.__.flycam.keysPressed.indexOf(event.code), 1);
            if (!this.__.flycam.stopMove && this.__.flycam.keysPressed.length == 0) {
                this.__.flycam.stopMove = true;
            }
            if (event.key === "ArrowUp" || event.code === "KeyW") {
                if ((this.__.flycam.keysPressed.indexOf("KeyS") == -1)) {
                    this.__.flycam.direction.x = 0
                } else {
                    this.__.flycam.direction.x = 1;
                }
            }
            if (event.key === "ArrowDown" || event.code === "KeyS") {
                if ((this.__.flycam.keysPressed.indexOf("KeyW") == -1)) {
                    this.__.flycam.direction.x = 0;
                } else {
                    this.__.flycam.direction.x = -1;
                }
            }
            if (event.key === "ArrowLeft" || event.code === "KeyA") {
                if ((this.__.flycam.keysPressed.indexOf("KeyD") == -1)) {
                    this.__.flycam.direction.y = 0;
                } else {
                    this.__.flycam.direction.y = 1;
                }
            }
            if (event.key === "ArrowRight" || event.code === "KeyD") {
                if ((this.__.flycam.keysPressed.indexOf("KeyA") == -1)) {
                    this.__.flycam.direction.y = 0;
                } else {
                    this.__.flycam.direction.y = -1;
                }
            }
            if (event.code === "KeyQ") {
                if ((this.__.flycam.keysPressed.indexOf("KeyE") == -1)) {
                    this.__.flycam.direction.z = 0;
                } else {
                    this.__.flycam.direction.y = 1;
                }
            }
            if (event.code === "KeyE") {
                if ((this.__.flycam.keysPressed.indexOf("KeyQ") == -1)) {
                    this.__.flycam.direction.z = 0;
                } else {
                    this.__.flycam.direction.y = -1;
                }
            }
        }
    }




    moveCamera() {
        if (!this.__.flycam.stopMove) {
            requestAnimationFrame(() => { moveCamera() });
        }

        this._three.camera.translateZ(this.__.flycam.velocity * this.__.flycam.direction.x);
        this._three.translateX(this.__.flycam.velocity * this.__.flycam.direction.y);
        this._three.translateY(this.__.flycam.velocity * this.__.flycam.direction.z);
    }
}