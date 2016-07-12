precision highp float;

uniform vec2 resolution;
uniform float scale;
uniform float range;

const float BASE = 255.;
const float OFFSET = BASE * BASE / 2.;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float decode(in vec2 channel, in float scale) {
  return (dot(channel, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

vec2 encode(in float v, in float scale) {
    float scaledV = v * scale + OFFSET;
    float x = mod(scaledV, BASE);
    float y = floor(scaledV / BASE);
    return vec2(x, y) / BASE;
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;

  float x = (rand(st) - 0.5) * range;
  float y = (rand(st + 0.04) - 0.5) * range;

  vec2 xChannel = encode(x, scale);
  vec2 yChannel = encode(y, scale);

  gl_FragColor = vec4(xChannel, yChannel);
}
