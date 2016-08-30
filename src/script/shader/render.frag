#define PI 3.14159265
#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)*(m))/(m))

// ---

precision highp float;

uniform float time;
uniform vec2 resolution;

uniform sampler2D textureCompute;

// ---

vec3 gradient( float _p ) {
  float p = saturate( _p );
  return mix(
    vec3( 0.0, 0.0, 0.0 ),
    mix(
      vec3( 1.0, 0.1, 0.4 ),
      mix(
        vec3( 1.0, 0.3, 0.1 ),
        vec3( 0.7, 1.0, 0.3 ),
        saturate( p * 3.0 - 2.0 )
      ),
      saturate( p * 3.0 - 1.0 )
    ),
    saturate( p * 3.0 )
  );
}

// ---

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  vec2 p = texture2D( textureCompute, uv ).xy;
  float v = pow( p.x / ( p.y + 1.0 ), 2.0 );
  gl_FragColor = vec4( gradient( 1.0 - v ) * V.yyy, 1.0 );
}
