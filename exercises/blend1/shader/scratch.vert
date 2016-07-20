precision highp float;

attribute vec3 aPosition;
attribute vec2 aUv;
uniform float rotate;

varying vec2 uv;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main() {
  uv = aUv;
  vec2 pos = aPosition.xy;
  pos = rotate2d(rotate) * pos;
  gl_Position = vec4(pos, 0.0, 1.0);
}
