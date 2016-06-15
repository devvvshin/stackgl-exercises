precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform mat4 projection;
uniform mat4 view;

vec2 pattern(vec2 st, in float index) {

  if (index > 0.75) {
    //to x axis
    st.y = 1.0 - st.y;
  } else if(index > 0.5) {
    //to y axis
    st.x = 1.0 - st.x;
  } else if(index > 0.25) {
    //to x,y axis
    st = vec2(1.0, 1.0) - st;
  }

  return st;
}

float rand(in float seed) {
    return fract(sin(seed) * 1e4);
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec3 color = vec3(1.0);

  st *= 10.0;
  vec2 fi = floor(st);
  vec2 fv = fract(st);

  fv = pattern(fv, rand(dot(fi, vec2(12.345,54.321))));

  //maze
  //float t = step(fv.x, fv.y) - (step(fv.x + 0.1, fv.y));

  float l = length(fv);
  float rl = length(1.0 - fv);
  float t = step(0.4, l) - step(0.6, l) + (step(0.4, rl) - step(0.6, rl));
  color = vec3(t);

  gl_FragColor = vec4(color , 1.0);
}
