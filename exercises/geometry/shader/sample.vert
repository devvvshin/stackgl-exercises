precision highp float;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vnormal;

uniform mat4 projection, view, model;

void main() {
  vnormal = normal;
  gl_Position = projection * view * model * vec4(position, 1.0);
}
