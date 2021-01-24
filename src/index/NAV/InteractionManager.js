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
        this.scrollManager.updateScroll()
    }
    updateHover() {
        if (!this.app._s.isMobile &&
            !this.app._s.info &&
            !this.app._s.tween.isTweening &&
            this.app._s.menu.isOpen &&
            !this.app._s.guiHover &&
            !this.app._s.mouseDown &&
            !this.app._s.pause
        ) {
            this.cursorManager.hoverMenu()
        }
    }
}

