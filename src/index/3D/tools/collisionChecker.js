import getRayData from "./getRayData"
export default function (thisPic) {
    let thisRayData = getRayData(thisPic);
    let thisBoundingBox = thisRayData.boundingBox;
    g.rayDatas[thisPic.name] = thisRayData;
    let boxColObjects = [];
    let colRayDatas = [];
    let arrowsOn = false;
    //check
    for (let key in g.rayDatas) {
        let rayData = g.rayDatas[key];
        if (rayData != thisRayData) {
            let boundingBox = rayData.boundingBox;
            if (thisBoundingBox.intersectsBox(boundingBox)) {
                boxColObjects.push(rayData.pic);
                boxColObjects.push(rayData.pic.children[0]);
                colRayDatas.push(rayData);
            }
        }
    }
    let colPics = [];
    //visualizer of raycast

    //update array which contains all the collided objects
    function addToInterFrust(pic) {
        let interExists = false;
        for (let colPic of colPics) {
            if (colPic.uuid === pic.uuid) {
                interExists = true;
            }
        }
        if (!interExists) {
            colPics.push(pic);
        }
    }

    function checkEdges(pic) {
        thisRayData = getRayData(pic);
        let indArray = [2, 0, 3, 1];
        for (let i = 0; i < thisRayData.picVectors.length; i++) {
            let index = indArray[i];
            let nextPicVector = thisRayData.picVectors[index];
            let picVector = thisRayData.picVectors[i];
            let dotGeometry = new THREE.Geometry();
            dotGeometry.vertices.push(picVector);
            var dotMaterial = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false });
            let points = new THREE.Points(dotGeometry, dotMaterial);
            let origin = new THREE.Vector3(dotGeometry.vertices[0].x, dotGeometry.vertices[0].y, dotGeometry.vertices[0].z);
            let directionVector = origin.sub(nextPicVector);
            let ray = new THREE.Raycaster(dotGeometry.vertices[0], directionVector.clone().normalize().multiplyScalar(-1));
            let arrowName = pic.name + "_" + i;
            let collisionResults = ray.intersectObjects(boxColObjects);
            if (collisionResults.length > 0) {
                for (let collisionResult of collisionResults) {
                    if (collisionResult.distance < directionVector.length()) {
                        let colPic;
                        if (collisionResult.object.name.indexOf("frustum") != -1) {
                            colPic = collisionResult.object.parent;
                        } else {
                            colPic = collisionResult.object;
                        }
                        if (colPics.indexOf(colPic) == -1) {
                            colPics.push(colPic);
                        }
                    }
                }
            }
        }
    }

    function checkFrustum(picVector, cam, pic, objects, index, callback) {
        let directionVector = picVector.sub(cam);
        let ray = new THREE.Raycaster(cam, directionVector.clone().normalize());
        let collisionResults = ray.intersectObjects(objects);
        if (collisionResults.length > 0) {
            for (let collisionResult of collisionResults) {
                if (collisionResult.distance < directionVector.length()) {
                    callback(collisionResult);
                }
            }
        }
    }
    //check edges of the transforming picture
    checkEdges(thisPic);
    //check frustum of the transforming picture
    let index = 0;
    let thisObject = [thisPic, thisPic.children[0]];
    for (let picVector of thisRayData.picVectors) {
        checkFrustum(picVector, thisRayData.cam, thisPic, boxColObjects, index, function (collisionResult) {
            let frustum;
            if (collisionResult.object.name.indexOf("frustum") != -1) {
                frustum = collisionResult.object.parent;
            } else {
                frustum = collisionResult.object;
            }
            addToInterFrust(frustum);
        });
        index++;
    }
    //check frustums of the pictures close to the transforming picture
    for (let intersectRayData of colRayDatas) {
        let newRayData = getRayData(intersectRayData.pic);
        let index = 0;
        for (let picVector of newRayData.picVectors) {
            checkFrustum(picVector, newRayData.cam, newRayData.pic, thisObject, index, function () {
                let frustum = newRayData.pic;
                addToInterFrust(frustum);
            });
            index++;
        }
    }

    function findIndex(collisions, collider, bool) {
        let index = 0;
        if (collisions.length > 1) {
            for (let collision of collisions) {
                if (bool) {
                    ////console.log(collision.project +" "+ collider.parent.name +" && "+ collision.name +" "+ collider.name);
                }
                if (collision.project === collider.parent.id && collision.id === collider.id) {
                    return index;
                }
                index++;
            }
            return -1
        } else {
            /* if (collisions.project === collider.parent.name && collisions.name === collider.name) {
                 return 0;
             } else {
                 return -1
             }*/

            return -1
        }
    }
    //add to global variable containing all collisions and highlight collided frustums
    function addCollision(pic, collider) {
        if (!pic.userData.collisions) {
            pic.userData.collisions = [];
        }
        let collisions = pic.userData.collisions;
        let collisionData = {
            project: collider.parent.id,
            id: collider.id
        }
        let colExists = findIndex(collisions, collider);

        if (colExists == -1) {
            //////console.log("NEW COLLISION");
            //////console.log(collisionData);
            collisions.push(collisionData);
            pic.children[0].material.color.set(new THREE.Color("#ff0f0f"));
        }
    }
    //remove from global variable containing all collisions and unhighlight collided frustums
    function removeCollision(pic, collider) {
        ////console.log(pic);
        ////console.log(collider);

        let collisions = pic.userData.collisions;
        //////console.log(collisions);


        let index = 0;
        for (let collision of collisions) {
            let index = findIndex(collision, collider, true);
            ////console.log(index);
            collisions.splice(index);
        }
        if (collisions.length == 0) {
            pic.children[0].material.color.set(new THREE.Color("#ffffff"));
        }
    }
    //remove all collisions from thisPic
    function removeAllCollisions(pic) {
        let collisions = pic.userData.collisions;
        for (let collider of collisions) {
            removeCollision(pic, collider);
            removeCollision(pic, collider);
        }
    }
    //add collisions to new objects from colPics and 
    //delete all previously collided frustums in case they aren't colliding anymore
    function updateCollisions() {
        let collisions = thisPic.userData.collisions;
        if (collisions) {
            collisions = thisPic.userData.collisions.slice(0);
            //////console.log(collisions);
            for (let colPic of colPics) {
                addCollision(thisPic, colPic);
                addCollision(colPic, thisPic);
                let index = findIndex(collisions, colPic);
                collisions.splice(index);
            }
            if (collisions.length) {
                for (let collision of collisions) {
                    let otherPic = this.threeManager.state.projects.getObjectById(collision.project).getObjectById(collision.id);
                    ////console.log(1);
                    removeCollision(thisPic, otherPic);
                    ////console.log(2);

                    removeCollision(otherPic, thisPic);
                }
            }

        } else {
            for (let colPic of colPics) {
                addCollision(thisPic, colPic);
                addCollision(colPic, thisPic);
            }
        }
    }
    updateCollisions();
}