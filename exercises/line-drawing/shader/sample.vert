precision highp float;

attribute vec3 position;
attribute vec2 normal;
attribute vec2 miter;

uniform mat4 view;
uniform mat4 projection;
uniform float thickness;

void main() {
  vec2 p = position.xy + vec2(normal * thickness/2.0 * miter);
  gl_Position = vec4(vec2(p), 0.0, 1.);
}
