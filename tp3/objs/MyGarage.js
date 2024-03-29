import * as THREE from "three";

/**
 * Represents a garage with animation functionality.
 */
export class MyGarage {
  /**
   * The duration of the animation in seconds.
   * @type {number}
   */
  static animationTime = 3;

  /**
   * Opens the garage door with animation.
   */
  static openGarage() {
    // search for the object named "door" in the objectModel
    const door = MyGarage.objectModel.getObjectByName("Door");

    if (MyGarage.clock == undefined) MyGarage.clock = new THREE.Clock();

    // open the door using animation rotation
    const angle = Math.PI / 2; // example angle value
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      angle
    );
    const keyFrameAnim = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      [0, MyGarage.animationTime],
      [0, 0, 0, 0, quaternion.x, quaternion.y, quaternion.z, quaternion.w] // pass the quaternion values as keyframes
    );
    const keyFrameClip = new THREE.AnimationClip("Door", 5, [keyFrameAnim]);
    MyGarage.mixer = new THREE.AnimationMixer(door);

    const action = MyGarage.mixer.clipAction(keyFrameClip);
    // Add an event listener for the end of the animation
    MyGarage.mixer.addEventListener("loop", (e) => {
      MyGarage.mixer.stopAllAction(); // Stop the animation mixer to prevent further updates
      door.rotateZ(angle);
    });

    action.play();
  }

  /**
   * Closes the garage door with animation.
   */
  static closeGarage() {
    const door = MyGarage.objectModel.getObjectByName("Door");

    // close the door using animation rotation
    const angle = Math.PI / 2; // example angle value
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      angle
    );
    const keyFrameAnim = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      [0, MyGarage.animationTime],
      [quaternion.x, quaternion.y, quaternion.z, quaternion.w, 0, 0, 0, 0] // pass the quaternion values as keyframes
    );
    const keyFrameClip = new THREE.AnimationClip("Door", 5, [keyFrameAnim]);
    MyGarage.mixer = new THREE.AnimationMixer(door);
    const action = MyGarage.mixer.clipAction(keyFrameClip);
    // Add an event listener for the end of the animation
    MyGarage.mixer.addEventListener("loop", (e) => {
      MyGarage.mixer.stopAllAction(); // Stop the animation mixer to prevent further updates
      door.rotateZ(-angle);
    });

    action.play();
  }

  /**
   * Updates the animation mixer if it exists and the clock is defined.
   */
  static update() {
    if (MyGarage.mixer !== undefined && MyGarage.clock != undefined) {
      const delta = MyGarage.clock.getDelta();
      MyGarage.mixer.update(delta);
    }
  }
}

// Static variables
MyGarage.clock = new THREE.Clock();
MyGarage.objectModel = new THREE.Group();
