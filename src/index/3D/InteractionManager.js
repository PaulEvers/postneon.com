import CursorManager from "./CursorManager"
import openCloseAbout from "../GUI/openCloseAbout"



export default class InteractionManager {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = threeManager;
        this.tweenManager = this.threeManager.tweenManager;


        this.DOM = {
            canvas: this.threeManager.renderer.domElement,
            projectTitle: document.querySelector("#projectTitle"),
            subTitle: document.querySelector("#subTitle"),
            picNumber: document.querySelector("#picNumber"),
            order: document.querySelector("#order"),
            projectLength: document.querySelector("#projectLength"),
            cursor: {
                cross: document.querySelector("#cross"),
                pointer: document.querySelector("#pointer"),
                container: document.querySelector("#cursor"),
                normal: document.querySelector("#normal"),
                hover: document.querySelector("#hover"),
            },

            buttons: {
                about: document.querySelector("#aboutButton"),
                contact: document.querySelector("#contactButton"),
                volume: document.querySelector("#volume"),
            }
        }


        this.flyCam = {
            velocity: 0.5,
            direction: { x: 0, y: 0, z: 0 },
            stopMove: true,
            keysPressed: []
        }




        this.state = {
            lastClick: null,
            isHoverProject: false,
        }

        this.init();
        this.cursorManager = new CursorManager({
            app: this.app,
            threeManager: this.threeManager,
            interactionManager: this
        });

    }
    init() {
        this.initResize();
        // this.initKey();
    }
    initResize() {
        window.addEventListener("resize", () => { this.threeManager.resizeCanvas() }, 125);
    }

    initKey() {
        // this.flyCam.direction = { x: 0, y: 0, z: 0 };

        function keyAction() {
            if (this.flyCam.stopMove) {
                this.flyCam.stopMove = false;
                moveCamera(this.flyCam.direction);
            }
        }
        document.body.addEventListener("keydown", function (event) {
            if (!this.app.state.menu.isOpen) {
                if (this.flyCam.keysPressed.indexOf(event.code) == -1) {
                    this.flyCam.keysPressed.push(event.code);
                    if (event.key === "ArrowUp" || event.code === "KeyW") {
                        this.flyCam.direction.x = -1;
                        keyAction();
                    }
                    if (event.key === "ArrowDown" || event.code === "KeyS") {
                        this.flyCam.direction.x = 1;
                        keyAction();
                    }
                    if (event.key === "ArrowLeft" || event.code === "KeyA") {
                        this.flyCam.direction.y = -1;
                        keyAction();
                    }
                    if (event.key === "ArrowRight" || event.code === "KeyD") {
                        this.flyCam.direction.y = 1;
                        keyAction();
                    }
                    if (event.code === "KeyQ") {
                        this.flyCam.direction.z = -1;
                        keyAction();
                    }
                    if (event.code === "KeyE") {
                        this.flyCam.direction.z = 1;
                        keyAction();
                    }
                }
            }
        })
        document.body.onkeyup = function (event) {
            this.flyCam.keysPressed.splice(this.flyCam.keysPressed.indexOf(event.code), 1);
            if (!this.flyCam.stopMove && this.flyCam.keysPressed.length == 0) {
                this.flyCam.stopMove = true;
            }
            if (event.key === "ArrowUp" || event.code === "KeyW") {
                if ((this.flyCam.keysPressed.indexOf("KeyS") == -1)) {
                    this.flyCam.direction.x = 0
                } else {
                    this.flyCam.direction.x = 1;
                }
            }
            if (event.key === "ArrowDown" || event.code === "KeyS") {
                if ((this.flyCam.keysPressed.indexOf("KeyW") == -1)) {
                    this.flyCam.direction.x = 0;
                } else {
                    this.flyCam.direction.x = -1;
                }
            }
            if (event.key === "ArrowLeft" || event.code === "KeyA") {
                if ((this.flyCam.keysPressed.indexOf("KeyD") == -1)) {
                    this.flyCam.direction.y = 0;
                } else {
                    this.flyCam.direction.y = 1;
                }
            }
            if (event.key === "ArrowRight" || event.code === "KeyD") {
                if ((this.flyCam.keysPressed.indexOf("KeyA") == -1)) {
                    this.flyCam.direction.y = 0;
                } else {
                    this.flyCam.direction.y = -1;
                }
            }
            if (event.code === "KeyQ") {
                if ((this.flyCam.keysPressed.indexOf("KeyE") == -1)) {
                    this.flyCam.direction.z = 0;
                } else {
                    this.flyCam.direction.y = 1;
                }
            }
            if (event.code === "KeyE") {
                if ((this.flyCam.keysPressed.indexOf("KeyQ") == -1)) {
                    this.flyCam.direction.z = 0;
                } else {
                    this.flyCam.direction.y = -1;
                }
            }
        }
    }

    initButtons() {
        /* this.threeManager.canvas.onmousemove = function () {
            if (this.app.state.menu.isOpen) {
                this.app.state.guiHover = false;
            }
        } */
        this.DOM.buttons.about.onmouseup = () => {
            openCloseAbout();
            this.threeManager.resizeCanvas();

        }
        this.DOM.buttons.contact.onmouseup = () => {
            if (this.app.state.menu.isOpen) {
                openCloseAbout("contact");
                this.threeManager.resizeCanvas();
            }
        }
        this.DOM.buttons.volume.addEventListener("mousedown", function (event) {
            if (this.children[0].innerHTML === "muted") {
                this.children[0].innerHTML = "mute";
                this.app.state.focus.media.material.map.image.volume = "1";
            } else {
                this.children[0].innerHTML = "muted";
                this.app.state.focus.media.material.map.image.volume = "0";
            }
        });
    }




    moveCamera() {
        if (!this.flyCam.stopMove) {
            requestAnimationFrame(() => { moveCamera() });
        }

        this.threeManager.camera.translateZ(this.flyCam.velocity * this.flyCam.direction.x);
        this.threeManager.translateX(this.flyCam.velocity * this.flyCam.direction.y);
        this.threeManager.translateY(this.flyCam.velocity * this.flyCam.direction.z);
    }




    menuMode() {
        for (let key in this.app.state.textures.update) {

            delete this.app.state.textures.update[key];
        }
        if (!this.app.state.isMobile) {
            // this.threeManager.state.centerDistance = 50 + 125 * window.innerHeight / window.innerWidth;
        }
        this.app.state.focus.project = null;

        this.DOM.buttons.volume.style.display = "";
        this.DOM.subTitle.style.display = "";
        this.DOM.subTitle.style.display = "";
        this.DOM.cursor.cross.style.transform = "";
        this.DOM.cursor.pointer.style.display = "";
        this.DOM.cursor.cross.style.display = "";
        this.DOM.buttons.contact.style.filter = "";
        this.DOM.buttons.contact.children[0].innerHTML = "contact";
        this.DOM.buttons.about.children[0].innerHTML = "about";
        this.DOM.buttons.contact.onmouseup = function () {
            if (this.app.state.menu.isOpen) {
                openCloseAbout("contact");
            }
        }

        this.DOM.projectTitle.style.transform = "translate(-50%,-50%)";
        this.DOM.projectTitle.children[0].style.transform = "translate(0%,-50%)";
        this.DOM.projectTitle.children[0].style.marginBottom = "0px";

        this.app.state.menu.isOpen = true;
        this.app.state.focus.media = false;

        if (this.app.state.focus.media) {
            if (this.app.state.focus.media.userData.type === "video") {
                this.app.state.textures["videos"][this.app.state.focus.media.userData.src].pause();
            }
        }


        this.DOM.projectTitle.style.display = "";
        let posNow = this.threeManager.camera.position;
        let z = this.threeManager.state.centerDistance;
        if (this.app.state.orientation === "portrait") {
            // z = this.threeManager.state.centerDistance * 1.65;
        }
        // this.tweenManager.tween(false);
    }







    toggleFullScreen() {
        g.fullscreen = true;
        var doc = window.document;
        var docEl = doc.documentElement;
        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        cancelFullScreen.call(doc);
        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
    }

    update(state) {
        this.cursorManager.update(state);
    }

}

