import getIntersects from "./tools/getIntersects";
import changePicture from "./tools/changePicture";
import normalizeWheel from 'normalize-wheel'


class CursorManager {
    constructor({ app, threeManager }) {

        this.app = app;

        this.threeManager = threeManager;
        this.intersectionManager = this.threeManager.intersectionManager;
        this.mediaManager = this.threeManager.mediaManager;

        this.tweenManager = threeManager.tweenManager;

        this.DOM = {
            canvas: this.threeManager.renderer.domElement,
            projectTitle: document.querySelector(".project-title"),
            indexContainer: document.querySelector(".index-container"),
            mediaIndex: document.querySelector(".media-index"),
            projectLength: document.querySelector(".project-length"),
            UIContainer: document.querySelector(".UI-container"),
            cursor: {
                cross: document.querySelector(".cross"),
                pointer: document.querySelector(".pointer"),
                container: document.querySelector(".cursor"),
            },

            buttons: {
                about: document.querySelector(".about-button"),
                contact: document.querySelector(".contact-button"),
                volume: document.querySelector(".volume-button"),
                back: document.querySelectorAll(".back-button"),
                info: document.querySelectorAll(".info-button")
            }
        }

        this.init();
        this.state = {
            focusBack: false,
            cursor: {
                temp: { x: null, y: null },
                now: { x: null, y: null },
                down: {
                    value: { x: null, y: null },
                    timestamp: null
                },
                delta: { x: null, y: null },
                array: [],
                vector: new THREE.Vector2(),
                guiHover: false,
                isDragging: false,
                scroll
            },
            lastHover: null,
            trans: { about: null },
            click: {
                intersects: [],
                isNewProject: false
            },
            menu: {
                canHover: false,
            },
            intersects: [],
            intersectedMedia: null,
            groups: null,
            hideTitle: null

        }
        this.vectors = {
            down: new THREE.Vector2(),
            up: new THREE.Vector2(),
            doubleClick: new THREE.Vector2(),
            move: new THREE.Vector2()
        }
    }

    init() {
        if (!this.app.state.isMobile) {
            document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
            this.DOM.canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            window.addEventListener('mousemove', this.onMouseMove.bind(this), 250);
            this.DOM.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this), false);
            // this.DOM.canvas.addEventListener('mouseleave', this.hideTitle.bind(this), false);
            this.DOM.canvas.addEventListener("mouseout", () => {
                this.DOM.cursor.container.classList.add('hidden');
            })
        }

        this.DOM.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        // document.addEventListener('touchend', this.onTouchEnd.bind(this), false);

        window.addEventListener('touchmove', this.onMouseMove.bind(this), 250, true);
        document.addEventListener("mouseout", (e) => {
            if (e.clientY <= 0 || e.clientX <= 0 ||
                (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
                this.DOM.cursor.container.style.opacity = "0.01";
            }
        });

        window.addEventListener("wheel", this.onScroll.bind(this), 125);
        document.querySelectorAll('button').forEach(b => {
            b.addEventListener('mouseenter', () => {
                this.state.cursor.guiHover = true;
            })
            b.addEventListener('mouseout', () => {
                this.state.cursor.guiHover = false;
            })
        })
    }

    validateScroll(event) {
        if (this.app.state.about.isOpen)
            return false;
        const normalized = normalizeWheel(event);
        let realScroll = Math.abs(normalized.pixelY) > 25;
        return { success: realScroll, y: normalized.pixelY };
    }

    initButtons() {
        this.DOM.buttons.back.forEach(b => {
            b.addEventListener('mouseup', () => {
                this.focusOn(false);
            })
        })

        this.DOM.buttons.about.onmouseup = () => {
            openCloseAbout();
            this.threeManager.resizeCanvas();
        }
        this.DOM.buttons.contact.onmouseup = () => {
            if (this.app.state.menu.isOpen) {
                openCloseAbout("contact");
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

    scrollToNextProject(direction) {
        let index = this.threeManager.state.projects.children.indexOf(this.app.state.focus.project);
        index = (index + direction) % (this.threeManager.state.projects.children.length);
        index = index < 0 ? (this.threeManager.state.projects.children.length - 1) : index;
        this.focusOn(this.threeManager.state.projects.children[index].children[0], 1000);
        this.DOM.projectLength.innerHTML = this.app.state.focus.project.userData.projectLength;
        this.DOM.mediaIndex.innerHTML = this.app.state.focus.project.userData.order + 1;
        this.DOM.projectTitle.innerHTML = this.app.state.focus.project.name;
    }

    onScroll(e) {
        this.state.scroll = this.validateScroll(e);
        if (!this.state.scroll.success) return;

        if (this.state.scroll.y > 0) {
            this.state.scroll.direction = 1;
        } else {
            this.state.scroll.direction = -1;
        }

        if (!this.app.state.menu.isOpen) {
            if (!this.app.state.tween.isTweening) {
                this.scrollToNextProject(this.state.scroll.direction);
            }
        } else {
            this.app.state.menu.lerpTo += (this.state.scroll.y / 1250);
            this.app.state.cursor.isScrolling = true;
        }

    }
    hoverMenu() {
        if (this.DOM.cursor.container.classList.contains('hidden')) {
            this.DOM.cursor.container.classList.remove('hidden');
        }

        this.state.cursor.array = this.getCursorPosition();
        if (!this.state.cursor.array) return;
        this.state.cursor.vector.fromArray(this.state.cursor.array);
        this.state.intersects = this.intersectionManager.getIntersects(this.threeManager.camera, this.state.cursor.vector, this.app.state.objects);
        if (this.state.intersects.length > 0) {


            this.state.intersectedMedia = this.state.intersects[0].object;
            this.state.intersectedProject = this.state.intersects[0].object.parent;

            this.DOM.projectTitle.classList.remove('hidden');

            if (this.DOM.projectTitle.innerHTML != this.state.intersectedProject.name) {
                this.DOM.projectTitle.innerHTML = this.state.intersectedProject.name
            }
        } else {
            if (!this.DOM.projectTitle.classList.contains('hidden')) {
                this.DOM.projectTitle.classList.add('hidden')
            }
        }
    }

    hoverProject() {
        if (this.DOM.cursor.container.classList.contains('hidden')) {
            this.DOM.cursor.container.classList.remove('hidden');
        }

        if (this.state.cursor.guiHover) {
            this.DOM.cursor.container.classList.remove('cross-on');
            this.DOM.cursor.container.classList.remove('pointer-left');
            this.DOM.cursor.container.classList.remove('pointer-right');
            return;
        }

        this.state.cursor.array = this.getCursorPosition();
        if (!this.state.cursor.array) return;
        this.state.cursor.vector.fromArray(this.state.cursor.array);
        this.state.intersects = this.intersectionManager.getIntersects(this.threeManager.camera, this.state.cursor.vector, this.app.state.objects);
        if (this.state.intersects.length > 0) {
            this.DOM.cursor.container.classList.remove('cross-on');
            this.state.intersectedMedia = this.state.intersects[0].object;
            this.state.intersectedProject = this.state.intersects[0].object.parent;
            if (!this.app.state.cursor.isTweening) {
                if (this.state.intersectedMedia.userData &&
                    this.state.intersectedMedia.userData.src != this.app.state.focus.media.userData.src) {


                    if (this.state.intersectedProject.name === this.app.state.focus.media.parent.name) return;
                    this.DOM.projectTitle.innerHTML = this.state.intersectedProject.name;
                } else {

                    if (this.state.intersectedProject.userData.medias.length == 1) {
                        if (this.DOM.cursor.container.classList.contains('pointer-right')) {
                            this.DOM.cursor.container.classList.remove('pointer-right')
                        }
                        if (this.DOM.cursor.container.classList.contains('pointer-left')) {
                            this.DOM.cursor.container.classList.remove('pointer-left')
                        }
                        return;

                    }
                    if (this.state.cursor.now.x > (window.innerWidth / 2)) {
                        this.DOM.cursor.container.classList.add('pointer-left');
                        this.DOM.cursor.container.classList.remove('pointer-right');
                    } else {
                        this.DOM.cursor.container.classList.remove('pointer-left');
                        this.DOM.cursor.container.classList.add('pointer-right');
                    }

                    if (this.state.intersectedProject.name === this.app.state.focus.media.parent.name) return;
                    this.DOM.projectTitle.innerHTML = this.state.intersectedProject.name;
                }
            }

        } else {
            this.state.isHoverProject = false;

            this.DOM.cursor.container.classList.remove('pointer-left');
            this.DOM.cursor.container.classList.remove('pointer-right');
            this.DOM.cursor.container.classList.add('cross-on');

            if (this.DOM.projectTitle.innerHTML != this.app.state.focus.project.name) {
                this.DOM.projectTitle.innerHTML = this.app.state.focus.project.name
            }


        }
    }

    onMouseDown(event) {
        if (!!this.state.focusBack) {
            clearTimeout(this.state.focusBack);
            this.state.focusBack = false;
        }
        this.state.cursor.isDragging = true;

        this.vectors.down.fromArray(this.getCursorPosition());
        this.app.state.mouseDown = performance.now();

        if (this.app.state.about.isOpen) {
            openCloseAbout();
        }
    }
    onMouseMove(event) {
        // let cursor = {};

        if (!!event.touches) {
            this.state.cursor.temp.x = event.touches[0].clientX;
            this.state.cursor.temp.y = event.touches[0].clientY;
        } else {
            this.state.cursor.temp.x = event.clientX;
            this.state.cursor.temp.y = event.clientY;
        }



        this.DOM.cursor.container.style.left = this.state.cursor.temp.x;
        this.DOM.cursor.container.style.top = this.state.cursor.temp.y;


        if (this.DOM.cursor.container.style.opacity = "0") {
            this.DOM.cursor.container.style.opacity = "1";
        }

        if (this.app.state.about.isOpen) {
            this.DOM.cursor.container.classList.add('cross-one');
        } else {
            if (!this.app.state.menu.isOpen) {
                this.hoverProject();
            } else {
                this.DOM.cursor.container.classList.remove('cross-one');
            }
        }


        if (this.state.cursor.isDragging && this.state.cursor.temp.x && this.app.state.menu.isOpen) {
            this.dragMenu(this.state.cursor.temp);
        }


        this.state.cursor.now.x = this.state.cursor.temp.x;
        this.state.cursor.now.y = this.state.cursor.temp.y;
        this.app.state.cursor.x = this.state.cursor.temp.x;
        this.app.state.cursor.y = this.state.cursor.temp.y;


        if (this.app.state.about.isOpen) {
            this.DOM.buttons.about.children[0].style.background = "white";
            this.DOM.buttons.about.children[0].style.color = "black";
        }
    }

    onMouseUp(event) {
        this.state.cursor.isDragging = false;

        this.vectors.up.fromArray(this.getCursorPosition());


        clearTimeout(this.state.hideTitle);



        if (this.state.cursor.temp.x < window.innerWidth / 2) {
            this.state.cursor.direction = -1;
        } else {
            this.state.cursor.direction = 1;
        }

        if (!this.app.state.about.isOpen && !this.state.trans.about) {
            if (Math.abs(this.app.state.mouseDown - performance.now()) < 200) {
                this.handleClick();
            }
        }

        this.app.state.mouseDown = false;
    }
    onTouchStart(event) {
        // this.state.cursor.now.x = false;

        this.state.cursor.down.value = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        }
        this.state.cursor.down.timestamp = performance.now();

    }
    /*     onTouchEnd(event) {
            g.lastTouchEnd = performance.now();
            let touch = event.changedTouches[0];
            let array = getCursorPosition(this.DOM.canvas, touch.clientX, touch.clientY);
            this.vectors.up.fromArray(array);
            let now = performance.now();
            let delta;
            if (this.app.state.orientation === "portrait") {
                delta = this.state.cursor.old.y - touch.clientY;
            } else {
                delta = touch.clientX - this.state.cursor.old.x;
            }
            if (Math.abs(this.app.state.mouseDown - now) < 200 && (Math.abs(delta) < 75)) {
                if (!this.app.state.menu.isOpen) {
                    changePicture(this.app.state.focus.media);
                } else {
                    this.handleClick();
                }
            } else {
                if (!this.app.state.menu.isOpen) {
                    if (Math.abs(delta) > 75) {
                        let count = 0;
                        for (let project of this.threeManager.state.projects.children) {
                            if (project.name === this.app.state.focus.project.name) {
                                break
                            }
                            count++;
                        }
                        let index = delta < 0 ? (count + 1) % this.threeManager.state.projects.children.length :
                            (count - 1);
                        index = index < 0 ? this.threeManager.state.projects.children.length - 1 :
                            index;
    
                        this.app.state.focus.project = this.threeManager.state.projects.children[index];
                        this.app.state.focus.media = this.app.state.focus.media.children[0];
    
                        this.tweenManager.tween({
                            project: this.app.state.focus.project,
                            media: this.app.state.focus.media,
                            delta: 675
                        });
    
                        this.DOM.projectTitle.innerHTML = newProject.name;
                    }
                }
            }
            this.app.state.mouseDown = false;
            document.removeEventListener('touchend', onTouchEnd, false);
        } */
    onMouseEnd(event) {
        // g.lastTouchEnd = performance.now();
        // let touch = event.changedTouches[0];

        if (!!event.touches) {
            this.state.cursor.temp.x = event.touches[0].clientX;
            this.state.cursor.temp.y = event.touches[0].clientY;
        } else {
            this.state.cursor.temp.x = event.clientX;
            this.state.cursor.temp.y = event.clientY;
        }

        this.vectors.up.fromArray(getCursorPosition(this.DOM.canvas, touch.clientX, touch.clientY));
        let now = performance.now();
        let delta;
        if (this.app.state.orientation === "portrait") {
            delta = this.state.cursor.old.y - this.state.cursor.temp.y;
        } else {
            delta = this.state.cursor.temp.x - this.state.cursor.old.x;
        }
        if (Math.abs(this.app.state.mouseDown - now) < 200 && (Math.abs(delta) < 75)) {
            if (!this.app.state.menu.isOpen) {
                changePicture(this.app.state.focus.media).then(function (object) { });
            } else {
                this.handleClick();
            }
        } else {
            if (!this.app.state.menu.isOpen) {
                if (Math.abs(delta) > 75) {
                    console.log("THIS!!");
                    this.DOM.projectTitle.classList.remove('hidden');
                    let projects = this.threeManager.state.projects.children;

                    let index = projects.indexOf(p => p.name === this.app.state.focus.project.name);
                    index = delta < 0 ? index + 1 : index - 1;
                    index = index % projects.length;
                    if (index < 0) index = projects.length - 1;

                    let newProject = projects[index];
                    this.tweenManager.tween(newProject);
                    this.app.state.focus.project = newProject;
                    this.app.state.focus.media = newProject.children[0];

                    this.DOM.projectTitle.innerHTML = newProject.name;
                }
            }
        }
        this.app.state.mouseDown = false;
        // document.removeEventListener('touchend', onMouseEnd, false);
    }
    onDoubleClick(event) {
        this.vectors.doubleClick.fromArray(this.getCursorPosition());
        let intersects = getIntersects(this.threeManager.camera, this.vectors.doubleClick, this.app.state.objects);
        if (intersects.length > 0) {
            let intersect = intersects[0];
        }
    }
    updateCursorPosition(event) {
        this.state.cursor.now.x = event.clientX;
        this.app.state.cursor.y = event.clientY;
    }
    getCursorPosition() {
        let bounds = this.threeManager.canvas.getBoundingClientRect();
        return [(this.app.state.cursor.x - bounds.left) / this.threeManager.canvas.offsetWidth, (this.app.state.cursor.y - bounds.top) / this.threeManager.canvas.offsetHeight];
    }


    dragMenu(cursor) {
        // this.DOM.projectTitle.style.display = "none";
        this.state.hideTitle = setTimeout(() => {
            this.DOM.projectTitle.classList.add('hidden');
        }, 250);


        if (this.app.state.orientation === "landscape") {
            this.threeManager.canvas.style.cursor = "";
            this.state.cursor.delta.x = this.state.cursor.now.x - cursor.x;
            this.threeManager.state.projects.rotation.y -= this.state.cursor.delta.x / 500;
        } else {

            // this.DOM.projectTitle.style.display = "none";
            this.threeManager.canvas.style.cursor = "";
            this.state.cursor.delta.y = this.app.state.cursor.y - cursor.y;
            this.threeManager.state.projects.rotation.y += this.state.cursor.delta.y / 500;
        }

        this.state.cursor.isDragging = true;

    }

    /*     hideTitle() {
            this.DOM.buttons.contact.style.filter = "";
    
    
            if (this.app.state.menu.isOpen) {
                this.state.lastHover = false;
                this.DOM.projectTitle.style.display = "none";
                this.threeManager.canvas.style.cursor = "";
            }
            if (this.app.state.about.isOpen) {
                document.querySelector("#aboutButton").children[0].style.background = "";
                document.querySelector("#aboutButton").children[0].style.color = "";
            }
        } */
    async checkPNG(object) {
        if (object.userData.type === "image" && object.material.map.image.src.indexOf("png") != -1) {
            let texData;
            if (!this.state.lastClick || this.state.lastClick != object.name) {
                let img = object.material.map.image;
                g.uvMap.canvas.width = img.width;
                g.uvMap.canvas.height = img.height;
                g.uvMap.drawImage(img, 0, 0);
                this.state.lastClick = object.name
                texData = g.uvMap.getImageData(0, 0, img.width, img.height);
            }
            let u = object.uv.x;
            let v = object.uv.y;
            var tx = Math.min(emod(u, 1) * texData.width | 0, texData.width - 1);
            var ty = Math.min(emod(v, 1) * texData.height | 0, texData.height - 1);
            ty = texData.height - ty;
            var offset = (ty * texData.width + tx) * 4;
            let color = {};

            color.r = texData.data[offset + 0];
            color.g = texData.data[offset + 1];
            color.b = texData.data[offset + 2];
            color.a = texData.data[offset + 3];

            if (color.a == 0) {
                if (intersects.length > (index - 1)) {
                    // checkPNG((index + 1));
                    return (object);
                } else {
                    return (false);
                }
            } else {
                return (object);
            }
        } else {
            return (object);
        }
    }

    projectMode() {
        this.DOM.UIContainer.classList.add('project-mode');
        this.DOM.UIContainer.classList.remove('menu-mode');
        this.DOM.UIContainer.classList.remove('info-mode');

        this.DOM.mediaIndex.innerHTML = this.app.state.focus.project.userData.order + 1;
        this.DOM.projectLength.innerHTML = this.app.state.focus.project.userData.projectLength;

        // video part"v
        if (this.app.state.focus.media.userData.type === "video") {
            if (this.app.state.focus.media.material.map.image) {
                this.app.state.focus.media.material.map.image.play();
                this.app.state.textures.update[this.app.state.focus.media.name] = this.app.state.focus.media.material.map;
            }
        }
    }

    loadVideos(project) {
        // console.log(this.app.state.textures);
        Object.values(this.app.state.textures.videos).map((v) => {
            v.dispose();
            return null;
        })
        this.app.state.textures.videos = {};
        project.userData.medias.forEach(m => {
            if (m.type !== 'video') return;
            let url = `projects/${project.userData.directory}/${this.mediaManager.capitalize(m.type)}/${this.app.state.opt}/${m.src}`;
            this.mediaManager.createVideoTexture(url);
            console.log(this.app.state.textures.videos);
        })
    }

    focusOn(media, duration = false) {
        let project = media ? media.parent : false;
        ////console.log(project);
        this.tweenManager.tweenCamera(project, duration);
        this.app.state.focus.project = project;
        this.app.state.focus.media = media;
        this.DOM.projectTitle.classList.remove('hidden');

        // this.loadVideos(project);
    }

    projectOpen() {

    }

    handleClick() {
        this.state.click.intersects = this.intersectionManager.getIntersects(this.threeManager.camera, this.vectors.up, this.app.state.objects);


        if (this.state.click.intersects.length > 0) {
            let media = this.state.click.intersects[0].object;
            this.state.click.isNewProject = !this.app.state.focus.project
                || media.parent.name != this.app.state.focus.project.name;

            if (this.state.click.isNewProject) {
                this.focusOn(media);
            } else {
                if (media.parent.userData.medias.length > 1) {
                    this.mediaManager.changeMedia(this.app.state.focus.project, this.state.cursor.direction);
                }
            }
            if (this.app.state.menu.isOpen) {
                this.app.state.menu.isOpen = false;
                this.DOM.UIContainer.classList.add('project-mode');
                this.DOM.UIContainer.classList.remove('menu-mode');
                this.DOM.UIContainer.classList.remove('info-mode');
            }

            this.DOM.projectLength.innerHTML = media.parent.userData.projectLength;
            this.DOM.mediaIndex.innerHTML = media.parent.userData.order + 1;

        } else {
            if (!!this.state.lastHover) {
                this.focusOn(this.state.lastHover);
            } else if (!this.app.state.menu.isOpen) {
                // back to menu
                this.app.state.menu.isOpen = true;
                this.DOM.cursor.container.classList.remove('cross-on');

                this.DOM.UIContainer.classList.add('menu-mode');
                this.DOM.UIContainer.classList.remove('project-mode');
                this.DOM.UIContainer.classList.remove('info-mode');


                this.focusOn(false);
            }
        }

        return this.state.click.isNewProject;
    }

    update(appState) {
        if (!appState.about.isOpen &&
            !appState.tween.isTweening &&
            appState.menu.isOpen &&
            !appState.guiHover &&
            appState.cursor.x &&
            appState.cursor.y &&
            !appState.mouseDown
        ) { this.hoverMenu() };
    }
}
export default CursorManager