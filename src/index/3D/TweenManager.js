import getPosFromPic from "./tools/getPosFromPic"
import checkIfFits from "./tools/checkIfFits"


class TweenManager {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = threeManager;
        this.camera = threeManager.camera;
        this.DOM = {
            canvas: document.querySelector("#threejs"),
            buttons: {
                volume: document.querySelector(".volume-button")
            },
            projectTitle: document.querySelector(".project-title")
        }
        this.easings = {
            sine_in: (x) => 1 - Math.cos((x * Math.PI) / 2),
            linear: (x) => x
        }

        this.resources = {
            quat: new THREE.Quaternion()
        }
        this.initState();
    }
    lerp(a, alpha) {
        return (1 - alpha) * a.now + alpha * a.next;
    }
    initState() {
        this.state = {
            tweens: {
                tweenCanvas: {
                    easing: this.easings.linear,
                    duration: 500,
                    isTweening: false,
                    start: null,
                    open: false,
                    values: {
                        canvas: {
                            now: null,
                            next: null
                        },
                        projectTitle: {
                            now: null,
                            next: null
                        }
                    },
                    update: (delta, tween) => {
                        this.DOM.canvas.style.left = this.lerp(tween.values.canvas, delta) + "vw";

                        this.DOM.projectTitle.style.left = this.lerp(tween.values.projectTitle, delta) + "%";
                    }
                },
                tweenCamera: {
                    easing: this.easings.sine_in,
                    duration: 500,
                    isTweening: false,
                    start: null,
                    values: {
                        fov: {
                            now: this.camera.fov,
                            next: null,
                            shouldChange: true
                        },
                        quat: {
                            now: () => { return new THREE.Quaternion().copy(this.camera.quaternion) },
                            next: new THREE.Quaternion()
                        },
                        pos: {
                            now: this.camera.position,
                            next: new THREE.Vector3(),
                            temp: null
                        },
                    },
                    update: (delta, tween) => {
                        console.log("OK?");
                        THREE.Quaternion.slerp(tween.values.quat.now, tween.values.quat.next, this.resources.quat, delta);
                        this.camera.quaternion.set(this.resources.quat.x, this.resources.quat.y, this.resources.quat.z, this.resources.quat.w);
                        tween.values.pos.temp.lerpVectors(tween.values.pos.now, tween.values.pos.next, delta)
                        this.camera.position.set(tween.values.pos.temp.x, tween.values.pos.temp.y, tween.values.pos.temp.z);
                        if (tween.values.fov.now != tween.values.fov.next) {
                            this.camera.fov = this.lerp(tween.values.fov, delta);
                            this.camera.updateProjectionMatrix();
                        }
                    }
                },
                scaleMedia: {
                    easing: this.easings.linear,
                    duration: 500,
                    isTweening: false,
                    media: null,
                    values: {
                        fov: {
                            now: this.camera.fov,
                            next: null
                        },
                        scale: {
                            now: new THREE.Vector3(),
                            next: new THREE.Vector3(),
                            temp: null,
                        }
                    },
                    update: (delta, tween) => {
                        tween.values.scale.temp = tween.values.scale.now.clone();
                        tween.values.scale.temp.lerp(tween.values.scale.next.clone(), delta);
                        tween.media.scale.copy(tween.values.scale.temp);
                        this.camera.fov = this.lerp(tween.values.fov, delta);
                        this.camera.updateProjectionMatrix();
                    }
                }
            },
            menu: {
                pos: () => new THREE.Vector3(0, 0, this.threeManager.state.centerDistance),
                quat: new THREE.Quaternion(),
                fov: 50
            },
            tween: null,
            screenRatio: () => { return (window.innerWidth / window.innerHeight) }
        }
    }

    adjustForVideo({ nextProject, nextMedia }) {
        // let delay = 0;

        if (this.app.state.focus.media) {
            if (this.app.state.focus.media.userData.type === "video" && this.app.state.focus.project.name != nextProject.name) {
                delete this.app.state.focus.media.name in this.app.state.textures.update;
                this.app.state.textures["videos"][this.app.state.focus.media.userData.src].pause();
                delete this.app.state.focus.media.name in this.app.state.textures.update;
            }
        }
        if (nextMedia.userData.type === "video") {
            if (!this.app.state.isMobile) {
                this.state.DOM.buttons.volume.style.display = "inline-block";
                if (nextMedia.material.map.image.volume != 0) {
                    this.state.DOM.buttons.volume.children[0].innerHTML = "mute";
                } else {
                    this.state.DOM.buttons.volume.children[0].innerHTML = "muted";
                }
            }

            if (this.app.state.focus.media.userData.thumbnail) {
                this.app.state.focus.media.material.map = this.app.state.textures["videos"][nextMedia.name];
            }
            let src = nextMedia.userData.src;

            if (src in this.app.state.textures["videos"]) {
                if (!this.app.state.textures["videos"][src].playing() && (
                    (this.app.state.focus.project && this.app.state.focus.project.name != nextMedia.parent.name) ||
                    !this.app.state.focus.project
                )) {
                    setTimeout(function () { this.app.state.textures["videos"][src].play() }, this.state.duration);
                }
            }
        } else {
            this.state.DOM.buttons.volume.style.display = "";
        }
    }

    tweenCanvas() {
        console.log("TWEEEEEEEEEn");
        let tween = this.state.tweens.tweenCanvas;
        let t_values = tween.values;
        tween.start = performance.now();
        if (tween.open) {
            t_values.canvas.next = 0;
            t_values.canvas.now = window.innerWidth < 600 ? 100 : 50;
            t_values.projectTitle.next = 50;
            t_values.projectTitle.now = window.innerWidth < 600 ? 50 : 75;
            tween.open = false;
        } else {
            t_values.canvas.next = window.innerWidth < 600 ? 100 : 50;
            t_values.canvas.now = 0;
            t_values.projectTitle.now = 50;
            t_values.projectTitle.next = window.innerWidth < 600 ? 50 : 75;
            tween.open = true;
        }



        tween.isTweening = true;
    }

    scaleMedia(media, ratio) {
        let tween = this.state.tweens.scaleMedia;
        let t_values = tween.values;

        tween.start = performance.now();
        tween.isTweening = true;
        tween.media = media;
        t_values.scale.now = media.scale.clone();
        t_values.fov.now = this.camera.fov;


        if (ratio < 1) {
            t_values.fov.next = 50;
            t_values.scale.next = new THREE.Vector3(30 * ratio, 30, 1);
        } else {
            t_values.scale.next = new THREE.Vector3(30, 30 / ratio, 1);
            t_values.fov.next = 50 / (Math.min(ratio, this.state.screenRatio()) * 0.96);
        }

        t_values.scale.shouldChange = t_values.scale.now !== t_values.scale.next;
        t_values.fov.shouldChange = t_values.fov.now !== t_values.fov.next;
        if (!t_values.scale.now !== t_values.scale.next &&
            t_values.fov.now !== t_values.fov.next) return;

    }

    toggleMedia(media, duration) {
        if (media.userData.type !== 'video') return;
        setTimeout(() => {
            media.material.map.toggle();
        }, duration);

    }

    pauseMedia(media, duration) {
        if (media.userData.type !== 'video') return;
        setTimeout(() => {
            media.material.map.pause();
        }, duration);
    }

    playMedia(media, duration) {
        if (media.userData.type !== 'video') return;
        setTimeout(() => {
            media.material.map.play();
        }, duration);
    }
    tweenCamera(nextProject) {
        let tween = this.state.tweens.tweenCamera;
        if (tween.isTweening)
            return false;
        tween.start = performance.now();
        tween.isTweening = true;

        if (this.app.state.focus.media)
            this.pauseMedia(this.app.state.focus.media, 0);
        if (nextProject) {
            let viewpoint = nextProject.children[1];
            viewpoint.getWorldPosition(tween.values.pos.next);
            nextProject.children[0].getWorldQuaternion(tween.values.quat.next);
            let media = nextProject.children[0];
            this.playMedia(media, tween.duration);
            if (media.userData.ratio < 1) {
                tween.values.fov.next = 50
            } else {
                let _ratio = this.state.screenRatio();
                tween.values.fov.next = 50 / Math.min(media.userData.ratio, _ratio);
            }

        } else {
            tween.values.fov.next = this.state.menu.fov;
            tween.values.pos.next = this.state.menu.pos();
            tween.values.quat.next = new THREE.Quaternion();

        }
        tween.values.fov.now = this.camera.fov;
        tween.values.pos.now = this.camera.position.clone();
        tween.values.quat.now = new THREE.Quaternion().copy(this.camera.quaternion);
        tween.values.pos.temp = tween.values.pos.now.clone();
        return true;
    }

    updateDelta() {

    }

    isTweening() {
        for (let tween in Object.values(this.state.tweens)) {
            if (tween.isTweening) return true;
        }
        return false;
    }


    update(now) {
        for (let name in this.state.tweens) {
            let tween = this.state.tweens[name];
            if (tween.isTweening && now !== tween.start) {
                let delta = (now - tween.start) / tween.duration;
                delta = tween.easing(delta);
                delta = Math.min(delta, 1);
                if (delta == 1)
                    tween.isTweening = false;

                tween.update(delta, tween);
            };

        }
    }
}

export default TweenManager