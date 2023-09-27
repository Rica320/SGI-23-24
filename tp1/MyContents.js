import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
  /**
       constructs the object
       @param {MyApp} app The application object
    */
  constructor(app) {
    this.app = app;
    this.axis = null;

    // box related attributes
    this.boxMesh = null;
    this.boxMeshSize = 1.0;
    this.boxEnabled = true;
    this.lastBoxEnabled = null;
    this.boxDisplacement = new THREE.Vector3(0, 2, 0);

    // plane related attributes
    // plane related attributes

    //texture

    this.planeTexture =
      new THREE.TextureLoader().load('textures/feup_b.jpg');

    this.planeTexture.wrapS = THREE.RepeatWrapping;

    this.planeTexture.wrapT = THREE.RepeatWrapping;

    // material

    this.diffusePlaneColor = "rgb(128,128,128)"

    this.specularPlaneColor = "rgb(0,0,0)"

    this.planeShininess = 0

    // relating texture and material:

    // two alternatives with different results

    // alternative 1
/*
    this.planeMaterial = new THREE.MeshPhongMaterial({

      color: this.diffusePlaneColor,

      specular: this.specularPlaneColor,

      emissive: "#000000", shininess: this.planeShininess,

      map: this.planeTexture
    })
*/
    // end of alternative 1

    // alternative 2

     this.planeMaterial = new THREE.MeshLambertMaterial({
            map : this.planeTexture });

    // end of alternative 2

    let plane = new THREE.PlaneGeometry(10, 10);
    // spotlight related attributes
    this.lightColor = 0xffffff;
    this.lightIntensity = 15;
    this.lightDistance = 8;
    this.lightAngle = 40;
    this.lightPenumbra = 0;
    this.lightDecay = 0;
    this.lightPosition = new THREE.Vector3(2, 5, 1);
    this.lightTarget = new THREE.Vector3(1, 0.1, 0); // TODO: why does nothing change here?

    // add a spot light
    this.spotLight = new THREE.SpotLight(
      this.lightColor,
      this.lightIntensity,
      this.lightDistance,
      THREE.MathUtils.degToRad(this.lightAngle),
      this.lightPenumbra,
      this.lightDecay
    );
    this.spotLight.position.copy(this.lightPosition);
    this.app.scene.add(this.spotLight.target);
    this.spotLight.target.position.copy(this.lightTarget);
  }

  /**
   * builds the box mesh with material assigned
   */
  buildBox() {
    let boxMaterial = new THREE.MeshPhongMaterial({
      color: "#ffff77",
      specular: "#000000",
      emissive: "#000000",
      shininess: 90,
      map: new THREE.TextureLoader().load("textures/feup_entry.jpg"),
    });

    // Create a Cube Mesh with basic material
    let box = new THREE.BoxGeometry(
      this.boxMeshSize,
      this.boxMeshSize,
      this.boxMeshSize
    );
    this.boxMesh = new THREE.Mesh(box, boxMaterial);
    this.boxMesh.rotation.x = -Math.PI / 2;
    this.boxMesh.position.y = this.boxDisplacement.y;
  }

  /**
   * initializes the contents
   */
  init() {
    // create once
    if (this.axis === null) {
      // create and attach the axis to the scene
      this.axis = new MyAxis(this);
      this.app.scene.add(this.axis);
    }

    // add a point light on top of the model
    const pointLight = new THREE.PointLight(0xffffff, 0, 0, 0);
    pointLight.position.set(0, 20, 0);
    //this.app.scene.add(pointLight);
    this.app.scene.add(this.spotLight);

    // add a point light helper for the previous point light
    const sphereSize = 0.5;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    this.app.scene.add(pointLightHelper);

    // add a spot light helper for the previous spot light
    const spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
    this.app.scene.add(spotLightHelper);


    //const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    //directionalLight.position.set(-5, 10, -2);

    /// TARGET with directional light
    this.buildBox();
    //this.app.scene.add(this.boxMesh);

    //directionalLight.target = this.boxMesh;

    //this.app.scene.add(directionalLight.target);
    //this.app.scene.add(directionalLight);





    //const directionalLightHelper = new THREE.DirectionalLightHelper(
    //directionalLight,
    //5
    //);
    // this.app.scene.add(directionalLightHelper);

    // add an ambient light
    const ambientLight = new THREE.AmbientLight(0x6f6f6f);
    this.app.scene.add(ambientLight);


    // add a area light (color, intensity, width, height)
    const areaLight = new THREE.RectAreaLight(0xf0ffff, 1500, 5, 5);
    areaLight.position.set(0, 3, 0);
    areaLight.rotateX(Math.PI / 2); // Rotate 90 degrees on the X-axis
    this.app.scene.add(areaLight);




    // TODO: Ask teacher about this

    // Create a Plane Mesh with basic material

    let planeSizeU = 10;
    let planeSizeV = 7;
    let planeUVRate = planeSizeV / planeSizeU;
    let planeTextureUVRate = 3354 / 2385; // image dimensions
    let planeTextureRepeatU = 1;
    let planeTextureRepeatV =
      planeTextureRepeatU * planeUVRate * planeTextureUVRate;
    this.planeTexture.repeat.set(
      planeTextureRepeatU, planeTextureRepeatV);
    this.planeTexture.rotation = 30 * Math.PI / 180;
    this.planeTexture.offset = new THREE.Vector2(0, 0);
    var plane = new THREE.PlaneGeometry(planeSizeU, planeSizeV);
    this.planeMesh = new THREE.Mesh(plane, this.planeMaterial);
    this.planeMesh.rotation.x = -Math.PI / 2;
    this.planeMesh.position.y = 0;
    this.app.scene.add(this.planeMesh);



    // Create a BoxGeometry to represent the area of the light
    const lightAreaGeometry = new THREE.BoxGeometry(5, 5, 0.1); // Width, Height, Depth (set depth as a small value)
    const lightAreaMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.35,
    }); // Green, semi-transparent material

    // Unlike other light sources, RectAreaLight does not emit light by default in Three.js
    const lightAreaMesh = new THREE.Mesh(lightAreaGeometry, lightAreaMaterial);
    lightAreaMesh.position.set(0, 3, 0); // Position it at the same location as the area light
    lightAreaMesh.rotateX(Math.PI / 2); // Rotate 90 degrees on the X-axis
    //this.app.scene.add(lightAreaMesh);
  }

  /**
   * updates the diffuse plane color and the material
   * @param {THREE.Color} value
   */
  updateDiffusePlaneColor(value) {
    this.diffusePlaneColor = value;
    this.planeMaterial.color.set(this.diffusePlaneColor);
  }
  /**
   * updates the specular plane color and the material
   * @param {THREE.Color} value
   */
  updateSpecularPlaneColor(value) {
    this.specularPlaneColor = value;
    this.planeMaterial.specular.set(this.specularPlaneColor);
  }
  /**
   * updates the plane shininess and the material
   * @param {number} value
   */
  updatePlaneShininess(value) {
    this.planeShininess = value;
    this.planeMaterial.shininess = this.planeShininess;
  }

  updateWrappingMode(d) {
    if (d === "Wrapping") {
      this.planeTexture.wrapS = THREE.ClampToEdgeWrapping;
      this.planeTexture.wrapT = THREE.ClampToEdgeWrapping;
    } else if (d === "Mirror") {
      this.planeTexture.wrapS = THREE.MirroredRepeatWrapping;
      this.planeTexture.wrapT = THREE.MirroredRepeatWrapping;
    }
     else {
      this.planeTexture.wrapS = THREE.RepeatWrapping;
      this.planeTexture.wrapT = THREE.RepeatWrapping;
    }

  }

  /**
   * rebuilds the box mesh if required
   * this method is called from the gui interface
   */
  rebuildBox() {
    // remove boxMesh if exists
    if (this.boxMesh !== undefined && this.boxMesh !== null) {
      this.app.scene.remove(this.boxMesh);
    }
    this.buildBox();
    this.lastBoxEnabled = null;
  }

  /**
   * updates the box mesh if required
   * this method is called from the render method of the app
   * updates are trigered by boxEnabled property changes
   */
  updateBoxIfRequired() {
    if (this.boxEnabled !== this.lastBoxEnabled) {
      this.lastBoxEnabled = this.boxEnabled;
      if (this.boxEnabled) {
        this.app.scene.add(this.boxMesh);
      } else {
        this.app.scene.remove(this.boxMesh);
      }
    }
  }

  // Update light color
  updateLightColor() {
    this.spotLight.color.set(this.lightColor);
  }

  // Update light intensity
  updateLightIntensity() {
    this.spotLight.intensity = this.lightIntensity;
  }

  // Update light distance
  updateLightDistance() {
    this.spotLight.distance = this.lightDistance;
  }

  // Update light angle
  updateLightAngle() {
    this.spotLight.angle = THREE.MathUtils.degToRad(this.lightAngle);
  }

  // Update light penumbra
  updateLightPenumbra() {
    this.spotLight.penumbra = this.lightPenumbra;
  }

  // Update light decay
  updateLightDecay() {
    this.spotLight.decay = this.lightDecay;
  }

  // Update light position
  updateLightPosition() {
    this.spotLight.position.copy(this.lightPosition);
  }

  // Update light target
  updateLightTarget() {
    this.spotLight.target.position.copy(this.lightTarget);
  }

  // ================= Light Updates =================

  /**
   * updates the contents
   * this method is called from the render method of the app
   *
   */
  update() {
    // check if box mesh needs to be updated
    this.updateBoxIfRequired();

    //console.log(this.spotLight.position);

    // sets the box mesh position based on the displacement vector
    this.boxMesh.position.x = this.boxDisplacement.x;
    this.boxMesh.position.y = this.boxDisplacement.y;
    this.boxMesh.position.z = this.boxDisplacement.z;
  }
}

export { MyContents };
