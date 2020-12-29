import TWEEN from '@tweenjs/tween.js'
import getPosFromPic from "./tools/getPosFromPic"
import checkIfFits from "./tools/checkIfFits"


class TweenManager {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = threeManager;
        this.camera = threeManager.camera;
        this.DOM = {
            buttons: {
                volume: document.querySelector("#volume")
            }
        }
        this.state = {
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
            scale: {
                now: new THREE.Vector3(),
                next: new THREE.Vector3(),
                temp: null,
                shouldChange: true
            },
            tweenCamera: {
                duration: 500,
                easing: TWEEN.Easing.Quadratic.InOut
            },
            scaleMedia: {
                duration: 500,
                easing: TWEEN.Easing.Quadratic.In
            },
            menu: {
                pos: () => new THREE.Vector3(0, 0, this.threeManager.state.centerDistance),
                quat: new THREE.Quaternion(),
                fov: 50
            },
            tween: null,
            screenRatio: () => { return (window.innerWidth / window.innerHeight) }
        }
        this.resources = {
            quat: new THREE.Quaternion()
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

    scaleMedia(media, ratio) {
        this.app.state.tween.isTweening = true;

        this.state.scale.now = media.scale.clone();
        this.state.fov.now = this.camera.fov;

        if (ratio < 1) {
            this.state.fov.next = 50;
            this.state.scale.next = new THREE.Vector3(30 * ratio, 30, 1);
        } else {
            this.state.scale.next = new THREE.Vector3(30, 30 / ratio, 1);
            this.state.fov.next = 50 / (Math.min(ratio, this.state.screenRatio()) * 0.96);
        }

        this.state.scale.shouldChange = this.state.scale.now !== this.state.scale.next;
        this.state.fov.shouldChange = this.state.fov.now !== this.state.fov.next;


        if (!this.state.scale.shouldChange && !this.state.fov.shouldChange) return;
        this.state.alpha = { t: 0 };


        this.state.tween = new TWEEN.Tween(this.state.alpha)
            .to({ t: 1 }, this.state.scaleMedia.duration)
            .easing(this.state.scaleMedia.easing) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                if (this.state.scale.shouldChange) {
                    this.state.scale.temp = this.state.scale.now.clone();
                    this.state.scale.temp.lerp(this.state.scale.next.clone(), this.state.alpha.t);
                    media.scale.set(this.state.scale.temp.x, this.state.scale.temp.y, this.state.scale.temp.y);
                    this.camera.fov = this.state.fov.now * (1 - this.state.alpha.t) + this.state.fov.next * this.state.alpha.t;
                    this.camera.updateProjectionMatrix();
                }
            })
            .onComplete(() => {
                this.app.state.tween.isTweening = false;
            })
            .start();
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
        this.app.state.tween.isTweening = true;
        // this.threeManager.renderer.antialias = false;

        if (this.app.state.focus.media)
            this.pauseMedia(this.app.state.focus.media, 0);

        let changeFOV = true;
        if (nextProject) {
            let viewpoint = nextProject.children[1];
            changeFOV = (!this.app.state.focus.project || nextProject != this.app.state.focus.project.name) ? true : false;

            viewpoint.getWorldPosition(this.state.pos.next);
            nextProject.children[0].getWorldQuaternion(this.state.quat.next);
            let media = nextProject.children[0];
            this.playMedia(media, (this.state.tweenCamera.duration / 2));
            if (media.userData.ratio < 1) {
                this.state.fov.next = 50
            } else {
                let _ratio = this.state.screenRatio();
                this.state.fov.next = 50 / Math.min(media.userData.ratio, _ratio);
            }

        } else {
            this.state.fov.next = this.state.menu.fov;
            this.state.pos.next = this.state.menu.pos();
            this.state.quat.next = new THREE.Quaternion();

        }



        this.state.fov.now = this.camera.fov;
        this.state.pos.now = this.camera.position.clone();
        this.state.quat.now = new THREE.Quaternion().copy(this.camera.quaternion);

        this.state.fov.shouldChange = this.state.fov.now !== this.state.fov.next;

        this.state.alpha = { t: 0 };
        this.state.pos.temp = this.state.pos.now.clone();
        this.state.tween = new TWEEN.Tween(this.state.alpha)
            .to({ t: 1 }, this.state.tweenCamera.duration)
            .easing(TWEEN.Easing.Quadratic.In) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                THREE.Quaternion.slerp(this.state.quat.now, this.state.quat.next, this.resources.quat, this.state.alpha.t);
                this.camera.quaternion.set(this.resources.quat.x, this.resources.quat.y, this.resources.quat.z, this.resources.quat.w);
                this.state.pos.temp.lerpVectors(this.state.pos.now, this.state.pos.next, this.state.alpha.t)
                this.camera.position.set(this.state.pos.temp.x, this.state.pos.temp.y, this.state.pos.temp.z);
                if (this.state.fov.shouldChange) {
                    this.camera.fov = this.state.fov.now * (1 - this.state.alpha.t) + this.state.fov.next * this.state.alpha.t;
                    this.camera.updateProjectionMatrix();
                }
            })
            .onComplete(() => {
                this.app.state.tween.isTweening = false;
                // this.threeManager.renderer.antialias = true;

            })
            .start();
    }
}

export default TweenManager