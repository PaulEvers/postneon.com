import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

export default class LogoManager {
    constructor({ app, _three }) {
        this.app = app;
        this._three = _three;
        this.canvas = this._three._3d.renderer.domElement;
        this.logos = new CSS3DObject();
        this.logos.position.set(0, 0, 0);
        this.logos.name = 'logos';
        this.__ = {
            isInitialized: false,
        }
    }
    createLogo(src, ratio, y) {
        return new Promise((resolve) => {
            let path = `./logos/${src}`;

            let d_img = document.createElement("img");

            let d_container = document.createElement("div");
            d_container.classList.add('d_container');
            d_container.classList.add('d_logo');

            d_container.appendChild(d_img);
            d_container.style.pointerEvents = 'none';
            d_img.setAttribute("src", path);
            let logo = new CSS3DObject(d_container);

            ratio = ratio / 3.75 * this.app._three.__.scale;

            d_img.onload = () => {
                logo.scale.set(ratio, ratio * d_img.height / d_img.width, 1);
                resolve(logo);
            }
        })
    }
    createLogos() {
        return new Promise((resolve) => {
            let promises = [];

            if (this.app.__.isMobile) {
                promises.push(this.createLogo("logo_h.png", 20, 2));
                promises.push(this.createLogo("logo_m.png", 9, 2));
                promises.push(this.createLogo("logo_v.png", 9, -7));
            } else {
                promises.push(this.createLogo("logo_h.png", 15, 2));
                promises.push(this.createLogo("logo_m.png", 9, 2));
                promises.push(this.createLogo("logo_v.png", 9, 0));
            }
            Promise.all(promises).then((resolves) => {
                resolves.forEach(logo => {
                    this.logos.add(logo);
                    logo.position.set(0, 0, 0);
                })
                this._three.render(performance.now);
                this._three.addToScene(this.logos);
                this.__.isInitialized = true;
                this.chooseLogo();
                resolve();
            })
        })

    }

    chooseLogo() {
        if (!this.__.isInitialized) return;
        if ((this.canvas.offsetWidth / window.innerHeight) > 1.6) {
            this.logos.children[0].visible = true;
            this.logos.children[1].visible = false;
            this.logos.children[2].visible = false;
        } else {
            if ((this.canvas.offsetWidth / window.innerHeight) > 1) {
                this.logos.children[0].visible = false;
                this.logos.children[1].visible = true;
                this.logos.children[2].visible = false;
            } else {
                this.logos.children[0].visible = false;
                this.logos.children[1].visible = false;
                this.logos.children[2].visible = true;
            }
        }
    }
}
