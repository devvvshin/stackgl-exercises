precision highp float;

uniform vec2 resolution;
uniform vec2 viewResolution;
uniform sampler2D bufTex;
uniform sampler2D velTex;
uniform sampler2D obsTex;
uniform float scale;
uniform float range;
uniform float gravity;
uniform float mode;
uniform float time;
varying vec2 uv;

const float BASE = 255.;
const float OFFSET = BASE * BASE / 2.;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 encode(in float v, in float scale) {
    float scaledV = v * scale + OFFSET;
    float x = mod(scaledV, BASE);
    float y = floor(scaledV / BASE);
    return vec2(x, y) / BASE;
}

float decode(in vec2 channel, in float scale) {
  return (dot(channel, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec4 buf = texture2D(bufTex, st);
  vec4 vel = texture2D(velTex, st);

  vec2 p = vec2(decode(buf.rg, scale), decode(buf.ba, scale));
  vec2 v = vec2(decode(vel.rg, scale), decode(vel.ba, scale));

  p -= v;
  v.y += gravity;
  vec2 normP = vec2((p.x / viewResolution.x * 2.0 + 1.0) * 0.5, (p.y / viewResolution.y * 2.0 + 1.0) * 0.5);
  vec2 norm = texture2D(obsTex, normP).xy;

  if (mode == 0.0) {
    if (p.y <= -viewResolution.y * 0.5 ||
        p.x <= -viewResolution.x * 0.5 ||
        p.x >= viewResolution.x * 0.5 ) {

      p.y = viewResolution.y * 0.5;
      p.x = (rand(st) - 0.5) * 2.0 * viewResolution.x * 0.5;
    }

    if (length(norm) > 0.3) {
      p += v;
      p.y -= gravity;
    }
  } else {
    if (p.y <= -viewResolution.y * 0.5 ||
        p.x <= -viewResolution.x * 0.5 ||
        p.x >= viewResolution.x * 0.5) {

      v.y = (rand(st + time + 0.01) - 0.5) * 2.0;
      v.x = (rand(st + time * 0.01) - 0.5) * 2.0;
    }

    if (length(norm) > 0.3) {
      vec2 v_ = reflect(v, (norm - 0.5) * 2.0) * 0.4;
      v = v_;
    }
  }

  vec2 xChannel = encode((mode == 0.0) ? p.x : v.x, scale);
  vec2 yChannel = encode((mode == 0.0) ? p.y : v.y, scale);
  gl_FragColor = vec4(xChannel, yChannel);
}
