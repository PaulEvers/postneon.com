

import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from "three"

import RayCastManager from './RayCastManager.js'
import LogoManager from "./LogoManager.js"
import Project from "./ProjectManager.js"




class ThreeManager {
    constructor({ app }) {
        this.app = app;
        this._ray = new RayCastManager();

        this.__ = {
            scale: 0.025,
            centerDistance: this.app.__.isMobile ? 110 : 200,
            orientation: null,
            tempOrientation: {},
            radius: 25,
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
            camera: new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000),
            collisions: []
        }

        // document.querySelector("#threejs").appendChild(this._3d.glRenderer.domElement);

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
    isVideoPlaying = () => this.app.__.focus && this.app.__.focus.media.userData.type === 'video'
    resetVideo = () => this.isVideoPlaying() ? this.app.__.focus.pause() : null

    pauseMedia = () => {
        const project = this.app.__.focus;
        if (project && project.media.userData.type === 'video')
            project.pause();
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
        let _vp = project.userData.project.getViewpoint();
        // console.log(this.getViewpoint(media), project.userData.project.getViewpoint());
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
            this.app.__.focus = null;
            this.app.__.focus.media = null;
        })
        return true;
    }




    focusOn = (project, duration = false) => {
        if (project === this.app.__.focus) return;
        this.resetVideo();



        let canTween = this.tweenToProject(project.project);

        this.app._gui.setTopMenuMode('project');
        this.app._gui.setProjectUI(project);

        this.app.__.menu.isOpen = false;
        this.app.__.focus = project;
        if (project.media.userData.type === 'video') {
            setTimeout(() => { this.app.__.focus.play(), 500 })
            project.setVideoUI(true);
        } else {
            project.setVideoUI(false);
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
        let index = this.__.projects.indexOf(this.app.__.focus);
        index = (index + direction) % (this.__.projects.length);
        index = index < 0 ? (this.__.projects.length - 1) : index;
        return this.__.projects[index];
    }

    changeOrientation = (orientation) => {
        this.app.__.orientation = orientation;

        if (orientation === 'landscape') {
            if (this.app.__.focus) this.app.__.focus.media.attach(this._3d.camera);
            this._3d.origin.rotation.z = 0;
            for (let project of this._3d.projects.children) {
                project.rotation.z = Math.PI / 2;
            }
            if (this.app.__.focus) this._3d.scene.attach(this._3d.camera);
        } else {
            if (this.app.__.focus) this.app.__.focus.media.attach(this._3d.camera);
            this._3d.origin.rotation.z = Math.PI / 2;
            for (let project of this._3d.projects.children) {
                project.rotation.z = 0;
            }
            if (this.app.__.focus) this._3d.scene.attach(this._3d.camera);
        }
    }

    updateCameraRatio = () => {
        this._3d.camera.aspect = window.innerWidth / window.innerHeight;
        this._3d.camera.updateProjectionMatrix();
        this._3d.renderer.setSize(window.innerWidth, window.innerHeight);
        this._3d.glRenderer.setSize(window.innerWidth, window.innerHeight);

    }

    resizeCanvas = (noLogo) => {
        this.__.tempOrientation = this.app.getOrientation();
        if (this.app.__.orientation !== this.__.tempOrientation)
            this.changeOrientation(this.__.tempOrientation);

        this._logo.chooseLogo();

        if (!!this.app.__.menu.isOpen) {
            this._logo.chooseLogo();
            this._3d.camera.position.z = this.__.centerDistance;

        } else {
            if (this.app.__.focus) {
                let _vp = this.app.__.focus.getViewpoint();
                this._3d.camera.position.copy(_vp.pos);
            }
        }

        this.updateCameraRatio();

        this.render();

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
            this._3d.collisions.push(_p.media);
            // this.addToScene(_p.media);
            _p.project.rotation.set(0, i * Math.PI * 2 / _data.projects.length, 0);
            this.__.projects.push(_p);

        });
        this.resizeCanvas();

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
        // this._3d.glRenderer.render(this._3d.scene, this._3d.camera);

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