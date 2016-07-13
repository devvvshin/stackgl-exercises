precision highp float;

void main() {
  vec2 p = (gl_PointCoord - 0.5) * 2.0;
  if(length(p) < 1.0) {
    vec2 norm = normalize(p * vec2(1, -1));
    gl_FragColor = vec4(norm, 0.0, 1.0);
  } else {
    discard;
  }
}
