export default class CursorDependencies {
    constructor({ app, threeManager }) {
        this.app = app;
        this.threeManager = threeManager;
        this.intersectionManager = this.threeManager.intersectionManager;
        this.mediaManager = this.threeManager.mediaManager;
        this.tweenManager = app.tweenManager;
        this.vectors = {
            down: new THREE.Vector2(),
            up: new THREE.Vector2(),
            doubleClick: new THREE.Vector2(),
            move: new THREE.Vector2()
        }
    }
}
