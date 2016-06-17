precision highp float;

uniform vec2 resolution;
uniform float uTime;
uniform mat4 projection;
uniform mat4 view;

float rand(in float seed) {
    return fract(sin(seed) * 1e4);
}

float noise(in float s) {
  float si = floor(s);
  float sf = fract(s);

  float a = rand(si);
  float b = rand(si + 1.0);

  return mix(a, b, smoothstep(.0, 1., sf));
}

float circle(in vec2 st, in float r) {
  float l = distance(st, vec2(.0, .0));
  return 1.0 - smoothstep(r, r + r * 0.01, l);
}

float plot(in float s, in float d) {
    return smoothstep(d - 0.01, d, s) - smoothstep(d, d + 0.01, s);
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec3 color = vec3(1.0);

  float nl = 4.0;

  float t = mod(uTime, 100.0) * 0.01;

  vec2 bst = st;
  float f = noise(t * nl);
  bst -= vec2(t, f);
  color = vec3(circle(bst, 0.05)) * f;

  float y = noise(st.x * nl);
  float pst = plot(st.y, y);
  color = (1.0 - pst) * color + pst * vec3(0.0, 1.0, 1.0);


  gl_FragColor = vec4(color , 1.0);
}
