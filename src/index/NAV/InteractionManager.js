import CursorManager from "./CursorManager"
import KeyManager from "./KeyManager"
import GUIManager from "./GUIManager"
import ScrollManager from "./ScrollManager"


export default class InteractionManager {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = threeManager;

        this.guiManager = new GUIManager({ app, threeManager });
        this.cursorManager = new CursorManager({ app, guiManager: this.guiManager });
        this.scrollManager = new ScrollManager({ app, guiManager: this.guiManager });
        this.keyManager = new KeyManager({ app, guiManager: this.guiManager });
    }

    updateScroll() {
        this.scrollManager.scrollLoop()
    }
    updateHover() {
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

