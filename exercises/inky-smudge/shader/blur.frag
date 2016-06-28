precision highp float;

#pragma glslify: blur = require('glsl-fast-gaussian-blur');

uniform vec2 resolution;
uniform vec2 texResolution;
uniform sampler2D texture;
uniform vec2 direction;

void main() {
  vec2 texCoord = gl_FragCoord.xy / texResolution.xy;
  texCoord.y = 1.0 - texCoord.y;
  gl_FragColor = blur(texture, texCoord, texResolution.xy, direction);
}
