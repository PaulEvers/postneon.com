import { Scene } from "three";

class TweenManager {
    constructor({ app, threeManager }) {
        this.tweens = {
            tweenCanvas: new TweenCanvas({ app, threeManager }),
            tweenCamera: new TweenCamera({ app, threeManager }),
            scaleMedia: new ScaleMedia({ app, threeManager })
        }
        this.state = {
            isTweening: false,
        }
    }


    update(now) {
        let isTweening = false;
        for (let name in this.tweens) {
            let tween = this.tweens[name];
            if (tween.state.isTweening && now !== tween.state.start) {
                isTweening = true;
                let delta = (now - tween.state.start) / tween.state.duration;
                delta = tween.state.easing(delta);
                delta = Math.min(delta, 1);
                if (delta == 1)
                    tween.state.isTweening = false;
                tween.update(delta);
            };
        }
        this.state.isTweening = isTweening;
        return isTweening;
    }
}

class TweenTemplate {
    constructor() {
        this.easings = {
            sine_in: (x) => 1 - Math.cos((x * Math.PI) / 2),
            linear: (x) => x
        }
    }
    getScreenRatio() { return (window.innerWidth / window.innerHeight) }
    lerp(a, alpha) {
        return (1 - alpha) * a.now + alpha * a.next;
    }
    updateViewpointPosition(project) {
        let media = project.children[0];
        let viewpoint = project.children[1];

        let ratio = media.userData.ratio;
        let _ratio = this.getScreenRatio();

        let fov = 50;

        let height = 30 + 2.5;

        if (ratio > 1) {
            height = height / ratio;
        }
        if (ratio > _ratio) {
            height = height + (ratio * height - _ratio * height) * 1 / _ratio;
        }
        // height *= 0.5;


        let distance = (height / 2) / Math.tan(fov * Math.PI / 360);



        console.log(ratio, _ratio);

        media.attach(viewpoint);
        viewpoint.position.set(0, 0, distance);
        project.attach(viewpoint);
    }

}


class TweenCanvas extends TweenTemplate {
    constructor({ app, threeManager }) {
        super();
        this.DOM = {
            canvas: document.querySelector("#threejs"),
            projectTitle: document.querySelector(".project-title")
        }
        this.state = {
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
            }
        }
    }

    tween() {
        let state = this.state;
        let values = state.values;
        state.start = performance.now();
        if (state.open) {
            values.canvas.next = 0;
            values.canvas.now = window.innerWidth < 600 ? 100 : 50;
            values.projectTitle.next = 50;
            values.projectTitle.now = window.innerWidth < 600 ? 50 : 75;
            state.open = false;
        } else {
            values.canvas.next = window.innerWidth < 600 ? 100 : 50;
            values.canvas.now = 0;
            values.projectTitle.now = 50;
            values.projectTitle.next = window.innerWidth < 600 ? 50 : 75;
            state.open = true;
        }
        state.isTweening = true;
    }

    update(delta) {
        this.DOM.canvas.style.left = this.lerp(this.state.values.canvas, delta) + "vw";
        this.DOM.projectTitle.style.left = this.lerp(this.state.values.projectTitle, delta) + "%";
    }
}

class TweenCamera extends TweenTemplate {
    constructor({ app, threeManager }) {
        super();
        this.app = app;
        this.threeManager = threeManager;
        this.camera = threeManager.camera;
        this.mediaManager = this.threeManager.mediaManager;

        this.state = {
            easing: this.easings.sine_in,
            duration: 500,
            isTweening: false,
            start: null,
            values: {
                fov: {
                    now: this.camera.fov,
                    next: null,
                    shouldChange: true,
                    menu: 50
                },
                quat: {
                    now: () => { return new THREE.Quaternion().copy(this.camera.quaternion) },
                    next: new THREE.Quaternion(),
                    menu: () => new THREE.Quaternion()
                },
                pos: {
                    now: this.camera.position,
                    next: new THREE.Vector3(),
                    temp: null,
                    menu: () => new THREE.Vector3(0, 0, this.threeManager.state.centerDistance)
                }
            }
        }
        this.resources = {
            quat: new THREE.Quaternion()
        }
    }

    tween(nextProject) {
        let state = this.state;
        let values = state.values;

        if (state.isTweening)
            return false;
        state.start = performance.now();
        state.isTweening = true;

        values.fov.now = this.camera.fov;
        values.pos.now = this.camera.position.clone();
        values.quat.now = new THREE.Quaternion().copy(this.camera.quaternion);
        values.pos.now = this.camera.position.clone();
        values.pos.temp = new THREE.Vector3();

        if (this.app.state.focus.media)
            this.threeManager.mediaManager.pauseIfVideo(this.app.state.focus.media, 0);
        if (nextProject) {
            let media = nextProject.children[0];
            let viewpoint = nextProject.children[1];

            let ratio = media.userData.ratio;
            let _ratio = this.getScreenRatio();

            this.updateViewpointPosition(nextProject);

            viewpoint.getWorldPosition(values.pos.next);
            media.getWorldQuaternion(values.quat.next);

            this.threeManager.mediaManager.playIfVideo(media, state.duration);

            // values.fov.next = 25 * Math.max(ratio, _ratio);
            values.fov.next = 50;

            console.log("FOV NEST", values.fov.next, ratio, _ratio);

        } else {
            values.fov.next = values.fov.menu;
            values.pos.next = values.pos.menu();
            values.quat.next = values.quat.menu();
        }
        return true;
    }
    update(delta) {

        THREE.Quaternion.slerp(this.state.values.quat.now, this.state.values.quat.next, this.resources.quat, delta);
        this.camera.quaternion.set(this.resources.quat.x, this.resources.quat.y, this.resources.quat.z, this.resources.quat.w);

        this.state.values.pos.temp.lerpVectors(this.state.values.pos.now, this.state.values.pos.next, delta);
        this.camera.position.copy(this.state.values.pos.temp);
        if (this.state.values.fov.now != this.state.values.fov.next) {
            this.camera.fov = this.lerp(this.state.values.fov, delta);
            this.camera.updateProjectionMatrix();
        }
    }
}

class ScaleMedia extends TweenTemplate {
    constructor({ app, threeManager }) {
        super();
        this.threeManager = threeManager;
        this.camera = threeManager.camera;
        this.state = {
            easing: this.easings.linear,
            duration: 500,
            isTweening: false,
            media: null,
            start: null,

            values: {
                fov: {
                    now: this.camera.fov,
                    next: null,
                },
                scale: {
                    now: new THREE.Vector3(),
                    next: new THREE.Vector3(),
                    temp: null,
                },
                pos: {
                    now: this.camera.position,
                    next: new THREE.Vector3(),
                    temp: new THREE.Vector3(),
                    menu: () => new THREE.Vector3(0, 0, this.threeManager.state.centerDistance)
                }
            }
        }
    }

    tween(media, ratio) {
        let state = this.state;
        let values = state.values;
        this.updateViewpointPosition(media.parent);
        let viewpoint = media.parent.children[1];

        state.start = performance.now();
        state.isTweening = true;
        state.media = media;
        values.scale.now = media.scale.clone();
        values.fov.now = this.camera.fov;
        values.pos.now = this.camera.position.clone();

        // values.fov.next = 2 * Math.atan(((media.scale.y + 0.025 * 2 * media.scale.y)) * (180 / Math.PI));
        values.fov.next = 50;

        let _ratio = this.getScreenRatio();
        if (ratio < 1) {
            // values.fov.next = 50;
            values.scale.next = new THREE.Vector3(30 * ratio, 30, 1);
        } else {
            values.scale.next = new THREE.Vector3(30, 30 / ratio, 1);
            // values.fov.next = 50 / (Math.min(ratio, _ratio) * 1.1);
        }
        viewpoint.getWorldPosition(values.pos.next);


        values.scale.shouldChange = values.scale.now !== values.scale.next;
        values.fov.shouldChange = values.fov.now !== values.fov.next;
        if (!values.scale.now !== values.scale.next &&
            values.fov.now !== values.fov.next) return;
    }
    update(delta) {
        let values = this.state.values;
        values.scale.temp = values.scale.now.clone();
        values.scale.temp.lerp(values.scale.next.clone(), delta);
        this.state.media.scale.copy(values.scale.temp);
        this.camera.fov = this.lerp(values.fov, delta);
        // console.log(/* values.pos.temp, */ values.pos.now, values.pos.next);
        // values.pos.temp.lerpVectors(values.pos.now, values.pos.next, delta);
        // this.camera.position.copy(values.pos.temp);
        this.camera.updateProjectionMatrix();
    }
}

export default TweenManager