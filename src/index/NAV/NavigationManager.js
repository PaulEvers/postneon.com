import CursorDependencies from "./CursorDependencies"
import CursorManager from "./CursorManager"
import ScrollManager from "./ScrollManager"
import GUIManager from "./GUIManager"


class TopMenuMode {
    constructor() {
        this.UIContainer = document.querySelector(".UI-container");

    }
    menu = () => {
        this.UIContainer.classList.add('menu-mode');
        this.UIContainer.classList.remove('project-mode');
        this.UIContainer.classList.remove('info-mode');
    }
    project = () => {
        this.UIContainer.classList.remove('menu-mode');
        this.UIContainer.classList.add('project-mode');
        this.UIContainer.classList.remove('info-mode');
    }
    info = () => {
        this.UIContainer.classList.remove('menu-mode');
        this.UIContainer.classList.remove('project-mode');
        this.UIContainer.classList.add('info-mode');
    }
}

class NavigationManager extends CursorDependencies {
    constructor({ app, threeManager }) {
        super({ app, threeManager })

        this.scrollManager = new ScrollManager({ app, threeManager });
        this.cursorManager = new CursorManager({ app, threeManager });
        this.GUIManager = new GUIManager({ app, threeManager });

        this.init();
    }

    DOM = {
        canvas: this.threeManager.renderer.domElement,
        buttons: {
            about: document.querySelector(".about-button"),
            contact: document.querySelector(".contact-button"),
            volume: document.querySelector(".volume-button"),
            back: document.querySelector(".back-button"),
            menu: document.querySelector(".back-button"),
            info: document.querySelector(".info-button")
        },
        info: {
            big: document.querySelector(".info-container").querySelector('.big'),
            small: document.querySelector(".info-container").querySelector('.small'),
            container: document.querySelector(".info-container")
        },
        about: document.querySelector(".about-container")
    }

    state = {
        focusBack: false,
        groups: null,
        topMenu: {
            mode: new TopMenuMode()
        }
    }

    init() {

        document.addEventListener("mouseout", (e) => {
            if (e.clientY <= 0 || e.clientX <= 0 ||
                (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
                this.DOM.cursor.container.style.opacity = "0.01";
            }
        });


    }


    update(appState) {
        if (!this.app.state.isMobile &&
            !appState.info &&
            !appState.tween.isTweening &&
            appState.menu.isOpen &&
            !appState.guiHover &&
            !appState.mouseDown &&
            !this.app.state.pause
        ) {
            this.cursorManager.hoverMenu()
        };
    }
}










export default NavigationManager