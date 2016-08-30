#define PI 3.14159265
#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)*(m))/(m))

// ---

precision highp float;

uniform float frame;
uniform vec2 resolution;

uniform sampler2D texturePrev;
uniform sampler2D textureRandom;

// ---

const vec2 DIF = vec2( 0.6, 0.3 );
const float FEED = 0.048;
const float KILL = 0.062;
const float SPEED = 1.0;

// ---

vec2 fetch( vec2 _p ) {
  return texture2D( texturePrev, mod( _p, resolution ) / resolution ).xy;
}

// ---

void main() {
  vec2 coord = gl_FragCoord.xy;
  vec2 uv = coord / resolution;

  if ( frame == 0.0 ) {
    float l = texture2D( textureRandom, uv / 4.0 ).x * 1.0;
    l *= exp( -length( uv - 0.5 ) * 2.0 );
    float d = pow( l, 4.0 );

    gl_FragColor = V.yxxy;
    if ( 0.5 < d ) { gl_FragColor = V.xyxy; }
    return;
  }

  vec2 p = fetch( coord ).xy;
  vec2 lap = -p;
  {
    vec2 d = vec2( 1.0 ) / resolution;
    lap += 0.20 * fetch( coord + vec2( -1.0,  0.0 ) ).xy;
    lap += 0.20 * fetch( coord + vec2(  0.0, -1.0 ) ).xy;
    lap += 0.20 * fetch( coord + vec2(  1.0,  0.0 ) ).xy;
    lap += 0.20 * fetch( coord + vec2(  0.0,  1.0 ) ).xy;
    lap += 0.05 * fetch( coord + vec2( -1.0, -1.0 ) ).xy;
    lap += 0.05 * fetch( coord + vec2(  1.0, -1.0 ) ).xy;
    lap += 0.05 * fetch( coord + vec2( -1.0,  1.0 ) ).xy;
    lap += 0.05 * fetch( coord + vec2(  1.0,  1.0 ) ).xy;
  }

  float superkill = max( 0.0, frame - 120.0 ) * 0.0005;
  vec2 ret = p + vec2(
    DIF.x * lap.x - p.x * p.y * p.y + FEED * ( 1.0 - p.x ),
    DIF.y * lap.y + p.x * p.y * p.y - ( KILL + superkill + FEED ) * p.y
  ) * SPEED;

  gl_FragColor = vec4( ret, 0.0, 1.0 );
}
