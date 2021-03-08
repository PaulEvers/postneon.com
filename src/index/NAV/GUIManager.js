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
    constructor({ app }) {
        this.app = app;

        this.__ = {
            cursorMode: new CursorModes(),
            topMenuMode: new TopMenuMode(),
            isHovering: false,
            cursor: {
                activated: false,
            },
            isMuted: false,
        }

        this.DOM = {
            cursor: document.querySelector('.cursor'),
            canvas: document.querySelector('#threejs'),
            UIContainer: document.querySelector(".UI-container"),
            buttons: {
                about: document.querySelector(".about-button"),
                contact: document.querySelector(".contact-button"),
                volume: document.querySelector(".volume-button"),
                back: document.querySelector(".back-button"),
                menu: document.querySelector(".menu-button"),
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
        this.DOM.cursor.style.transform = `translateX(${x}px) translateY(${y}px)`
        if (!this.__.cursor.activated) {
            this.__.cursor.activated = true;
            setTimeout(() => {
                this.DOM.cursor.classList.add('activated');
            }, 0);
        }
    }

    setCursorMode = (mode) => {
        this.__.cursorMode.set(mode);
    }
    setTopMenuMode = (mode) => {
        this.__.topMenuMode.set(mode);
    }
    setProjectTitle = (project_name) => {
        if (this.DOM.project.title.innerHTML != project_name) {
            this.DOM.project.title.innerHTML = project_name;
        }
        if (this.DOM.project.title.classList.contains('hidden'))
            this.DOM.project.title.classList.remove('hidden');
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

        this.DOM.project.length.innerHTML = project.__.projectLength;
        this.DOM.project.index.innerHTML = project.__.order + 1;
        this.DOM.project.title.innerHTML = project.__.name;
        this.DOM.project.title.classList.remove('hidden');
    }

    tweenCanvas = () => {
        console.log('TWEEEEEEEEEN');


        let tweener = this.app._tween.add(500);
        if (!tweener) return

        const max = {
            canvas: window.innerWidth < 600 ? 100 : 50,
            projecTitle: window.innerWidth < 600 ? 100 : 75
        }

        let infoOpen = this.app.__.infoOpen;

        let canvas = {
            now: infoOpen ? max.canvas : 0,
            next: infoOpen ? 0 : max.canvas
        }
        let projectTitle = {
            now: infoOpen ? max.projecTitle : 50,
            next: infoOpen ? 50 : max.projecTitle
        }

        tweener.addEventListener('update', ({ detail }) => {
            //console.log(detail);
            this.DOM.canvas.style.left = this.app._tween.lerp(canvas, detail) + "vw";
            this.DOM.canvas.children[0].style.transform = `translateX(-${this.app._tween.lerp(canvas, detail) / 2}%)`;

            this.DOM.project.title.style.left = this.app._tween.lerp(projectTitle, detail) + "%";
        })
        tweener.addEventListener('complete', ({ detail }) => {
            //console.log("COMPLETE!!!");
            this.app.__.infoOpen = !this.app.__.infoOpen;
            //console.log("INFO OPEN IS ", this.app.__.infoOpen);
        })
    }

    getMuted = () => {
        return this.__.isMuted;
    }
    setVideoUI = (bool) => {
        bool ? this.DOM.buttons.volume.classList.remove('hidden') : this.DOM.buttons.volume.classList.add('hidden');
    }

    showVolume = () => {
        this.DOM.buttons.volume.classList.remove('hidden');
    }

    hideVolume = () => {
        this.DOM.buttons.volume.classList.add('hidden');
    }

    closeInfo = e => {
        this.app.__.infoMode = false;
        document.querySelector('.scroll-container').classList.remove('hidden');
        this.tweenCanvas();
        this.setCursorMode('pointer');
        setTimeout(() => {
            if (this.app.__.menu.isOpen) {
                this.setTopMenuMode('menu')
            } else {
                this.setTopMenuMode('project')
            }
        }, 500)

        this.DOM.canvas.removeEventListener('mouseup', this.closeInfo);
        e.stopPropagation();
        e.preventDefault();
    }

    openInfo = () => {
        this.app.__.infoMode = true;
        this.setTopMenuMode('info');
        this.tweenCanvas();
        document.querySelector('.scroll-container').classList.add('hidden');
        this.DOM.canvas.addEventListener('mouseup', this.closeInfo);
        /* if (this.app.__.isMobile && this.app.__.focus.media && this.app.__.focus.media.userData.type === 'video') {
            this.app.__.focus.media.material.map.image.pause();
        } */
    }

    init = () => {
        this.DOM.buttons.back.addEventListener('mouseup', this.closeInfo)
        this.DOM.buttons.menu.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            //console.log('this?');
            this.app._three.tweenToMenu(false);
            this.setTopMenuMode('menu');
        })

        document.querySelectorAll('button').forEach(b => {
            b.addEventListener('mouseenter', () => {
                this.__.isHovering = true;
            })
            b.addEventListener('mouseout', () => {
                this.__.isHovering = false;
            })
        })

        this.DOM.buttons.about.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            this.DOM.about.classList.remove('hidden');
            this.DOM.info.container.classList.add('hidden');

            this.openInfo();
        });

        this.DOM.buttons.info.addEventListener('mouseup', (e) => {
            e.stopPropagation();

            this.DOM.info.container.classList.remove('hidden');
            this.DOM.about.classList.add('hidden');

            this.DOM.info.big.innerHTML = this.app.__.focus.__.info.big;
            this.DOM.info.small.innerHTML = this.app.__.focus.__.info.small;

            this.openInfo();
        });


        this.DOM.buttons.contact.addEventListener('mouseup', (e) => {
            e.stopPropagation();

            if (this.app.__.menu.isOpen) {
                this.app._three.resizeCanvas();
            }
        })

        this.DOM.buttons.volume.addEventListener("mousedown", e => {
            if (this.__.isMuted) {
                this.DOM.buttons.volume.innerHTML = "mute";
                this.app.__.focus.media.material.map.image.volume = "1";
                this.__.isMuted = false;
            } else {
                this.DOM.buttons.volume.innerHTML = "muted";
                this.app.__.focus.media.material.map.image.volume = "0";
                this.__.isMuted = true;
            }
        });
    }

}

export default GUIManager