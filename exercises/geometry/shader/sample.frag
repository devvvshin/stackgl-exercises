precision highp float;

varying vec3 vnormal;

void main() {
  gl_FragColor = vec4(vnormal.r * 1.0, 0.0, 0.0 , 1.0);
}
