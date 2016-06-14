precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform mat4 projection;
uniform mat4 view;

float circle(in float r, in vec2 pos) {
  float len = distance(pos, vec2(0.0, 0.0));
  return smoothstep(r - r * 0.01, r + r * 0.01, len);
}

vec2 tile(in vec2 pos, in float zoom) {
  return fract(pos * zoom);
}

vec2 rotate2d(in vec2 pos, in float degree) {
    float radian = degree * 3.14159265359 / 180.0;
    pos -= 0.5;
    mat2 m = mat2(
        cos(radian), -sin(radian),
        sin(radian), cos(radian)
    );
    return (m * pos) + 0.5;
}

float box_(in vec2 pos, in float size) {
  vec2 uv = smoothstep(size, size + size*0.01, pos);
  uv *= smoothstep(size, size + size*0.01, vec2(1.0) - pos);
  return uv.x * uv.y;
}

float box(vec2 _st, vec2 _size, float _smoothEdges){
    _size = vec2(0.5)-_size*0.5;
    vec2 aa = vec2(_smoothEdges*0.5);
    vec2 uv = step(_size,_st);
    uv *= step(_size,vec2(1.0)-_st);
    return uv.x*uv.y;
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec2 pos = vec2(-0.5) + st;
  vec2 t = tile(pos, 10.0);

  t = rotate2d(t, cos(uTime * 0.05) * 90.0);

  gl_FragColor = vec4(vec3(box(t,vec2(0.7),0.01)) , 1.0);
}
