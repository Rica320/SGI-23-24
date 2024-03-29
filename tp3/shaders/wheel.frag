  uniform float time;
  uniform sampler2D map;
  uniform float velocity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    if (uv.y < 0.5) {
      uv.x = mod(time * velocity - uv.x, 1.0); // Apply the velocity to the rotation and wrap within [0, 1]
    } else if (uv.y > 0.5) {
     
      // Calculate the offset from the center
      vec2 offset = vec2(uv.x - 0.484375, uv.y - 0.765625);

      // Calculate the polar coordinates
      float angle = atan(offset.y, offset.x);

      // Rotate the texture
      angle += time * -velocity;

      // Convert back to Cartesian coordinatesa
      uv = vec2(0.484375, 0.765625) + vec2(cos(angle), sin(angle)) * length(offset);

      // Wrap within [0, 1]
      uv = mod(uv, 1.0);
    }

    gl_FragColor = texture2D(map, uv);
  }