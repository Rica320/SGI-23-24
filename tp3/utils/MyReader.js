import * as THREE from "three";
import { ObjectBuilder } from "../builders/ObjectBuilder.js";
import { MyTree } from "../objs/MyTree.js";
import { CatmullTrack } from "./CatmullTrack.js";
import { MyGarage } from "../objs/MyGarage.js";
import { MyCar } from "../objs/MyCar.js";
import { TextSpriteDraw } from "../gui/TextSpriteDraw.js";
import { MyObstacle } from "../objs/MyObstacle.js";
import { MyPowerUp } from "../objs/MyPowerUp.js";
import { MyWater } from "../objs/MyWater.js";
import { ShaderLoader } from "../shaders/ShaderLoader.js";

/**
 * A class representing a MyReader.
 * @class
 */
export class MyReader {
  /**
   * The object type constants.
   * @type {Object}
   */
  static ObjectType = {
    OBSTACLE: "obstacle",
    POWERUP: "powerup",
  };

  /**
   * Constructs a new MyReader object.
   */
  constructor() {
    this.hitabbleObjs = [];

    // Setting the shaders for the boxes
    this.loadShader();
    this.constructor.BoxesShaders = this.shader.clone();
    this.constructor.BlockShaders = this.shader.clone();
    this.constructor.BlockShaders2 = this.shader.clone();

    const loader = new THREE.TextureLoader();
    this.grassTex = loader.load("scene/textures/grass.png");
    this.grassTex.wrapS = THREE.RepeatWrapping;
    this.grassTex.wrapT = THREE.RepeatWrapping;
    this.grassTex.repeat.set(20, 20);

    this.flagRotate = false;

    this.grassMat = new THREE.MeshPhongMaterial({
      map: this.grassTex,
      side: THREE.DoubleSide,
      color: 0x009900,
    });

    this.mountainMat = new THREE.MeshBasicMaterial({
      color: 0x442211, // Adjust color as needed
      map: new THREE.TextureLoader().load("assets/mountain.jpg"),
    });

    this.snowMat = new THREE.MeshBasicMaterial({
      color: 0xddddee, // Adjust color as needed
    });

    this.objBuilder = new ObjectBuilder();

    // Meshes for powerups and obstacles Items
    this.powerupItem = new THREE.Group();
    this.obstacleItem = new THREE.Group();

    this.trees = [];
    this.lake = null;
    this.indexLastObj = 0;
  }

  /**
   * Loads the shader for the boxes.
   */
  loadShader() {
    const [vert, frag] = ShaderLoader.get("shaders/boxPulse");

    this.shader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        map: { value: null },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
    });
  }

  /**
   * Reads a JSON file from the given file path.
   * @param {string} filePath - The file path of the JSON file.
   * @returns {Promise<Object>} A promise that resolves to the parsed JSON data.
   */
  async readJSON(filePath) {
    const response = await fetch(filePath);
    const data = await response.json();
    return data;
  }

  /**
   * Gets the control points.
   * @returns {THREE.Group} The control points group.
   */
  getControlPoints() {
    return this.controPointGroup;
  }

  /**
   * Loads the 3D models for powerups and obstacles.
   * @returns {Promise<void>} A promise that resolves when the models are loaded.
   */
  async loadObjs() {
    // define the meshes for powerups and obstacles
    await this.objBuilder.create3dModel(
      {
        filepath: "objs/block/BlockQuestion.obj",
      },
      "scene/",
      this.powerupItem
    );

    await this.objBuilder.create3dModel(
      {
        filepath: "objs/box/ItmPowderBox.obj",
      },
      "scene/",
      this.obstacleItem
    );

    await this.objBuilder.create3dModel(
      {
        filepath: "objs/garage/smallgarage.obj",
      },
      "scene/",
      MyGarage.objectModel
    );
  }

  /**
   * Builds the grid group for the given track number.
   * @param {number} track_number - The track number.
   * @returns {THREE.Group} The grid group.
   */
  async buildGridGroup(track_number) {
    const csvPath = "tracks/track_" + track_number + ".json";
    const json = await this.readJSON(csvPath);

    const group = new THREE.Group();

    // ADDING STUFF
    await this.loadObjs();
    this.addGarage(group);
    this.addTrackCurve(group, json);
    this.addMountains(group);

    // ================ LAKE =================

    json.lake.forEach((lake) => {
      this.addLake(group, lake.x, lake.z, lake.rotate);
    });

    // ================ FLAG =================

    let rotateFlag = json.flagRotate ? json.flagRotate : false;
    this.addFlag(group, rotateFlag);
    this.addCheckpoints(group, rotateFlag);

    // ================ GRASS =================

    // Create the plain of grass
    const squareGeometry = new THREE.PlaneGeometry(400, 400);
    const squareMesh = new THREE.Mesh(squareGeometry, this.grassMat);
    squareMesh.rotateX(-Math.PI / 2);
    squareMesh.position.set(130, 0, 130);
    group.add(squareMesh);

    // ================ OBSTACLES =================

    json.obstacles.forEach((obstacle) => {
      const obstacleMesh = this.createObstacle(obstacle.x, obstacle.z);
      let hitBB = new THREE.Box3().setFromObject(obstacleMesh);
      hitBB.position = obstacleMesh.position;
      // create the obstacle object
      let obstacleObj = new MyObstacle();
      obstacleObj.type = MyReader.ObjectType.OBSTACLE;
      obstacleObj.setBBox(hitBB);
      this.hitabbleObjs.push(obstacleObj);

      group.add(obstacleMesh);
    });

    // ================ POWERUPS =================

    json.powerups.forEach((powerup) => {
      const powerupMesh = this.createPowerup(powerup.x, powerup.z);
      let hitBB = new THREE.Box3().setFromObject(powerupMesh);
      hitBB.position = powerupMesh.position;
      let powerupObj = new MyPowerUp();
      powerupObj.setBBox(hitBB);
      powerupObj.type = MyReader.ObjectType.POWERUP;

      this.hitabbleObjs.push(powerupObj);
      group.add(powerupMesh);
    });

    this.powerupSize = json.powerups.length;

    // ================ TREES =================

    json.trees.forEach((tree) => {
      const treeMesh = this.createTree(tree.x, tree.z);
      this.trees.push(treeMesh);
      group.add(treeMesh);
    });

    this.addTreesCircle(group);
    this.gg = [];
    this.hitObs = [];
    this.groupp = group;

    return group;
  }

  /**
   * Adds the next obstacle to the group.
   */
  addNextObstacleToGroup() {
    if (this.indexLastObj >= this.gg.length) return;
    const obstacleMesh = this.gg[this.indexLastObj];
    this.groupp.add(obstacleMesh);
    // add hitobbj to hittable objs
    this.hitabbleObjs.push(this.hitObs[this.indexLastObj]);
    this.indexLastObj++;
  }

  /**
   * Gets the number of obstacles to drop based on the given difficulty.
   * @param {number} difficulty - The difficulty level.
   * @returns {number} The number of obstacles based on the difficulty level.
   */
  difficultyObjs(difficulty) {
    switch (difficulty) {
      case 1:
        return 0;
      case 2:
        return 5;
      case 3:
        return 9;
    }
    return 1;
  }

  /**
   * Adds an obstacle to the group.
   * @param {Object} pos - The position of the obstacle.
   * @param {string} name - The name of the obstacle.
   * @param {number} difficulty - The difficulty level of the obstacle.
   * @returns {boolean} True if all obstacles have been added, false otherwise.
   */
  addObstacle(pos, name, difficulty) {
    const obstacleMesh = this.createObstacle(pos.x, pos.z);
    obstacleMesh.name = name;
    let hitBB = new THREE.Box3().setFromObject(obstacleMesh);
    hitBB.position = obstacleMesh.position;
    // create the obstacle object
    let obstacleObj =
      name == "Direction" ? new MyObstacle(2, 0, 0, true) : new MyObstacle();
    obstacleObj.type = MyReader.ObjectType.OBSTACLE;
    obstacleObj.setBBox(hitBB);

    this.gg.push(obstacleMesh);
    this.hitObs.push(obstacleObj);

    return this.gg.length === this.difficultyObjs(difficulty);
  }

  /**
   * Adds the garage to the group.
   * @param {THREE.Group} group - The group to add the garage to.
   */
  addGarage(group) {
    MyGarage.objectModel.scale.set(0.05, 0.05, 0.05);

    let garageGroup = new THREE.Group();
    garageGroup.add(MyGarage.objectModel);
    garageGroup.position.set(120, 0.1, 120);
    const availableCars = MyCar.availableCars.clone();
    const carCount = availableCars.children.length;
    const spaceBetweenCars = 45 / (carCount + 1);

    for (let i = 0; i < carCount; i++) {
      let clone = availableCars.children[i].clone();
      clone.position.set(10, 0, spaceBetweenCars * i - 11);
      clone.rotateY(Math.PI / 2);
      clone.scale.set(3, 3, 3);

      var spritey = TextSpriteDraw.makeTextSprite(clone.name, {
        fontsize: 20,
        textColor: { r: 255, g: 255, b: 255, a: 1.0 },
        borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
        borderThickness: 6,
      });
      spritey.position.set(4, 0, 0);

      clone.add(spritey);
      garageGroup.add(clone);
    }

    group.add(garageGroup);
  }

  /**
   * Adds the track curve to the group.
   * @param {THREE.Group} group - The group to add the track curve to.
   * @param {Object} json - The JSON data for the track curve.
   */
  addTrackCurve(group, json) {
    // catmull curve from the json
    const points = [];
    json.track.forEach((point) => {
      points.push(new THREE.Vector3(point.x, 0, point.z));
    });

    this.makeCatmullCurve(group, points);

    this.controlPoints = points;

    // add a small translucid blue spehere to each control point
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.5,
    });

    this.controPointGroup = new THREE.Group();
    this.controPointGroup.name = "Track_ControlPoints";

    points.forEach((controlPoint) => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(...controlPoint);
      sphere.position.y += 0.5;
      sphere.visible = false;
      this.controPointGroup.add(sphere);
    });

    group.add(this.controPointGroup);
  }

  /**
   * Adds the checkpoints to the group.
   * @param {THREE.Group} group - The group to add the checkpoints to.
   * @param {boolean} rotateFlag - Whether to rotate the flag or not.
   */
  addCheckpoints(group, rotateFlag) {
    // Create a box geometry
    let boxGeometry = new THREE.BoxGeometry(10, 1, 2);
    let boxMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      visible: false,
    });

    // SET THE FIRST CHECKPOINT ON THE START OF THE TRACK
    let box1 = new THREE.Mesh(boxGeometry, boxMaterial);
    let pos = this.getKeyPath()[0];
    box1.position.set(pos.x, 0.5, pos.z);
    box1.name = "sector1";
    if (!rotateFlag) box1.rotateY(Math.PI / 2);
    group.add(box1);

    // SET THE SECOND CHECKPOINT ON THE MIDDLE OF THE TRACK
    boxGeometry = new THREE.BoxGeometry(25, 1, 25);
    let box2 = new THREE.Mesh(boxGeometry, boxMaterial);
    let middleIndex = Math.floor(this.getKeyPath().length / 2);
    pos = this.getKeyPath()[middleIndex];
    box2.position.copy(new THREE.Vector3(pos.x, 0, pos.z));
    box2.name = "sector2";
    group.add(box2);

    // Create bounding boxes
    let box1BB = new THREE.Box3().setFromObject(box1);
    let box2BB = new THREE.Box3().setFromObject(box2);
    box1.bbox = box1BB;
    box2.bbox = box2BB;
    this.checkpoints = [box2, box1];
  }

  /**
   * Adds the flag to the group.
   * @param {THREE.Group} group - The group to add the flag to.
   * @param {boolean} rotate - Whether to rotate the flag or not.
   */
  addFlag(group, rotate) {
    const pos = this.getKeyPath()[0];
    this.flagRotate = rotate;
    const flagMat = new THREE.TextureLoader().load("assets/finishFlag.jpg");

    this.endFlagMat = new THREE.MeshPhongMaterial({
      map: flagMat,
      side: THREE.DoubleSide,
      color: 0xffffff,
    });

    let endLine = new THREE.Group();

    // Poles
    let poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 15, 5, 5);
    let poleMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    let pole1 = new THREE.Mesh(poleGeo, poleMat);
    let pole2 = new THREE.Mesh(poleGeo, poleMat);
    pole1.position.set(0, -1, 0);
    pole2.position.set(10, -1, 0);

    // Flag
    let flagGeo = new THREE.PlaneGeometry(10, 5);
    let flag = new THREE.Mesh(flagGeo, this.endFlagMat);
    flag.position.set(5, 5, 0);

    endLine.add(pole1);
    endLine.add(pole2);
    endLine.add(flag);

    endLine.rotation.y = Math.PI / 2;

    if (rotate) {
      endLine.rotation.y = Math.PI;
      endLine.position.set(pos.x + 5, 6, pos.z);
    } else endLine.position.set(pos.x, 6, pos.z + 5);
    endLine.name = "endLine";

    // add a plane on the floor with the flag texture on the endline
    let planeGeo = new THREE.PlaneGeometry(5, 10);
    flagMat.wrapS = THREE.RepeatWrapping;
    flagMat.wrapT = THREE.RepeatWrapping;
    flagMat.repeat.set(1, 2);
    let planeMat = new THREE.MeshPhongMaterial({
      map: flagMat,
      side: THREE.DoubleSide,
      color: 0xffffff,
    });
    let plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.set(pos.x, 0.1, pos.z);
    plane.rotation.x = -Math.PI / 2;
    if (rotate) plane.rotation.z = Math.PI / 2;
    plane.name = "endLinePlane";
    group.add(plane);

    group.add(endLine);
  }

  /**
   * Gets the hittable objects.
   * @returns {Array} The hittable objects.
   */
  getHitabbleObjs() {
    return this.hitabbleObjs;
  }

  /**
   * Gets the trees.
   * @returns {Array} The trees.
   */
  getTrees() {
    return this.trees;
  }

  /**
   * Gets the lake.
   * @returns {THREE.Group} The lake.
   */
  getLake() {
    return this.lake;
  }

  /**
   * Creates a tree mesh at the specified position.
   * @param {number} x - The x-coordinate of the tree.
   * @param {number} y - The y-coordinate of the tree.
   * @returns {THREE.Mesh} The tree mesh.
   */
  createTree(x, y) {
    let tree = new MyTree("assets/trees/", 7);
    tree.position.set(x, 6.8, y);
    return tree;
  }

  /**
   * Creates a mountain mesh at the specified position.
   * @param {number} x - The x-coordinate of the mountain.
   * @param {number} y - The y-coordinate of the mountain.
   * @param {number} z - The z-coordinate of the mountain.
   * @returns {THREE.Mesh} The mountain mesh.
   */
  createMountainMesh(x, y, z) {
    const minHeight = 25;
    const maxHeight = 50;

    const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    // Calculate heights for the three parts
    const grassHeight = randomHeight / 3;
    const mountainHeight = randomHeight / 3;
    const snowHeight = randomHeight / 3;

    const startRadius = randomHeight * 0.3;
    const radiusLimit1 = startRadius * 0.7;
    const radiusLimit2 = radiusLimit1 * 0.6;
    const topRadius = Math.random() * (2 - 1) + 1;

    // Create three parts of the mountain
    const grassGeometry = new THREE.CylinderGeometry(
      radiusLimit1,
      startRadius,
      grassHeight,
      10,
      1
    );
    const mountainGeometry = new THREE.CylinderGeometry(
      radiusLimit2,
      radiusLimit1,
      mountainHeight,
      10,
      1
    );
    const snowGeometry = new THREE.CylinderGeometry(
      topRadius,
      radiusLimit2,
      snowHeight,
      10,
      1
    );

    // Create meshes for each part
    const grassMesh = new THREE.Mesh(grassGeometry, this.grassMat);
    const mountainMesh = new THREE.Mesh(mountainGeometry, this.mountainMat);
    const snowMesh = new THREE.Mesh(snowGeometry, this.snowMat);

    // Set positions for each part
    grassMesh.position.set(x, y, z);
    mountainMesh.position.set(x, y + grassHeight, z);
    snowMesh.position.set(x, y + grassHeight + mountainHeight, z);

    // Create a group to hold all parts
    const mountainGroup = new THREE.Group();
    mountainGroup.add(grassMesh);
    mountainGroup.add(mountainMesh);
    mountainGroup.add(snowMesh);
    mountainGroup.position.y -= randomHeight * 0.25;

    // randomize 5 places in x and z
    const randomX = Math.random() * 10 - 5;
    const randomZ = Math.random() * 10 - 5;
    mountainGroup.position.x += randomX;
    mountainGroup.position.z += randomZ;

    return mountainGroup;
  }

  /**
   * Adds trees in a circular pattern to the given group.
   *
   * @param {THREE.Group} group - The group to add the trees to.
   */
  addTreesCircle(group) {
    const numCones = 70;
    const radius = 170;
    const forest = new THREE.Group();
    for (let i = 0; i < numCones; i++) {
      const angle = (i / numCones) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      const randomX = Math.random() * 10 - 5;
      const randomZ = Math.random() * 10 - 5;
      let tree = this.createTree(x + randomX, z + randomZ);

      forest.add(tree);
      this.trees.push(tree);
    }
    forest.position.set(125, 0, 125);
    group.add(forest);
  }

  /**
   * Adds mountains to the given group.
   * @param {THREE.Group} group - The group to which the mountains will be added.
   */
  addMountains(group) {
    const mountains = new THREE.Group();
    const numCones = 120;
    const radius = 200;

    for (let i = 0; i < numCones; i++) {
      const angle = (i / numCones) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      let mountain = this.createMountainMesh(x, 10, z);
      mountains.add(mountain);
    }

    mountains.position.set(125, 0, 125);
    group.add(mountains);
  }

  /**
   * Adds a lake to the specified group at the given coordinates.
   * @param {THREE.Group} group - The group to add the lake to.
   * @param {number} x - The x-coordinate of the lake's position.
   * @param {number} z - The z-coordinate of the lake's position.
   * @param {boolean} rotate - Whether to rotate the lake or not.
   */
  addLake(group, x, z, rotate) {
    const lake = new MyWater(10, 10, true);
    lake.position.set(x, 0.05, z);
    if (rotate) lake.rotateY(Math.PI / 2);
    group.name = "lake";
    this.lake = lake;
    group.add(lake);
  }

  /**
   * Create materials for the curve elements: the mesh, the line and the wireframe
   */
  createCurveMaterialsTextures() {
    const texture = new THREE.TextureLoader().load("./assets/menu.jpg");
    // texture.wrapS = THREE.RepeatWrapping;

    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      // color: 0x1b1b19,
      // emissive: 0xdddddd,
      // wireframe:  true
    });

    // this.material.map.repeat.set(3, 3);
    this.material.map.wrapS = THREE.RepeatWrapping;
    this.material.map.wrapT = THREE.RepeatWrapping;

    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      opacity: 0.3,
      wireframe: true,
      transparent: true,
    });

    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  }

  /**
   * Creates a Catmull-Rom curve and adds it to the specified group.
   * @param {THREE.Group} group - The group to add the curve mesh to.
   * @param {THREE.Vector3[]} points - The points defining the curve.
   */
  makeCatmullCurve(group, points) {
    // points.push(points[0]);
    const curve = new THREE.CatmullRomCurve3(points);

    this.pathPoints = curve.getPoints(100);
    this.trackPoints = curve.getPoints(150);

    this.TRACK_SIZE = 11;
    const catmullTrack = new CatmullTrack(
      curve,
      this.TRACK_SIZE,
      0.1,
      this.TRACK_SIZE,
      16
    );

    this.createCurveMaterialsTextures();

    this.material.vertexColors = true;
    this.material.needsUpdate = true;

    const mesh = new THREE.Mesh(catmullTrack.geometry, this.material);

    mesh.scale.set(1, 1, 1);
    group.add(mesh);
  }

  /**
   * Returns the key path with modified y-coordinates.
   * @returns {Array} The modified key path.
   */
  getKeyPath() {
    let path = [...this.pathPoints];
    for (let i = 0; i < path.length; i++) {
      path[i].y += 0.47;
    }
    return this.pathPoints;
  }

  /**
   * Creates a powerup item at the specified coordinates.
   *
   * @param {number} x - The x-coordinate of the powerup item.
   * @param {number} y - The y-coordinate of the powerup item.
   * @returns {Object} The created powerup item.
   */
  createPowerup(x, y) {
    const item = this.powerupItem.clone();
    for (let child of item.children) {
      child.material = MyReader.BoxesShaders;
    }
    item.material = MyReader.BoxesShaders;
    item.position.set(x, 0.15, y);
    item.rotateX(Math.PI / 2);
    item.scale.set(0.015, 0.015, 0.015);
    return item;
  }

  /**
   * Creates an obstacle item at the specified coordinates.
   * @param {number} x - The x-coordinate of the obstacle.
   * @param {number} y - The y-coordinate of the obstacle.
   * @returns {Object3D} - The created obstacle item.
   */
  createObstacle(x, y) {
    const item = this.obstacleItem.clone();
    for (let child of item.children) {
      child.material = MyReader.BoxesShaders;
    }
    item.material = MyReader.BoxesShaders;
    item.position.set(x, 0.8, y);
    item.scale.set(0.1, 0.1, 0.1);
    return item;
  }
}
