precision highp float;

attribute vec3 position;

uniform mat4 view;
uniform mat4 projection;

void main() {
  gl_Position = vec4(position, 1.0);
}
