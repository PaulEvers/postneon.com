import normalizeWheel from 'normalize-wheel'

export default class ScrollManager {
    constructor({ app, guiManager }) {

        this.app = app;
        this.threeManager = app.threeManager;
        this.mediaManager = this.threeManager.mediaManager;
        this.tweenManager = app.tweenManager;
        this.guiManager = guiManager;

        this.DOM = {
            scroll: {
                container: document.querySelector(".scroll-container"),
                content: document.querySelector(".scroll-content")
            },
        }
        this.state = {
            toOrigin: false,
            scroll: {
                now: { x: null, y: null },
                eased: { x: null, y: null },
                last: { x: null, y: null },
                delta: { x: null, y: null },
                alpha: 0.25,
                origin: null
            }

        }
        this.init();
    }
    init() {
        this.state.scroll.origin = this.DOM.scroll.content.offsetHeight / 2;
        this.DOM.scroll.container.scrollTop = this.state.scroll.origin;
        this.scrollLoop();
    }

    scrollLoop = () => {

        this.state.scroll.now = {
            x: this.DOM.scroll.container.scrollLeft,
            y: this.DOM.scroll.container.scrollTop
        }

        if (this.state.toOrigin) {
            if (this.state.scroll.now.y === this.state.scroll.origin)
                this.state.toOrigin = false;
            return;
        }

        if (this.state.scroll.now.y === this.state.scroll.origin) {
            this.state.scroll.eased = this.state.scroll.now;
            this.state.scroll.last = this.state.scroll.eased
            return
        }

        this.state.scroll.eased = {
            x: this.state.scroll.now.x * this.state.scroll.alpha + this.state.scroll.eased.x * (1 - this.state.scroll.alpha),
            y: this.state.scroll.now.y * this.state.scroll.alpha + this.state.scroll.eased.y * (1 - this.state.scroll.alpha),
        }

        this.state.scroll.delta = {
            x: this.state.scroll.last.x - this.state.scroll.eased.x,
            y: this.state.scroll.last.y - this.state.scroll.eased.y
        }

        this.app.state.menu.direction = this.state.scroll.delta.y > 0 ? 1 : -1;


        if (Math.abs(this.state.scroll.delta.y) < 0.00125) {
            this.DOM.scroll.container.scrollTo(0, this.state.scroll.origin);
            this.state.toOrigin = true;
            return
        }


        if (this.app.state.menu.isOpen) {
            this.app.state.menu.lerpTo += this.state.scroll.delta.y / 10000;

        } else {
        }
        this.state.scroll.last = this.state.scroll.eased
    }

    scrollToNextProject(direction) {
        let nextProject = this.threeManager.getNextProject(direction);
        let success = this.threeManager.focusOn(nextProject.children[0], 1000);
        if (success)
            this.guiManager.setProjectUI(project)

    }

}