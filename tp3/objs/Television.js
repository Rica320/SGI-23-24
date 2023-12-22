import * as THREE from "three";

export class Television {
  constructor(scene, camera, render) {
    this.scene = scene;
    this.camera = camera;
    this.width = 30;
    this.height = 20;

    this.render = render;

    this.camera.position.z = 5;
    this.depthTexture = new THREE.DepthTexture(
      window.innerWidth,
      window.innerHeight
    );
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        depthBuffer: true,
        depthTexture: this.depthTexture,
      }
    );
    this.renderTarget.depthTexture.format = THREE.DepthFormat;
    this.renderTarget.depthTexture.type = THREE.UnsignedShortType;

    // Create a plane geometry to represent the television screen
    const geometry = new THREE.PlaneGeometry(this.width, this.height, 100, 100);
    // Create a shader material
    this.material = new THREE.ShaderMaterial({
      vertexShader: `
                    uniform sampler2D renderBuffer;
                    varying vec2 vUv;
  
                    void main() {
                      vUv = uv;

                      vec4 newPosition = modelViewMatrix * vec4(position, 1.0);
                      // newPosition.z += vDepth * 10.0; 
                      // 
                      // // Set the transformed position
                      gl_Position = projectionMatrix * newPosition;
                    }
                    `,
      fragmentShader: `
                    #include <packing>
                    uniform sampler2D renderTexture;
                    uniform sampler2D renderBuffer;
                    varying vec2 vUv;

                    uniform float cameraNear;
			              uniform float cameraFar;

                    /*
                    float perspectiveDepthToViewZ(float depth, float near, float far) {
                      return (near * far) / ( (depth * (far - near)) - far);
                    }

                    float viewZToOrthographicDepth(float viewZ, float near, float far) {
                      return (viewZ + near) / (near - far);
                    }*/
                    
                    float readDepth( sampler2D depthSampler, vec2 coord ) {
                      float fragCoordZ = texture2D( depthSampler, coord ).x;
                      float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
                      return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
                    }

                    void main() {
                        float depth = readDepth( renderBuffer, vUv );

                        gl_FragColor.rgb = 1.0 - vec3( depth );
				                gl_FragColor.a = 1.0;
                        

                        //gl_FragColor = texture2D(renderBuffer, vUv);
                    }
                `,
      uniforms: {
        renderTexture: { value: this.renderTarget.texture },
        renderBuffer: { value: this.renderTarget.depthTexture },
        cameraNear: { value: this.camera.near },
        cameraFar: { value: this.camera.far },
      },
      transparent: true,
      side: THREE.DoubleSide, // Set material to double-sided
    });


    this.group = new THREE.Group();

    this.screen1 = new THREE.Mesh(geometry, this.material);
    this.screen1.position.x = 0;
    this.screen1.position.y = 0;
    this.screen1.position.z = 0;
    this.group.add(this.screen1);

    this.screen2 = new THREE.Mesh(geometry, this.material);
    this.screen1.position.x = 0;
    this.screen1.position.y = 0;
    this.screen1.position.z = this.width;
    this.group.add(this.screen2);

    this.screen3 = new THREE.Mesh(geometry, this.material);
    this.screen3.position.x = -this.width / 2;
    this.screen3.position.y = 0;
    this.screen3.position.z = this.width / 2;
    this.screen3.rotation.y = Math.PI / 2;
    this.group.add(this.screen3);

    this.screen4 = new THREE.Mesh(geometry, this.material);
    this.screen4.position.x = this.width / 2;
    this.screen4.position.y = 0;
    this.screen4.position.z = this.width / 2;
    this.screen4.rotation.y = Math.PI / 2;
    this.group.add(this.screen4);

    // post
    this.post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 30, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    this.post.position.x = 0;
    this.post.position.y = -16;
    this.post.position.z = 15;

    let geo = new THREE.BoxGeometry(30, 0.5, 30);
    // square
    this.square = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    this.square.position.x = 0;
    this.square.position.y = -this.height / 2 - 0.25;
    this.square.position.z = 15;

    this.square2 = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    this.square2.position.x = 0;
    this.square2.position.y = this.height / 2 + 0.25;
    this.square2.position.z = 15;

    this.group.add(this.square2);
    this.group.add(this.square);
    this.group.add(this.post);

    this.group.position.x = 120;
    this.group.position.y = 30;
    this.group.position.z = 130;

    this.scene.add(this.group);
  }

  updateRenderTarget(cam) {
    this.camera = cam;
    this.render.setRenderTarget(this.renderTarget);
    this.render.render(this.scene, this.camera);

    this.material.uniforms.renderTexture.value = this.renderTarget.texture;
    this.material.uniforms.renderBuffer.value = this.renderTarget.depthTexture;
    this.material.uniforms.cameraNear.value = this.camera.near;
    this.material.uniforms.cameraFar.value = this.camera.far;
    
    this.render.setRenderTarget(null);
    this.material.needsUpdate = true;
  }
}
