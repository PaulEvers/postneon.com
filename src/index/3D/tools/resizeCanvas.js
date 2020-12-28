import checkIfFits from "./checkIfFits"
import getPosFromPic from "./getPosFromPic"

export default function (noLogo) {
    function createRandom() {
        let random = Math.random() * Math.PI / 8;
        let random2 = Math.random();
        if (random2 < 0.5) {
            random = random * -1;
        }
        return random;
    }
    if (window.innerWidth > window.innerHeight) {
        if (this.app.state.orientation === 'portrait') {
            this.app.state.orientation = "landscape";
            this.threeManager.state.projectsContainer.rotation.z = 0;
            for (let project of this.threeManager.state.projects.children) {
                project.children[0].rotation.z += Math.PI / 2;
            }
        }
    } else {
        if (this.app.state.orientation === 'landscape') {
            this.app.state.orientation = "portrait";
            this.threeManager.state.projectsContainer.rotation.z = Math.PI / 2;
            for (let project of this.threeManager.state.projects.children) {
                project.children[0].rotation.z = Math.PI / -2 + createRandom();
                project.children[0].rotation.x = createRandom();
                project.children[0].rotation.y = Math.PI / 2 + createRandom();
            }
        }
    }
    if (this.app.state.orientation === "portrait") {
        g.centerDistance = 200;
    } else {
        g.centerDistance = 125;
    }
    if (g.menuOpen) {
        chooseLogo();
        g.camera.position.z = g.centerDistance;
    } else {
        let position = getPosFromPic(g.focusedPic);
        if (g.mobile) {
            let fov = checkIfFits(g.focusedPic);
            g.camera.fov = fov;
            g.camera.updateProjectionMatrix();
        }
    }
    g.camera.aspect = window.innerWidth / window.innerHeight;
    g.camera.updateProjectionMatrix();
    this.threeManager.renderer.setSize(window.innerWidth, window.innerHeight);
    this.threeManager.renderer.render(g.scene, g.camera);
    if (!!g.menuOpen) {
        chooseLogo();
    }
}