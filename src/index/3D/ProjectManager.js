
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from "three"


export default class Project {
    constructor({ app, data }) {
        this.app = app;
        console.log(data);
        this.__ = {
            projectLength: data.medias.length,
            order: 0,
            name: data.title,
            directory: data.directory,
            info: {
                big: data.info.big ? data.info.big.replace(/\n/g, "<br>") : "",
                small: data.info.small ? data.info.small.replace(/\n/g, "<br>") : "",
            },
            medias: data.medias,
            index: data.index
        }
        this.media = null;
        this.collision = null;
        this.project = null;

        this.init(data.medias[0])
    }
    capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1) };
    getUrl = (type, src) => `projects/${this.__.directory}/${this.capitalize(type)}/${this.app.__.opt}/${src}`;
    isPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
    getMediaDomFromSrc = (src) => [...this.media.element.children].find(v => v.src.includes(src))

    init = (media_data) => {

        let media_dom = this.createMedia(media_data);

        let d_container = document.createElement('div');
        d_container.className = 'd_container';
        d_container.appendChild(media_dom);

        this.media = new CSS3DObject(d_container);

        this.collision = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        );
        this.collision.scale.set(1000, 1000, 1);
        this.collision.userData.project = this;

        this.media.add(this.collision);
        this.collision.parent = this.media;

        this.project = new CSS3DObject();
        this.project.rotation.z = this.app.getOrientation() === 'landscape' ? Math.PI / 2 : 0;
        this.project.add(this.media);
        this.media.parent = this.project;
        this.project.userData.project = this;


        let radius = this.app._three.__.radius;
        this.media.position.set(0, 0, radius * 5);
        this.media.rotation.set(Math.PI, Math.PI, Math.PI / 2);

        this.updateMedia(media_data, false);
    }

    setVideoUI = (bool) => this.app._gui.setVideoUI(bool)

    click = (x) => {
        if (this.app.__.focus != this) {
            this.app._three.focusOn(this);
            if (this.__.medias[0].type === 'video') {
                setTimeout(() => {
                    this.play();
                }, 500);
            }
        } else {
            this.changeMedia(x > window.innerWidth / 2 ? 1 : -1)
        }
    }

    hover = (x) => {
        if (this != this.app.__.focus || this.__.medias.length == 1) {
            this.app._gui.setCursorMode('pointer');
            return;
        }
        if (x > (window.innerWidth / 2)) {
            this.app._gui.setCursorMode('left');
        } else {
            this.app._gui.setCursorMode('right');
        }
    }

    createMedia = (mediaData) => {
        let media_dom;
        let url = this.getUrl(mediaData.type, mediaData.src);

        if (mediaData.type === "image") {
            media_dom = document.createElement('img')
        } else {
            media_dom = document.createElement('video');
            media_dom.setAttribute('playsinline', true);
            media_dom.addEventListener('loadedmetadata', () => {
                media_dom.volume = 0;
                media_dom.play();
                setTimeout(() => {
                    media_dom.pause();
                }, 10)
            });
            media_dom.volume = 0;
            media_dom.loop = true;
            media_dom.onerror = () => {
                console.error('error video');
            }
        }

        media_dom.src = url;
        media_dom.className = 'media_dom';
        return media_dom;
    }

    getNextMedia = (direction) => {
        this.__.order = (this.__.order + direction) % (this.__.medias.length);
        if (this.__.order < 0) this.__.order = this.__.medias.length - 1;
        return this.__.medias[this.__.order];
    }

    changeMedia = (direction) => {
        if (this.__.medias.length <= 1) return

        let nextMedia = this.getNextMedia(direction);
        this.updateMedia(nextMedia);
        if (!this.app.__.isMobile)
            this.setVideoUI(nextMedia.type === 'video');

        let loadedMedia = [...this.media.element.children].find(v => v.src.includes(nextMedia.src));
        if (loadedMedia) {
            this.hideOldMedia();
            loadedMedia.classList.remove('hidden');
            if (nextMedia.type === 'video')
                this.play(loadedMedia);
        } else {
            let media_dom = this.createMedia(nextMedia);
            this.media.element.appendChild(media_dom);
            media_dom.classList.add('hidden');
            media_dom.addEventListener(nextMedia.type === 'video' ? 'loadedmetadata' : 'load',
                () => {
                    setTimeout(() => {
                        this.hideOldMedia();
                        media_dom.classList.remove('hidden');
                    }, 5)
                    if (nextMedia.type === 'video') {
                        this.play(media_dom);
                    }
                }
            )
        }
    }

    lerp = (a, b, d) => a - d * a + b * d;

    tweenScale = (x, y) => {
        let tween = this.app._tween.add(500);
        let scale = {
            start: { x: this.media.scale.x, y: this.media.scale.y },
            target: { x, y },
            delta: {}
        }

        let _vp = this.getViewpoint(x, y);
        let pos = {
            now: this.app._three._3d.camera.position.clone(),
            next: _vp.pos.clone(),
            tween: new THREE.Vector3()
        }

        tween.addEventListener('update', ({ detail }) => {
            scale.delta.x = this.lerp(scale.start.x, scale.target.x, detail);
            scale.delta.y = this.lerp(scale.start.y, scale.target.y, detail);
            this.media.scale.set(scale.delta.x, scale.delta.y, 1);

            pos.tween.lerpVectors(pos.now, pos.next, detail);
            this.app._three._3d.camera.position.copy(pos.tween);
        })
    }


    getViewpoint = (width = this.media.scale.x, height = this.media.scale.y) => {
        let quat = new THREE.Quaternion();
        let pos = new THREE.Vector3();

        let w_ratio = window.innerWidth / window.innerHeight;
        let m_ratio = width / height;
        height = w_ratio > m_ratio ? height : height + (m_ratio * height - w_ratio * height) * 1 / w_ratio

        let distance = (height / 2) / Math.tan(this.app._three._3d.camera.fov * (Math.PI / 360));

        this.media.getWorldQuaternion(quat);
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        this.media.getWorldPosition(pos);
        pos.addScaledVector(normal, distance * 1175);
        return { quat, pos };
    }

    updateMedia = (mediaData, tween = true) => {
        if (!mediaData) {
            console.log('errrrr', this.__.medias, this.__.order);
            return;
        }
        this.media.userData = mediaData;

        let scale = this.app._three.__.scale;

        let volume = scale;
        let width = Math.sqrt(volume * mediaData.ratio);
        let height = width / mediaData.ratio;

        if (tween) {
            this.tweenScale(width, height)

        } else {
            this.media.scale.set(width, height, 1)

        }

    }

    hideOldMedia = async () => {
        [...this.media.element.children].forEach(v => {
            if (!v.src.includes(this.__.medias[this.__.order].src)) {
                console.log(v.src, v.tagName);

                if (v.tagName === 'VIDEO')
                    this.pause(v);
                v.classList.add('hidden');
            }
        });
    }

    play = (media_dom) => {

        if (!media_dom) {
            media_dom = this.getMediaDomFromSrc(this.__.medias[this.__.order].src);
        }

        if (media_dom.tagName !== 'VIDEO') {
            console.log("ERRORR PLAY");
            return;
        }
        let tween = this.app._tween.add(1000, "sine_in");

        if (this.isPlaying(media_dom)) return;
        media_dom.volume = this.app.__.isMobile ? 1 : 0;
        media_dom.play();
        tween.addEventListener('update', ({ detail }) => {
            media_dom.volume = Math.min(1, Math.max(0, detail));
        })
    }

    pause = (media_dom) => {
        if (!media_dom) media_dom = [...this.media.element.children].find(v => {
            return v.src.includes(this.__.medias[this.__.order].src)
        })

        if (!media_dom || media_dom.tagName !== 'VIDEO') {
            console.error("error with pausing video");
            return;
        }

        let startVolume = media_dom.volume;

        return new Promise((resolve) => {
            if (startVolume == 0) {
                media_dom.pause();
                resolve();
                return;
            }
            let tween = this.app._tween.add(500);
            tween.addEventListener('update', ({ detail }) => {
                media_dom.volume = Math.min(1, Math.max(0, 1 - detail));
            })
            tween.addEventListener('complete', () => {
                media_dom.pause();
                resolve();
            })
        })

    }

    setVolume = (volume) => {
        let media_dom = this.getMediaDomFromSrc(this.__.medias[this.__.order].src);
        let startVolume = media_dom.volume;

        let tween = this.app._tween.add(500);
        tween.addEventListener('update', ({ detail }) => {
            let _volume = startVolume * (1 - detail) + volume * detail;
            media_dom.volume = Math.min(1, Math.max(0, _volume));
        })
    }

}