
import ThreeManager from "./3D/ThreeManager"
import InteractionManager from "./NAV/InteractionManager"
import TweenManager from './TweenManager';
import GUIManager from './NAV/GUIManager';

import * as THREE from "three"
window.THREE = THREE;

class Application {

    constructor() {
        this.__ = {
            hover_timestamp: performance.now(),
            menu: {
                isOpen: true,
                direction: 1,
                lerpTo: 0,
            },
            focus: null,
            isMobile: null,
            opt: null
        }

        const faviconAnimator = new FaviconAnimator();
        setInterval(() => {
            faviconAnimator.changeFavicon();
        }, 2000);
        const formatOptimizer = new FormatOptimizer();

        this.__.isMobile = formatOptimizer.isMobile;
        this.__.opt = this.__.isMobile ? 'mobile' : 'desktop';

        this._three = new ThreeManager({ app: this });
        this._tween = new TweenManager({ app: this });
        this._gui = new GUIManager({ app: this });
        this._interaction = new InteractionManager({ app: this });

        this._three.initLogos().then(() => {
            this.animate(performance.now());
        })

        this._three.fetchScene('./JSON/data.json').then(data => {
            this.__.data = data;
            this.openPage();
        });

    }

    openPage = () => {
        const params = new URLSearchParams(window.location.search);
        if (!params.has('page')) { return; }

        const page = params.get('page');
        if (page === 'about') {
            this._gui.openAbout();
        }

        if (page === 'contact') {
            this._gui.openContact();
        }
    }

    getOrientation() {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };

    throttle(now, timestamp, delta) {
        return (1000 / (now - timestamp)) < delta
    }

    animate(now) {
        this._three.render();

        setTimeout(() => this.animate(performance.now()), 1000 / 60);

        if (!now) return;

        if (this.__.menu.isOpen && !this.__.infoMode) {
            this._three.rotateMenu(now);
        }

        this._tween.update(now);

        if (this.__.infoMode || this.__.isMobile) return

        this._interaction._scroll.updateScroll();

        if (!this.__.menu.isOpen || this._gui.__.isHovering) return;

        if (this.throttle(now, this.__.hover_timestamp, 30)) {
            this._interaction._cursor.hoverMenu();
            this.__.hover_timestamp = now;
        }
    }
}

class FaviconAnimator {
    currentFaviconIndex = 0;
    favicons = ['P', 'O', 'S', 'T', 'N', 'E', 'O', 'N'];

    changeFavicon() {
        var link = document.createElement('link'),
            oldLink = document.getElementById('dynamic-favicon');
        link.id = 'dynamic-favicon';
        link.rel = 'shortcut icon';
        link.href = "./favicons/favicon_" + this.favicons[this.currentFaviconIndex] + ".png";
        this.currentFaviconIndex === this.favicons.length -1 ? this.currentFaviconIndex = 0 : this.currentFaviconIndex++;

        if (oldLink) document.head.removeChild(oldLink);
        document.head.appendChild(link);
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

