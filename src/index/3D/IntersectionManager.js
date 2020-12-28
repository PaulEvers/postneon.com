export default class IntersectionManager {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.cursor = new THREE.Vector2();
    }
    getIntersects(camera, point, objects) {
        // console.log(camera, point, objects);
        this.cursor.set((point.x * 2) - 1, -(point.y * 2) + 1);
        this.raycaster.setFromCamera(this.cursor, camera);
        return this.raycaster.intersectObjects(objects);
    }
}