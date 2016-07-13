precision highp float;

attribute vec2 index;

uniform vec2 resolution;
uniform mat4 view;
uniform mat4 projection;
uniform sampler2D buf;
uniform float scale;

const float BASE = 255.;
const float OFFSET = BASE * BASE / 2.;

float decode(in vec2 channel, in float scale) {
  return (dot(channel, vec2(BASE, BASE * BASE)) - OFFSET) / scale;
}

void main() {
  vec4 channels = texture2D(buf, index);
  float x = decode(channels.rg, scale) / resolution.x * 2.0;
  float y = decode(channels.ba, scale) / resolution.y * 2.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = 4.0;
}
