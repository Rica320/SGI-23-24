# SGI 2023/2024 - TP1

## Group: T0xG0y

| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| John Doe         | 201901010 | ...                |
| Jane Doe         | 201901011 | ...                |

----
## Project information

- (items describing main strong points)
- Scene
  - (Brief description of the created scene)
  - (relative link to the scene)
----
## Issues/Problems

- (items describing unimplemented features, bugs, problems, etc.)

## Comments on the Tps

- Changing light font position to (0,-20,0,)
  - The plane gets darker, only gets the ambient light. The back part of the plane was, and its not, visible. 
  - The top part of the cube only gets the ambient light
  - The laterals are not lighted by the pont light
  - The bottom part of the cube is lighted by the pont light

- Changing light font position to (0,2,0) and intensity to 5
  - The plane is lighed by the pont light
  - The cube faces are not lighet by the pont light, the light is inside the cube

- The plane is black, its also possible to see the specular light. The diffuse light is black and its present in the plane .

- The shininess of the plane affects the size of the specular light effect. The bigger the shininess (n) the smaller the specular light effect.

- The more distance we put to the point light the farther the light will achive.
  
- NOTE: Intensity is not the penultimate parameter of the point light.
- The change of decay will determine the effect that the distance between the light and the object point will have in the light intensity. The bigger the decay the smaller the effect of the distance in the light intensity. 3JS uses quadratic decay.  

- Changing the directional light position to (5, 10, 2) will effect how the light rays hit the cube. Effectively, the light rays will hit the cube in a different angle, and the cube will be lighted in a different way.

- Changing the position to (-5, 10, -2) is going to have the same effect as the previous change, but the light rays will hit the cube in the opposite direction. Now, instead of lighting the squares sighted by the camera, the light will hit the squares that are not sighted by the camera and the top one. The bottom part of the cube will not be lighted in both scenes.

- By adding a spot light helper we can better understand what is going on in the scene. Everything that is distanced more then the distance parameter is unlighted. By changing the angle, we get a smaller radius on the light passed, we can see a change of the radius of light projected on the planes and 3 phases of the cube. The 3 phases of the cube have different illuminations depending on the angle of the light with the normal of the plane.

========================TEXTURES========================

- The color of the plane is mixed with the color of the texture. The intensity of the material's diffuse color affects the amount of mixing that occurs. A more intense diffuse color will produce a stronger mix.

- Its possible to see a more lighted image on the plane.

- Yes, the dimmension is unchanged. Its due to planeTextureUVRate that is used in the calculation of planeTextureRepeatV ... keeping the image dimmensions
- ClampToEdgeWrapping repeats the last edges to the end of the plane and MirroredRepeatWrapping keeps mirroring the textures so that it seems that there is a linear transposition of the texture.

- Rotation takes effect on the texture before its mapped to the plane. The texture is rotated around the (0,0).

- we can change the center of the rotation by using .center() 


