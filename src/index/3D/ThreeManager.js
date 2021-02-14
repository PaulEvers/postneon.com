// import MediaManager from "./MediaManager"
import RayCastManager from "./RayCastManager"

import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';


class Project {
    constructor(app, _p) {
        this.app = app;

        this.__ = {
            projectLength: _p.medias.length,
            order: 0,
            oldProject: _p.title,
            directory: _p.directory,
            info: {
                big: _p.info.big ? _p.info.big.replace(/\n/g, "<br>") : "",
                small: _p.info.small ? _p.info.small.replace(/\n/g, "<br>") : "",
            },
            medias: _p.medias
        }
        let { project, media } = this.init(this.__.medias[0]);
        this.project = project;
        this.media = media;
    }

    getUrl = (_m) => `projects/${this.__.directory}/${this.app.capitalize(_m.type)}/${this.app.__.opt}/${_m.src}`;

    setMedia = (e) => {
        console.log(e)
    }

    init = (_m) => {
        let url = this.getUrl(_m);

        let d_media;
        _m.type === "image" ?
            d_media = document.createElement('img') :
            d_media = document.createElement('video');
        d_media.addEventListener('click', this.setMedia);
        d_media.src = url;

        let d_container = document.createElement('div');
        d_container.appendChild(d_media);

        let media = new CSS3DObject(d_container);
        let project = new CSS3DObject();
        project.rotation.z = this.app.getOrientation() === 'landscape' ? Math.PI / 2 : 0;
        project.add(media);

        _m.ratio < 1 ?
            media.scale.set(this.__.scale, this.__.scale / _m.ratio, 1) :
            media.scale.set(this.__.scale * _m.ratio, this.__.scale, 1);
        media.position.set(0, 0, this.__.radius * 5);
        media.rotation.set(Math.PI, Math.PI, Math.PI);




        return { project, media };
    }
}

class ThreeManager {
    constructor({ app }) {
        // initiate
        this.app = app;

        this.resources = {
            geo: new THREE.PlaneGeometry(0, 0, 1),
            mat: new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
            mesh: new THREE.Mesh(this.geo, this.mat),
            // MediaManager: new MediaManager({ app: this.app, _three: this })
        }

        this.__ = {
            scale: 0.25,
            centerDistance: this.app.__.isMobile ? 110 : 2750,
            orientation: null,
            tempOrientation: {},
            radius: 400,
            menu: {
                lastTick: null,
                delta: 0,
                speed: 0.00125 / 25,
                lerpTo: 0
            }
        }



        this.renderer = new CSS3DRenderer({
            /* autoClear: false,
            preserveDrawingBuffer: true,
            alpha: false,
            // depth: false,
            // stencil: false,
            // precision: 'mediump',
            powerPreference: 'low-power',
            antialias: true,
            outputEncoding: THREE.sRGBEncoding, */
        });
        // ?this.renderer.precision = this.renderer.capabilities.getMaxPrecision();
        // console.log('PRECISION IS ', this.renderer.capabilities.getMaxPrecision());
        /* const minPixelRatio = 1;
        const pixelRatio = Math.min(minPixelRatio, window.devicePixelRatio);

        this.renderer.setPixelRatio(pixelRatio); */
        // this.renderer.debug.checkShaderErrors = false;

        this.canvas = this.renderer.domElement;
        this.canvas.id = "scene";

        document.querySelector("#threejs").appendChild(this.canvas);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 500);
        // this.camera.far = 10000000;
        this.camera.updateProjectionMatrix();
        this.camera.position.z = this.__.centerDistance;
        ////console.log(this.camera.fov, this.camera.position.z);

        this.loader = new THREE.TextureLoader();
        this._logo = new LogoManager({ app: this.app, _three: this });

        this.init();

    }
    init = () => {
        window.addEventListener("resize", this.resizeCanvas);
        this.initProjects();
    }
    initLogos = async () => {
        await this._logo.createLogos();
        return;
    }

    getScreenRatio() { return (window.innerWidth / window.innerHeight) }

    updateViewpointPosition(project) {
        const media = project.children[0];
        const viewpoint = project.children[1];

        const ratio = media.userData.ratio;
        const _ratio = this.getScreenRatio();

        const fov = 50;
        let height = ratio < 1 ? 35 : 35 / ratio;
        height = ratio < _ratio ? height : height + (ratio * height - _ratio * height) * 1 / _ratio
        const distance = (height / 2) / Math.tan(fov * Math.PI / 360);

        media.attach(viewpoint);
        viewpoint.position.set(0, 0, distance);
        project.attach(viewpoint);
    }

    pauseMedia = () => {
        const media = this.app.__.focus.media;
        if (media && media.userData.type === 'video')
            media.material.map.pause();
    }

    tweenToProject(project) {
        let tween = this.app._tween.add(500, "sine_in");
        const media = project.children[0];
        const viewpoint = project.children[1];

        this.pauseMedia();


        this.updateViewpointPosition(project);

        let pos = {
            now: this.camera.position.clone(),
            next: new THREE.Vector3(),
            tween: new THREE.Vector3()
        }
        let quat = {
            now: this.camera.quaternion.clone(),
            next: new THREE.Quaternion(),
            tween: new THREE.Quaternion()
        }

        viewpoint.getWorldPosition(pos.next);
        media.getWorldQuaternion(quat.next);

        tween.addEventListener('update', ({ detail }) => {
            THREE.Quaternion.slerp(quat.now, quat.next, quat.tween, detail);
            pos.tween.lerpVectors(pos.now, pos.next, detail);
            this.camera.quaternion.copy(quat.tween);
            this.camera.position.copy(pos.tween);
        })

        tween.addEventListener('complete', () => {
            this.app.__.menu.isOpen = false;
            if (media.userData.type === 'video') media.material.map.play();
        })
        return tween;
    }

    tweenToMenu = () => {
        console.log("TWEEN TO MENU");
        let tween = this.app._tween.add(500, "sine_in");
        if (!tween) return false;

        this.pauseMedia();

        let quat = {
            now: this.camera.quaternion.clone(),
            next: new THREE.Quaternion(),
            tween: new THREE.Quaternion()
        }
        let pos = {
            now: this.camera.position.clone(),
            next: new THREE.Vector3(0, 0, this.__.centerDistance),
            tween: new THREE.Vector3()
        }
        tween.addEventListener('update', ({ detail }) => {
            THREE.Quaternion.slerp(quat.now, quat.next, quat.tween, detail);
            this.camera.quaternion.copy(quat.tween);
            pos.tween.lerpVectors(pos.now, pos.next, detail);
            this.camera.position.copy(pos.tween);
        })

        tween.addEventListener('complete', () => {
            this.app.__.menu.isOpen = true;
            this.app.__.focus.project = null;
            this.app.__.focus.media = null;
        })
        return true;
    }

    focusOn = (project, duration = false) => {
        let media = project.children[0];
        let canTween = this.tweenToProject(project);
        if (canTween) {
            this.app.__.focus.project = project;
            this.app.__.focus.media = media;
            if (this.app.__.focus.media.userData.type === 'video') {
                this.app.__.focus.media.material.map.pause();
                this.app.__.focus.media.material.map.image.volume = this.app._gui.getMuted() ? 0 : 1;
                this.app._gui.showVolume();

            } else {
                this.app._gui.hideVolume();
            }
            if (!this.app.__.focus.project) return;
        }
        return canTween;
    }

    initProjects = () => {
        this.__.origin = new CSS3DObject();
        this.__.origin.name = 'projectsContainer';
        this.__.origin.position.set(0, 0, 0);
        this.__.projects = new CSS3DObject();
        this.__.projects.name = 'projects';
        this.__.projects.userData.outlinerEnabled = false;
        this.__.projects.findProject = (name) => this.__.projects.find(p => p.name === name);
        // this.__.origin.add(this.__.projects);
        this.addToScene(this.__.projects);
        // this.__.origin.position.set(0, 0, 0);
    }

    getNextProject = (direction) => {
        let index = this.__.projects.children.indexOf(this.app.__.focus.project);
        index = (index + direction) % (this.__.projects.children.length);
        index = index < 0 ? (this.__.projects.children.length - 1) : index;
        return this.__.projects.children[index];
    }

    changeOrientation = (orientation) => {

        if (orientation === 'landscape') {
            if (this.app.__.focus.media) this.app.__.focus.media.attach(this.camera);
            this.app.__.orientation = orientation;
            this.__.origin.rotation.z = 0;
            for (let project of this.__.projects.children) {
                project.rotation.z = Math.PI / 2;
            }
            if (this.app.__.focus.media) this.scene.attach(this.camera);
        } else {
            if (this.app.__.focus.media) this.app.__.focus.media.attach(this.camera);
            this.app.__.orientation = orientation;
            this.__.origin.rotation.z = Math.PI / 2;
            for (let project of this.__.projects.children) {
                project.rotation.z = 0;
            }
            if (this.app.__.focus.media) this.scene.attach(this.camera);
            // this.__.centerDistance = 200;
        }
    }

    updateCameraRatio = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    resizeCanvas = (noLogo) => {

        this.__.tempOrientation = this.app.getOrientation();
        if (this.app.__.orientation !== this.__.tempOrientation)
            this.changeOrientation(this.__.tempOrientation);

        this._logo.chooseLogo();


        if (this.app.__.menuOpen) {

            this.camera.position.z = this.__.centerDistance;
        }

        this.updateCameraRatio();

        this.render();
        if (!!this.app.__.menu.isOpen) {
            this._logo.chooseLogo();
        } else {
            this.updateViewpointPosition(this.app.__.focus.project);
            let vector = new THREE.Vector3();
            this.app.__.focus.project.children[1].getWorldPosition(vector);
            this.camera.position.copy(vector);
        }
    }



    fetchProject = async (_p, i, _amount) => {

    }

    fetchScene = async (url) => {
        let _data = await fetch(url, { method: 'GET', mode: 'cors' })
            .then(res => res.json());

        let _amount = _data.projects.length;

        _data.about.big = _data.about.big.replace(/\n/g, "<br>");
        _data.about.small = _data.about.small.replace(/\n/g, "<br>");
        _data.contact.big = _data.contact.big.replace(/\n/g, "<br>");
        _data.contact.small = _data.contact.small.replace(/\n/g, "<br>");


        this.updateCameraRatio();
        let orientation = this.app.getOrientation();
        [..._data.projects].forEach(async (p, i) => {

            let _p = new Project(this.app, p);
            console.log(_p);

            this.__.projects.add(_p.project);
            // console.log(project);

        });

        this.render();

        this.resizeCanvas();

        return _data;
    }

    addToProjects = (_p) => {
        this.__.projects.add(_p);
    }
    addToScene = (_m) => {
        this.scene.add(_m);
    }
    render = () => {
        this.renderer.render(this.scene, this.camera);
    }
    lerp = (a, b, alpha) => a * alpha + b * (1 - alpha)

    rotateMenu = (now) => {

        if (!this.__.menu.lastTick) this.__.menu.lastTick = now;
        this.__.menu.delta = Math.min(10, now - this.__.menu.lastTick);
        this.__.menu.lerpTo = this.lerp(this.app.__.menu.lerpTo, this.__.menu.lerpTo, 0.125);
        this.__.projects.rotation.y += this.__.menu.speed * this.__.menu.delta * this.app.__.menu.direction * 0.9 + this.__.menu.lerpTo * this.__.menu.delta;
        this.__.menu.lastTick = now;
        this.app.__.menu.lerpTo = 0
        this.scene.updateMatrixWorld();

    }
}


class LogoManager {
    constructor({ app, _three }) {
        this.app = app;
        this._three = _three;
        this.canvas = this._three.canvas;
        this.logos = new CSS3DObject();
        this.logos.position.set(0, 0, 0);
        this.logos.name = 'logos';

        this.resources = {
            mat: new THREE.MeshBasicMaterial({ color: 0xffffff, transparant: true }),
            mesh: this._three.resources.mesh
        };
        this.__ = {
            isInitialized: false,
        }
    }
    createLogo(src, ratio, y) {
        return new Promise((resolve) => {
            let path = `./logos/${src}`;

            let img = document.createElement("img");
            img.setAttribute("src", path);

            img.onload = () => {
                let geo = new THREE.PlaneGeometry(ratio, ratio * img.height / img.width, 32);
                let mat = new THREE.MeshBasicMaterial(ratio, ratio * img.height / img.width, 32);
                mat.visible = false;
                let logo = new THREE.Mesh(geo, mat);
                logo.name = "LOGO";

                let texture = new THREE.Texture(img);
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.generateMipMaps = true;

                logo.material.alphaMap = texture;
                logo.material.alphaTest = 0.5;
                logo.material.transparent = true;
                logo.material.matrixAutoUpdate = true;
                logo.material.side = THREE.DoubleSide;

                logo.material.needsUpdate = true;
                texture.needsUpdate = true;

                setTimeout(function () {
                    logo.material.needsUpdate = true;
                }, 2000);
                resolve({ logo, y })
            }
        })
    }
    createLogos() {
        return new Promise((resolve) => {
            let promises = [];

            if (this.app.__.isMobile) {
                promises.push(this.createLogo("logo_h.png", 200, 2));
                promises.push(this.createLogo("logo_m.png", 90, 2));
                promises.push(this.createLogo("logo_v.png", 90, -7));
            } else {
                promises.push(this.createLogo("logo_h.png", 150, 2));
                promises.push(this.createLogo("logo_m.png", 90, 2));
                promises.push(this.createLogo("logo_v.png", 45, 0));
            }
            Promise.all(promises).then((resolves) => {
                resolves.forEach(res => {
                    this.logos.add(res.logo);
                    res.logo.position.set(0, 0, 0);
                    // res.logo.position.y = res.y;
                })
                ////console.log("CHOOSELOG");
                this.chooseLogo();
                this._three.render(performance.now);
                this._three.addToScene(this.logos);
                this.__.isInitialized = true;
                resolve();
            })
        })

    }

    chooseLogo() {
        if (!this.__.isInitialized) return;
        if ((this.canvas.offsetWidth / window.innerHeight) > 1.6) {
            this.logos.children[0].material.visible = true;
            this.logos.children[1].material.visible = false;
            this.logos.children[2].material.visible = false;
        } else {
            if ((this.canvas.offsetWidth / window.innerHeight) > 1) {
                this.logos.children[0].material.visible = false;
                this.logos.children[1].material.visible = true;
                this.logos.children[2].material.visible = false;
            } else {
                this.logos.children[0].material.visible = false;
                this.logos.children[1].material.visible = false;
                this.logos.children[2].material.visible = true;
            }
        }
    }
}

export default ThreeManager;