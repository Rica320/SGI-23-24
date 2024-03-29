import * as THREE from "three";
import { MyMenu } from "./MyMenu.js";
import { MyPicker } from "./MyPicker.js";
import { MyGarage } from "../objs/MyGarage.js";
import { MyCar } from "../objs/MyCar.js";
import { TextSpriteDraw } from "./TextSpriteDraw.js";
import { MyPodium } from "./MyPodium.js";

/**
 * Represents a menu controller for the game.
 * @class
 */
export class MenuController {
  /**
   * Constructs a new MenuController object.
   * @param {Object} app - The application object.
   */
  constructor(app) {
    app.picker = new MyPicker(app);
    this.app = app;
    this.currentMenu = null;

    this.dropContentsLoaded = false;

    // store menus options
    this.difficulty = null;
    this.map = 0;
    this.availableMaps = 3;
    this.playerName = "Player";

    // load menus
    this.loadMenuMain();
    this.loadMenuPause();
    this.loadMenuEnd();
    this.loadMenuMapSelect();
    this.loadMenuDificultySelect();
    this.loadNameMenu();
    this.loadRulesMenu();
  }

  /**
   * Gets the difficulty level.
   * @returns {number} The difficulty level.
   */
  getDifficulty() {
    return this.difficulty;
  }

  /**
   * Gets the selected map.
   * @returns {number} The selected map.
   */
  getMap() {
    return this.map;
  }

  /**
   * Gets the player's name.
   * @returns {string} The player's name.
   */
  getPlayerName() {
    return this.playerName;
  }

  /**
   * Navigates to the specified menu.
   * @param {string} menu - The menu to navigate to.
   */
  gotoMenu(menu) {
    switch (menu) {
      case "main":
        this.currentMenu = this.mainMenu;
        break;
      case "pause":
        this.currentMenu = this.pauseMenu;
        break;
      case "mapSelect":
        this.currentMenu = this.MapSelectingMenu;
        break;
      case "dificultySelect":
        this.currentMenu = this.dificultySelectingMenu;
        break;
      case "dropObstacles":
        this.loadDropObstaclesMenu();
        this.dropObstaclesMenu();
        return;
      case "name":
        this.currentMenu = this.nameMenu;
        break;
      case "rules":
        this.currentMenu = this.rulesMenu;
        break;
      case "game":
        this.currentMenu = null;
        this.app.setActiveCamera("FirstPerson");
        if (this.app.contents.hasGameStarted) this.app.contents.unpauseGame();
        else this.app.contents.startCountdown();
        break;
      case "carSelect":
        this.garageLoad();
        return;
      case "end":
        this.app.MyHUD.setVisible(false);
        this.podium.setPodiumCamera();
        return;
      default:
        this.currentMenu = null;
        console.log(
          "Camera '" +
            menu +
            "' option not found. Using default perspective camera"
        );
        this.app.setActiveCamera("Perspective");
    }

    if (this.currentMenu) {
      this.app.MyHUD.setVisible(false);
      this.currentMenu.setCamera(this.app);
    } else {
      // Player is in game
      this.app.MyHUD.setVisible(true);
    }
  }

  /**
   * Loads the menu for pausing the game.
   */
  loadMenuPause() {
    this.pauseMenu = new MyMenu(this.app, "Pause Menu", -1200);
    this.pauseMenu.addButton("Resume", () => {
      this.gotoMenu("game");
    });
    this.pauseMenu.addButton("Exit", () => {
      this.app.contents.resetGame();
      this.gotoMenu("main");
    });

    // add menu to scene
    this.app.scene.add(this.pauseMenu.getMenu());
  }

  /**
   * Loads the menu for selecting a map.
   */
  loadMenuMapSelect() {
    this.MapSelectingMenu = new MyMenu(
      this.app,
      "Select Map",
      -1400,
      "left",
      0.8
    );

    this.MapSelectingMenu.addButton("Select", async () => {
      this.app.contents.loadTrack(this.map + 1);
      this.gotoMenu("dificultySelect");
    });
    this.MapSelectingMenu.addButton("Next", () => {
      this.map = (this.map + 1) % this.availableMaps;
      this.displayMap(group);
    });
    this.MapSelectingMenu.addButton("Go back", async () => {
      this.gotoMenu("name");
    });

    let group = this.MapSelectingMenu.getMenu();

    this.displayMap(group);

    // add menu to scene
    this.app.scene.add(group);
  }

  /**
   * Loads the menu for selecting a difficulty.
   */
  loadMenuDificultySelect() {
    this.dificultySelectingMenu = new MyMenu(
      this.app,
      "Select Dificulty",
      -1500
    );
    this.dificultySelectingMenu.addButton(
      "Easy",
      () => {
        this.difficulty = 1;
        this.toDropNumber = this.app.contents.myReader.difficultyObjs(
          this.difficulty
        );
        this.updateNumber();
        this.gotoMenu("carSelect");
      },
      0x00cc00
    );
    this.dificultySelectingMenu.addButton(
      "Medium",
      () => {
        this.difficulty = 2;
        this.toDropNumber = this.app.contents.myReader.difficultyObjs(
          this.difficulty
        );
        this.updateNumber();
        this.gotoMenu("dropObstacles");
      },
      0xcccc00
    );
    this.dificultySelectingMenu.addButton(
      "Hard",
      () => {
        this.difficulty = 3;
        this.toDropNumber = this.app.contents.myReader.difficultyObjs(
          this.difficulty
        );
        this.updateNumber();
        this.gotoMenu("dropObstacles");
      },
      0xff9900
    );

    this.dificultySelectingMenu.addButton("Go back", () => {
      this.gotoMenu("mapSelect");
    });

    // add menu to scene
    this.app.scene.add(this.dificultySelectingMenu.getMenu());
  }

  /**
   * Loads the menu for dropping obstacles.
   */
  loadDropObstaclesMenu() {
    if (this.dropContentsLoaded) return;
    this.dropContentsLoaded = true;

    // put a obstacleItem in the scene at 125, 110, 125
    if (!this.app.contents) return;
    let group = new THREE.Group();
    const obstacleItem = this.app.contents.myReader.obstacleItem;
    const obstacle = obstacleItem.clone();
    obstacle.scale.set(4, 4, 4);
    obstacle.rotation.x = Math.PI / 4;
    obstacle.rotation.z = Math.PI / 4;
    obstacle.position.set(-225, 100, 60);

    var spritey = TextSpriteDraw.makeTextSprite("Vel.Drop", {
      fontsize: 62,
      backgroundColor: { r: 0, g: 0, b: 0, a: 0.0 },
      textColor: { r: 255, g: 0, b: 0, a: 1.0 },
    });

    spritey.position.set(-225, 100, 10);

    spritey.name = "Vel.Drop";
    obstacle.name = "Vel.Drop";
    group.name = "Vel.Drop";
    // every child should have a name
    // change the children polygon0 to Vel.Drop
    let polygon0 = obstacle.getObjectByName("polygon0");
    if (polygon0) {
      polygon0.name = "Vel.Drop";
    }

    group.add(obstacle);
    group.add(spritey);

    this.app.scene.add(group);

    group = new THREE.Group();
    // create a new obstacle that its call direction and is right after the vel drop
    const direction = obstacleItem.clone();
    direction.scale.set(4, 4, 4);
    direction.rotation.x = Math.PI / 4;
    direction.rotation.z = Math.PI / 4;
    direction.position.set(-225, 100, 200);

    var spritey = TextSpriteDraw.makeTextSprite("Direction", {
      fontsize: 55,
      backgroundColor: { r: 0, g: 0, b: 0, a: 0.0 },
      textColor: { r: 255, g: 0, b: 0, a: 1.0 },
    });

    spritey.name = "Direction";
    direction.name = "Direction";
    group.name = "Direction";
    polygon0 = direction.getObjectByName("polygon0");
    if (polygon0) {
      polygon0.name = "Direction";
    }

    spritey.position.set(-225, 100, 150);

    group.add(direction);
    group.add(spritey);

    this.toDropNumber = this.app.contents.myReader.difficultyObjs(
      this.difficulty
    );
    this.updateNumber();

    this.app.scene.add(group);
  }

  /**
   * Decrements the number of obstacles needed
   * to be dropped and updates the display.
   */
  decrementNumber() {
    if (this.toDropNumber > 0) {
      this.toDropNumber--;
      this.updateNumber();
    }
  }

  /**
   * Updates the counter of dropped obstacles in the menu.
   */
  updateNumber() {
    if (this.numberTexture) this.app.scene.remove(this.numberTexture);
    this.numberTexture = TextSpriteDraw.makeTextSprite(this.toDropNumber, {
      fontsize: 145,
      fontface: "Arial",
      backgroundColor: { r: 0, g: 0, b: 0, a: 0.0 },
      textColor: { r: 0, g: 0, b: 0, a: 1.0 },
    });

    this.numberTexture.position.set(420, 100, 125);
    this.numberTexture.name = "Number";
    this.app.scene.add(this.numberTexture);
  }

  /**
   * Set the camera to the top camera to drop the obstacles.
   */
  dropObstaclesMenu() {
    this.app.MyHUD.setVisible(false);
    this.app.setActiveCamera("TopCamera");
  }

  /**
   * Loads the main menu.
   */
  loadMenuMain() {
    this.mainMenu = new MyMenu(this.app, "Kart Mania", -1700, "center", 0.8);
    this.mainMenu.addButton("Play", () => {
      this.gotoMenu("name");
    });
    this.mainMenu.addButton("Instructions", () => {
      this.gotoMenu("rules");
    });
    this.mainMenu.addButton("Exit", () => {
      window.history.go(-1);
    });

    let group = this.mainMenu.getMenu();

    const writer = new TextSpriteDraw();
    writer.write(group, -33, -17, 0.2, "FEUP | MEIC - 2023 ", 16, "0xffffff");
    writer.write(
      group,
      -33,
      -20,
      0.2,
      "Marco Rocha (up202004891)",
      16,
      "0xffffff"
    );
    writer.write(
      group,
      -33,
      -23,
      0.2,
      "Ricardo Matos (up202007962)",
      16,
      "0xffffff"
    );

    // add menu to scene
    this.app.scene.add(group);
  }

  /**
   * Loads the menu for entering the player's name.
   */
  loadNameMenu() {
    this.nameMenu = new MyMenu(this.app, "Enter your name", -1600);

    this.nameMenu.addText(this.playerName);

    this.nameMenu.addButton("Confirm", () => {
      this.gotoMenu("mapSelect");
    });

    this.nameMenu.addButton("Change", () => {
      while (true) {
        let name = prompt("Enter your name", this.playerName);
        if (name) {
          name = name.trim();
          let oldMenu = this.app.scene.getObjectByName("nameMenu");
          this.app.scene.remove(oldMenu);
          this.nameMenu.updateText(name, 0);
          this.app.scene.add(this.nameMenu.getMenu());
          this.playerName = name;
          break;
        } else alert("Please enter a valid name");
      }
    });

    this.nameMenu.addButton("Go back", () => {
      this.gotoMenu("main");
    });

    // add menu to scene
    const group = this.nameMenu.getMenu();
    group.name = "nameMenu";
    this.app.scene.add(group);
  }

  /**
   * Loads the menu for the game's rules.
   */
  loadRulesMenu() {
    this.rulesMenu = new MyMenu(this.app, "Instructions", -1300, "center", 0.5);
    this.rulesMenu.addText("Use WASD to move and ESC to pause");
    this.rulesMenu.addText("The first to complete all laps wins");
    this.rulesMenu.addText("Avoid obstacles and collect powerups");
    this.rulesMenu.addButton("Go back", () => {
      this.gotoMenu("main");
    });

    // add menu to scene
    this.app.scene.add(this.rulesMenu.getMenu());
  }

  /**
   * Loads the menu for the end of the game.
   */
  loadMenuEnd() {
    this.podium = new MyPodium(this.app);
    let menu = null;
    [this.endMenu, menu] = this.podium.loadMenuEnd();
    this.app.scene.add(menu);
  }

  // ========================= UTILS ===============================

  /**
   * Updates the end menu with the given parameters.
   *
   * @param {boolean} won - Indicates whether the player won or lost.
   * @param {number} time - The player's time.
   * @param {number} timeRival - The rival's time.
   * @param {string} difficulty - The difficulty level.
   */
  updateEndMenu(won, time, timeRival, difficulty) {
    let menu = null;
    [this.endMenu, menu] = this.podium.updateEndMenu(
      won,
      time,
      timeRival,
      difficulty
    );

    this.app.scene.add(menu);
  }

  /**
   * Selects a car and performs various actions related to car selection.
   * @param {Object} car - The car object to be selected.
   */
  selectCar(car) {
    this.app.audio.playSound("garage");
    MyGarage.closeGarage();

    this.carIndex = MyCar.availableCars.children.findIndex(
      (c) => c.name === car.name
    );

    let position = this.app.contents.myReader.getKeyPath()[0];
    let nextPosition = this.app.contents.myReader.getKeyPath()[1];

    if (this.carIndex === 0) this.app.audio.playSound("yoshi");
    else if (this.carIndex === 1) this.app.audio.playSound("mario");
    else if (this.carIndex === 2) this.app.audio.playSound("peach");

    let carPos = this.app.contents.myReader.flagRotate
      ? [position.x + 3, 0.1, position.z]
      : [position.x, 0.1, position.z + 3];

    this.app.contents.playerCam.defineSelfObj(
      new MyCar(0.5, 0.01, this.carIndex),
      carPos
    );

    // select randomly a car index that is not carIndex from 0 to 2
    this.rivalCarIndex = Math.floor(Math.random() * 10) % 3;
    while (this.rivalCarIndex === this.carIndex) {
      this.rivalCarIndex = Math.floor(Math.random() * 10) % 3;
    }

    this.app.contents.AICar.addAICar(this.app.scene, this.rivalCarIndex);

    // Calculate rotation to align the car to the next point
    let direction = new THREE.Vector3().subVectors(nextPosition, position);
    this.app.contents.playerCam.player.rotationSpeed = Math.atan2(
      direction.x,
      direction.z
    );
    this.app.contents.playerCam.player.rotation.y = Math.atan2(
      direction.x,
      direction.z
    );

    setTimeout(() => {
      this.gotoMenu("game");
    }, MyGarage.animationTime * 1000 + 0.1);
  }

  /**
   * Loads the garage scene and sets the active camera to "Garage".
   * Plays the "garage" sound and opens the garage once it is loaded.
   */
  garageLoad() {
    this.app.MyHUD.setVisible(false);
    this.app.setActiveCamera("Garage");
    this.app.cameras["Garage"].position.set(130, 6, 120);
    const checkGarageLoaded = setInterval(() => {
      if (MyGarage.objectModel.children.length > 0) {
        clearInterval(checkGarageLoaded);
        this.app.audio.playSound("garage");
        MyGarage.openGarage();
      }
    }, 100);
    const garage = new THREE.PerspectiveCamera(75, 0.2, 0.1, 1000);
    garage.position.set(160, 6, 120);
    garage.lookAt(new THREE.Vector3(120, 6, 120));
    this.app.cameras["Garage"] = garage;
  }

  /**
   * Displays a map in the specified group.
   *
   * @param {THREE.Group} group - The group in which the map will be displayed.
   */
  async displayMap(group) {
    if (this.currentMAP) group.remove(this.currentMAP);

    let map = await this.readTrackJson(this.map + 1);
    let points = [];
    let curve = new THREE.CatmullRomCurve3();

    for (let i = 0; i < map.track.length; i++)
      points.push(new THREE.Vector3(map.track[i].x, map.track[i].z, -0.1));

    curve.points = points;
    let tubeGeometry = new THREE.TubeGeometry(curve, 50, 1.5, 8, false);
    let tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    let tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tubeMesh.scale.set(0.1, 0.1, 0.1);
    tubeMesh.position.set(4, -12, 0);
    this.currentMAP = tubeMesh;
    group.add(tubeMesh);
  }

  /**
   * Reads the track data from a JSON file.
   * @param {number} trackNumber - The number of the track.
   * @returns {JSON} - Track data JSON object.
   */
  async readTrackJson(trackNumber) {
    const response = await fetch(`tracks/track_${trackNumber}.json`);
    const trackData = await response.json();
    return trackData;
  }
}
