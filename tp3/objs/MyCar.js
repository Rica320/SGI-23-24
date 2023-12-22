import * as THREE from "three";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";

export class MyCar extends THREE.Object3D {
  constructor(maxVel = 0.6, velInc = 0.01, carUsed = 0) {
    super();
    // VELOCITY
    this.maxVel = maxVel;
    this.velInc = velInc * 0.6;

    this.currVel = 0;
    this.velMultiplyer = 1;

    this.rotationSpeedInc = 0.02;
    this.rotationSpeed = -Math.PI / 2;
    this.maxRotation = (6 * Math.PI) / 16;

    // POSITION
    this.x = 0;
    this.y = 0;
    this.z = 0;


    // POWER UP
    this.powerUpEffect = false;
    this.collisionEffect = 3;


    this.add(MyCar.availableCars.children[carUsed].clone());

    this.carBB = new THREE.Box3().setFromObject(this); // bounding box

    let spritey = TextSpriteDraw.makeTextSprite(" YOU ", {
      fontsize: 20,
      textColor: { r: 255, g: 255, b: 255, a: 1.0 },
    });
    spritey.position.set(-2, 0.5, -1);

    this.add(spritey);
  }

  incRotation() {
    this.rotationSpeed += this.rotationSpeedInc;
    // if (this.rotationSpeed > this.maxRotation) this.rotationSpeed = this.maxRotation;
    this.rotatePlayer();
  }

  decRotation() {
    this.rotationSpeed -= this.rotationSpeedInc;
    // if (this.rotationSpeed < -this.maxRotation) this.rotationSpeed = -this.maxRotation;
    this.rotatePlayer();
  }
  normalizeRadian(angle) {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  rotatePlayer() {
    this.rotation.y = this.rotationSpeed;

    if (this.rotationSpeed > 0) {
      this.children[0].children[0].rotation.y =
        this.normalizeRadian(this.rotationSpeed) * 0.08;
      this.children[0].children[1].rotation.y =
        this.normalizeRadian(this.rotationSpeed) * 0.03;
      this.children[0].children[2].rotation.y =
        this.normalizeRadian(this.rotationSpeed) * 0.05;
    } else if (this.rotationSpeed < 0) {
      this.children[0].children[0].rotation.y =
        -this.normalizeRadian(this.rotationSpeed) * 0.08;
      this.children[0].children[1].rotation.y =
        -this.normalizeRadian(this.rotationSpeed) * 0.03;
      this.children[0].children[2].rotation.y =
        -this.normalizeRadian(this.rotationSpeed) * 0.05;
    }
  }

  hasPowerUpEffect() {
    return this.powerUpEffect;
  }


  getPos() {
    return [this.x, this.y, this.z];
  }

  setPos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  speedUp() {
    this.currVel += this.velInc;
    if (this.currVel > this.getMaxVel()) this.currVel = this.getMaxVel();
  }

  speedDown() {
    this.currVel -= this.velInc;

    if (this.currVel < -this.getMaxVel()) this.currVel = -this.getMaxVel();
  }

  friction() {
    const frictionCoefficient = 0.03;
    const frictionForce = -frictionCoefficient * this.currVel;
    this.currVel += frictionForce;
    if (Math.abs(this.currVel) < this.velInc) this.currVel = 0;
  }

  getMaxVel() {
    return this.maxVel * this.velMultiplyer;
  }

  getSpeed() {
    return this.currVel;
  }

  getSpeedInfo() {
    return [this.currVel, this.velMultiplyer];
  }

  collideCar() {
    this.velMultiplyer = 0.7;

    setTimeout( () => {
       this.velMultiplyer = 1;
    }, this.collisionEffect * 1000);
  }

}

MyCar.availableCars = new THREE.Group();
