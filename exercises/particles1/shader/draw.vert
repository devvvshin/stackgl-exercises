precision highp float;

attribute vec2 index;

uniform mat4 view;
uniform mat4 projection;
uniform sampler2D buf;
uniform float scale;

const float BASE = 255.;
const float OFFSET = BASE * BASE / 2.;

float decode(in vec2 channel, in float scale) {
  return (dot(channel, vec2(BASE, BASE * BASE)) / scale - OFFSET);
}

void main() {
  vec4 channels = texture2D(buf, index);
  float x = decode(channels.rg, scale);
  float y = decode(channels.ba, scale);
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = 3.0;
}
