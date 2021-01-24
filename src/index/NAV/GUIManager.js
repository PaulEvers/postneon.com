class CursorModes {
    DOM = document.querySelector(".cursor")
    set = (mode) => {
        switch (mode) {
            case 'pointer':
                this.DOM.classList.remove('cross-on');
                this.DOM.classList.remove('pointer-left');
                this.DOM.classList.remove('pointer-right');
                break
            case 'cross':
                this.DOM.classList.add('cross-on');
                this.DOM.classList.remove('pointer-left');
                this.DOM.classList.remove('pointer-right');
                break
            case 'left':
                this.DOM.classList.remove('cross-on');
                this.DOM.classList.add('pointer-left');
                this.DOM.classList.remove('pointer-right');
                break
            case 'right':
                this.DOM.classList.remove('cross-on');
                this.DOM.classList.add('pointer-right');
                this.DOM.classList.remove('pointer-left');
                break
        }
    }
}

class TopMenuMode {
    DOM = document.querySelector(".UI-container")
    set = (mode) => {
        switch (mode) {
            case 'menu':
                this.DOM.classList.add('menu-mode');
                this.DOM.classList.remove('project-mode');
                this.DOM.classList.remove('info-mode');
                break
            case 'project':
                this.DOM.classList.remove('menu-mode');
                this.DOM.classList.add('project-mode');
                this.DOM.classList.remove('info-mode');
                break
            case 'info':
                this.DOM.classList.remove('menu-mode');
                this.DOM.classList.remove('project-mode');
                this.DOM.classList.add('info-mode');
                break
        }
    }
}

class GUIManager {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = app.threeManager;
        this.tweenManager = app.tweenManager;

        this._s = {
            cursorMode: new CursorModes(),
            topMenuMode: new TopMenuMode(),
            isHovering: false
        }

        this.DOM = {
            cursor: document.querySelector('.cursor'),
            canvas: document.querySelector('#threejs'),
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
            },
            about: document.querySelector(".about-container"),
            info: {
                container: document.querySelector(".info-container"),
                big: document.querySelector(".info-container").querySelector(".big"),
                small: document.querySelector(".info-container").querySelector(".small"),
            }
        }
        this.init();
    }


    setCursorPosition = (x, y) => {
        this.DOM.cursor.style.left = x;
        this.DOM.cursor.style.top = y;
    }

    setCursorMode = (mode) => {
        this._s.cursorMode.set(mode);
    }
    setTopMenuMode = (mode) => {
        this._s.topMenuMode.set(mode);
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

    tweenCanvas = () => {
        let tweener = this.app.tweenManager.add(750);
        if (!tweener) return

        const max = {
            canvas: window.innerWidth < 600 ? 100 : 50,
            projecTitle: window.innerWidth < 600 ? 100 : 75
        }

        let infoOpen = this.app._s.infoOpen;

        let canvas = {
            now: infoOpen ? max.canvas : 0,
            next: infoOpen ? 0 : max.canvas
        }
        let projectTitle = {
            now: infoOpen ? max.projecTitle : 50,
            next: infoOpen ? 50 : max.projecTitle
        }

        tweener.addEventListener('update', ({ detail }) => {
            this.DOM.canvas.style.left = this.tweenManager.lerp(canvas, detail) + "vw";
            this.DOM.project.title.style.left = this.tweenManager.lerp(projectTitle, detail) + "%";
        })
        tweener.addEventListener('complete', ({ detail }) => {
            console.log("COMPLETE!!!");
            this.app._s.infoOpen = !this.app._s.infoOpen;
            console.log("INFO OPEN IS ", this.app._s.infoOpen);
        })
    }

    closeInfo = e => {
        e.stopPropagation();
        this.app._s.pause = false;
        this.app._s.info = false;
        this.tweenCanvas();
        this.setCursorMode('pointer');
        if (this.app._s.menu.isOpen) {
            this.setTopMenuMode('menu')
        } else {
            this.setTopMenuMode('project')
        }
        this.DOM.canvas.removeEventListener('mouseup', this.closeInfo);
    }

    openInfo = () => {
        this.app._s.info = true;
        this.app._s.pause = true;
        this.setTopMenuMode('info');
        this.tweenCanvas();
        this.DOM.canvas.addEventListener('mouseup', this.closeInfo);
    }

    init = () => {
        this.DOM.buttons.back.addEventListener('mouseup', this.closeInfo)
        this.DOM.buttons.menu.addEventListener('mouseup', () => {
            this.threeManager.tweenToMenu(false);
            this.setTopMenuMode('menu');
        })

        document.querySelectorAll('button').forEach(b => {
            b.addEventListener('mouseenter', () => {
                this._s.isHovering = true;
            })
            b.addEventListener('mouseout', () => {
                this._s.isHovering = false;
            })
        })

        this.DOM.buttons.about.addEventListener('mouseup', () => {
            this.DOM.about.classList.remove('hidden');
            this.DOM.info.container.classList.add('hidden');

            this.openInfo();
        });

        this.DOM.buttons.info.addEventListener('mouseup', () => {
            this.DOM.info.container.classList.remove('hidden');
            this.DOM.about.classList.add('hidden');

            this.DOM.info.big.innerHTML = this.app._s.focus.project.userData.info.big;
            this.DOM.info.small.innerHTML = this.app._s.focus.project.userData.info.small;

            this.openInfo();
        });


        this.DOM.buttons.contact.addEventListener('mouseup', () => {
            if (this.app._s.menu.isOpen) {
                this.threeManager.resizeCanvas();
            }
        })

        this.DOM.buttons.volume.addEventListener("mousedown", function (event) {
            if (this.children[0].innerHTML === "muted") {
                this.children[0].innerHTML = "mute";
                this.app._s.focus.media.material.map.image.volume = "1";
            } else {
                this.children[0].innerHTML = "muted";
                this.app._s.focus.media.material.map.image.volume = "0";
            }
        });
    }

}

export default GUIManager