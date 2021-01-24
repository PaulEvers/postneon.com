export default class RayCastManager {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 1000;
        this.cursor = new THREE.Vector2();
        this.intersects = [];

    }
    getIntersects(camera, point, objects) {
        this.cursor.set((point.x * 2) - 1, -(point.y * 2) + 1);
        this.raycaster.setFromCamera(this.cursor, camera);
        this.intersects.length = 0;
        this.raycaster.intersectObjects(objects, false, this.intersects);
        return this.intersects;
    }
}