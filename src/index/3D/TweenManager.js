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
                next: null
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
                temp: null
            },
            tweenCamera: {
                duration: 500,
                easing: TWEEN.Easing.Quadratic.InOut
            },
            scaleMedia: {
                duration: 250,
                easing: TWEEN.Easing.Quadratic.In
            },
            menu: {
                pos: () => new THREE.Vector3(0, 0, this.threeManager.state.centerDistance),
                quat: new THREE.Quaternion(),
                fov: 50
            },
            tween: null
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
        this.state.scale.now = media.scale.clone();

        //console.log("RATIO!!!!!!!!", ratio);
        if (ratio < 1) {
            this.state.scale.next = new THREE.Vector3(30 * ratio, 30, 1);
        } else {
            this.state.scale.next = new THREE.Vector3(30, 30 / ratio, 1);
        }
        //console.log(" this.state.scale.next", this.state.scale.next);

        this.state.alpha = { t: 0 };

        this.state.tween = new TWEEN.Tween(this.state.alpha)
            .to({ t: 1 }, this.state.scaleMedia.duration)
            .easing(this.state.scaleMedia.easing) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                this.state.scale.temp = this.state.scale.now.clone();
                this.state.scale.temp.lerp(this.state.scale.next.clone(), this.state.alpha.t);
                media.scale.set(this.state.scale.temp.x, this.state.scale.temp.y, this.state.scale.temp.y);
            })
            /*            .onComplete(() => {
                           this.state.scale.temp = this.state.scale.now.clone();
                           this.state.scale.temp.lerp(this.state.scale.next.clone(), this.state.alpha.t);
           
                       }) */
            .start();
    }

    toggleMedia(media, duration) {
        if (media.userData.type === 'video') {
            setTimeout(() => {
                media.material.map.toggle();
            }, duration);
        }
    }

    tweenCamera(nextProject, duration = this.state.tweenCamera.duration) {
        let changeFOV = true;
        if (nextProject) {
            let viewpoint = nextProject.children[1];
            changeFOV = (!this.app.state.focus.project || nextProject != this.app.state.focus.project.name) ? true : false;
            this.state.fov.next = checkIfFits(nextProject.children[0]);
            viewpoint.getWorldPosition(this.state.pos.next);
            nextProject.children[0].getWorldQuaternion(this.state.quat.next);
            let media = nextProject.children[0];
            this.toggleMedia(media, duration);
            if (this.app.state.focus.media)
                this.toggleMedia(this.app.state.focus.media, duration);
        } else {
            this.state.fov.next = this.state.menu.fov;
            this.state.pos.next = this.state.menu.pos();
            this.state.quat.next = new THREE.Quaternion();
            let media = this.app.state.focus.media;
            if (media.userData.type === 'video') {
                setTimeout(() => {
                    media.material.map.pause();
                }, duration);
            }
        }


        this.app.state.isTweening = true;

        this.state.fov.now = this.camera.fov;
        this.state.pos.now = this.camera.position.clone();
        this.state.quat.now = new THREE.Quaternion().copy(this.camera.quaternion);

        this.state.alpha = { t: 0 };

        this.state.tween = new TWEEN.Tween(this.state.alpha)
            .to({ t: 1 }, duration ? duration : this.state.tweenCamera.duration)
            .easing(TWEEN.Easing.Quadratic.In) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                THREE.Quaternion.slerp(this.state.quat.now, this.state.quat.next, this.resources.quat, this.state.alpha.t);
                this.camera.quaternion.set(this.resources.quat.x, this.resources.quat.y, this.resources.quat.z, this.resources.quat.w);
                this.state.pos.temp = this.state.pos.now.clone();

                this.state.pos.temp.lerp(this.state.pos.next, this.state.alpha.t)
                this.camera.position.set(this.state.pos.temp.x, this.state.pos.temp.y, this.state.pos.temp.z);

                if (changeFOV) {
                    // this.camera.fov = this.state.fov.now * (1 - this.state.alpha.t) + this.state.fov.next * this.state.alpha.t;
                }
                this.camera.updateProjectionMatrix();
                // //console.log(this.camera.fov, this.camera.position.z);

            })
            .onComplete(() => {

                this.camera.quaternion.set(this.state.quat.next.x, this.state.quat.next.y, this.state.quat.next.z, this.state.quat.next.w);
                this.app.state.isTweening = false;
            })
            .start();
    }
}

export default TweenManager