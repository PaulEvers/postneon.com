export default class KeyManager {
    constructor() {
        this.state = {
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
            if (this.state.flycam.stopMove) {
                this.state.flycam.stopMove = false;
                moveCamera(this.state.flycam.direction);
            }
        }
        document.body.addEventListener("keydown", function (event) {
            if (!this.app.state.menu.isOpen) {
                if (this.state.flycam.keysPressed.indexOf(event.code) == -1) {
                    this.state.flycam.keysPressed.push(event.code);
                    if (event.key === "ArrowUp" || event.code === "KeyW") {
                        this.state.flycam.direction.x = -1;
                        keyAction();
                    }
                    if (event.key === "ArrowDown" || event.code === "KeyS") {
                        this.state.flycam.direction.x = 1;
                        keyAction();
                    }
                    if (event.key === "ArrowLeft" || event.code === "KeyA") {
                        this.state.flycam.direction.y = -1;
                        keyAction();
                    }
                    if (event.key === "ArrowRight" || event.code === "KeyD") {
                        this.state.flycam.direction.y = 1;
                        keyAction();
                    }
                    if (event.code === "KeyQ") {
                        this.state.flycam.direction.z = -1;
                        keyAction();
                    }
                    if (event.code === "KeyE") {
                        this.state.flycam.direction.z = 1;
                        keyAction();
                    }
                }
            }
        })
        document.body.onkeyup = function (event) {
            this.state.flycam.keysPressed.splice(this.state.flycam.keysPressed.indexOf(event.code), 1);
            if (!this.state.flycam.stopMove && this.state.flycam.keysPressed.length == 0) {
                this.state.flycam.stopMove = true;
            }
            if (event.key === "ArrowUp" || event.code === "KeyW") {
                if ((this.state.flycam.keysPressed.indexOf("KeyS") == -1)) {
                    this.state.flycam.direction.x = 0
                } else {
                    this.state.flycam.direction.x = 1;
                }
            }
            if (event.key === "ArrowDown" || event.code === "KeyS") {
                if ((this.state.flycam.keysPressed.indexOf("KeyW") == -1)) {
                    this.state.flycam.direction.x = 0;
                } else {
                    this.state.flycam.direction.x = -1;
                }
            }
            if (event.key === "ArrowLeft" || event.code === "KeyA") {
                if ((this.state.flycam.keysPressed.indexOf("KeyD") == -1)) {
                    this.state.flycam.direction.y = 0;
                } else {
                    this.state.flycam.direction.y = 1;
                }
            }
            if (event.key === "ArrowRight" || event.code === "KeyD") {
                if ((this.state.flycam.keysPressed.indexOf("KeyA") == -1)) {
                    this.state.flycam.direction.y = 0;
                } else {
                    this.state.flycam.direction.y = -1;
                }
            }
            if (event.code === "KeyQ") {
                if ((this.state.flycam.keysPressed.indexOf("KeyE") == -1)) {
                    this.state.flycam.direction.z = 0;
                } else {
                    this.state.flycam.direction.y = 1;
                }
            }
            if (event.code === "KeyE") {
                if ((this.state.flycam.keysPressed.indexOf("KeyQ") == -1)) {
                    this.state.flycam.direction.z = 0;
                } else {
                    this.state.flycam.direction.y = -1;
                }
            }
        }
    }




    moveCamera() {
        if (!this.state.flycam.stopMove) {
            requestAnimationFrame(() => { moveCamera() });
        }

        this.threeManager.camera.translateZ(this.state.flycam.velocity * this.state.flycam.direction.x);
        this.threeManager.translateX(this.state.flycam.velocity * this.state.flycam.direction.y);
        this.threeManager.translateY(this.state.flycam.velocity * this.state.flycam.direction.z);
    }
}