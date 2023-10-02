import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { MyApp } from "./MyApp.js";
import { MyContents } from "./MyContents.js";

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface {
  /**
   *
   * @param {MyApp} app The application object
   */
  constructor(app) {
    this.app = app;
    this.datgui = new GUI();
    this.contents = null;
  }

  /**
   * Set the contents object
   * @param {MyContents} contents the contents objects
   */
  setContents(contents) {
    this.contents = contents;
  }

  /**
   * Initialize the gui interface
   */
  init() {
    // add a folder to the gui interface for the box
    const boxFolder = this.datgui.addFolder("Box");
    // note that we are using a property from the contents object
    boxFolder
      .add(this.contents, "boxMeshSize", 0, 10)
      .name("size")
      .onChange(() => {
        this.contents.rebuildBox();
      });
    boxFolder.add(this.contents, "boxEnabled", true).name("enabled");
    boxFolder.add(this.contents.boxDisplacement, "x", -5, 5);
    boxFolder.add(this.contents.boxDisplacement, "y", -5, 5);
    boxFolder.add(this.contents.boxDisplacement, "z", -5, 5);
    boxFolder.open();

    const data = {
      "diffuse color": this.contents.diffusePlaneColor,
      "specular color": this.contents.specularPlaneColor,
    };

    // adds a folder to the gui interface for the plane
    const planeFolder = this.datgui.addFolder("Plane");
    planeFolder.addColor(data, "diffuse color").onChange((value) => {
      this.contents.updateDiffusePlaneColor(value);
    });
    planeFolder.addColor(data, "specular color").onChange((value) => {
      this.contents.updateSpecularPlaneColor(value);
    });
    planeFolder
      .add(this.contents, "planeShininess", 0, 1000)
      .name("shininess")
      .onChange((value) => {
        this.contents.updatePlaneShininess(value);
      });
    planeFolder.open();

    // adds a folder to the gui interface for the camera
    const cameraFolder = this.datgui.addFolder("Camera");
    cameraFolder
      .add(this.app, "activeCameraName", [
        "Perspective",
        "Left",
        "Top",
        "Front",
      ])
      .name("active camera");
    // note that we are using a property from the app
    cameraFolder
      .add(this.app.activeCamera.position, "x", 0, 10)
      .name("x coord");
    cameraFolder.open();

    // ... your existing code ...

    const textFolder = this.datgui.addFolder("Textures");

    /*
    textFolder
      .add(this.contents, "Wrapping mode")
      .name("Wrapping mode")
      .onChange(() => {
        this.contents.updateWrappingMode();
      });
    */

    textFolder
      .add(this.contents, "wrapping", [
        "Wrapping",
        "Mirror",
        "Top",
      ])
      .name("active camera").onChange((d) => {
        this.contents.updateWrappingMode(d);
      });

    textFolder.add(this.contents, "repeatS", 0, 10).name("repeatS").onChange((value) => {
      this.contents.updateRepeatS(value);
    });

    textFolder.add(this.contents, "repeatT", 0, 10).name("repeatT").onChange((value) => {
      this.contents.updateRepeatT(value);
    });

    textFolder.add(this.contents, "offU", 0, 10).name("offU").onChange(() => {
      this.contents.updateOFF();
    });

    textFolder.add(this.contents, "offV", 0, 10).name("offV").onChange((value) => {
      this.contents.updateOFF();

    });

    textFolder.add(this.contents, "rot", 0, Math.PI).name("rot").onChange(() => {
      this.contents.rotation();
    });
    

    const lightFolder = this.datgui.addFolder("Light");

    // a. Cor: branca
    lightFolder
      .addColor(this.contents, "lightColor")
      .name("Cor")
      .onChange(() => {
        this.contents.updateLightColor();
      });

    // b. Intensidade: 15
    lightFolder
      .add(this.contents, "lightIntensity", 0, 30)
      .name("Intensidade")
      .onChange(() => {
        this.contents.updateLightIntensity();
      });

    // c. Distância limite: 8
    lightFolder
      .add(this.contents, "lightDistance", 0, 20)
      .name("Distância limite")
      .onChange(() => {
        this.contents.updateLightDistance();
      });

    // d. Ângulo de spot: 40º
    lightFolder
      .add(this.contents, "lightAngle", 0, 90)
      .name("Ângulo de spot")
      .onChange(() => {
        this.contents.updateLightAngle();
      });

    // e. Penumbra: 0
    lightFolder
      .add(this.contents, "lightPenumbra", 0, 1)
      .name("Penumbra")
      .onChange(() => {
        this.contents.updateLightPenumbra();
      });

    // f. Decaimento: 0
    lightFolder
      .add(this.contents, "lightDecay", 0, 2)
      .name("Decaimento")
      .onChange(() => {
        this.contents.updateLightDecay();
      });

    // g. Posição: (2,5,1)
    const lightPosition = lightFolder.addFolder("Posição");
    lightPosition
      .add(this.contents.lightPosition, "x", -10, 10)
      .name("x")
      .onChange(() => {
        this.contents.updateLightPosition();
      });
    lightPosition
      .add(this.contents.lightPosition, "y", -10, 10)
      .name("y")
      .onChange(() => {
        this.contents.updateLightPosition();
      });
    lightPosition
      .add(this.contents.lightPosition, "z", -10, 10)
      .name("z")
      .onChange(() => {
        this.contents.updateLightPosition();
      });

    // h. Target: (1,0.1)
    const lightTarget = lightFolder.addFolder("Target");
    lightTarget
      .add(this.contents.lightTarget, "x", -10, 10)
      .name("x")
      .onChange(() => {
        this.contents.updateLightTarget();
      });
    lightTarget
      .add(this.contents.lightTarget, "y", -10, 10)
      .name("y")
      .onChange(() => {
        this.contents.updateLightTarget();
      });
    lightTarget
      .add(this.contents.lightTarget, "z", -10, 10)
      .name("z")
      .onChange(() => {
        this.contents.updateLightTarget();
      });
  }
}

export { MyGuiInterface };
