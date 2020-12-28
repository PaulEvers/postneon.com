export default function(pic) {
    // init variables
    let triangles;
    let positions;
    let vectors;
    // init object
    let rayData = {};
    // faces pic
    triangles = [];
    positions = pic.geometry.attributes.position.array.slice(0);
    triangles = [];
    vectors = [];
    for (let i = 0; i < (positions.length / 3); i++) {
        let index = i * 3;
        let vector = new THREE.Vector3(positions[index], positions[(index + 1)], positions[(index + 2)]);
        vector.applyMatrix4(pic.matrixWorld);
        vectors.push(vector);
    }
    rayData.picVectors = vectors;
    // camVector
    let cam = pic.children[1];
    positions = cam.geometry.attributes.position.array;
    rayData.cam = new THREE.Vector3(positions[0], positions[1], positions[2]);
    rayData.cam.applyMatrix4(cam.matrixWorld);
    // boundingBox
    pic.children[0].geometry.computeBoundingBox();
    let boundingBox = pic.children[0].geometry.boundingBox.clone();
    //boundingBox.center.applyMatrix4(pic.children[0].matrixWorld);
    rayData.boundingBox = boundingBox;
    //visualizer
    // pic
    rayData.pic = pic;
    // return
    return rayData;
}