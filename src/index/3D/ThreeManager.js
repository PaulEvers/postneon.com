

import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import RayCastManager from './RayCastManager.js'
import LogoManager from "./LogoManager.js"
import * as THREE from "three"

class Project {
    constructor(app, _p) {
        this.app = app;

        this.__ = {
            projectLength: _p.medias.length,
            order: 0,
            name: _p.title,
            directory: _p.directory,
            info: {
                big: _p.info.big ? _p.info.big.replace(/\n/g, "<br>") : "",
                small: _p.info.small ? _p.info.small.replace(/\n/g, "<br>") : "",
            },
            medias: _p.medias,
        }

        this.mediaCache = [];

        this.init(_p.medias[0])
    }

    getUrl = (_m) => `projects/${this.__.directory}/${this.app.capitalize(_m.type)}/${this.app.__.opt}/${_m.src}`;

    handleClick = (e) => {
        switch (e.detail.type) {
            case 'click':
                if (this.app.__.focus.project != this) {
                    this.app._three.focusOn(this);
                    if (this.__.medias[0].type === 'video') {
                        setTimeout(() => {
                            this.play();
                        }, 500);
                    }
                } else {
                    this.changeMedia(e.detail.x > window.innerWidth / 2 ? 1 : -1)
                }
                break;
            case 'hover_menu':
                this.app._gui.setProjectTitle(this.__.name)
                break;
            case 'hover_project':
                if (this != this.app.__.focus.project || this.__.medias.length == 1) {
                    this.app._gui.setCursorMode('pointer');
                    return;
                }
                if (e.detail.x > (window.innerWidth / 2)) {
                    this.app._gui.setCursorMode('left');
                } else {
                    this.app._gui.setCursorMode('right');
                }
                break;
        }
    }

    isPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);

    pause = (d_media) => {
        if (!d_media) d_media = [...this.media.element.children].find(v => v.src.includes(this.__.medias[this.__.order]))

        console.log(d_media);
        if (!d_media || d_media.tagName !== 'VIDEO') {
            console.log("ERRORR PAUSE");
            return;
        }

        return new Promise((resolve) => {
            let tween = this.app._tween.add(500);
            tween.addEventListener('update', ({ detail }) => {
                d_media.volume = Math.min(1, Math.max(0, 1 - detail));
            })
            tween.addEventListener('complete', () => {
                d_media.pause();
                resolve();
            })
        })

    }

    getMediaDomFromSrc = (src) => [...this.media.element.children].find(v => v.src.includes(src))

    play = (d_media) => {

        if (!d_media) {
            console.log('this happens', this.__.medias[this.__.order], [...this.media.element.children]);
            d_media = this.getMediaDomFromSrc(this.__.medias[this.__.order].src);
        }

        console.log(d_media.tagName);
        if (d_media.tagName !== 'VIDEO') {
            console.log("ERRORR PLAY");
            return;
        }
        let tween = this.app._tween.add(1000, "sine_in");

        if (this.isPlaying(d_media)) return;
        d_media.volume = 0
        d_media.play();
        tween.addEventListener('update', ({ detail }) => {
            d_media.volume = Math.min(1, Math.max(0, detail));
        })
    }

    hideOldMedia = async () => {
        const oldMedia = this.__.medias[this.__.order];
        console.log('oldMedia', oldMedia);
        const url = this.getUrl(oldMedia);
        console.log('url', url);
        let d_media = [...this.media.element.children].find(v => {
            console.log(v.src, url);
            return v.src.includes(url);
        });
        console.log(d_media);
        if (!d_media) return
        if (oldMedia.type === 'video') {
            this.pause(d_media);
        }
        d_media.classList.add('hidden');
    }

    changeMedia = (direction) => {
        if (this.__.medias.length <= 1) return
        this.hideOldMedia();

        this.__.order = this.__.order + direction % (this.__.medias.length);
        if (this.__.order < 0) this.__.order = this.__.medias.length - 1;
        let nextMedia = this.__.medias[this.__.order];

        this.updateMedia(nextMedia);
        console.log(this.media.element)
        let loadedMedia = [...this.media.element.children].find(v => v.src.includes(nextMedia.src));
        if (loadedMedia) {
            console.log('this?');
            loadedMedia.classList.remove('hidden');
            if (nextMedia.type === 'video')
                this.play(loadedMedia);
            return;
        }

        let d_media = this.createMedia(nextMedia);

        let listenTo = nextMedia.type === 'video' ? 'loadedmetadata' : 'load'
        this.media.element.appendChild(d_media);

        d_media.classList.add('hidden');

        d_media.addEventListener(listenTo, () => {
            if (nextMedia.type === 'video') {
                console.log(d_media, nextMedia);
                this.play(d_media);

            }
            d_media.classList.remove('hidden');
        })
    }

    createMedia = (_m) => {
        let url = this.getUrl(_m);

        let d_media;
        if (_m.type === "image") {
            d_media = document.createElement('img')
        } else {
            d_media = document.createElement('video');
            d_media.volume = 0;
            d_media.loop = true;
        }

        d_media.src = url;
        d_media.className = 'd_media';
        return d_media;
    }

    updateMedia = (_m) => {
        this.media.userData = _m;

        let scale = this.app._three.__.scale;

        _m.ratio < 1 ?
            this.media.scale.set(scale * _m.ratio, scale, 1) :
            this.media.scale.set(scale, scale / _m.ratio, 1);
    }

    init = (_m) => {

        let d_media = this.createMedia(_m);

        let d_container = document.createElement('div');
        d_container.className = 'd_container';
        d_container.appendChild(d_media);
        d_container.addEventListener('click', this.handleClick);

        // this.media = new CSS3DObject(d_container);
        this.media = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        );
        this.collision = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        );
        // this.media.add(this.collision);
        console.log(this.media);

        this.project = new CSS3DObject();
        this.project.rotation.z = this.app.getOrientation() === 'landscape' ? Math.PI / 2 : 0;
        this.project.add(this.media);
        this.media.parent = this.project;


        let radius = this.app._three.__.radius;
        this.media.position.set(0, 0, radius * 5);
        this.media.rotation.set(Math.PI, Math.PI, Math.PI / 2);

        this.updateMedia(_m);

        // return { project, media };
    }
}

class ThreeManager {
    constructor({ app }) {
        this.app = app;
        this._ray = new RayCastManager();

        this.__ = {
            scale: 0.375,
            centerDistance: this.app.__.isMobile ? 110 : 3000,
            orientation: null,
            tempOrientation: {},
            radius: 400,
            menu: {
                lastTick: null,
                delta: 0,
                speed: 0.00125 / 25,
                lerpTo: 0
            },
            projects: []
        }

        this._3d = {
            renderer: new CSS3DRenderer(),
            glRenderer: new THREE.WebGLRenderer({
                autoClear: false,
                preserveDrawingBuffer: true,
                alpha: false,
                depth: false,
                // precision: 'highp',
                powerPreference: 'low-power',
                antialias: true,
                outputEncoding: THREE.LinearEncoding,
            }),
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 500),
            collisions: []
        }

        document.querySelector("#threejs").appendChild(this._3d.glRenderer.domElement);

        this._3d.renderer.domElement.id = 'scene';
        document.querySelector("#threejs").appendChild(this._3d.renderer.domElement);

        this._3d.camera.updateProjectionMatrix();
        this._3d.camera.position.z = this.__.centerDistance;

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

    // getIntersects = () => this._ray.getIntersects(this.__.projects.)

    getScreenRatio = () => (window.innerWidth / window.innerHeight)
    isVideoPlaying = () => this.app.__.focus.project && this.app.__.focus.project.media.userData.type === 'video'
    resetVideo = () => this.isVideoPlaying() ? this.app.__.focus.project.pause() : null

    pauseMedia = () => {
        const media = this.app.__.focus.media;
        if (media && media.userData.type === 'video')
            media.material.map.pause();
    }

    getViewpoint = (media) => {
        let quat = new THREE.Quaternion();
        let pos = new THREE.Vector3();

        const height = media.scale.y;
        const distance = (height) / Math.tan(this._3d.camera.fov * Math.PI / 360);

        media.getWorldQuaternion(quat);
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        media.getWorldPosition(pos);
        pos.addScaledVector(normal, distance * 1175);
        return { quat, pos };
    }

    tweenToProject(project) {
        let media = project.children[0];
        let tween = this.app._tween.add(500, "sine_in");
        let pos = {
            now: this._3d.camera.position.clone(),
            next: new THREE.Vector3(),
            tween: new THREE.Vector3()
        }
        let quat = {
            now: this._3d.camera.quaternion.clone(),
            next: new THREE.Quaternion(),
            tween: new THREE.Quaternion()
        }
        let _vp = this.getViewpoint(media);
        pos.next.copy(_vp.pos);
        quat.next.copy(_vp.quat);

        tween.addEventListener('update', ({ detail }) => {
            THREE.Quaternion.slerp(quat.now, quat.next, quat.tween, detail);
            pos.tween.lerpVectors(pos.now, pos.next, detail);
            this._3d.camera.quaternion.copy(quat.tween);
            this._3d.camera.position.copy(pos.tween);
        })

        return tween;
    }

    tweenToMenu = () => {
        this.resetVideo();
        this.app._gui.setTopMenuMode('menu');

        let tween = this.app._tween.add(500, "sine_in");
        if (!tween) return false;

        this.pauseMedia();

        let quat = {
            now: this._3d.camera.quaternion.clone(),
            next: new THREE.Quaternion(),
            tween: new THREE.Quaternion()
        }
        let pos = {
            now: this._3d.camera.position.clone(),
            next: new THREE.Vector3(0, 0, this.__.centerDistance),
            tween: new THREE.Vector3()
        }
        tween.addEventListener('update', ({ detail }) => {
            THREE.Quaternion.slerp(quat.now, quat.next, quat.tween, detail);
            this._3d.camera.quaternion.copy(quat.tween);
            pos.tween.lerpVectors(pos.now, pos.next, detail);
            this._3d.camera.position.copy(pos.tween);
        })

        tween.addEventListener('complete', () => {
            this.app.__.menu.isOpen = true;
            this.app.__.focus.project = null;
            this.app.__.focus.media = null;
        })
        return true;
    }




    focusOn = (project, duration = false) => {
        if (project === this.app.__.focus.project) return;
        this.resetVideo();

        let canTween = this.tweenToProject(project.project);

        this.app._gui.setTopMenuMode('project');
        this.app._gui.setProjectUI(project);

        this.app.__.menu.isOpen = false;
        this.app.__.focus.project = project;
        if (project.media.userData.type === 'video') {
            setTimeout(() => { this.app.__.focus.project.play(), 500 })
        }
        return canTween;
    }

    initProjects = () => {
        this._3d.origin = new CSS3DObject();
        this._3d.origin.name = 'projectsContainer';
        this._3d.origin.position.set(0, 0, 0);
        this._3d.projects = new CSS3DObject();
        this._3d.projects.name = 'projects';
        this._3d.projects.userData.outlinerEnabled = false;
        this._3d.projects.findProject = (name) => this._3d.projects.find(p => p.name === name);
        this.addToScene(this._3d.projects);
    }

    getNextProject = (direction) => {
        let index = this.__.projects.indexOf(this.app.__.focus.project);
        index = (index + direction) % (this.__.projects.length);
        index = index < 0 ? (this.__.projects.length - 1) : index;
        return this.__.projects[index];
    }

    changeOrientation = (orientation) => {
        this.app.__.orientation = orientation;

        if (orientation === 'landscape') {
            if (this.app.__.focus.media) this.app.__.focus.media.attach(this._3d.camera);
            this._3d.origin.rotation.z = 0;
            for (let project of this._3d.projects.children) {
                project.rotation.z = Math.PI / 2;
            }
            if (this.app.__.focus.media) this._3d.scene.attach(this._3d.camera);
        } else {
            if (this.app.__.focus.media) this.app.__.focus.media.attach(this._3d.camera);
            this._3d.origin.rotation.z = Math.PI / 2;
            for (let project of this._3d.projects.children) {
                project.rotation.z = 0;
            }
            if (this.app.__.focus.media) this._3d.scene.attach(this._3d.camera);
        }
    }

    updateCameraRatio = () => {
        this._3d.camera.aspect = window.innerWidth / window.innerHeight;
        this._3d.camera.updateProjectionMatrix();
        this._3d.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    resizeCanvas = (noLogo) => {

        this.__.tempOrientation = this.app.getOrientation();
        if (this.app.__.orientation !== this.__.tempOrientation)
            this.changeOrientation(this.__.tempOrientation);

        this._logo.chooseLogo();


        if (this.app.__.menuOpen) {

            this._3d.camera.position.z = this.__.centerDistance;
        }

        this.updateCameraRatio();

        this.render();
        if (!!this.app.__.menu.isOpen) {
            this._logo.chooseLogo();
        } else {
            // let vector = new THREE.Vector3();
            // this.app.__.focus.project.children[1].getWorldPosition(vector);
            // this._3d.camera.position.copy(vector);
        }
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
            this._3d.projects.add(_p.project);
            this._3d.collisions.push(_p.collision);
            this.addToScene(_p.collision);
            _p.project.rotation.set(0, i * Math.PI * 2 / _data.projects.length, 0);
            this.__.projects.push(_p);

        });

        this.render();

        this.resizeCanvas();

        return _data;
    }

    addToProjects = (_p) => {
        this._3d.projects.add(_p);
    }
    addToScene = (_m) => {
        this._3d.scene.add(_m);
    }
    render = () => {
        this._3d.renderer.render(this._3d.scene, this._3d.camera);
        this._3d.glRenderer.render(this._3d.scene, this._3d.camera);

    }
    lerp = (a, b, alpha) => a * alpha + b * (1 - alpha)

    rotateMenu = (now) => {

        if (!this.__.menu.lastTick) this.__.menu.lastTick = now;
        this.__.menu.delta = Math.min(10, now - this.__.menu.lastTick);
        this.__.menu.lerpTo = this.lerp(this.app.__.menu.lerpTo, this.__.menu.lerpTo, 0.125);
        this._3d.projects.rotation.y += this.__.menu.speed * this.__.menu.delta * this.app.__.menu.direction * 0.9 + this.__.menu.lerpTo * this.__.menu.delta;
        this.__.menu.lastTick = now;
        this.app.__.menu.lerpTo = 0
        this._3d.scene.updateMatrixWorld();

    }
}



export default ThreeManager;