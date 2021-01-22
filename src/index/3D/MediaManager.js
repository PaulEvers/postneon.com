import enableInlineVideo from 'iphone-inline-video';

export default class MediaManager {
    constructor({ threeManager, app }) {
        this.app = app;
        this.threeManager = threeManager;
        this.DOM = {
            videos: document.querySelector('#videos'),
            buttons: {
                volume: document.querySelector('.volume-button')
            }
        }
        this.resources = {
            geo: new THREE.PlaneBufferGeometry(1, 1, 1, 1),
            mat: () => {
                return new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    transparent: true,
                    alphaTest: 0.5
                })
            },
            texture: {
                image: () => {
                    return new THREE.Texture({
                        minFilter: THREE.NearestFilter,
                        magFilter: THREE.NearestFilter,
                        generateMipMaps: false,
                    })
                },
                video: (video) => {
                    return new THREE.Texture(video,
                        {
                            minFilter: THREE.LinearFilter,
                            magFilter: THREE.LinearFilter,
                            generateMipMaps: false,
                        })
                }
            },
            loader: new THREE.TextureLoader(),
        }
        this.initVideoTester();
    }
    initVideoTester = () => {
        let canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        this.videoTester = canvas.getContext("2d");
    }

    isReady = async (video) => {
        let p = null;

        return new Promise((resolve) => {
            const pingVideo = (video) => {
                this.videoTester.drawImage(video, 0, 0, 1, 1);
                p = this.videoTester.getImageData(0, 0, 1, 1).data;
                if (p.reduce((a, b) => a + b) > 0.5)
                    resolve()
                else
                    requestAnimationFrame(() => { pingVideo(video) });
            }
            pingVideo(video);
        })
    }

    pauseIfVideo = (media, duration) => {
        if (media.userData.type !== 'video') return;
        setTimeout(() => {
            media.material.map.pause();
        }, duration);
    }

    playIfVideo = (media, duration) => {
        if (media.userData.type !== 'video') return;
        setTimeout(() => {
            media.material.map.play();
        }, duration);
    }

    createVideo = async ({ url, src }) => {
        return new Promise(async (resolve) => {
            var video = document.createElement("video");
            var source = document.createElement("source");
            source.src = `${url}`;
            video.setAttribute("loop", "");
            video.id = src;
            video.volume = 0;
            video.setAttribute("playsinline", "true");
            enableInlineVideo(video);
            video.appendChild(source);
            resolve(video);
        })
    }

    createVideoTexture = async (url) => {
        //console.log("CREATE VIDEO ", url);
        return new Promise(async (resolve) => {
            let src = url.split("/")[url.split("/").length - 1];
            let video = await this.createVideo({ url, src });
            let texture = this.resources.texture.video(video);
            texture.generateMipMaps = false;
            // let texture = new THREE.VideoTexture(video);
            texture.play = async (callback) => {
                // const video = document.getElementById(src);
                video.play();
                this.app.state.textures.update[src] = texture;
                texture.playing = true;

                if (callback) {
                    callback();
                }
            }
            texture.toggle = () => {
                if (texture.playing) {
                    texture.pause()
                } else {
                    texture.play();
                }
            }

            texture.pause = () => {
                video.pause();
                texture.playing = false;
                delete this.app.state.textures.update[src];
            }

            this.app.state.textures["videos"][src] = texture;

            const init = async () => {
                if (texture.playing)
                    return
                texture.play();
                await this.isReady(video);
                console.log("OK!");

                video.pause();
                setTimeout(() => {
                    texture.pause();
                    video.removeEventListener('playthrough', init);
                    setTimeout(() => {
                        resolve(texture);
                    }, 125)
                }, 500);
            }
            init();
        })
    }

    loadTexture(url) {
        return new Promise((resolve) => {
            this.resources.loader.load(url, (tex) => {
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.generateMipMaps = false;
                resolve(tex)
            });
        })
    }

    async preloadVideos(project) {
        console.log(project);
        for (let _media of project.userData.medias) {
            if (_media.type === 'video') {
                if (!this.app.state.textures["videos"][_media.src]) {
                    let url = `projects/${project.userData.directory}/${this.capitalize(_media.type)}/${this.app.state.opt}/${_media.src}`;
                    let texture = await this.createVideoTexture(url);
                    console.log('preloaded texture');
                }
            }
        }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    scaleMedia = (media, ratio) => {
        const camera = this.threeManager.camera;
        const viewpoint = media.parent.children[1];

        this.threeManager.updateViewpointPosition(media.parent);

        for (let src in this.app.state.textures.update)
            this.app.state.textures.update[src].pause();


        let scale = {
            now: media.scale.clone(),
            next: ratio < 1 ?
                new THREE.Vector3(30 * ratio, 30, 1) :
                new THREE.Vector3(30, 30 / ratio, 1),
            tween: new THREE.Vector3()
        }

        let pos = {
            now: camera.position.clone(),
            next: new THREE.Vector3(),
            tween: new THREE.Vector3()
        }

        viewpoint.getWorldPosition(pos.next);

        if (scale.now === scale.next) return

        let tweener = this.app.tweenManager.add(500);
        tweener.addEventListener('update', ({ detail }) => {
            scale.tween = scale.now.clone();
            scale.tween.lerp(scale.next.clone(), detail);
            media.scale.copy(scale.tween);

            pos.tween.lerpVectors(pos.now, pos.next, detail);
            camera.position.copy(pos.tween);
        })
        tweener.addEventListener('complete', () => {
            console.log('completed')
        })



    }

    async changeMedia(project, direction) {
        let order = (project.userData.order + direction) % project.userData.medias.length;
        if (order < 0) order = project.userData.medias.length - 1;

        let media = project.children[0];
        console.log(project, media);

        let _media = project.userData.medias[order];
        project.userData.order = order;

        media.userData = _media;
        let url = `projects/${project.userData.directory}/${this.capitalize(_media.type)}/${this.app.state.opt}/${_media.src}`;

        this.scaleMedia(media, media.userData.ratio);

        if (_media.type === 'image') {
            let _oldTex = media.material.map;
            let tex = await this.loadTexture(url);
            _oldTex.dispose();
            project.children[0].material.map = tex;
            project.children[0].material.needsUpdate = true;
        } else {
            if (!this.app.state.isMobile) {
                this.DOM.buttons.volume.classList.remove('hidden');
            }
            if (!this.app.state.textures["videos"][_media.src]) {
                let texture = await this.createVideoTexture(url);
                texture.play();
                setTimeout(() => {
                    this.app.state.textures["videos"][_media.src] = texture;
                    media.material.map = texture;
                }, 250)
            } else {
                setTimeout(() => {
                    const texture = this.app.state.textures.videos[_media.src];
                    this.app.state.textures.update[_media.src] = texture;
                    media.material.map = texture;
                    texture.play();
                }, 250);
            }
        }
    }

    getScreenRatio() { return window.innerWidth / window.innerHeight }

    getScaleMedia(ratio) {
        let _ratio = this.getScreenRatio();
        if (ratio < 1 /* && ratio < _ratio */) {
            return new THREE.Vector3(30 * ratio, 30, 1);
        } else {
            return new THREE.Vector3(30, 30 / ratio, 1);
        }
    }
    updateScaleMedias() {
        for (let project of this.threeManager.state.projects.children) {
            let media = project.children[0];
            if (!media) return;
            media.scale.copy(this.getScaleMedia(media.userData.ratio));
        }
    }

    async create({ _media, _project }) {
        let media = new THREE.Mesh(this.resources.geo, new this.resources.mat());
        media.name = `${_project.title}_media`;
        media.userData = _media
        media.updateMatrix();
        media.position.set(0, 0, 75);
        media.rotation.set(0, 0, (Math.PI / -2));
        media.scale.copy(this.getScaleMedia(_media.ratio));

        let url = `projects/${_project.directory}/${this.capitalize(_media.type)}/${this.app.state.opt}/${_media.src}`;

        if (_media.type === "image") {
            media.material.visible = false;
            let _tex = await this.loadTexture(url);
            media.material.map = _tex;
            media.material.visible = true;
            media.material.needsUpdate = true;
        } else {
            let texture = await this.createVideoTexture(url);
            media.material.map = texture;
            media.material.needsUpdate = true;
        }
        return media;
    }
}