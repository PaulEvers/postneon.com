
import ThreeManager from "./3D/ThreeManager"
import InteractionManager from "./NAV/InteractionManager"
import TweenManager from './TweenManager';
import MenuManager from "./MenuManager"
import * as THREE from "three"
window.THREE = THREE;

class Application {
    constructor() {
        // set up some variables
        this.JSON = {};
        this.scene = null;
        this._s = {
            time: 0,
            pause: false,
            infoOpen: false,
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

        this._s.isMobile = formatOptimizer.isMobile;

        this._s.opt = this._s.isMobile ? 'mobile' : 'desktop';
        // this._s.opt = 'mobile';
        this.threeManager = new ThreeManager({ app: this });
        this.tweenManager = new TweenManager({ app: this, threeManager: this.threeManager });
        this.interactionManager = new InteractionManager({ app: this, threeManager: this.threeManager });
        this.menuManager = new MenuManager({ app: this, threeManager: this.threeManager });
        this.threeManager.initLogos().then(() => {
            this.animate();
        })

        this.threeManager.fetchScene("http://www.post-neon.com/new/JSON/data.json");
    }

    animate = (now) => {
        requestAnimationFrame(this.animate);
        if (!now) return;
        if (!this._s.lastTime)
            this._s.lastTime = now;
        else {
            if ((1000 / (now - this._s.lastTime)) > 90) {
                return;
            } else {
                this._s.lastTime = now;
            }
        }

        if (this._s.stopAnimation || document.hidden || !document.visibilityState)
            return;



        this.threeManager.render();
        this.interactionManager.updateScroll();
        this.interactionManager.updateHover();

        this.tweenManager.update(now);

        for (let key in this._s.textures.update) {
            if (this._s.textures.update[key].image.readyState >=
                this._s.textures.update[key].image.HAVE_CURRENT_DATA
            ) {
                this._s.textures.update[key].needsUpdate = true;
            }
        }


        if (this._s.menu.isOpen) {
            this.threeManager.rotateMenu(now);
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

window.app = new Application();

