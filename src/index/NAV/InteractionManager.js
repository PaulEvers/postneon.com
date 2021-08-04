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

    scrollToNextProject(direction) {
        let project = this.app._three.getNextProject(direction);
        let success = this.app._three.focusOn(project, 1000);
        if (success)
            this.app._gui.setProjectUI(project)
    }
}

