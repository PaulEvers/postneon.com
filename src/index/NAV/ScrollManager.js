export default class ScrollManager {
    constructor({ app }) {
        this.app = app;
        this.init();
    }
    DOM = {
        scroll: {
            container: document.querySelector(".scroll-container"),
            content: document.querySelector(".scroll-content")
        },
    }
    __ = {
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
            throttle: null
        }

    }
    init() {
        this.__.scroll.origin =
        {
            x: this.DOM.scroll.content.offsetWidth / 2,
            y: this.DOM.scroll.content.offsetHeight / 2
        };
        this.DOM.scroll.container.scrollTop = this.__.scroll.origin.y;
        this.DOM.scroll.container.addEventListener('wheel', this.onWheel);
        this.resetScrollState();
        this.updateScroll();
    }

    onWheel = e => {
        // console.log(this.app.__.infoMode, this.__.scroll.scrolling);
        if (!this.app.__.infoMode)
            this.setScrolling(true);
    }

    setScrolling = (bool) => {
        this.__.scroll.scrolling = true;

        if (!bool) return

        if (this.__.scroll.clearScrolling)
            clearTimeout(this.__.scroll.clearScrolling);
        this.__.scroll.clearScrolling = setTimeout(() => {
            this.setScrolling(false);
        }, 500)
    }

    pingScrollContainer = () => {
        this.__.scroll.temp = this.getScrollPosition();
        if (this.__.scroll.temp.y === this.__.scroll.origin.y) {
            this.__.toOrigin = false;
            this.DOM.scroll.container.classList.remove('toOrigin');
        } else {
            requestAnimationFrame(this.pingScrollContainer);
        }
    }

    scrollToOrigin = () => {
        this.DOM.scroll.container.scrollTo(0, this.__.scroll.origin.y);
        this.DOM.scroll.container.classList.add('toOrigin');
        this.__.toOrigin = true;
        this.pingScrollContainer();
    }

    resetScrollState = () => {
        this.__.scroll.eased = this.__.scroll.origin;
        this.__.scroll.last = this.__.scroll.eased;
    }

    getScrollPosition = () => {
        return {
            x: this.DOM.scroll.container.scrollLeft,
            y: this.DOM.scroll.container.scrollTop
        }
    }

    updateScroll = () => {
        if (!this.__.scroll.scrolling || this.__.toOrigin) {
            return false;
        }

        this.__.scroll.now = {
            x: this.DOM.scroll.container.scrollLeft,
            y: this.DOM.scroll.container.scrollTop
        }

        if (this.__.scroll.now.y === this.__.scroll.origin.y) {
            this.resetScrollState();
            return
        }

        this.__.scroll.eased = {
            x: this.__.scroll.now.x * this.__.scroll.alpha + this.__.scroll.eased.x * (1 - this.__.scroll.alpha),
            y: this.__.scroll.now.y * this.__.scroll.alpha + this.__.scroll.eased.y * (1 - this.__.scroll.alpha),
        }

        this.__.scroll.delta = {
            x: this.__.scroll.last.x - this.__.scroll.eased.x,
            y: this.__.scroll.last.y - this.__.scroll.eased.y
        }

        this.app.__.menu.direction = this.__.scroll.delta.y > 0 ? 1 : -1;


        if (Math.abs(this.__.scroll.delta.y) < 0.00125) {
            this.scrollToOrigin();
            return
        }


        if (this.app.__.menu.isOpen) {
            this.app.__.menu.lerpTo += this.__.scroll.delta.y / 10000;
        } else {
            if (!this.app._tween.__.isTweening && Math.abs(this.__.scroll.delta.y) > 40)
                this.scrollToNextProject(this.__.scroll.delta.y > 0 ? -1 : 1)
        }
        this.__.scroll.last = this.__.scroll.eased
    }

    scrollToNextProject(direction) {
        let project = this.app._three.getNextProject(direction);
        let success = this.app._three.focusOn(project, 1000);
        if (success)
            this.app._gui.setProjectUI(project)
    }
}