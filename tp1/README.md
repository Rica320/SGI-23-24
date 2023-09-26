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
- The change of decay will determine the effect that the distance between the light and the object point will have in the light intensity. The bigger the decay the smaller the effect of the distance in the light intensity. Its not clear if 1 is a linear decay and 2 is a quadratic decay. 