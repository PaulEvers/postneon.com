import RayCastManager from "../3D/RayCastManager.js"

export default class CursorManager {
    constructor({ app }) {
        this.app = app;

        this._ray = new RayCastManager();

        this.DOM = {
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
                timestamp: null,
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
        this.__.cursor.timestamp = performance.now();

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
            if (event.target.classList.contains("scroll-content")) {
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

    s_event = (type, data) => new CustomEvent("click", { detail: { type: type, ...data } });

    onCursorUp(event) {
        if (!this.__.cursor.isDragging) return;
        this.__.cursor.isDragging = false;

        let d_media = document.elementsFromPoint(this.__.cursor.now.x, this.__.cursor.now.y).find(v => v.className.includes('d_'));
        // console.log(document.elementsFromPoint(this.__.cursor.now.x, this.__.cursor.now.y));



        if (!d_media) {
            console.log(this.app.__.menu.isOpen);
            if (!this.app.__.menu.isOpen)
                this.app._three.tweenToMenu();
            return;
        }

        clearTimeout(this.__.hideTitle);

        if (!this.app.__.isMobile || this.app.__.menu.isOpen) {
            if (Math.abs(this.__.cursor.timestamp - performance.now()) < 200) {
                d_media.dispatchEvent(this.s_event('click'));
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
            } else if (Math.abs(this.__.cursor.timestamp - performance.now()) < 200) {
                d_media.dispatchEvent(this.s_event('click'));
            }
        }

        this.__.cursor.start = this.__.cursor.now;
    }

    getIntersects() {
        this.__.cursor.array = this.getCursorArray();
        if (!this.__.cursor.array) return;
        this.__.vector.fromArray(this.__.cursor.array);
        this.__.intersections = this._ray.getIntersects(this.app._three._3d.camera, this.__.vector, this.app._three._3d.collisions);
        if (this.__.intersections.length > 0) {
            return this.__.intersections[0].object;
        } else {
            return false;
        }
    }

    hoverMenu() {
        if (this.app._tween.__.isTweening || this.__.cursor.isDragging) return;

        this.__.intersection = this.getIntersects();

        if (this.__.intersection) {
            this.this.app._gui.setProjectTitle(this._s.intersection);
            return;
        }

        this.app._gui.hideProjectTitle()
    }

    hoverProject() {
        if (this.app.__.pause) return;
        if (this.app._tween.__.isTweening) return;
        console.log(document.elementsFromPoint(this.__.cursor.now.x, this.__.cursor.now.y));
        let d_media = document.elementsFromPoint(this.__.cursor.now.x, this.__.cursor.now.y).find(v => v.className.includes('d_'));
        if (d_media) {
            d_media.dispatchEvent(this.s_event('hover_project', { x: this.__.cursor.now.x, y: this.__.cursor.now.y }));
            return;
        }
        if (!this.app._gui.__.isHovering)
            this.app._gui.setCursorMode('cross');
        else
            this.app._gui.setCursorMode('pointer');
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
}