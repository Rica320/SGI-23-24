import * as THREE from "three";
import { Fire } from "./fire.js";

/**
 * Cake class
 */
export class Cake extends THREE.Object3D {
  loader = new THREE.TextureLoader();

  // ==================== MATERIALS ====================

  candleMaterial = new THREE.MeshStandardMaterial({
    color: 0xfaf7c4,
    roughness: 0.8,
    metalness: 0.9,
  });

  fireMaterial = new THREE.MeshPhongMaterial({
    color: "#ff5000",
    specular: "#ffA000",
    emissive: "#ff0000",
    shininess: 30,
  });

  plateMaterial = new THREE.MeshPhongMaterial({
    color: "#c0c0c0",
    specular: "#ffffff",
    emissive: "#000000",
    shininess: 30,
  });

  cakeMaterial = new THREE.MeshPhongMaterial({
    color: "#5C4033",
    specular: "#222222",
    emissive: "#000000",
    shininess: 30,
    map: this.loader.load("textures/cake.jpg"),
    normalMap: this.loader.load("textures/cakeN.jpg"),
  });

  // ==================== CONSTRUCTOR ====================

  constructor(
    radius,
    height,
    radialSegments,
    heightSegments,
    openEnded,
    startAngle,
    endAngle
  ) {
    super();

    this.showShader = false;
    this.candleStringMesh = null;

    // Create the original cake geometry
    this.cakeGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      radialSegments,
      heightSegments,
      openEnded,
      startAngle,
      endAngle
    );

    const positions = this.cakeGeometry.attributes.position.array;

    const points = [];
    for (let i = 0; i < positions.length; i += 3) {
      points.push(
        new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
      );
    }

    // candle
    this.candle = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 32);
    this.candle.scale(1.0, 1.5, 1.0);
    this.candle.translate(0, height / 2.0 + 0.4, -0.2);

    // fire
    this.fire = new THREE.ConeGeometry(0.06, 0.25, 32);
    this.fire.scale(2.3, 1.5, 2.3);
    this.fire.translate(0, height / 2.0 + 1.1, -0.2);

    // sides to close the cake
    const oneSide = new THREE.BoxGeometry(radius, height, 0.05);
    const otherSide = new THREE.BoxGeometry(radius, height, 0.05);

    // place oneSide on the endangle of the cake
    oneSide.translate(radius / 2, 0, 0);
    oneSide.rotateY(-startAngle);
    otherSide.translate(radius / 2, 0, 0);
    otherSide.rotateY(-(startAngle - endAngle));

    // Create a mesh using the resulting geometry and the specified material
    this.cakeMesh = new THREE.Mesh(this.cakeGeometry, this.cakeMaterial);
    this.oneSideMesh = new THREE.Mesh(oneSide, this.cakeMaterial);
    this.otherSideMesh = new THREE.Mesh(otherSide, this.cakeMaterial);

    // ==================== SHADOWS ====================

    this.cakeMesh.castShadow = true;
    this.cakeMesh.receiveShadow = true;

    this.oneSideMesh.castShadow = true;
    this.oneSideMesh.receiveShadow = true;

    this.otherSideMesh.castShadow = true;
    this.otherSideMesh.receiveShadow = true;

    // adding a candle string
    const candleString = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 32);
    candleString.translate(0, height / 2.0 + 0.2, -0.2);
    this.candleStringMesh = new THREE.Mesh(
      candleString,
      new THREE.MeshPhongMaterial({
        color: "#fcfcfc",
        shininess: 30,
      })
    );

    this.candleMesh = new THREE.Mesh(this.candle, this.candleMaterial);
    this.fireMesh = new THREE.Mesh(this.fire, this.fireMaterial);

    // ==================== SHADOWS ====================

    this.candleStringMesh.castShadow = true;
    this.candleStringMesh.receiveShadow = true;

    this.candleMesh.castShadow = true;
    this.fireMesh.castShadow = true;

    this.candleMesh.castShadow = true;
    this.candleMesh.receiveShadow = true;

    // Dish
    const dish = new THREE.CylinderGeometry(1.3, 1, 0.25, 32);
    const dishMesh = new THREE.Mesh(dish, this.plateMaterial);

    dishMesh.castShadow = true;
    dishMesh.receiveShadow = true;

    dishMesh.scale.set(4, 2, 4);
    dishMesh.translateY(-0.6);
    this.candleStringMesh.translateY(0.6);
    this.cakeMesh.translateY(1);

    // ==================== DISPLAY ====================

    this.cakeMesh.add(dishMesh);
    this.cakeMesh.add(this.oneSideMesh);
    this.cakeMesh.add(this.otherSideMesh);
    this.cakeMesh.add(this.candleMesh);
    this.cakeMesh.add(this.candleStringMesh);
    this.add(this.cakeMesh);

    this.setFire();

    this.cakeMesh.add(this.fireMesh);
  }

  /**
   * Set the fire shader
   */
  setFire() {
    const candle_params = {
      color1: 0xffffff,
      color2: 0xff9000,
      color3: 0x000000,
      windX: 0.0,
      windY: 0.0,
      colorBias: 0.3,
      burnRate: 3,
      diffuse: 3.3,
      viscosity: 25,
      expansion: 0.01,
      swirl: 500.5,
      drag: 50.0,
      airSpeed: 8.0,
      speed: 500.0,
      massConservation: false,
    };

    const plane = new THREE.PlaneGeometry(3, 3);
    this.fire = new Fire(plane, {
      textureWidth: 512,
      textureHeight: 512,
      debug: false,
    });

    this.fire.rotateY(Math.PI / 2);
    this.fire.translateY(2.3);
    this.fire.translateX(0.2);

    // set parameters for realistic fire
    this.fire.addSource(0.5, 0.1, 0.1, 1.0, 0.0, 1.0);
    this.fire.color1.set(candle_params.color1);
    this.fire.color2.set(candle_params.color2);
    this.fire.color3.set(candle_params.color3);
    this.fire.colorBias = candle_params.colorBias;
    this.fire.burnRate = candle_params.burnRate;
    this.fire.diffuse = candle_params.diffuse;
    this.fire.viscosity = candle_params.viscosity;
    this.fire.expansion = candle_params.expansion;
    this.fire.swirl = candle_params.swirl;
    this.fire.drag = candle_params.drag;
    this.fire.airSpeed = candle_params.airSpeed;
    this.fire.speed = candle_params.speed;
    this.fire.massConservation = candle_params.massConservation;
  }

  /**
   * Update the shader condition. If true, the shader is on, otherwise it is off
   * @param {boolean} bool - true if the shader is on, false otherwise
   */
  updateShaderCondition(bool) {
    this.showShader = bool;
    if (this.showShader) {
      // add shader fire and remove a normal mesh fire
      this.cakeMesh.remove(this.fireMesh);
      this.candleStringMesh.add(this.fire);
    } else {
      // remove shader fire and add a normal mesh fire
      this.candleStringMesh.remove(this.fire);
      this.cakeMesh.add(this.fireMesh);
    }
  }
}
