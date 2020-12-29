import createUrl from "./createUrl.js"
import TWEEN from '@tweenjs/tween.js'
import checkIfFits from "./checkIfFits"
import createVideoTexture from "./createVideoTexture"

export default function (nextPic) {
    for (let key in this.app.state.textures.update) {
        this.app.state.textures.update[key].pause();
    }
    function changeScale(nextPic, nextMedia) {
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
    if (nextPic.parent.userData.projectLength != 1) {
        if (this.app.state.focus.media.userData.type === "video") {
            this.app.state.focus.media.material.map.pause();
        }
        let promise = new Promise(function (resolve) {
            if (g.camera.quaternion != this.app.state.focus.media.quaternion) {
                g.camTweener(this.app.state.focus.media, 250);
            }
            if (this.app.state.focus.media.userData.type === "video") {
            }
            let nextIndex;
            if (g.clientX > (window.innerWidth / 2)) {
                nextIndex = (nextPic.parent.userData.order + 1) % nextPic.parent.userData.projectLength;
            } else {
                nextIndex = (nextPic.parent.userData.order - 1);
                if (nextIndex < 0) {
                    nextIndex = nextPic.parent.userData.projectLength - 1;
                }
            }
            eId("order").innerHTML = nextIndex + 1;
            nextPic.parent.userData.order = nextIndex;
            let thisProject = g.sceneObject.projects.find(p => { return p.title === g.focusedProject.name });
            ////console.log(thisProject);
            // ////console.log(gof)
            let nextMedia = thisProject.medias[nextIndex];
            nextPic.userData.type = nextMedia.type;
            nextPic.name = nextMedia.src;
            nextPic.userData.src = nextMedia.src;
            if (nextMedia.type === "image") {
                eId("volume").style.display = "";
                let loader = new THREE.TextureLoader();
                this.app.state.focus.media.userData.type === "image";
                loader.load(
                    createUrl(g.focusedProject, nextMedia),
                    function (texture) {
                        nextPic.material.map = texture;
                        nextPic.material.map.needsUpdate = true;
                        changeScale(nextPic, nextMedia);
                        resolve(nextPic);
                    },
                    undefined,
                    function (err) { }
                );
            } else {
                if (!g.mobile) {
                    eId("volume").style.display = "inline-block";
                    if (nextPic.material.map.image.volume != 0) {
                        eId("volume").children[0].innerHTML = "mute";
                    } else {
                        eId("volume").children[0].innerHTML = "muted";
                    }
                }
                this.app.state.focus.media.userData.type === "video";
                let texture;
                if (!src in this.app.state.textures["videos"]) {
                    texture = createVideoTexture(g.focusedProject.name, nextMedia.name, true);
                    this.app.state.textures["videos"][nextMedia.name] = texture;
                    this.app.state.focus.media.material.map = texture;
                    this.app.state.focus.media.userData.src = nextMedia.name;
                    changeScale(nextPic, nextMedia);
                    eId("volume").children[0].innerHTML = "muted";
                    texture.play();
                } else {
                    texture = this.app.state.textures["videos"][nextMedia.name];
                    texture.play();
                    nextPic.material.map = texture;
                    this.app.state.textures.update[nextMedia.name] = texture;
                    if (texture.image.muted) {
                        eId("volume").children[0].innerHTML = "muted";
                    } else {
                        eId("volume").children[0].innerHTML = "mute";
                    }
                    changeScale(nextPic, nextMedia);
                }
            }
        })
        return promise;
    }
}