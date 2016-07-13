precision highp float;

uniform vec2 resolution;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec2 p = (gl_PointCoord - 0.5) * 2.0;
  if (length(p) < 1.0) {
    gl_FragColor = vec4(st.x, st.y, 1.0, 1.0);
  } else {
    discard;
  }
}
