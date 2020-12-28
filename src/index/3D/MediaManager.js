import collisionChecker from "./tools/collisionChecker"
import createVideo from "./tools/createVideo"

export default class MediaManager {
    constructor({ threeManager, app }) {
        this.app = app;
        this.threeManager = threeManager;
        this.tweenManager = this.threeManager.tweenManager;
        this.DOM = {
            videos: document.querySelector('#videos'),
            buttons: {
                volume: document.querySelector('#volume')
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
                        minFilter: THREE.LinearMipMapLinearFilter,
                        magFilter: THREE.LinearMipMapLinearFilter,
                        encoding: THREE.sRGBEncoding,
                    })
                },
                video: (video) => {
                    return new THREE.Texture(video,
                        {
                            minFilter: THREE.LinearFilter,
                            magFilter: THREE.NearestFilter,
                            generateMipMaps: false,
                            encoding: THREE.sRGBEncoding,
                            // map: video
                        })
                }
            },
            loader: new THREE.TextureLoader()
        }
    }
    async createVideoTexture(url) {
        return new Promise(async (resolve) => {
            let src = url.split("/")[url.split("/").length - 1];
            let video = await createVideo({ url, src });
            let texture = this.resources.texture.video(video);
            texture.play = (callback) => {
                console.log("PLAY!");
                console.log(this);
                this.app.state.textures.update[src] = texture;
                const video = document.getElementById(src);
                video.play();
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
                console.log("PAUSE!");
                document.getElementById(src).pause();
                texture.playing = false;
                delete this.app.state.textures.update[src];
            }
            console.log(texture);
            /*  texture.color = new THREE.Color();
             texture.color.convertSRGBToLinear(); */
            /* texture.playing = function () {
                return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
            }
            texture.isPlaying = false; */
            // texture.anisotropy = 0.25;
            this.app.state.textures["videos"][src] = texture;
            // texture.generateMipmaps = false;
            // video.firstFrame = false;
            video.onloadeddata = function () {
                console.log('this happens')
                texture.play();
                function hasAudio(video) {
                    return video.mozHasAudio ||
                        Boolean(video.webkitAudioDecodedByteCount) ||
                        Boolean(video.audioTracks && video.audioTracks.length);
                }

                console.log(`video width is ${video.videoWidth} ${video.videoHeight}`);
                resolve(texture);
            }
            this.DOM.videos.append(video);
            // return texture;
        })


    }
    loadTexture(url) {
        return new Promise((resolve) => {
            this.app.state.textures.uploading[url] = 0;
            this.resources.loader.load(url, (tex) => { resolve(tex) });
        })
    }


    changeScale(nextPic, nextMedia) {
        let scaleNow = nextPic.scale;
        let ratio = nextMedia.ratio;
        let scaleNext = { x: ratio, y: 1, z: 1 };
        let t = { t: 0 };
        var tween = new TWEEN.Tween(scaleNow)
            .to(scaleNext, 250)
            .onUpdate(function () {
                nextPic.scale.copy(scaleNow);
                let fov = checkIfFits(nextPic);
                if (fov != g.camera.fov) {
                    g.camera.fov = fov;
                    this.threeManager.renderer.render(g.scene, g.camera);
                }
            })
            .onComplete(function () { })
            .start();
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    async changeMedia(project) {

        project.userData.order = (project.userData.order + 1) % project.userData.medias.length;
        let media = project.children[0];
        let _media = project.userData.medias[project.userData.order];

        media.userData = _media;
        let url = `projects/${project.userData.directory}/${this.capitalize(_media.type)}/${this.app.state.opt}/${_media.src}`;

        console.log(_media);
        console.log('ok');
        this.tweenManager.scaleMedia(media, _media.ratio);

        if (_media.type === 'image') {
            let tex = await this.loadTexture(url);
            project.children[0].material.map = tex;
            project.children[0].material.needsUpdate = true;
        } else {
            if (!this.app.state.isMobile) {
                this.DOM.buttons.volume.classList.remove('hidden');
            }
            if (!this.app.state.textures["videos"][_media.src]) {
                let texture = await this.createVideoTexture(url);
                await new Promise((res) => { setTimeout(() => { res() }, 125) });
                console.log('CREATE TEXTURE');

                console.log('texture', texture);
                this.app.state.textures["videos"][_media.src] = texture;
                media.material.map = texture;
                media.material.dithering = true
            } else {
                console.log('PLAY TEXTURE');
                console.log(this.app.state.textures.videos[_media.src]);
                let texture = this.app.state.textures.videos[_media.src];

                this.app.state.textures.update[_media.src] = texture;
                media.material.map = texture;
                texture.play();

            }
        }
    }

    async create({ _media, _project }) {
        let distance = 1.03 * _media.scale.y * (Math.tan(((50) * Math.PI / 180)));
        let media = new THREE.Mesh(this.resources.geo, new this.resources.mat());
        media.name = `${_project.title}_media`;
        let url = `projects/${_project.directory}/${this.capitalize(_media.type)}/${this.app.state.opt}/${_media.src}`;
        media.userData = {
            distance: distance,
            src: _media.src,
            type: _media.type
        }
        media.updateMatrix();
        media.position.set(0, 0, 75);
        media.rotation.set(0, 0, (Math.PI / -2));
        if (_media.ratio < 1) {
            media.scale.set(30 * _media.ratio, 30, 1);
        } else {
            media.scale.set(30, 30 / _media.ratio, 1);
        }

        if (_media.type === "image") {
            media.material.visible = false;
            let _tex = await this.loadTexture(url);
            console.log(`map tex of image is`, _tex.image.width, _tex.image.height);
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

// export default function (data, mediaObject, project, openState) {
//     console.log(project);
//     function loadTexture(picture, project, src, opt, callback) {
//         let promise = new Promise(function (resolve) {
//             let url = "projects/" + project + "/Image/" + opt + "/" + src;
//             if (opt === "opt") { }
//             this.app.state.textures.uploading["projects/" + project + "/Image/" + opt + "/" + src] = 0;
//             g.loader.load(
//                 url,
//                 function (texture) {
//                     console.log(texture);
//                     console.log(picture);
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
//     console.log(mediaObject.rotation);
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
//         //////////console.log("VIDEOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")
//     }
//     console.log(g.scene);
//     return picture;
// }