import * as THREE from "three";
import { ObjectBuilder } from "./builders/ObjectBuilder.js";

export class GridParser {
  constructor() {
    // Textures
    const loader = new THREE.TextureLoader();
    this.greenTileTex = loader.load("scene/textures/grass.png");
    this.greyTileTex = loader.load("scene/textures/asphalt.jpg");
    this.endFlagTex = loader.load("scene/textures/finishFlag.jpg");
    this.metalTex = loader.load("scene/textures/metal.jpg");

    // Materials
    this.greenTileMat = new THREE.MeshPhongMaterial({
      map: this.greenTileTex,
      side: THREE.DoubleSide,
      color: 0x009900,
    });
    this.greyTileMat = new THREE.MeshPhongMaterial({
      map: this.greyTileTex,
      side: THREE.DoubleSide,
      color: 0xA0A0A0,
    });
    this.endFlagMat = new THREE.MeshPhongMaterial({
      map: this.endFlagTex,
      side: THREE.DoubleSide,
      color: 0xffffff,
    });
    this.metalMat = new THREE.MeshPhongMaterial({
      map: this.metalTex,
      side: THREE.DoubleSide,
      color: 0x060606,
      shininess: 100,
      specular: 0xaaaaaa,
    });

    this.objBuilder = new ObjectBuilder();
  }

  async buildGridGroup(track_number) {
    const csvPath = "tracks/track_" + track_number + ".csv";
    const csv = await this.readCSV(csvPath);
    const rows = csv.trim().split("\n");

    const group = new THREE.Group();

    for (let i = 0; i < rows.length; i++) {
      const columns = rows[i].split(",");

      for (let j = 0; j < columns.length; j++) {
        const value = parseInt(columns[j]);

        const xy1 = [5 * i, 5 * j];
        const xy2 = [5 * (i + 1), 5 * (j + 1)];

        let obj = null;
        let geo = this.objBuilder.createTileGeometry(xy1, xy2);

        switch (value) {
          case 0:
            obj = new THREE.Mesh(geo, this.greenTileMat);
            break;
          case 1:
            obj = new THREE.Mesh(geo, this.greyTileMat);
            break;
          case 2:
            obj = new THREE.Mesh(geo, this.endFlagMat);
            break;
          case 3:
            obj = new THREE.Mesh(geo, this.greyTileMat);
            break;
          case 4:
            obj = new THREE.Mesh(geo, this.greyTileMat);
            break;
          default:
            console.error("Invalid value in CSV");
            break;
        }

        group.add(obj);
      }
    }

    group.rotateX(Math.PI / 2);

    return group;
  }

  async readCSV(csvPath) {
    try {
      const parsedData = await this.fetchCSV(csvPath);
      return parsedData;
    } catch (error) {
      console.error(error);
      throw error; // Propagate the error
    }
  }

  async fetchCSV(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load CSV file");
      }

      const csvData = await response.text();
      return csvData;
    } catch (error) {
      console.error(error);
      throw error; // Propagate the error
    }
  }
}
