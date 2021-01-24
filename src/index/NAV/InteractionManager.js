import CursorManager from "./CursorManager"
import KeyManager from "./KeyManager"
import GUIManager from "./GUIManager"
import ScrollManager from "./ScrollManager"


export default class InteractionManager {
    constructor({ app, _three }) {
        this.app = app;
        this._cursor = new CursorManager({ app });
        this._scroll = new ScrollManager({ app });
        this.keyManager = new KeyManager({ app });
    }

    updateScroll() {
        this._scroll.updateScroll()
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
            this._cursor.hoverMenu()
        }
    }
}

