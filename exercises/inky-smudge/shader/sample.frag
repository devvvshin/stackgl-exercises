precision highp float;

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = vec4(vec3(0.0, 0.0, 0.0), 1.0);
}
