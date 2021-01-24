import RayCastManager from "../3D/RayCastManager"




export default class CursorManager {
    constructor({ app, guiManager }) {
        this.app = app;
        this.threeManager = app.threeManager;
        this.tweenManager = app.tweenManager;
        this.guiManager = guiManager;

        this.rayCastManager = new RayCastManager();

        this.DOM = {
            canvas: this.threeManager.renderer.domElement,
            projectTitle: document.querySelector(".project-title"),
            buttons: {
                back: document.querySelector(".back-button"),
            }
        }

        this._s = {
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
        if (!this.app._s.isMobile) {
            window.addEventListener('mousemove', this.onCursorMove.bind(this), false);
            window.addEventListener('mousedown', this.onCursorDown.bind(this), false);
            window.addEventListener('mouseup', this.onCursorUp.bind(this), false);
            window.addEventListener("mouseout", () => {
                this.guiManager.hideCursor()
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
        return [(this._s.cursor.now.x) / window.innerWidth, (this._s.cursor.now.y) / window.innerHeight];
    }

    onCursorDown(event) {
        if (this.app._s.info) return;
        if (!!this._s.focusBack) {
            clearTimeout(this._s.focusBack);
            this._s.focusBack = false;
        }
        this._s.cursor.isDragging = true;
        this._s.cursor.now = this.getCursorPosition(event);
        this.app._s.mouseDown = performance.now();

        if (this.app._s.isMobile)
            this._s.cursor.start = this._s.cursor.now;
    }

    onCursorMove = (event) => {
        if (!this._s.throttle.mousemove) return;

        this._s.throttle.mousemove = false;

        this._s.cursor.temp = this.getCursorPosition(event);

        this.guiManager.setCursorPosition(this._s.cursor.temp.x, this._s.cursor.temp.y)
        this.guiManager.showCursor();

        if (!this.app._s.menu.isOpen) {

            this.hoverProject();
        } else {
            this.guiManager.setCursorMode('pointer')
        }

        if (this._s.cursor.isDragging && this._s.cursor.temp.x && this.app._s.menu.isOpen) {
            this.dragMenu(this._s.cursor.temp);
        }

        if (this.app._s.info) {
            if (event.target.id === 'scene') {
                this.DOM.buttons.back.classList.add('active');
                this.guiManager.setCursorMode('cross')
            } else {
                this.DOM.buttons.back.classList.remove('active');
                this.guiManager.setCursorMode('pointer')
            }
        }
        this._s.cursor.now = this._s.cursor.temp;

        setTimeout(() => this._s.throttle.mousemove = true, 1000 / 60);
    }

    onCursorUp(event) {
        if (!this._s.cursor.isDragging) return;
        this._s.cursor.isDragging = false;

        this._s.vector.fromArray(this.getCursorArray());

        clearTimeout(this._s.hideTitle);


        if (this._s.cursor.temp.x < window.innerWidth / 2) {
            this._s.cursor.direction = -1;
        } else {
            this._s.cursor.direction = 1;
        }

        if (!this.app._s.info) {
            if (!this.app._s.isMobile || this.app._s.menu.isOpen) {
                if (Math.abs(this.app._s.mouseDown - performance.now()) < 200) {
                    this.handleClick();
                }
            } else {
                if (this.app._s.orientation === 'landscape' &&
                    Math.abs(this._s.cursor.start.x - this._s.cursor.now.x) > 125) {
                    let direction = this._s.cursor.start.x > this._s.cursor.now.x ? -1 : 1;
                    this.scrollToNextProject(direction);

                } else if (this.app._s.orientation === 'portrait' &&
                    Math.abs(this._s.cursor.start.y - this._s.cursor.now.y) > 125) {
                    let direction = this._s.cursor.start.y > this._s.cursor.now.y ? -1 : 1;
                    this.scrollToNextProject(direction);
                    return
                } else if (Math.abs(this.app._s.mouseDown - performance.now()) < 200) {
                    this.handleClick();
                }
            }
        }
        this._s.cursor.start = this._s.cursor.now;
        this.app._s.mouseDown = false;
    }

    hoverMenu() {
        if (this.tweenManager._s.isTweening) return;

        this._s.cursor.array = this.getCursorArray();
        if (!this._s.cursor.array) return;

        this._s.vector.fromArray(this._s.cursor.array);

        this._s.intersections = this.rayCastManager.getIntersects(this.threeManager.camera, this._s.vector, this.app._s.objects);

        if (this._s.intersections.length > 0) {
            this._s.intersected.media = this._s.intersections[0].object;
            this._s.intersected.project = this._s.intersected.media.parent;
            this.guiManager.setProjectTitle(this._s.intersected.project);
        } else {
            this.guiManager.hideProjectTitle();
        }
    }

    hoverProject() {
        if (this.app._s.pause) return;
        if (this.tweenManager._s.isTweening) return;
        this.guiManager.showCursor();

        if (this.guiManager._s.isHovering) {
            this.guiManager.setCursorMode('pointer');
            return;
        }

        const cursorArray = this.getCursorArray();
        if (!cursorArray) return;
        this._s.vector.fromArray(cursorArray);

        const intersects = this.rayCastManager.getIntersects(this.threeManager.camera, this._s.vector, this.app._s.objects);

        if (intersects.length > 0) {
            let intersectedMedia = intersects[0].object;
            let intersectedProject = intersects[0].object.parent;
            this.DOM.projectTitle.innerHTML = intersectedProject.name;

            if (intersectedMedia.userData && !this.app._s.focus.media ||
                intersectedMedia.userData.src != this.app._s.focus.media.userData.src ||
                intersectedProject.userData.medias.length == 1) {
                this.guiManager.setCursorMode('pointer');
                return;
            }
            if (this._s.cursor.now.x > (window.innerWidth / 2)) {
                this.guiManager.setCursorMode('left');
            } else {
                this.guiManager.setCursorMode('right');

            }
            return
        }

        this._s.isHoverProject = false;
        this.guiManager.setCursorMode('cross');
        if (this.DOM.projectTitle.innerHTML != this.app._s.focus.project.name) {
            this.DOM.projectTitle.innerHTML = this.app._s.focus.project.name
        }
    }

    dragMenu(cursor) {
        this._s.hideTitle = setTimeout(() => {
            this.DOM.projectTitle.classList.add('hidden');
        }, 250);

        let delta;

        if (this.app._s.orientation === "landscape") {
            delta = this._s.cursor.now.x - cursor.x;
            this.app._s.menu.lerpTo += delta / -5000;

        } else {
            delta = this._s.cursor.now.y - cursor.y;
            this.threeManager._s.projects.rotation.y += delta / 500;
        }
        this.app._s.menu.direction = delta < 0 ? 1 : -1;

        this._s.cursor.isDragging = true;
    }

    handleClick() {
        const intersects = this.rayCastManager.getIntersects(this.threeManager.camera, this._s.vector, this.app._s.objects);
        let isNewProject = false;

        if (intersects.length > 0) {
            const media = intersects[0].object;
            const project = media.parent;
            console.log(media, project);
            isNewProject = !this.app._s.focus.project
                || project.name != this.app._s.focus.project.name;

            if (isNewProject) {
                this.threeManager.focusOn(project);
            } else {
                if (project.userData.medias.length > 1) {
                    console.log(project);
                    this.threeManager.mediaManager.changeMedia(project, this._s.cursor.direction);
                }
            }
            if (this.app._s.menu.isOpen) {
                this.app._s.menu.isOpen = false;
                this.guiManager.setTopMenuMode('project');
            }
            this.guiManager.setProjectUI(project);
            /* this.DOM.projectLength.innerHTML = media.parent.userData.projectLength;
            this.DOM.mediaIndex.innerHTML = media.parent.userData.order + 1; */
        } else {
            /* if (!!this._s.lastHover) {
                this.threeManager.focusOn(this._s.lastHover);
                // this.focusOn(this._s.lastHover);
                this.guiManager.setTopMenuMode('project');
            } else if (!this.app._s.menu.isOpen) {
                // back to menu */
            this.app._s.menu.isOpen = true;
            this.threeManager.tweenToMenu();
            this.guiManager.setCursorMode('cross');
            this.guiManager.setTopMenuMode('menu');
            // }
        }
        return isNewProject;
    }
}