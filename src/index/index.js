
import ThreeManager from "./3D/ThreeManager"
import InteractionManager from "./3D/InteractionManager"
import MenuManager from "./MenuManager"
import * as THREE from "three"

//modules
import TWEEN from '@tweenjs/tween.js'
console.log("HALLO");
window.THREE = THREE;
console.log(THREE);

class Application {
    constructor() {
        // set up some variables
        this.JSON = {};
        this.scene = null;
        this.state = {
            menu: {
                isOpen: true,
                direction: 1,
                lerpTo: 0,
            },
            interaction: {
                updateStamp: performance.now()
            },
            about: {
                isOpen: false
            },
            cursor: {
                x: null,
                y: null,
                isScrolling: false
            },
            textures: {
                pics: {},
                update: {},
                preview: {},
                uploading: [],
                videos: {},
                updateStamp: performance.now()
            },
            focus: {
                project: null,
                media: null
            },
            opt: null,
            objects: []
        }
        this.DOM = {
            projectTitle: document.querySelector("#projectTitle"),
            contactButton: document.querySelector("#contactButton"),
            aboutButton: document.querySelector("#aboutButton"),
            subTitle: document.querySelector("#subTitle"),
            threejs: document.querySelector("#threejs"),
            picNumber: document.querySelector("#picNumber"),
            order: document.querySelector("#order"),
            projectLength: document.querySelector("#projectLength")
        }
        // initialize 
        this.init();

    }
    async init() {
        this.faviconAnimator = new FaviconAnimator();

        let formatOptimizer = new FormatOptimizer();

        this.state.isMobile = formatOptimizer.isMobile;
        this.state.opt = this.state.isMobile ? 'mobile' : 'desktop';
        // this.state.opt = 'mobile';
        this.threeManager = new ThreeManager({ app: this });
        this.interactionManager = new InteractionManager({ app: this, threeManager: this.threeManager });
        this.menuManager = new MenuManager({ app: this, threeManager: this.threeManager });
        this.threeManager.initLogos().then(() => {
            this.render();
        })

        this.threeManager.fetchScene("http://www.post-neon.com/JSON/data.json");
    }

    render() {
        requestAnimationFrame(this.render.bind(this));
        if (this.state.stopAnimation)
            return;

        this.state.now = performance.now();
        if (this.state.now - this.state.textures.updateStamp > (1000 / 30)) {
            for (let key in this.state.textures.update) {
                let texture = this.state.textures.update[key];
                texture.needsUpdate = true;
            }
            this.state.textures.updateStamp = this.state.now;
        }

        if (this.state.now - this.state.interaction.updateStamp > (1000 / 10)) {
            this.interactionManager.update(this.state);
            this.state.interaction.updateStamp = this.state.now;
        }
        this.menuManager.rotateMenu(this.state);
        this.threeManager.render()
        TWEEN.update();


    }
}

class FaviconAnimator {
    constructor() {
        this.characters = "pqstneqn";
        setTimeout(() => {
            this.changeFavicon(1);
        }, 5000);
    }
    changeFavicon(index) {
        let favoLinks = "pqstneqn";
        var link = document.createElement('link'),
            oldLink = document.getElementById('dynamic-favicon');
        link.id = 'dynamic-favicon';
        link.rel = 'shortcut icon';
        link.href = "http://www.post-neon.com/favicons/favicon_" + this.characters[index] + ".png";
        if (oldLink) document.head.removeChild(oldLink);
        document.head.appendChild(link);
        index = index++ % favoLinks.length;
        setTimeout(() => {
            this.changeFavicon(index);
        }, 5000)
    }
}

class FormatOptimizer {
    constructor() {
        this.hasTouch = this.checkTouch();
        this.isMobile = navigator.userAgent.match(/Mobi/) ||
            (navigator.userAgent.match(/Mac/) && this.hasTouch);
        this.optimizeDOM();
        return this.isMobile;
    }
    checkTouch() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    }
    optimizeDOM() {
        if (this.isMobile) {
            document.querySelector("#topGUI").style.position = "fixed";
            document.querySelector("#cursor").style.display = "none";

        } else {
            document.querySelector("#scroll").setAttribute("class", "noMobile");
        }
    }

}

window.application = new Application();