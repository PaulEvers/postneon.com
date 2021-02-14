import RayCastManager from "../3D/RayCastManager"




export default class CursorManager {
    constructor({ app }) {
        this.app = app;

        this._raycast = new RayCastManager();

        this.DOM = {
            canvas: this.app._three.renderer.domElement,
            projectTitle: document.querySelector(".project-title"),
            buttons: {
                back: document.querySelector(".back-button"),
            },
            scroll: document.querySelector(".scroll-container")
        }

        this.__ = {
            vector: new THREE.Vector2(),
            intersections: [],
            intersected: {
                media: null,
                project: null
            },
            hideTitle: null,
            throttle: {
                mousemove: true,
            },
            cursor: {
                temp: { x: null, y: null },
                now: { x: null, y: null },
                down: {
                    value: { x: null, y: null },
                    timestamp: null
                },
                delta: { x: null, y: null },
                array: [],
                isDragging: false,
                scroll: {
                    isHot: false,
                    isCold: false
                }
            },
            menu: {
                delta: 0
            }

        }

        this.init();
    }

    init() {
        if (!this.app.__.isMobile) {
            window.addEventListener('mousemove', this.onCursorMove.bind(this), false);
            this.DOM.scroll.addEventListener('mousedown', this.onCursorDown.bind(this), false);
            this.DOM.scroll.addEventListener('mouseup', this.onCursorUp.bind(this), false);
            window.addEventListener("mouseout", () => {
                this.app._gui.hideCursor()
            })
        } else {
            window.addEventListener('touchstart', this.onCursorDown.bind(this), false);
            window.addEventListener('touchmove', this.onCursorMove.bind(this), false);
            window.addEventListener('touchend', this.onCursorUp.bind(this), false);
        }

    }

    getCursorPosition(event) {
        if (!!event.touches) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        } else {
            return { x: event.clientX, y: event.clientY };
        }
    }

    getCursorArray() {
        return [(this.__.cursor.now.x) / window.innerWidth, (this.__.cursor.now.y) / window.innerHeight];
    }

    onCursorDown(event) {
        if (this.app.__.info) return;
        if (!!this.__.focusBack) {
            clearTimeout(this.__.focusBack);
            this.__.focusBack = false;
        }
        this.__.cursor.isDragging = true;
        this.__.cursor.now = this.getCursorPosition(event);
        document.elementsFromPoint(this.__.cursor.now.x, this.__.cursor.now.y)[2].click({ 'detail': 'start' });
        console.log(document.elementsFromPoint(this.__.cursor.now.x, this.__.cursor.now.y));
        this.app.__.mouseDown = performance.now();

        if (this.app.__.isMobile)
            this.__.cursor.start = this.__.cursor.now;
    }

    onCursorMove = (event) => {
        this.app.__.pause = false;
        if (!this.__.throttle.mousemove) return;

        this.__.throttle.mousemove = false;

        this.__.cursor.temp = this.getCursorPosition(event);

        this.app._gui.setCursorPosition(this.__.cursor.temp.x, this.__.cursor.temp.y)
        this.app._gui.showCursor();

        if (!this.app.__.menu.isOpen) {
            this.hoverProject();
        } else {
            this.app._gui.setCursorMode('pointer')
        }

        if (this.__.cursor.isDragging && this.__.cursor.temp.x && this.app.__.menu.isOpen) {
            this.dragMenu(this.__.cursor.temp);
        }

        if (this.app.__.infoMode) {
            // console.log(event.target);
            if (event.target.classList.contains("scroll-content")) {
                console.log('ok');
                this.DOM.buttons.back.classList.add('active');
                this.app._gui.setCursorMode('cross')
            } else {
                this.DOM.buttons.back.classList.remove('active');
                this.app._gui.setCursorMode('pointer')
            }
        }
        this.__.cursor.now = this.__.cursor.temp;

        setTimeout(() => this.__.throttle.mousemove = true, 1000 / 60);
    }

    onCursorUp(event) {
        if (!this.__.cursor.isDragging) return;
        this.__.cursor.isDragging = false;

        this.__.vector.fromArray(this.getCursorArray());

        clearTimeout(this.__.hideTitle);


        if (this.__.cursor.temp.x < window.innerWidth / 2) {
            this.__.cursor.direction = -1;
        } else {
            this.__.cursor.direction = 1;
        }

        if (!this.app.__.infoMode) {
            if (!this.app.__.isMobile || this.app.__.menu.isOpen) {
                if (Math.abs(this.app.__.mouseDown - performance.now()) < 200) {
                    this.handleClick();
                }
            } else {
                if (this.app.__.orientation === 'landscape' &&
                    Math.abs(this.__.cursor.start.x - this.__.cursor.now.x) > 125) {
                    let direction = this.__.cursor.start.x > this.__.cursor.now.x ? -1 : 1;
                    this.scrollToNextProject(direction);

                } else if (this.app.__.orientation === 'portrait' &&
                    Math.abs(this.__.cursor.start.y - this.__.cursor.now.y) > 125) {
                    let direction = this.__.cursor.start.y > this.__.cursor.now.y ? -1 : 1;
                    this.scrollToNextProject(direction);
                    return
                } else if (Math.abs(this.app.__.mouseDown - performance.now()) < 200) {
                    this.handleClick();
                }
            }
        }
        this.__.cursor.start = this.__.cursor.now;
        this.app.__.mouseDown = false;
    }

    hoverMenu() {
        if (this.app._tween.__.isTweening) return;

        this.__.cursor.array = this.getCursorArray();
        if (!this.__.cursor.array) return;

        this.__.vector.fromArray(this.__.cursor.array);

        this.__.intersections = this._raycast.getIntersects(this.app._three.camera, this.__.vector, this.app.__.objects);

        if (this.__.intersections.length > 0) {
            this.__.intersected.media = this.__.intersections[0].object;
            this.__.intersected.project = this.__.intersected.media.parent;
            this.app._gui.setProjectTitle(this.__.intersected.project);
        } else {
            this.app._gui.hideProjectTitle();
        }
    }

    hoverProject() {
        if (this.app.__.pause) return;
        if (this.app._tween.__.isTweening) return;
        this.app._gui.showCursor();

        if (this.app._gui.__.isHovering) {
            this.app._gui.setCursorMode('pointer');
            return;
        }

        const cursorArray = this.getCursorArray();
        if (!cursorArray) return;
        this.__.vector.fromArray(cursorArray);

        const intersects = this._raycast.getIntersects(this.app._three.camera, this.__.vector, this.app.__.objects);

        if (intersects.length > 0) {
            let intersectedMedia = intersects[0].object;
            let intersectedProject = intersects[0].object.parent;
            this.DOM.projectTitle.innerHTML = intersectedProject.name;

            if (intersectedMedia.userData && !this.app.__.focus.media ||
                intersectedMedia.userData.src != this.app.__.focus.media.userData.src ||
                intersectedProject.userData.medias.length == 1) {
                this.app._gui.setCursorMode('pointer');
                return;
            }
            if (this.__.cursor.now.x > (window.innerWidth / 2)) {
                this.app._gui.setCursorMode('left');
            } else {
                this.app._gui.setCursorMode('right');

            }
            return
        }

        this.__.isHoverProject = false;
        this.app._gui.setCursorMode('cross');
        if (this.DOM.projectTitle.innerHTML != this.app.__.focus.project.name) {
            this.DOM.projectTitle.innerHTML = this.app.__.focus.project.name
        }
    }

    dragMenu(cursor) {
        this.__.hideTitle = setTimeout(() => {
            this.DOM.projectTitle.classList.add('hidden');
        }, 250);

        let delta;

        if (this.app.__.orientation === "landscape") {
            delta = this.__.cursor.now.x - cursor.x;
            this.app.__.menu.lerpTo += delta / -5000;

        } else {
            delta = this.__.cursor.now.y - cursor.y;
            this.app._three.__.projects.rotation.y += delta / 500;
        }
        this.app.__.menu.direction = delta < 0 ? 1 : -1;

        this.__.cursor.isDragging = true;
    }

    handleClick() {
        const intersects = this._raycast.getIntersects(this.app._three.camera, this.__.vector, this.app.__.objects);
        let isNewProject = false;

        if (intersects.length > 0) {
            const media = intersects[0].object;
            const project = media.parent;
            isNewProject = !this.app.__.focus.project
                || project.name != this.app.__.focus.project.name;

            if (isNewProject) {
                this.app._three.focusOn(project);
            } else {
                if (project.userData.medias.length > 1) {

                    this.app._three._media.changeMedia(project, this.__.cursor.direction);
                }
            }
            if (this.app.__.menu.isOpen) {
                this.app.__.menu.isOpen = false;
                this.app._gui.setTopMenuMode('project');
            }
            this.app._gui.setProjectUI(project);

        } else {
            this.app.__.menu.isOpen = true;
            this.app._three.tweenToMenu();
            this.app._gui.setCursorMode('cross');
            this.app._gui.setTopMenuMode('menu');
        }
        return isNewProject;
    }
}