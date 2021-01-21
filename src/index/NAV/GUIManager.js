class CursorModes {
    DOM = {
        cursor: document.querySelector(".cursor")
    }
    set = (mode) => {
        switch (mode) {
            case 'pointer':
                this.DOM.cursor.classList.remove('cross-on');
                this.DOM.cursor.classList.remove('pointer-left');
                this.DOM.cursor.classList.remove('pointer-right');
                break
            case 'cross':
                this.DOM.cursor.classList.add('cross-on');
                this.DOM.cursor.classList.remove('pointer-left');
                this.DOM.cursor.classList.remove('pointer-right');
                break
            case 'left':
                this.DOM.cursor.classList.remove('cross-on');
                this.DOM.cursor.classList.add('pointer-left');
                this.DOM.cursor.classList.remove('pointer-right');
                break
            case 'right':
                this.DOM.cursor.classList.remove('cross-on');
                this.DOM.cursor.classList.add('pointer-right');
                this.DOM.cursor.classList.remove('pointer-left');
                break

        }
    }

}

class GUIManager {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = app.threeManager;
        this.tweenManager = app.tweenManager;

        this.state = {
            cursorMode: new CursorModes(),
            guiHover: false
        }

        this.DOM = {
            cursor: document.querySelector('.cursor'),
            buttons: {
                about: document.querySelector(".about-button"),
                contact: document.querySelector(".contact-button"),
                volume: document.querySelector(".volume-button"),
                back: document.querySelector(".back-button"),
                menu: document.querySelector(".back-button"),
                info: document.querySelector(".info-button")
            },
            project: {
                length: document.querySelector(".project-length"),
                index: document.querySelector(".media-index"),
                title: document.querySelector(".project-title")
            }
        }
        this.init();
    }

    setCursorPosition = (x, y) => {
        this.DOM.cursor.style.left = x;
        this.DOM.cursor.style.top = y;
    }

    setCursorMode = (mode) => {
        this.state.cursorMode.set(mode);
    }

    setProjectTitle = (project) => {
        this.DOM.project.title.classList.remove('hidden');

        if (this.DOM.project.title.innerHTML != project.name) {
            this.DOM.project.title.innerHTML = project.name
        }
    }

    hideProjectTitle = () => {
        this.DOM.project.title.classList.add('hidden')
    }

    hideCursor = () => {
        this.DOM.cursor.classList.add('hidden');
    }

    showCursor = () => {
        this.DOM.cursor.classList.remove('hidden');
        this.DOM.cursor.style.opacity = "1";
    }
    setProjectUI = (project) => {
        this.DOM.project.length.innerHTML = project.userData.projectLength;
        this.DOM.project.index.innerHTML = project.userData.order + 1;
        this.DOM.project.title.innerHTML = project.name;
        this.DOM.project.title.classList.remove('hidden');
    }

    closeInfo = () => {
        this.app.state.pause = false;
        this.app.state.info = false;
        this.tweenManager.tweens.tweenCanvas.tween();
        this.setCursorMode('pointer');
        if (this.app.state.menu.isOpen) {
            this.state.topMenu.mode.menu()
        } else {
            this.state.topMenu.mode.project()
        }
        this.DOM.canvas.removeEventListener('mouseup', this.closeInfo);
    }

    init = () => {
        this.DOM.buttons.back.addEventListener('mouseup', this.closeInfo)
        this.DOM.buttons.menu.addEventListener('mouseup', () => {
            this.threeManager.focusOn(false);
            this.state.topMenu.mode.menu();
        })

        document.querySelectorAll('button').forEach(b => {
            b.addEventListener('mouseenter', () => {
                this.state.guiHover = true;
            })
            b.addEventListener('mouseout', () => {
                this.state.guiHover = false;
            })
        })

        this.DOM.buttons.about.addEventListener('mouseup', () => {
            this.DOM.canvas.addEventListener('mouseup', this.closeInfo);

            this.app.state.pause = true;
            this.state.topMenu.mode.info();
            this.app.state.info = true;

            this.DOM.about.classList.remove('hidden');
            this.DOM.info.container.classList.add('hidden');


            this.tweenManager.tweens.tweenCanvas.tween()
        });

        this.DOM.buttons.info.addEventListener('mouseup', () => {
            this.DOM.canvas.addEventListener('mouseup', closeInfo);

            this.app.state.pause = true;
            this.state.topMenu.mode.info();
            this.app.state.info = true;

            this.DOM.info.container.classList.remove('hidden');
            this.DOM.about.classList.add('hidden');
            this.DOM.info.big.innerHTML = this.app.state.focus.project.userData.info.big;
            this.DOM.info.small.innerHTML = this.app.state.focus.project.userData.info.small;


            this.tweenManager.tweens.tweenCanvas.tween()
        });


        this.DOM.buttons.contact.onCursorUp = () => {
            if (this.app.state.menu.isOpen) {
                this.threeManager.resizeCanvas();
            }
        }
        this.DOM.buttons.volume.addEventListener("mousedown", function (event) {
            if (this.children[0].innerHTML === "muted") {
                this.children[0].innerHTML = "mute";
                this.app.state.focus.media.material.map.image.volume = "1";
            } else {
                this.children[0].innerHTML = "muted";
                this.app.state.focus.media.material.map.image.volume = "0";
            }
        });
    }

}

export default GUIManager