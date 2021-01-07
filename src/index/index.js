
import ThreeManager from "./3D/ThreeManager"
import TweenManager from './TweenManager';
import InteractionManager from "./3D/InteractionManager"
import MenuManager from "./MenuManager"
import * as THREE from "three"
window.THREE = THREE;

class Application {
    constructor() {
        // set up some variables
        this.JSON = {};
        this.scene = null;
        this.state = {
            tween: {
                isTweening: false,
                timeStamp: performance.now()
            },
            menu: {
                isOpen: true,
                direction: 1,
                lerpTo: 0,
            },
            interaction: {
                timeStap: performance.now()
            },
            infoMode: false,
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
                timeStap: performance.now()
            },
            focus: {
                project: null,
                media: null
            },
            opt: null,
            objects: []
        }
        this.init();

    }
    async init() {
        this.faviconAnimator = new FaviconAnimator();
        let formatOptimizer = new FormatOptimizer();

        this.state.isMobile = formatOptimizer.isMobile;
        this.state.opt = this.state.isMobile ? 'mobile' : 'desktop';
        console.log("STATE MOBILE IS ", this.state.isMobile);
        // this.state.opt = 'mobile';
        this.threeManager = new ThreeManager({ app: this });
        this.tweenManager = new TweenManager({ app: this, threeManager: this.threeManager });
        this.interactionManager = new InteractionManager({ app: this, threeManager: this.threeManager });
        this.menuManager = new MenuManager({ app: this, threeManager: this.threeManager });
        this.threeManager.initLogos().then(() => {
            this.render();
        })

        this.threeManager.fetchScene("http://www.post-neon.com/JSON/data.json");
    }

    render() {
        requestAnimationFrame(this.render.bind(this));
        if (this.state.stopAnimation || document.hidden)
            return;

        this.threeManager.render();
        this.state.now = performance.now();
        this.tweenManager.update(this.state.now);

        if (this.state.now - this.state.textures.timeStap > (1000 / 30)) {
            for (let key in this.state.textures.update) {
                if (this.state.textures.update[key].image.readyState >=
                    this.state.textures.update[key].image.HAVE_CURRENT_DATA) {
                    this.state.textures.update[key].needsUpdate = true;
                }
            }
            this.state.textures.timeStap = this.state.now;
        }

        if (!this.tweenManager.tweens.tweenCamera.state.isTweening) {
            if (this.state.now - this.state.interaction.timeStap > (1000 / 10)) {
                this.interactionManager.update(this.state);
                this.state.interaction.timeStap = this.state.now;
            }
            this.menuManager.rotateMenu(this.state);
        }
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
        this.isMobile = (!!navigator.userAgent.match(/Mobi/)) ||
            (navigator.userAgent.match(/Mac/) && this.hasTouch);
        this.optimizeDOM();
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
            // document.querySelector("#topGUI").style.position = "fixed";
            document.querySelector(".cursor").style.display = "none";
            document.body.classList.add('mobile');

        } else {
            document.querySelector("#scroll").setAttribute("class", "noMobile");
        }
    }

}

window.application = new Application();