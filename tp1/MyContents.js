import * as THREE from 'three';

import { MyAxis } from './MyAxis.js';

import { MyNurbsBuilder } from './MyNurbsBuilder.js';

/**

 *  This class contains the contents of out application

 */

class MyContents {

    /**

       constructs the object

       @param {MyApp} app The application object

    */

    constructor(app) {

        this.app = app

        this.axis = null

        const map =

            new THREE.TextureLoader().load('textures/feup_entry.jpg');

        map.wrapS = map.wrapT = THREE.RepeatWrapping;

        map.anisotropy = 16;

        map.colorSpace = THREE.SRGBColorSpace;

        this.material = new THREE.MeshLambertMaterial({
            map: map,

            side: THREE.DoubleSide,

            transparent: true, opacity: 0.90
        });

        this.builder = new MyNurbsBuilder()

        this.meshes = []

        this.samplesU = 16         // maximum defined in MyGuiInterface

        this.samplesV = 18         // maximum defined in MyGuiInterface

        this.init()

        this.createNurbsSurfaces([   // U = 0

            [ // V = 0..1;

                [-2.0, -2.0, 0.0, 0.2],

                [-2.0, 2.0, 0.0, 1]

            ],

            // U = 1

            [ // V = 0..1

                [2.0, -2.0, 0.0, 1],

                [2.0, 2.0, 0.0, 1]

            ]

        ], [-4, 3, 0])

        this.createNurbsSurfaces([   // U = 0

            [ // V = 0..3;

                [-1.5, -1.5, 0.0, 1],

                [-2.0, -2.0, 2.0, 1],

                [-2.0, 2.0, 2.0, 1],

                [-1.5, 1.5, 0.0, 1]

            ],

            // U = 1

            [ // V = 0..3

                [0.0, 0.0, 3.0, 1],

                [0.0, -2.0, 3.0, 1],

                [0.0, 2.0, 3.0, 1],

                [0.0, 0.0, 3.0, 1]

            ],

            // U = 2

            [ // V = 0..3

                [1.5, -1.5, 0.0, 1],

                [2.0, -2.0, 2.0, 1],

                [2.0, 2.0, 2.0, 1],

                [1.5, 1.5, 0.0, 1]

            ]

        ], [-4, 0, 0])

        this.createNurbsSurfaces([   // U = 0

            [ // V = 0..2;

                [-2.0, -2.0, 1.0, 1],

                [0, -2.0, 0, 1],

                [2.0, -2.0, -1.0, 1]

            ],

            // U = 1

            [ // V = 0..2

                [-2.0, -1.0, -2.0, 1],

                [0, -1.0, -5.0, 1],

                [2.0, -1.0, 2.0, 1]

            ],

            // U = 2

            [ // V = 0..2

                [-2.0, 4.0, 5.0, 1],

                [0, 1.0, 1.5, 1],

                [4.0, 4.0, -35.0, 1]

            ],

            // U = 3

            [ // V = 0..2

                [-2.0, 2.0, -1.0, 1],

                [0, 2.0, 0, 1],

                [2.0, 32.0, 1.0, 1]

            ]

        ], [0, -3, 0])

    }



    /**

     * initializes the contents

     */

    init() {



        // create once

        if (this.axis === null) {

            // create and attach the axis to the scene

            this.axis = new MyAxis(this)

            this.app.scene.add(this.axis)

        }

        // add a point light on top of the model

        const pointLight = new THREE.PointLight(0xffffff, 1000, 0);

        pointLight.position.set(0, 20, 20);

        this.app.scene.add(pointLight);

        // add a point light helper for the previous point light

        const sphereSize = 0.5;

        const pointLightHelper =

            new THREE.PointLightHelper(pointLight, sphereSize);

        this.app.scene.add(pointLightHelper);

        // add an ambient light

        const ambientLight = new THREE.AmbientLight(0x555555);

        this.app.scene.add(ambientLight);

    }

    /**

     * removes (if existing) and recreates the nurbs surfaces

     */

    createNurbsSurfaces(controlPoints, pos) {

        // are there any meshes to remove?

        if (this.meshes !== null) {

            // traverse mesh array

            for (let i = 0; i < this.meshes.length; i++) {

                // remove all meshes from the scene

                this.app.scene.remove(this.meshes[i])

            }

            this.meshes = [] // empty the array  

        }



        // declare local variables

        let surfaceData;

        let mesh;

        let orderU = 1

        let orderV = 1

        // build nurb #1






        surfaceData = this.builder.build(controlPoints,

            orderU, orderV, this.samplesU,

            this.samplesV, this.material)

        mesh = new THREE.Mesh(surfaceData, this.material);

        mesh.rotation.x = 0

        mesh.rotation.y = 0

        mesh.rotation.z = 0

        mesh.scale.set(1, 1, 1)

        mesh.position.set(pos[0], pos[1], pos[2])

        this.app.scene.add(mesh)

        this.meshes.push(mesh)


    }
    /**

     * updates the contents

     * this method is called from the render method of the app

     *

     */

    update() {

    }

} export { MyContents };