precision highp float;

attribute vec3 position;
attribute vec3 vColor;

varying vec3 color;

uniform mat4 projection;
uniform mat4 view;

void main() {
    gl_Position = projection * view * vec4(position, 1.0);
    color = vColor;
}
