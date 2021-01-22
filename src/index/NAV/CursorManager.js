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

        this.state = {
            vector: new THREE.Vector2(),
            intersects: [],
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
            }
        }

        this.init();
    }

    init() {
        if (!this.app.state.isMobile) {
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
        return [(this.state.cursor.now.x) / window.innerWidth, (this.state.cursor.now.y) / window.innerHeight];
    }

    onCursorDown(event) {
        if (this.app.state.info) return;
        if (!!this.state.focusBack) {
            clearTimeout(this.state.focusBack);
            this.state.focusBack = false;
        }
        this.state.cursor.isDragging = true;
        this.state.cursor.now = this.getCursorPosition(event);
        this.app.state.mouseDown = performance.now();

        if (this.app.state.isMobile)
            this.state.cursor.start = this.state.cursor.now;
    }

    onCursorMove = (event) => {
        if (!this.state.throttle.mousemove) return;

        this.state.throttle.mousemove = false;

        const cursorPosition = this.getCursorPosition(event);

        this.guiManager.setCursorPosition(cursorPosition.x, cursorPosition.y)
        this.guiManager.showCursor();

        if (!this.app.state.menu.isOpen) {

            this.hoverProject();
        } else {
            this.guiManager.setCursorMode('pointer')
        }




        if (this.state.cursor.isDragging && cursorPosition.x && this.app.state.menu.isOpen) {
            this.dragMenu(cursorPosition);
        }

        if (this.app.state.info) {
            if (event.target.id === 'scene') {
                this.DOM.buttons.back.classList.add('active');
                this.guiManager.setCursorMode('cross')
            } else {
                this.DOM.buttons.back.classList.remove('active');
                this.guiManager.setCursorMode('pointer')
            }
        }
        this.state.cursor.now = cursorPosition;

        setTimeout(() => this.state.throttle.mousemove = true, 1000 / 60);

    }

    onCursorUp(event) {
        if (!this.state.cursor.isDragging) return;
        this.state.cursor.isDragging = false;

        this.state.vector.fromArray(this.getCursorArray());

        clearTimeout(this.state.hideTitle);


        if (this.state.cursor.temp.x < window.innerWidth / 2) {
            this.state.cursor.direction = -1;
        } else {
            this.state.cursor.direction = 1;
        }

        if (!this.app.state.info) {
            if (!this.app.state.isMobile || this.app.state.menu.isOpen) {
                if (Math.abs(this.app.state.mouseDown - performance.now()) < 200) {
                    this.handleClick();
                }
            } else {
                if (this.app.state.orientation === 'landscape' &&
                    Math.abs(this.state.cursor.start.x - this.state.cursor.now.x) > 125) {
                    let direction = this.state.cursor.start.x > this.state.cursor.now.x ? -1 : 1;
                    this.scrollToNextProject(direction);

                } else if (this.app.state.orientation === 'portrait' &&
                    Math.abs(this.state.cursor.start.y - this.state.cursor.now.y) > 125) {
                    let direction = this.state.cursor.start.y > this.state.cursor.now.y ? -1 : 1;
                    this.scrollToNextProject(direction);
                    return
                } else if (Math.abs(this.app.state.mouseDown - performance.now()) < 200) {
                    this.handleClick();
                }
            }
        }
        this.state.cursor.start = this.state.cursor.now;
        this.app.state.mouseDown = false;
    }

    hoverMenu() {
        if (this.tweenManager.state.isTweening) return;

        const cursorArray = this.getCursorArray();
        if (!cursorArray) return;

        this.state.vector.fromArray(cursorArray);

        let intersects = this.rayCastManager.getIntersects(this.threeManager.camera, this.state.vector, this.app.state.objects);

        if (intersects.length > 0) {
            let intersectedMedia = intersects[0].object;
            let intersectedProject = intersectedMedia.parent;
            this.guiManager.setProjectTitle(intersectedProject);
        } else {
            this.guiManager.hideProjectTitle();
        }
    }

    hoverProject() {
        if (this.app.state.pause) return;
        if (this.tweenManager.state.isTweening) return;
        this.guiManager.showCursor();

        if (this.guiManager.state.isHovering) {
            this.guiManager.setCursorMode('pointer');
            return;
        }

        const cursorArray = this.getCursorArray();
        if (!cursorArray) return;
        this.state.vector.fromArray(cursorArray);

        const intersects = this.rayCastManager.getIntersects(this.threeManager.camera, this.state.vector, this.app.state.objects);

        if (intersects.length > 0) {
            let intersectedMedia = intersects[0].object;
            let intersectedProject = intersects[0].object.parent;
            this.DOM.projectTitle.innerHTML = intersectedProject.name;

            if (intersectedMedia.userData && !this.app.state.focus.media ||
                intersectedMedia.userData.src != this.app.state.focus.media.userData.src ||
                intersectedProject.userData.medias.length == 1) {
                this.guiManager.setCursorMode('pointer');
                return;
            }
            if (this.state.cursor.now.x > (window.innerWidth / 2)) {
                this.guiManager.setCursorMode('left');
            } else {
                this.guiManager.setCursorMode('right');

            }
            return
        }

        this.state.isHoverProject = false;
        this.guiManager.setCursorMode('cross');
        if (this.DOM.projectTitle.innerHTML != this.app.state.focus.project.name) {
            this.DOM.projectTitle.innerHTML = this.app.state.focus.project.name
        }
    }

    dragMenu(cursor) {
        // this.DOM.projectTitle.style.display = "none";
        this.state.hideTitle = setTimeout(() => {
            this.DOM.projectTitle.classList.add('hidden');
        }, 250);


        if (this.app.state.orientation === "landscape") {
            this.threeManager.canvas.style.cursor = "";
            const delta = this.state.cursor.now.x - cursor.x;
            this.threeManager.state.projects.rotation.y -= delta / 500;
        } else {
            this.threeManager.canvas.style.cursor = "";
            const delta = this.state.cursor.now.y - cursor.y;
            this.threeManager.state.projects.rotation.y += delta / 500;
        }

        this.state.cursor.isDragging = true;
    }

    handleClick() {
        const intersects = this.rayCastManager.getIntersects(this.threeManager.camera, this.state.vector, this.app.state.objects);
        let isNewProject = false;

        if (intersects.length > 0) {
            const media = intersects[0].object;
            const project = media.parent;
            console.log(media, project);
            isNewProject = !this.app.state.focus.project
                || project.name != this.app.state.focus.project.name;

            if (isNewProject) {
                this.threeManager.focusOn(project);
            } else {
                if (project.userData.medias.length > 1) {
                    console.log(project);
                    this.threeManager.mediaManager.changeMedia(project, this.state.cursor.direction);
                }
            }
            if (this.app.state.menu.isOpen) {
                this.app.state.menu.isOpen = false;
                this.guiManager.setTopMenuMode('project');
            }
            this.guiManager.setProjectUI(project);
            /* this.DOM.projectLength.innerHTML = media.parent.userData.projectLength;
            this.DOM.mediaIndex.innerHTML = media.parent.userData.order + 1; */
        } else {
            /* if (!!this.state.lastHover) {
                this.threeManager.focusOn(this.state.lastHover);
                // this.focusOn(this.state.lastHover);
                this.guiManager.setTopMenuMode('project');
            } else if (!this.app.state.menu.isOpen) {
                // back to menu */
            this.app.state.menu.isOpen = true;
            this.threeManager.tweenToMenu();
            this.guiManager.setCursorMode('cross');
            this.guiManager.setTopMenuMode('menu');
            // }
        }
        return isNewProject;
    }
}