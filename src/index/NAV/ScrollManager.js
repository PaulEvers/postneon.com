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
            scroll: null,
        }
        this.init();
    }
    init() {
        this.DOM.scroll.container.scrollTop = this.DOM.scroll.content.offsetHeight / 2;
        window.addEventListener("wheel", this.onScroll.bind(this), 125);
    }
    validateScroll(event) {
        if (this.app.state.info)
            return false;
        const normalized = normalizeWheel(event);

        let realScroll = this.app.state.menu.isOpen ? true : Math.abs(normalized.pixelY) > 75;

        // let hotZone = realScroll;
        // if (hotZone && !this.state.cursor.scroll.isHot) {
        //     
        //     this.state.cursor.scroll.isHot = true;
        //     /*            if (this.state.cursor.scroll.isCold) {
        //                    clearTimeout(this.state.cursor.scroll.isCold);
        //                    this.state.cursor.isCold = false;
        //                }
        //                this.state.cursor.isCold = setTimeout(() => {
        //                    this.state.cursor.scroll.isHot = false;
        //                    this.state.cursor.scroll.isCold = false;
        //                    
        //                }, 1000) */
        // }

        return { success: realScroll, y: normalized.pixelY };
    }

    onScroll(e) {
        let sx = this.DOM.scroll.container.pageXOffset;
        let sy = this.DOM.scroll.container.pageYOffset;

        console.log(sx, sy);

        if (this.app.state.pause) return;

        if (this.tweenManager.state.isTweening) return;
        this.state.scroll = this.validateScroll(e);
        if (!this.state.scroll.success) return;
        if (this.state.scroll.y > 0) {
            this.state.scroll.direction = 1;
            this.app.state.menu.direction = 1;
        } else {
            this.state.scroll.direction = -1;
            this.app.state.menu.direction = -1;

        }
        if (!this.app.state.menu.isOpen) {
            if (!this.tweenManager.tweens.tweenCamera.state.isTweening) {
                this.scrollToNextProject(this.state.scroll.direction);
            }
        } else {
            this.app.state.menu.lerpTo += (this.state.scroll.y / 1250);
        }
    }



    scrollToNextProject(direction) {
        let nextProject = this.threeManager.getNextProject(direction);
        let success = this.threeManager.focusOn(nextProject.children[0], 1000);
        if (success)
            this.guiManager.setProjectUI(project)

    }

}