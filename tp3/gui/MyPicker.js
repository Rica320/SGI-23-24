import * as THREE from "three";
import { TextSpriteDraw } from "./TextSpriteDraw.js";

/**
 * Represents a MyPicker object.
 * @class
 */

export class MyPicker {
  /**
   * Creates an instance of MyPicker.
   */
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.raycaster.near = 1;
    this.raycaster.far = 1000;

    this.pointer = new THREE.Vector2();
    this.intersectedObj = null;
    this.pickingHoverColor = "0xFFFFFF";
    this.pickingClickColor = "0xFFFF00";

    this.menu = null;
    this.app = null;

    this.availableLayers = ["none", 1, 2, 3, 4, 5, 6, 7, 8];
    this.selectedLayer = this.availableLayers[1];

    this.notPickableObjIds = [];

    document.addEventListener("pointermove", this.onPointerMove.bind(this));
    document.addEventListener("pointerdown", this.onPointerDown.bind(this));
    document.addEventListener("pointerup", this.pointerUp.bind(this));

    const geometry = new THREE.CircleGeometry(5, 10);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    });
    this.circle = new THREE.Mesh(geometry, material);
    this.circle.rotation.x += Math.PI / 2; // Rotate the circle
    this.circle.visible = false;
    this.circle.name = "POINTER";
    this.updateSelectedLayer();
  }

  /**
   * Sets the active menu.
   * @param {Object} menu - The menu object.
   */
  setActiveMenu(menu) {
    this.menu = menu;
    this.app = menu.app;
    this.app.scene.add(this.circle);
  }

  /**
   * Clears the active menu.
   */
  clearMenu() {
    this.menu = null;
    this.app = null;
  }

  /**
   * Sets the active layer.
   * @param {number} layer - The layer to set.
   * @throws {Error} If the layer is not available.
   */
  setActiveLayer(layer) {
    if (!this.availableLayers.includes(layer))
      throw new Error("Layer not available");
    this.selectedLayer = layer;
  }

  /**
   * Adds an object to the ignore list.
   * @param {Object} obj - The object to add.
   * @returns {Object} The added object.
   */
  addToIgnoreList(obj) {
    obj.name = "ignore_" + this.notPickableObjIds.length;
    this.notPickableObjIds.push(obj.name);
    return obj;
  }

  /**
   * Sets the layers of an object.
   * @param {Object} obj - The object to set the layers for.
   * @param {string} name - The name of the object.
   * @param {number} [layer=1] - The layer to set.
   * @throws {Error} If the layer is not available.
   * @returns {Object} The object with the updated layers.
   */
  setObjLayers(obj, name, layer = 1) {
    if (!this.availableLayers.includes(layer))
      throw new Error("Layer not available");
    obj.name = name;
    obj.layers.enable(this.availableLayers[layer]);
    return obj;
  }

  /**
   * Changes the color of an object.
   * @param {Object} obj - The object to change the color of.
   * @param {string} color - The color to change to.
   */
  changeTargetColor(obj, color) {
    if (this.lastPickedObj && this.lastPickedObj.name === obj.name) return;
    else this.app.audio.playSound("menuHover");

    if (this.lastPickedObj && this.lastPickedObj.material !== undefined)
      this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
    this.lastPickedObj = obj;
    this.lastPickedObj.currentHex = this.lastPickedObj.material.color.getHex();
    this.lastPickedObj.material.color.setHex(color);
  }

  /**
   * Restores the color of the last picked object.
   */
  restoreTargetColor() {
    if (this.lastPickedObj)
      this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
    this.lastPickedObj = null;
  }

  /**
   * Handles the pointer up event.
   * @param {Event} event - The pointer up event.
   */
  pointerUp(event) {
    if (this.app.activeCameraName === "TopCamera") {
      this.app.audio.playSound("menuSelect");

      if (this.selectedObs === "" || this.selectedObs == undefined) return;
      this.circle.visible = false;

      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      //2. set the picking ray from the camera position and mouse coordinates
      this.raycaster.setFromCamera(this.pointer, this.app.cameras["TopCamera"]);
      // the next function should be called on the up event
      if (
        this.menu.handleObstacleAdd(this.raycaster.ray.origin, this.selectedObs)
      ) {
        let copyCircle = this.circle.clone();
        copyCircle.position.set(
          this.raycaster.ray.origin.x,
          100,
          this.raycaster.ray.origin.z
        );
        copyCircle.visible = true;
        this.app.contents.myReader.groupp.add(copyCircle);
      }
      this.selectedObs = "";
      return;
    }

    this.restoreTargetColor();
  }

  /**
   * Changes the sprite color of an object.
   * @param {Object} obj - The object to change the color of.
   * @param {string} color - The color to change to.
   */
  changeSpriteColor(obj, color) {
    if (this.lastPickedObj && this.lastPickedObj.material !== undefined)
      this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
    this.lastPickedObj = obj;
    this.lastPickedObj.currentHex = this.lastPickedObj.material.color.getHex();
    this.lastPickedObj.material.color.setHex(color);
  }

  /**
   * Sets the car sprite color.
   * @param {Object} obj - The car object.
   * @param {string} color - The color to set.
   * @param {Object} parent - The parent object.
   */
  setCarSpriteColor(obj, color, parent) {
    //remove obj from parent and add a new object
    obj.CAR = parent;
    parent.remove(obj);

    obj = TextSpriteDraw.makeTextSprite(parent.name, {
      fontsize: 20,
      textColor: color,
      borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
      borderThickness: 6,
    });
    obj.position.set(4, 0, 0);
    obj.parent = parent;

    this.lastPickedCar = obj;
    parent.add(obj);
  }

  /**
   * Resets the last car sprite color.
   */
  resetLastCarSpriteColor() {
    if (this.lastPickedCar) {
      let parent = this.lastPickedCar.parent;
      parent.remove(this.lastPickedCar);
      this.lastPickedCar = null;
      let obj = TextSpriteDraw.makeTextSprite(parent.name, {
        fontsize: 20,
        textColor: { r: 255, g: 255, b: 255, a: 1.0 },
        borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
        borderThickness: 6,
      });
      obj.position.set(4, 0, 0);
      obj.parent = parent;

      parent.add(obj);
    }
  }

  /**
   * Helper function for picking objects.
   * @param {Array} intersects - The intersected objects.
   * @param {string} colorChange - The color to change to.
   */
  pickingHelper(intersects, colorChange) {
    if (intersects.length > 0) {
      let obj = intersects[0].object;

      // in garage mode for obstacles
      if (this.selectedLayer == 0) {
        // check the first object that has type Sprite
        obj = intersects.find(
          (intersect) => intersect.object instanceof THREE.Sprite
        );
        if (obj === undefined) return;
        obj = obj.object;
        let parent = obj.parent;

        this.resetLastCarSpriteColor();
        this.setCarSpriteColor(obj, { r: 255, g: 20, b: 20, a: 1.0 }, parent);

        return;
      }

      // Else is a menu button
      if (this.notPickableObjIds.includes(obj.name)) this.restoreTargetColor();
      else this.changeTargetColor(obj, colorChange);
    } else {
      this.resetLastCarSpriteColor();
      this.restoreTargetColor();
    }
  }

  /**
   * Updates the selected layer.
   */
  updateSelectedLayer() {
    this.raycaster.layers.enableAll();
    if (this.selectedLayer !== "none") {
      let selectedIndex = this.availableLayers[this.selectedLayer];
      this.raycaster.layers.set(selectedIndex);
    }
  }

  /**
   * Sets the selected layer.
   * @param {number} layer - The layer to set.
   */
  setSelectedLayer(layer) {
    this.selectedLayer = layer;
    this.updateSelectedLayer();
  }

  /**
   * Handles the pointer move event.
   * @param {Event} event - The pointer move event.
   */
  onPointerMove(event) {
    if (!this.menu) return;
    if (
      this.app.activeCameraName !== "MenuCamera" &&
      this.app.activeCameraName !== "Garage" &&
      this.app.activeCameraName !== "TopCamera"
    )
      return;

    let cam = this.app.activeCameraName;

    if (this.app.activeCameraName === "Garage") {
      this.setSelectedLayer(0);
    } else {
      this.setSelectedLayer(1);
    }

    // 1. set the mouse position with a coordinate system where the center
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    this.raycaster.setFromCamera(this.pointer, this.app.cameras[cam]);

    //3. compute intersections
    let intersects = this.raycaster.intersectObjects(this.app.scene.children);

    if (
      this.app.activeCameraName == "TopCamera" &&
      this.selectedObs != "" &&
      this.selectedObs != undefined
    ) {
      // Put a circle around the mouse
      const mouse = new THREE.Vector2();
      mouse.x = this.raycaster.ray.origin.x;
      mouse.y = this.raycaster.ray.origin.y - 30;
      mouse.z = this.raycaster.ray.origin.z;

      this.circle.position.set(mouse.x, mouse.y, mouse.z);
    }

    // 4. picking helper (change color of first intersected object)
    this.pickingHelper(intersects, this.pickingHoverColor);
  }

  /**
   * Handles the pointer down event.
   * @param {Event} event - The pointer down event.
   */
  onPointerDown(event) {
    if (!this.menu) return;
    if (
      this.app.activeCameraName !== "MenuCamera" &&
      this.app.activeCameraName !== "Garage" &&
      this.app.activeCameraName !== "TopCamera"
    )
      return;

    if (
      this.app.activeCameraName === "Garage" ||
      this.app.activeCameraName === "TopCamera"
    )
      this.setSelectedLayer(0);
    else this.setSelectedLayer(1);

    let cam = this.app.activeCameraName;

    // 1. set the mouse position with a coordinate system where the center
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    this.raycaster.setFromCamera(this.pointer, this.app.cameras[cam]);

    //3. compute intersections
    let intersects = this.raycaster.intersectObjects(this.app.scene.children);

    // 4. picking helper (change color of first intersected object)
    if (this.app.activeCameraName !== "TopCamera")
      this.pickingHelper(intersects, this.pickingClickColor);

    // if there are selected objects
    if (intersects.length > 0) {
      let obj = intersects[0].object;

      // if garage or top camera mode
      if (this.selectedLayer == 0) {
        obj = intersects.find(
          (intersect) => intersect.object instanceof THREE.Sprite
        );

        if (this.app.activeCameraName === "TopCamera") {
          console.log(intersects);
          obj = intersects.find(
            (intersect) =>
              intersect.object.name === "Direction" ||
              intersect.object.name === "Vel.Drop"
          );
          // is top camera mode for obstacles pick & drop
          if (obj == undefined || obj.object == undefined)
            this.selectedObs = "";
          else {
            this.selectedObs = obj.object.name;
            this.circle.visible = true;
          }
          return;
        }

        // is garage mode
        if (obj == undefined || obj.object == undefined) return;
        obj = obj.object.CAR;
        this.setCarSpriteColor(obj, { r: 0, g: 0, b: 0, a: 0 }, obj.parent);
        this.app.contents.menuController.selectCar(obj);
        return;
      }

      // Else is a menu button
      const buttonIndex = parseInt(obj.name.split("_").pop(), 10);
      this.app.audio.playSound("menuSelect");
      this.menu.handleButtonClick(buttonIndex);
    }
  }
}
