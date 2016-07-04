precision highp float;

uniform vec2 resolution;
uniform vec2 texResolution;
uniform sampler2D texture;
uniform sampler2D blurTexture;
uniform float time;

varying vec2 texCoord;

float rand(in vec2 st) {
    return fract(sin(dot(st, vec2(149.4928, 751.3942))));
}

float noise(in vec2 st) {
  vec2 f = fract(st);
  vec2 i = floor(st);

  vec2 u = smoothstep(0., 1., f);

  float a = rand(i);
  float b = rand(i + vec2(1.0, 0.0));
  float c = rand(i + vec2(0.0, 1.0));
  float d = rand(i + vec2(1.0, 1.0));

  return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
//  vec2 texCoord = gl_FragCoord.xy / texResolution.xy;
  vec4 texColor = texture2D(texture, texCoord);//vec2(texCoord.x, 1.0 - texCoord.y));
//  vec4 blurColor = texture2D(blurTexture, texCoord);

//  vec3 mc = (blurColor).rgb;
  //
  // float a = 0.0;
  // float t = 1.0 - abs(sin(time/100.0));
  // a += smoothstep(t, t + 0.001, mc.r + noise(texCoord * 1000.0) * 0.1) * 0.3;
  // a += smoothstep(t, t + 0.001, mc.r + noise(texCoord * 50.0) * 0.2) * 0.3;
  // a += smoothstep(t, t + 0.001, mc.r + noise(texCoord * 500.0) * 0.2) * 0.4;
  //
  gl_FragColor = vec4(vec3(texColor.r), 1.0);
}
