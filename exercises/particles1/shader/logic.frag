precision highp float;

uniform vec2 resolution;
uniform sampler2D bufTex;
uniform sampler2D velTex;

varying vec2 uv;

void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
