export default function (nextPic) {

	if ((window.innerHeight / window.innerWidth) * 0.925 > (nextPic.scale.y / nextPic.scale.x)) {
		let delta = (window.innerHeight / window.innerWidth) / (nextPic.scale.y / nextPic.scale.x);
		// g.newFOV = 2 * Math.atan( ((nextPic.scale.y + 0.025 * 2  * nextPic.scale.y)  * delta) / ( 2 * nextPic.userData.distance ) ) * ( 180 / Math.PI ) ;
		/* 	    if(g.mobile){
					g.newFOV = 2 * Math.atan( ((nextPic.scale.y + 0.025 * 2  * nextPic.scale.y)  * delta) / ( 2 * nextPic.userData.distance ) ) * ( 180 / Math.PI ) ;
				}else{
					g.newFOV =
				} */
		return 2 * Math.atan(((nextPic.scale.y + 0.025 * 2 * nextPic.scale.y) * delta) / (1.75 * nextPic.userData.distance)) * (180 / Math.PI);
	} else {
		return 50;
	}
}