precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform mat4 projection;
uniform mat4 view;

float rand(in vec2 st) {
  return fract(sin(dot(st,vec2(12.50234, 42.30402))) * 1000.0);
}

float noise(in vec2 st) {
  vec2 vi = floor(st);
  vec2 vf = fract(st);

  float a = rand(vi);
  float b = rand(vi + vec2(1.0, 0.0));
  float c = rand(vi + vec2(0.0, 1.0));
  float d = rand(vi + vec2(1.0, 1.0));

  vec2 u = vf * vf * (3.0 - 2.0 * vf);

  return mix(a, b, u.x) +
          (c - a)* u.y * (1.0 - u.x) +
          (d - b) * u.x * u.y;
}


float metaball(in vec2 st) {
  float a = atan(st.y, st.x);
  float t = sin(a * 3.0);
  float r = length(st) * 2.0;
  float n = 0.4 + t * noise(st + sin(uTime * 0.01)) * abs(cos(uTime * 0.01)) * 0.05;
  return smoothstep(n, n + 0.01, r);
}

float sdfMetaball(in vec2 st) {
  float a = atan(st.y, st.x);
  float t = sin(a * 2.0);
  float r = distance(st, vec2(0., 0.)) * 2.0;
  float n = 0.4 + t * noise(st + sin(uTime * 0.01)) * abs(sin(uTime * 0.001)) * 0.5;
  return smoothstep(n, n + 0.3, r);
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec3 color = vec3(1.0);

  st -= 0.5;
  st -= abs(cos(mod(uTime * 0.001, 1000.0))) * 0.05;
  float sm = sdfMetaball(st);
  float a = 0.0;
  a += smoothstep(0.7, 0.7 + 0.001, sm + noise(st * 1000.0) * 0.3) * 0.3;
  a += smoothstep(0.7, 0.7 + 0.001, sm + noise(st * 50.0) * 0.4) * 0.3;
  a += smoothstep(0.7, 0.7 + 0.001, sm + noise(st * 500.0) * 0.4) * 0.4;
  color *= a;
  gl_FragColor = vec4(color , 1.0);
}
