precision highp float;

uniform vec2 resolution;
uniform sampler2D brush;
uniform float op;

varying vec2 uv;

void main() {
  vec4 color = texture2D(brush, uv);
  gl_FragColor = vec4(color.rgb, op);
}
