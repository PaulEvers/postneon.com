import createVideo from "./tools/createVideo"

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
                        minFilter: THREE.LinearFilter,
                        magFilter: THREE.LinearFilter,
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
        console.log('VIDEO TESTER', this.videoTester);
    }
    initVideoTester() {
        let canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        let ctx = canvas.getContext("2d");
        this.videoTester = ctx;
    }

    async isReady(video) {
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

    pauseIfVideo(media, duration) {
        if (media.userData.type !== 'video') return;
        setTimeout(() => {
            media.material.map.pause();
        }, duration);
    }

    playIfVideo(media, duration) {
        if (media.userData.type !== 'video') return;
        setTimeout(() => {
            media.material.map.play();
        }, duration);
    }

    async createVideoTexture(url) {
        return new Promise(async (resolve) => {
            let src = url.split("/")[url.split("/").length - 1];
            let video = await createVideo({ url, src });
            let texture = this.resources.texture.video(video);

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
                texture.pause();
                video.removeEventListener('playthrough', init);
                setTimeout(() => {
                    resolve(texture);
                }, 125)
            }

            video.addEventListener('canplaythrough', init.bind(this));
            // this.DOM.videos.append(video);
        })


    }
    loadTexture(url) {
        return new Promise((resolve) => {
            this.resources.loader.load(url, (tex) => { resolve(tex) });
        })
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    async changeMedia(project, direction) {
        let order = (project.userData.order + direction) % project.userData.medias.length;
        if (order < 0) order = project.userData.medias.length - 1;

        let media = project.children[0];
        let _media = project.userData.medias[order];
        project.userData.order = order;

        media.userData = _media;
        let url = `projects/${project.userData.directory}/${this.capitalize(_media.type)}/${this.app.state.opt}/${_media.src}`;

        this.app.tweenManager.tweens.scaleMedia.tween(media, _media.ratio);

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
                texture.play()
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
            console.log('media', media.userData.ratio);
            media.scale.copy(this.getScaleMedia(media.userData.ratio));
        }
    }

    async create({ _media, _project }) {
        // let distance = 1.03 * _media.scale.y * (Math.tan(((50) * Math.PI / 180)));
        let media = new THREE.Mesh(this.resources.geo, new this.resources.mat());
        media.frustumCulled = true;
        media.name = `${_project.title}_media`;
        let url = `projects/${_project.directory}/${this.capitalize(_media.type)}/${this.app.state.opt}/${_media.src}`;
        media.userData = _media
        media.updateMatrix();
        media.position.set(0, 0, 75);
        media.rotation.set(0, 0, (Math.PI / -2));
        media.scale.copy(this.getScaleMedia(_media.ratio));

        /*         if (_media.ratio < 1) {
                    media.scale.set(30 * _media.ratio, 30, 1);
                } else {
                    media.scale.set(30, 30 / _media.ratio, 1);
                } */

        if (_media.type === "image") {
            media.material.visible = false;
            let _tex = await this.loadTexture(url);
            media.material.map = _tex;
            media.material.visible = true;
            media.material.needsUpdate = true;
        } else {
            let texture = await this.createVideoTexture(url);
            texture.pause();
            // texture..painitializing = 0;
            media.material.map = texture;
            media.material.needsUpdate = true;
            /* setTimeout(() => {
                texture.pause()
            }, 100); */
        }
        return media;

    }
}

// export default function (data, mediaObject, project, openState) {
//     ////console.log(project);
//     function loadTexture(picture, project, src, opt, callback) {
//         let promise = new Promise(function (resolve) {
//             let url = "projects/" + project + "/Image/" + opt + "/" + src;
//             if (opt === "opt") { }
//             this.app.state.textures.uploading["projects/" + project + "/Image/" + opt + "/" + src] = 0;
//             g.loader.load(
//                 url,
//                 function (texture) {
//                     ////console.log(texture);
//                     ////console.log(picture);
//                     picture.material.map = texture;
//                     texture.minFilter = THREE.NearestFilter;
//                     texture.magFilter = THREE.NearestFilter;
//                     texture.encoding = THREE.sRGBEncoding;
//                     material.visible = true;
//                     this.threeManager.renderer.render(g.scene, g.camera);
//                     if (!g.mobile) {
//                         g.loQ--;
//                         if (g.loQ == 0) {
//                             g.animate();
//                         }
//                     }
//                     resolve();
//                 },
//                 function (progress) {
//                     this.app.state.textures.uploading[url] = (progress.loaded / progress.total) * 100;
//                     let sum = 0;
//                     for (let key in this.app.state.textures.uploading) {
//                         sum += this.app.state.textures.uploading[key];
//                     }
//                     let uploaded = sum / g.mediaCount;
//                     uploaded = uploaded.toFixed(2);
//                     if (uploaded == 100.00) {
//                         resizeCanvas();
//                     }
//                 },
//                 function () {
//                 }
//             );
//         })
//         return promise;
//     }
//     // let distance = 1.03 * data.scale.y * (Math.tan(((50) * Math.PI / 180))) * project.scale.x;
//     // let scalar = distance;
//     /*     let mediaObjectPos = new THREE.Vector3(0, 0, scalar);
//         let plane = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
//         let material = new THREE.MeshBasicMaterial();
//         material.side = THREE.DoubleSide;
//         let type = data.type;
//         material.transparent = true;
//         material.alphaTest = 0.5;
//         let picture = new THREE.Mesh(plane, material); */
//     // picture.frustumCulled = false;
//     // g.objects.push(picture);

//     picture.updateMatrix();
//     picture.position.set(0, 0, 0);
//     picture.name = data.name;
//     // picture.userData.src = data.src;
//     if (data.type === "image") {
//         material.visible = false;
//         loadTexture(picture, project.userData.directory, data.src, g.opt)
//     } else if (data.type === "video") {
//         let texture = createVideoTexture(project.userData.directory, data.src);
//         picture.material.map = texture;
//         picture.material.needsUpdate = true;
//     }
//     let camPoint = new THREE.Points();
//     let points = [mediaObjectPos];
//     let geometry = new THREE.BufferGeometry().setFromPoints(points);
//     let pointsMaterial = new THREE.PointsMaterial({ visible: false });
//     camPoint.material = pointsMaterial;
//     camPoint.geometry = geometry;
//     camPoint.name = "cam";
//     camPoint.userData.transformEnabled = false;
//     camPoint.userData.outlinerEnabled = false;
//     // frustum visualizer
//     let frustumGeo = new THREE.Geometry();
//     let frustumMat = new THREE.MeshBasicMaterial({ visible: false });
//     let vectors = [];
//     let position = picture.geometry.attributes.position.array;
//     frustumGeo.vertices.push(mediaObjectPos);
//     for (let i = 0; i < (position.length / 3); i++) {
//         let index = i * 3;
//         let vector = new THREE.Vector3((position[index]), (position[(index + 1)]), 0);
//         vector.applyMatrix4(picture.matrix);
//         frustumGeo.vertices.push(vector);
//     }
//     frustumGeo.faces.push(new THREE.Face3(2, 1, 0));
//     frustumGeo.faces.push(new THREE.Face3(1, 3, 0));
//     frustumGeo.faces.push(new THREE.Face3(3, 4, 0));
//     frustumGeo.faces.push(new THREE.Face3(4, 2, 0));
//     let bufferGeo = new THREE.BufferGeometry().fromGeometry(frustumGeo);
//     let frustum = new THREE.Mesh(bufferGeo, frustumMat);
//     // position picture
//     frustum.scale.x = 1 / picture.scale.x;
//     frustum.scale.y = 1 / picture.scale.y;
//     // make frustum invisible in hierarchy and untransformable in viewport
//     frustum.userData.transformEnabled = false;
//     frustum.userData.outlinerEnabled = false;
//     if (project.children) {
//         frustum.name = "frustum_" + project.children.length;
//     } else {
//         frustum.name = "frustum_0";
//     }
//     picture.add(frustum);
//     picture.add(camPoint);
//     // position picture
//     project.add(picture);
//     //
//     ////console.log(mediaObject.rotation);
//     // picture.rotation.copy(mediaObject.rotation);
//     picture.rotation.set(mediaObject.rotation.x, mediaObject.rotation.y, mediaObject.rotation.z);
//     let newPosition = new THREE.Vector3(mediaObject.position.x, mediaObject.position.y, mediaObject.position.z);
//     picture.position.copy(newPosition.sub(project.position));
//     if (data.width) {
//         picture.scale.x = data.width / 200;
//         picture.scale.y = data.height / 200;
//     } else {
//         picture.scale.x = data.scale.x * project.scale.x;
//         picture.scale.y = data.scale.y * project.scale.x;
//     }
//     let direction = new THREE.Vector3();
//     picture.getWorldDirection(direction);
//     if (!openState) {
//         picture.position.add(direction.multiplyScalar((scalar * -1)));
//     } else {
//         picture.position.add(project.position);
//     }
//     picture.scale.set((picture.scale.x / project.scale.x), (picture.scale.y / project.scale.y), (picture.scale.z / project.scale.z));
//     picture.geometry.needsUpdate = true;
//     picture.geometry.needsUpdate = true;
//     picture.geometry.verticesNeedsUpdate = true;
//     picture.geometry.elementNeedsUpdate = true;
//     picture.updateMatrix();
//     // remove child from scene and add it to parent
//     picture.geometry.attributes.position.needsUpdate = true;
//     setTimeout(function () {
//         collisionChecker(picture);
//     }, 50);
//     if (type === "video") {
//         //////////////console.log("VIDEOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")
//     }
//     ////console.log(g.scene);
//     return picture;
// }