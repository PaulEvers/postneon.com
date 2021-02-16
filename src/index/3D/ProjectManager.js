
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from "three"


export default class Project {
    constructor(app, _p) {
        this.app = app;

        this.__ = {
            projectLength: _p.medias.length,
            order: 0,
            name: _p.title,
            directory: _p.directory,
            info: {
                big: _p.info.big ? _p.info.big.replace(/\n/g, "<br>") : "",
                small: _p.info.small ? _p.info.small.replace(/\n/g, "<br>") : "",
            },
            medias: _p.medias,
        }

        this.mediaCache = [];

        this.init(_p.medias[0])
    }

    getUrl = (_m) => `projects/${this.__.directory}/${this.app.capitalize(_m.type)}/${this.app.__.opt}/${_m.src}`;
    isPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
    getMediaDomFromSrc = (src) => [...this.media.element.children].find(v => v.src.includes(src))

    init = (_m) => {

        let d_media = this.createMedia(_m);

        let d_container = document.createElement('div');
        d_container.className = 'd_container';
        d_container.appendChild(d_media);

        this.media = new CSS3DObject(d_container);

        this.collision = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        );
        this.collision.scale.set(2000, 2000, 1);
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

        this.updateMedia(_m, false);
    }

    setVideoUI = (bool) => this.app._gui.setVideoUI(bool)

    click = (x) => {
        if (this.app.__.focus.project != this) {
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
        if (this != this.app.__.focus.project || this.__.medias.length == 1) {
            this.app._gui.setCursorMode('pointer');
            return;
        }
        if (x > (window.innerWidth / 2)) {
            this.app._gui.setCursorMode('left');
        } else {
            this.app._gui.setCursorMode('right');
        }
    }

    createMedia = (_m) => {
        let url = this.getUrl(_m);

        let d_media;
        if (_m.type === "image") {
            d_media = document.createElement('img')
        } else {
            d_media = document.createElement('video');
            d_media.volume = 0;
            d_media.loop = true;
        }

        d_media.src = url;
        d_media.className = 'd_media';
        return d_media;
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
        this.setVideoUI(nextMedia.type === 'video');

        let loadedMedia = [...this.media.element.children].find(v => v.src.includes(nextMedia.src));
        if (loadedMedia) {
            this.hideOldMedia();
            loadedMedia.classList.remove('hidden');
            if (nextMedia.type === 'video')
                this.play(loadedMedia);
        } else {
            let d_media = this.createMedia(nextMedia);
            this.media.element.appendChild(d_media);
            d_media.classList.add('hidden');
            d_media.addEventListener(nextMedia.type === 'video' ? 'loadedmetadata' : 'load',
                () => {
                    this.hideOldMedia();
                    if (nextMedia.type === 'video') {
                        this.play(d_media);
                    }
                    d_media.classList.remove('hidden');
                }
            )
        }
    }

    lerp = (a, b, d) => a - d * a + b * d

    tweenScale = (x, y) => {
        let tween = this.app._tween.add(500);
        let scale = {
            start: { x: this.media.scale.x, y: this.media.scale.y },
            target: { x, y },
            delta: {}
        }

        let _vp = this.getViewpoint(y);
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


    getViewpoint = (height = this.media.scale.y) => {
        let quat = new THREE.Quaternion();
        let pos = new THREE.Vector3();



        const distance = (height) / Math.tan(this.app._three._3d.camera.fov * (Math.PI / 360));


        this.media.getWorldQuaternion(quat);
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        this.media.getWorldPosition(pos);
        pos.addScaledVector(normal, distance * 1175);
        return { quat, pos };
    }

    updateMedia = (_m, tween = true) => {
        if (!_m) {
            console.log('errrrr', this.__.medias, this.__.order);
            return;
        }
        this.media.userData = _m;

        let scale = this.app._three.__.scale;

        if (tween) {
            _m.ratio < 1 ?
                this.tweenScale(scale * _m.ratio, scale) :
                this.tweenScale(scale, scale / _m.ratio);
        } else {
            _m.ratio < 1 ?
                this.media.scale.set(scale * _m.ratio, scale, 1) :
                this.media.scale.set(scale, scale / _m.ratio, 1);
        }

    }

    hideOldMedia = async () => {
        [...this.media.element.children].forEach(v => {
            if (v.src.includes(this.__.medias[this.__.order])) return;
            if (v.tagName === 'video' && v.volume == 1)
                this.pause(d_media);
            v.classList.add('hidden');
        });
    }




    play = (d_media) => {

        if (!d_media) {
            d_media = this.getMediaDomFromSrc(this.__.medias[this.__.order].src);
        }

        if (d_media.tagName !== 'VIDEO') {
            console.log("ERRORR PLAY");
            return;
        }
        let tween = this.app._tween.add(1000, "sine_in");

        if (this.isPlaying(d_media)) return;
        d_media.volume = 0
        d_media.play();
        tween.addEventListener('update', ({ detail }) => {
            d_media.volume = Math.min(1, Math.max(0, detail));
        })
    }

    pause = (d_media) => {
        if (!d_media) d_media = [...this.media.element.children].find(v => {
            console.log(v.src, this.__.medias[this.__.order]);
            return v.src.includes(this.__.medias[this.__.order].src)
        })

        console.log(d_media);
        if (!d_media || d_media.tagName !== 'VIDEO') {
            console.log("ERRORR PAUSE");
            return;
        }

        return new Promise((resolve) => {
            let tween = this.app._tween.add(500);
            tween.addEventListener('update', ({ detail }) => {
                d_media.volume = Math.min(1, Math.max(0, 1 - detail));
            })
            tween.addEventListener('complete', () => {
                d_media.pause();
                resolve();
            })
        })

    }

}