import enableInlineVideo from 'iphone-inline-video';


const VideoCanvas = function ({ url, src }) {
    this.canvas = document.createElement("canvas");
    var ctx = this.canvas.getContext('2d', { alpha: false });
    // const ctx = this.canvas.getContext('bitmaprenderer')

    this.video = document.createElement("video");

    this.video.setAttribute("loop", "");
    this.video.id = src;
    this.video.volume = 0;
    this.video.setAttribute("playsinline", "true");
    enableInlineVideo(this.video);

    let source = document.createElement("source");
    source.src = url;
    this.video.appendChild(source);



    this.video.addEventListener('loadedmetadata', () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
    });

    let playing = false;

    this.play = () => {
        this.video.play();
        playing = true;
        // updateCanvas();
    }

    this.pause = () => {
        this.video.pause();
        playing = false;
    }

    this.update = async () => {
        // ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // if (!playing) return;
        // console.log('this should happen');

        // requestAnimationFrame(updateCanvas);


        // this.canvas = await createImageBitmap(this.video);

        // ctx.transferFromImageBitmap(img);
    }


    this.isReady = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const videoTester = canvas.getContext("2d");

        let p = null;
        return new Promise((resolve) => {
            const pingVideo = () => {
                if (this.video.readyState >=
                    this.video.HAVE_CURRENT_DATA) {
                    videoTester.drawImage(this.video, 0, 0, 1, 1);
                    p = videoTester.getImageData(0, 0, 1, 1).data;
                    if (p.reduce((a, b) => a + b) > 0.5)
                        resolve()
                    else
                        requestAnimationFrame(pingVideo);
                } else {
                    requestAnimationFrame(pingVideo);
                }

            }
            pingVideo();
        })
    }
}

export default class MediaManager {
    constructor({ app }) {
        this.app = app;
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
                canvas: (canvas) => {
                    return new THREE.Texture(canvas,
                        {
                            minFilter: THREE.LinearFilter,
                            magFilter: THREE.LinearFilter,
                            encoding: THREE.sRGBEncoding,
                            generateMipMaps: false,
                        })
                }
            },
            loader: new THREE.TextureLoader(),
        }
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

    /* createVideo = async ({ url, src }) => {
        return 
    } */

    createVideoTexture = async (url, onlyFirstFrame) => {

        return new Promise(async (resolve) => {
            let src = url.split("/")[url.split("/").length - 1];
            let video = new VideoCanvas({ url, src });
            let texture = this.resources.texture.canvas(video.video);
            texture.update = video.update;
            console.log("VIDEOVIDEO IS ", video.video)
            texture.video = video.video;
            // texture.minFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            // texture.format = THREE.AlphaFormat;
            texture.generateMipMaps = false;
            // texture.anisotropy = this.app._three.renderer.getMaxAnisotropy()

            texture.play = async (callback) => {
                video.play();
                this.app.__.textures.update[src] = texture;
                console.log(this.app.__.textures.update);
                texture.playing = true;
                if (callback) {
                    callback();
                }
            }

            texture.pause = () => {
                video.pause();
                texture.playing = false;
                delete this.app.__.textures.update[src];
            }

            this.app.__.textures["videos"][src] = texture;
            // document.getElementById('videos').appendChild(video.canvas);

            if (onlyFirstFrame) {
                if (texture.playing)
                    return
                texture.play();
                await video.isReady();
                console.log(video.src + ' is ready');
                resolve(texture);
                setTimeout(() => {
                    texture.pause();
                }, 1000);
            } else {
                texture.play();
                await video.isReady();
                resolve(texture);
                console.log("SHOULD  BE PAYIN???");
            }
        })
    }

    loadTexture(url) {
        return new Promise((resolve) => {
            this.resources.loader.load(url, (tex) => {
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.generateMipMaps = true;
                resolve(tex)
            });
        })
    }

    async preloadVideos(project) {
        console.log(project);
        for (let _media of project.userData.medias) {
            if (_media.type === 'video') {
                if (!this.app.__.textures["videos"][_media.src]) {
                    let url = `projects/${project.userData.directory}/${this.capitalize(_media.type)}/${this.app.__.opt}/${_media.src}`;
                    let texture = await this.createVideoTexture(url, true);
                    console.log('preloaded texture');
                }
            }
        }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    scaleMedia = (media, ratio) => {
        const camera = this.app._three.camera;
        const viewpoint = media.parent.children[1];

        this.app._three.updateViewpointPosition(media.parent);

        for (let src in this.app.__.textures.update)
            this.app.__.textures.update[src].pause();


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

        let tweener = this.app._tween.add(500, "elastic_in_out");
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

        let _media = project.userData.medias[order];
        project.userData.order = order;

        media.userData = _media;
        let url = `projects/${project.userData.directory}/${this.capitalize(_media.type)}/${this.app.__.opt}/${_media.src}`;

        this.scaleMedia(media, media.userData.ratio);

        if (_media.type === 'image') {
            let _oldTex = media.material.map;
            let tex = await this.loadTexture(url);
            _oldTex.dispose();
            project.children[0].material.map = tex;
            project.children[0].material.needsUpdate = true;
            this.app._gui.hideVolume();
        } else {
            if (!this.app.__.isMobile) {
                this.DOM.buttons.volume.classList.remove('hidden');
            }
            let _oldTex = media.material.map;
            let texture = await this.createVideoTexture(url, false);
            this.app.__.textures["videos"][_media.src] = texture;
            setTimeout(() => {
                media.material.map = texture;
                _oldTex.dispose();
            }, 250);
            this.app._gui.showVolume();
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
        for (let project of this.app._three.__.projects.children) {
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
        media.rotation.set(0, 0, (Math.PI / 2));
        media.scale.copy(this.getScaleMedia(_media.ratio));
        media.frustumCulled = false;

        let url = `projects/${_project.directory}/${this.capitalize(_media.type)}/${this.app.__.opt}/${_media.src}`;

        if (_media.type === "image") {
            media.material.visible = false;
            let _tex = await this.loadTexture(url);
            media.material.map = _tex;
            media.material.visible = true;
            media.material.needsUpdate = true;
        } else {
            let texture = await this.createVideoTexture(url, true);
            media.material.map = texture;
            media.material.needsUpdate = true;
        }
        return media;
    }
}