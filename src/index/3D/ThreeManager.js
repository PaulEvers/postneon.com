import MediaManager from "./MediaManager"
import RayCastManager from "./RayCastManager"

class ThreeManager {
    constructor({ app }) {
        // initiate
        this.app = app;

        this.resources = {
            geo: new THREE.PlaneGeometry(0, 0, 1),
            mat: new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
            mesh: new THREE.Mesh(this.geo, this.mat),
            // MediaManager: new MediaManager({ app: this.app, threeManager: this })
        }

        this.state = {
            scale: 40,
            centerDistance: 125,
            orientation: null,
            tempOrientation: {},
            radius: 250,
            menu: {
                lastTick: null,
                delta: 0,
                speed: 0.00125 / 25,
                lerpTo: 0
            }
        }

        this.renderer = new THREE.WebGLRenderer({
            autoClear: false,
            // alpha: true,
            antialias: true,
            // gammaInput: true,
            outputEncoding: THREE.LinearEncoding
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.canvas = this.renderer.domElement;
        this.canvas.id = "scene";

        document.querySelector("#threejs").appendChild(this.canvas);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        // this.camera.far = 10000000;
        this.camera.updateProjectionMatrix();
        this.camera.position.z = this.state.centerDistance;
        ////console.log(this.camera.fov, this.camera.position.z);

        this.loader = new THREE.TextureLoader();
        this.mediaManager = new MediaManager({ app: app, threeManager: this });
        this.logoManager = new LogoManager({ app: this.app, threeManager: this });

        this.init();

    }
    init = () => {
        window.addEventListener("resize", this.resizeCanvas);
        this.initProjects();
    }
    initLogos = async () => {
        await this.logoManager.createLogos();
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
        const media = this.app.state.focus.media;
        if (media && media.userData.type === 'video')
            media.material.map.pause();
    }

    tweenToProject(project) {
        let tween = this.app.tweenManager.add(500, "sine_in");
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

        project.children[1].getWorldPosition(pos.next);
        project.children[1].getWorldQuaternion(quat.next);

        tween.addEventListener('update', ({ detail }) => {
            THREE.Quaternion.slerp(quat.now, quat.next, quat.tween, detail);
            pos.tween.lerpVectors(pos.now, pos.next, detail);
            this.camera.quaternion.copy(quat.tween);
            this.camera.position.copy(pos.tween);
        })

        tween.addEventListener('complete', () => {
            this.app.state.menu.isOpen = false;
            if (media.userData.type === 'video') media.material.map.play();

        })
        return tween;
    }

    tweenToMenu = () => {
        let tween = this.app.tweenManager.add(500, "sine_in");
        if (!tween) return false;

        this.pauseMedia();

        let quat = {
            now: this.camera.quaternion.clone(),
            next: new THREE.Quaternion(),
            tween: new THREE.Quaternion()
        }
        let pos = {
            now: this.camera.position.clone(),
            next: new THREE.Vector3(0, 0, this.state.centerDistance),
            tween: new THREE.Vector3()
        }
        tween.addEventListener('update', ({ detail }) => {
            THREE.Quaternion.slerp(quat.now, quat.next, quat.tween, detail);
            this.camera.quaternion.copy(quat.tween);
            pos.tween.lerpVectors(pos.now, pos.next, detail);
            this.camera.position.copy(pos.tween);
        })

        tween.addEventListener('complete', () => {
            this.app.state.menu.isOpen = true;
            this.app.state.focus.project = null;
            this.app.state.focus.media = null;
        })
        return true;
    }

    focusOn = (project, duration = false) => {
        let media = project.children[0];
        // let project = media ? media.parent : false;
        let canTween = this.tweenToProject(project);
        if (canTween) {
            this.app.state.focus.project = project;
            this.app.state.focus.media = media;
            if (this.app.state.focus.media.userData.type === 'video')
                this.app.state.focus.media.material.map.pause();
            if (!this.app.state.focus.project) return;
            // this.mediaManager.preloadVideos(project);
        }
        return canTween;
    }

    initProjects = () => {
        this.state.origin = new THREE.Group();
        this.state.origin.name = 'projectsContainer';
        this.state.projects = new THREE.Group();
        this.state.projects.name = 'projects';
        this.state.projects.userData.outlinerEnabled = false;
        this.state.projects.findProject = (name) => this.state.projects.find(p => p.name === name);
        this.state.origin.add(this.state.projects);
        this.addToScene(this.state.origin);
    }

    getNextProject = (direction) => {
        let index = this.state.projects.children.indexOf(this.app.state.focus.project);
        index = (index + direction) % (this.state.projects.children.length);
        index = index < 0 ? (this.state.projects.children.length - 1) : index;
        return this.state.projects.children[index];
    }

    changeOrientation = (orientation) => {

        if (orientation === 'landscape') {
            if (this.app.state.focus.media) this.app.state.focus.media.attach(this.camera);
            this.app.state.orientation = orientation;
            this.state.origin.rotation.z = 0;
            for (let project of this.state.projects.children) {
                project.rotation.z = Math.PI / 2;
            }
            if (this.app.state.focus.media) this.scene.attach(this.camera);
        } else {
            if (this.app.state.focus.media) this.app.state.focus.media.attach(this.camera);
            this.app.state.orientation = orientation;
            this.state.origin.rotation.z = Math.PI / 2;
            for (let project of this.state.projects.children) {
                project.rotation.z = 0;
            }
            if (this.app.state.focus.media) this.scene.attach(this.camera);
            // this.state.centerDistance = 200;
        }
    }

    updateCameraRatio = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getOrientation = () => {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    resizeCanvas = (noLogo) => {

        this.state.tempOrientation = this.getOrientation();
        if (this.app.state.orientation !== this.state.tempOrientation)
            this.changeOrientation(this.state.tempOrientation);

        this.logoManager.chooseLogo();

        if (this.app.state.menuOpen) {

            this.camera.position.z = this.state.centerDistance;
        }

        this.updateCameraRatio();

        this.render();
        if (!!this.app.state.menu.isOpen) {
            this.logoManager.chooseLogo();
        }
        this.mediaManager.updateScaleMedias();
    }

    fetchProject = async (_p) => {
        console.log(_p);
        let project = new THREE.Group();
        project.name = _p.title;
        this.state.projects.add(project);

        project.userData = {
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

        project.scale.set(1, 1, 1);


        let _m = _p.medias[0];

        _m.rotation = {
            x: Math.random() * Math.PI / 8 - Math.PI / 16,
            y: Math.PI / 2 + (Math.random() * Math.PI / 4 - Math.PI / 8),
            z: Math.random() * Math.PI / 8 - Math.PI / 16
        }
        _m.position = {
            x: 0,
            y: 0,
            z: this.state.radius
        }
        _m.scale = _m.ratio > 1 ?
            { x: this.state.scale, y: this.state.scale / _m.ratio } :
            { x: this.state.scale * _m.ratio, y: this.state.scale };

        this.addToProjects(project);
        let media = await this.mediaManager.create({ _media: _m, _project: _p });
        console.log(media);

        project.add(media);
        this.app.state.objects.push(media);

        let viewpoint = new THREE.Group();
        viewpoint.name = 'viewpoint';
        media.add(viewpoint);
        viewpoint.position.set(0, 0, 32.167);
        project.attach(viewpoint);
        // return project;
        return project;
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
        let orientation = this.getOrientation();
        [..._data.projects].forEach(async (p, i) => {
            let project = await this.fetchProject(p);
            console.log(project);
            project.rotation.set(0, i * Math.PI * 2 / _amount, 0);
            project.rotation.z = orientation === 'landscape' ? Math.PI / 2 : 0;
        });

        this.render();

        this.resizeCanvas();

        return _data;
    }

    addToProjects = (_p) => {
        this.state.projects.add(_p);
    }
    addToScene = (_m) => {
        this.scene.add(_m);
    }
    render = () => {
        this.renderer.render(this.scene, this.camera);
    }
    lerp = (a, b, alpha) => a * alpha + b * (1 - alpha)
    rotateMenu = (now) => {

        if (!this.state.menu.lastTick) this.state.menu.lastTick = now;
        this.state.menu.delta = Math.min(10, now - this.state.menu.lastTick);
        this.state.menu.lerpTo = this.lerp(this.app.state.menu.lerpTo, this.state.menu.lerpTo, 0.5);
        this.state.projects.rotation.y += this.state.menu.speed * this.state.menu.delta * this.app.state.menu.direction * 0.9 + this.state.menu.lerpTo * this.state.menu.delta;
        this.state.menu.lastTick = now;
        this.app.state.menu.lerpTo = 0
    }
}


class LogoManager {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = threeManager;
        this.canvas = this.threeManager.canvas;
        this.logos = new THREE.Group();
        this.logos.name = 'logos';

        this.resources = {
            mat: new THREE.MeshBasicMaterial({ color: 0xffffff, transparant: true }),
            mesh: this.threeManager.resources.mesh
        };
        this.state = {
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
                texture.magFilter = THREE.LinearMipMapLinearFilter;
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                // texture.generateMipMaps = true;

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

            if (this.app.isMobile) {
                promises.push(this.createLogo("logo_h.png", 250, 2));
                promises.push(this.createLogo("logo_m.png", 125, 2));
                promises.push(this.createLogo("logo_v.png", 90, -7));
            } else {
                promises.push(this.createLogo("logo_h.png", 150, 2));
                promises.push(this.createLogo("logo_m.png", 90, 2));
                promises.push(this.createLogo("logo_v.png", 45, 0));
            }
            Promise.all(promises).then((resolves) => {
                resolves.forEach(res => {
                    this.logos.add(res.logo);
                    res.logo.position.y = res.y;
                })
                ////console.log("CHOOSELOG");
                this.chooseLogo();
                this.threeManager.render(performance.now);
                this.threeManager.addToScene(this.logos);
                this.state.isInitialized = true;
                resolve();
            })
        })

    }

    chooseLogo() {
        if (!this.state.isInitialized) return;
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