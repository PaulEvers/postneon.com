import checkIfFits from "./tools/checkIfFits"
import MediaManager from "./MediaManager"
import IntersectionManager from "./IntersectionManager"
import TweenManager from './TweenManager';

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
            tempOrientation: {}
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

        this.canvasContainer = document.querySelector("#threejs");
        this.canvasContainer.appendChild(this.canvas);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        // this.camera.far = 10000000;
        this.camera.updateProjectionMatrix();
        this.camera.position.z = this.state.centerDistance;
        ////console.log(this.camera.fov, this.camera.position.z);

        this.loader = new THREE.TextureLoader();
        this.tweenManager = new TweenManager({ app: app, threeManager: this });
        this.intersectionManager = new IntersectionManager();
        this.mediaManager = new MediaManager({ app: app, threeManager: this });
        this.logoManager = new LogoManager({ app: this.app, threeManager: this });

        this.initProjects();
    }
    async initLogos() {
        await this.logoManager.createLogos();
        return;
    }

    initProjects() {
        this.state.projectsContainer = new THREE.Group();
        this.state.projectsContainer.name = 'projectsContainer';
        this.state.projects = new THREE.Group();
        this.state.projects.name = 'projects';
        this.state.projects.userData.outlinerEnabled = false;
        this.state.projects.findProject = (name) => this.state.projects.find(p => p.name === name);
        this.state.projectsContainer.add(this.state.projects);
        this.addToScene(this.state.projectsContainer);
    }


    changeOrientation(orientation) {
        function createRandom() {
            let random = Math.random() * Math.PI / 8;
            return Math.random() < 0.5 ? random : random * -1;
        }

        if (orientation === 'landscape') {
            if (this.app.state.focus.media) this.app.state.focus.media.attach(this.camera);
            this.app.state.orientation = orientation;
            this.state.projectsContainer.rotation.z = 0;
            for (let project of this.state.projects.children) {
                project.rotation.z = Math.PI / 2;
            }
            if (this.app.state.focus.media) this.scene.attach(this.camera);
        } else {
            if (this.app.state.focus.media) this.app.state.focus.media.attach(this.camera);
            this.app.state.orientation = orientation;
            this.state.projectsContainer.rotation.z = Math.PI / 2;
            for (let project of this.state.projects.children) {
                project.rotation.z = 0;
            }
            if (this.app.state.focus.media) this.scene.attach(this.camera);
            // this.state.centerDistance = 200;
        }
    }


    resizeCanvas(noLogo) {

        this.state.tempOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        if (this.app.state.orientation !== this.state.tempOrientation)
            this.changeOrientation(this.state.tempOrientation);

        this.logoManager.chooseLogo();

        if (this.app.state.menuOpen) {

            this.camera.position.z = this.state.centerDistance;
        } else {
            if (this.app.state.isMobile) {
                let fov = checkIfFits(this.app.state.focus.media);
                this.camera.fov = fov;
                this.camera.updateProjectionMatrix();
            }
        }

        // update camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.render();
        if (!!this.app.state.menu.isOpen) {
            this.logoManager.chooseLogo();
        }
    }

    async fetchScene(url) {
        let _data = await fetch(url, { method: 'GET', mode: 'cors' })
            .then(res => res.json());
        ////console.log("FETCHED");
        ////console.log(_data);

        let _amount = _data.projects.length;
        let radius = 250;

        _data.about.big = _data.about.big.replace(/\n/g, "<br>");
        _data.about.small = _data.about.small.replace(/\n/g, "<br>");
        _data.contact.big = _data.contact.big.replace(/\n/g, "<br>");
        _data.contact.small = _data.contact.small.replace(/\n/g, "<br>");

        _data.projects.forEach(async (_p, i) => {
            let project = new THREE.Group();
            project.name = _p.title;
            this.state.projects.add(project);

            project.userData = {
                projectLength: _p.medias.length,
                order: 0,
                oldProject: _p.title,
                directory: _p.directory,
                infoBig: _p.info.big ? _p.info.big.replace(/\n/g, "<br>") : "",
                infoSmall: _p.info.small ? _p.info.small.replace(/\n/g, "<br>") : "",
                medias: _p.medias
            }

            project.rotation.set(0, i * Math.PI * 2 / _amount, 0)
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
                z: radius
            }
            _m.scale = _m.ratio > 1 ?
                { x: this.state.scale, y: this.state.scale / _m.ratio } :
                { x: this.state.scale * _m.ratio, y: this.state.scale };

            this.addToProjects(project);
            let media = await this.mediaManager.create({ _media: _m, _project: _p });
            if (_m.type === 'video') {
                setTimeout(() => {
                    media.material.map.pause()
                }, 1000);
            }

            project.add(media);
            this.app.state.objects.push(media);

            let viewpoint = new THREE.Group();
            viewpoint.name = 'viewpoint';
            viewpoint.position.set(0, 0, 40 + 73.5);
            project.add(viewpoint);

        })

        this.render();

        // this.resizeCanvas();

        return _data;
    }

    addToProjects(_p) {
        this.state.projects.add(_p);
        ////console.log(this.scene);
    }
    addToScene(_m) {
        ////console.log(_m);
        this.scene.add(_m);
        ////console.log("add to scene! ", this.scene);
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}


class LogoManager {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = threeManager;
        this.canvas = this.threeManager.canvas;
        this.canvasContainer = this.threeManager.canvasContainer;
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
                this.threeManager.render();
                this.threeManager.addToScene(this.logos);
                this.state.isInitialized = true;
                resolve();
            })
        })

    }

    chooseLogo() {
        if (!this.state.isInitialized) return;
        if ((this.canvasContainer.offsetWidth / window.innerHeight) > 1.6) {
            this.logos.children[0].material.visible = true;
            this.logos.children[1].material.visible = false;
            this.logos.children[2].material.visible = false;
        } else {
            if ((this.canvasContainer.offsetWidth / window.innerHeight) > 1) {
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