export default class ScrollManager {
    constructor({ app }) {
        this.app = app;

        this.DOM = {
            scroll: {
                container: document.querySelector(".scroll-container"),
                content: document.querySelector(".scroll-content")
            },
        }
        this._s = {
            toOrigin: false,
            scroll: {
                now: { x: null, y: null },
                eased: { x: null, y: null },
                last: { x: null, y: null },
                delta: { x: null, y: null },
                alpha: 0.25,
                origin: null,
                scrolling: false,
                clearScrolling: null,
            }

        }
        this.init();
    }
    init() {
        this._s.scroll.origin =
        {
            x: this.DOM.scroll.content.offsetWidth / 2,
            y: this.DOM.scroll.content.offsetHeight / 2
        };
        this.DOM.scroll.container.scrollTop = this._s.scroll.origin.y;
        this.DOM.scroll.container.addEventListener('wheel', () => { this.setScrolling(true) });
        this.resetScrollState();
        this.updateScroll();
    }
    setScrolling = (bool) => {
        if (bool) {
            this._s.scroll.scrolling = true;
            if (this._s.scroll.clearScrolling)
                clearTimeout(this._s.scroll.clearScrolling);
            this._s.scroll.clearScrolling = setTimeout(() => {
                this.setScrolling(false);

            }, 500)
        } else {
            this._s.scroll.scrolling = true;
        }
    }

    scrollToOrigin = () => {
        this.DOM.scroll.container.scrollTo(0, this._s.scroll.origin.y);
        this._s.toOrigin = true;
    }

    resetScrollState = () => {
        this._s.scroll.eased = this._s.scroll.origin;
        this._s.scroll.last = this._s.scroll.eased;
    }

    updateScroll = () => {
        if (!this._s.scroll.scrolling) {
            return false;
        }
        this._s.scroll.now = {
            x: this.DOM.scroll.container.scrollLeft,
            y: this.DOM.scroll.container.scrollTop
        }

        if (this._s.toOrigin) {
            if (this._s.scroll.now.y === this._s.scroll.origin.y)
                this._s.toOrigin = false;
            return;
        }

        if (this._s.scroll.now.y === this._s.scroll.origin.y) {
            this.resetScrollState();
            return
        }

        this._s.scroll.eased = {
            x: this._s.scroll.now.x * this._s.scroll.alpha + this._s.scroll.eased.x * (1 - this._s.scroll.alpha),
            y: this._s.scroll.now.y * this._s.scroll.alpha + this._s.scroll.eased.y * (1 - this._s.scroll.alpha),
        }

        this._s.scroll.delta = {
            x: this._s.scroll.last.x - this._s.scroll.eased.x,
            y: this._s.scroll.last.y - this._s.scroll.eased.y
        }

        this.app._s.menu.direction = this._s.scroll.delta.y > 0 ? 1 : -1;


        if (Math.abs(this._s.scroll.delta.y) < 0.00125) {
            this.scrollToOrigin();
            return
        }


        if (this.app._s.menu.isOpen) {
            this.app._s.menu.lerpTo += this._s.scroll.delta.y / 10000;
        } else {
            if (!this.app._tween._s.isTweening && Math.abs(this._s.scroll.delta.y) > 30)
                this.scrollToNextProject(this._s.scroll.delta.y > 0 ? -1 : 1)
        }
        this._s.scroll.last = this._s.scroll.eased
    }

    scrollToNextProject(direction) {
        let project = this.app._three.getNextProject(direction);
        let success = this.app._three.focusOn(project, 1000);
        if (success)
            this.app._gui.setProjectUI(project)
    }
}