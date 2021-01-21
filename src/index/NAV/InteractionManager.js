import CursorManager from "./CursorManager"
import KeyManager from "./KeyManager"
import GUIManager from "./GUIManager"
import ScrollManager from "./ScrollManager"


export default class InteractionManager {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = threeManager;

        this.init();

        this.guiManager = new GUIManager({ app, threeManager });

        this.cursorManager = new CursorManager({ app, guiManager: this.guiManager });
        this.scrollManager = new ScrollManager({ app, guiManager: this.guiManager });

        this.keyManager = new KeyManager({ app, guiManager: this.guiManager });

    }
    init() {
        this.initResize();
        // this.initKey();
    }
    initResize() {
        window.addEventListener("resize", () => { this.threeManager.resizeCanvas() }, 125);
    }


    toggleFullScreen() {
        g.fullscreen = true;
        var doc = window.document;
        var docEl = doc.documentElement;
        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        cancelFullScreen.call(doc);
        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
    }

    update() {
        if (!this.app.state.isMobile &&
            !this.app.state.info &&
            !this.app.state.tween.isTweening &&
            this.app.state.menu.isOpen &&
            !this.app.state.guiHover &&
            !this.app.state.mouseDown &&
            !this.app.state.pause
        ) {
            this.cursorManager.hoverMenu()
        }
    }

}

