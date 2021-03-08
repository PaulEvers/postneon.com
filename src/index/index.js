
import ThreeManager from "./3D/ThreeManager"
import InteractionManager from "./NAV/InteractionManager"
import TweenManager from './TweenManager';
import GUIManager from './NAV/GUIManager';

import * as THREE from "three"
window.THREE = THREE;

class Application {
    __ = {
        time: 0,
        pause: false,
        infoOpen: false,
        timestamp: {
            analysis: performance.now(),
            hover: performance.now(),
            scroll: performance.now(),
        },
        tween: {
            isTweening: false,
        },
        menu: {
            isOpen: true,
            direction: 1,
            lerpTo: 0,
        },
        infoMode: false,
        cursor: {
            x: null,
            y: null,
        },
        textures: {
            pics: {},
            update: {},
            preview: {},
            uploading: [],
            videos: {},
        },
        focus: null,
        opt: null,
        objects: []
    }

    capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);


    getOrientation = () => window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

    constructor() {
        const faviconAnimator = new FaviconAnimator();
        const formatOptimizer = new FormatOptimizer();

        this.__.isMobile = formatOptimizer.isMobile;
        this.__.opt = this.__.isMobile ? 'mobile' : 'desktop';

        this._three = new ThreeManager({ app: this });
        this._tween = new TweenManager({ app: this });
        this._gui = new GUIManager({ app: this });
        this._interaction = new InteractionManager({ app: this });

        this._three.initLogos()
            .then(this.initLoops)

        this._three.fetchScene("http://www.post-neon.com/new/JSON/data.json");
    }


    initLoops = () => {
        this.analyse();
        this.animate();
    }

    analyse = (now) => {
        requestAnimationFrame(this.analyse);
        if (this.__.pause) return;
        if (!now) return;

        if (this.__.menu.isOpen && !this.__.infoMode) {
            this._three.rotateMenu(now);
        }

        this._tween.update(now);


        if (this.__.infoMode || this.__.isMobile) return

        if ((1000 / (now - this.__.timestamp.scroll)) < 60) {
            this._interaction._scroll.updateScroll();
            this.__.timestamp.scroll = now;
        }


        if (this.__.menu.isOpen &&
            !this.__.tween.isTweening &&
            !this._gui.__.isHovering
        ) {
            if ((1000 / (now - this.__.timestamp.hover)) < 15) {
                this._interaction._cursor.hoverMenu();
                this.__.timestamp.hover = now;
            }
        }
    }

    animate = (now) => {
        requestAnimationFrame(this.animate);
        if (this.__.pause) return;
        this._three.render();
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

