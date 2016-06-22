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

float circle(in vec2 st,in float r) {
  float len = distance(st, vec2(0.5, 0.5));

  return smoothstep(r - 0.05, r, len) - smoothstep(r, r + 0.05, len);
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec3 color = vec3(1.0);

  float nl = mod(uTime, 1000.0) * 0.1;
  color = vec3(noise(st * nl));

  gl_FragColor = vec4(color , 1.0);
}
