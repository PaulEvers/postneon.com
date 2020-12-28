export default function (pic) {
	let positions = pic.geometry.attributes.position.array;
	let pos = new THREE.Vector3(positions[0], positions[1], positions[2]);
	pos.applyMatrix4(pic.matrixWorld);
	return pos;
}