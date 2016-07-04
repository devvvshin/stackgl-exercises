precision highp float;

attribute vec3 position;
attribute vec2 aTexCoord;

uniform mat4 view;
uniform mat4 projection;

varying vec2 texCoord;

void main() {
  gl_Position = vec4(position, 1.0);
  texCoord = aTexCoord;
}
