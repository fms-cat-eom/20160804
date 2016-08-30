import xorshift from './xorshift';
xorshift( 43235 );
import GLCat from './glcat';

let glslify = require( 'glslify' );

// ---

let clamp = ( v, b, t ) => Math.min( Math.max( v, b ), t );
let saturate = ( v ) => clamp( v, 0.0, 1.0 );

// ---

let width = canvas.width = 300;
let height = canvas.height = 300;

let gl = canvas.getContext( 'webgl' );
let glCat = new GLCat( gl );

let frame = 0;
let frames = 160;
let speed = 1.0;
let time = 0.0;
let deltaTime = 0.0;

let step = 200;

// ---

let vboQuad = glCat.createVertexbuffer( [ -1, -1, 1, -1, -1, 1, 1, 1 ] );

// ---

let vertQuad = glslify( './shader/quad.vert' );

let programReturn = glCat.createProgram(
  vertQuad,
  glslify( './shader/return.frag' )
);

let programCompute = glCat.createProgram(
  vertQuad,
  glslify( './shader/compute.frag' )
);

let programRender = glCat.createProgram(
  vertQuad,
  glslify( './shader/render.frag' )
);

// ---

let framebufferCompute = glCat.createFloatFramebuffer( width, height );
let framebufferComputeReturn = glCat.createFloatFramebuffer( width, height );
let framebufferRender = glCat.createFloatFramebuffer( width, height );

// ---

let textureRandomSize = 256;
let textureRandom = glCat.createTexture();
glCat.textureWrap( textureRandom, gl.REPEAT );

let textureRandomUpdate = () => {
  glCat.setTextureFromArray( textureRandom, textureRandomSize, textureRandomSize, ( () => {
    let len = textureRandomSize * textureRandomSize * 4;
    let ret = new Uint8Array( len );
    for ( let i = 0; i < len; i ++ ) {
      ret[ i ] = Math.floor( xorshift() * 256.0 );
    }
    return ret;
  } )() );
};
textureRandomUpdate();

// ---

let renderA = document.createElement( 'a' );

let saveFrame = () => {
  renderA.href = canvas.toDataURL();
  renderA.download = ( '0000' + frame ).slice( -5 ) + '.png';
  renderA.click();
};

// ---

let render = () => {
  for ( let i = 0; i < step; i ++ ) {
    gl.viewport( 0, 0, width, height );
    glCat.useProgram( programReturn );
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferComputeReturn );
    glCat.clear();

    glCat.attribute( 'p', vboQuad, 2 );
    glCat.uniform2fv( 'resolution', [ width, height ] );
    glCat.uniformTexture( 'texture', framebufferCompute.texture, 0 );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    // ---

    gl.viewport( 0, 0, width, height );
    glCat.useProgram( programCompute );
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferCompute );
    glCat.clear();

    glCat.attribute( 'p', vboQuad, 2 );
    glCat.uniform1f( 'frame', frame );
    glCat.uniform2fv( 'resolution', [ width, height ] );
    glCat.uniformTexture( 'textureRandom', textureRandom, 0 );
    glCat.uniformTexture( 'texturePrev', framebufferComputeReturn.texture, 1 );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
  }

  // ---

  gl.viewport( 0, 0, width, height );
  glCat.useProgram( programRender );
  gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferRender );
  glCat.clear();

  glCat.attribute( 'p', vboQuad, 2 );
  glCat.uniform1f( 'time', time );
  glCat.uniform2fv( 'resolution', [ width, height ] );
  glCat.uniformTexture( 'textureCompute', framebufferCompute.texture, 0 );

  gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

  // ---

  gl.viewport( 0, 0, width, height );
  glCat.useProgram( programReturn );
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );
  glCat.clear();

  glCat.attribute( 'p', vboQuad, 2 );
  glCat.uniform2fv( 'resolution', [ width, height ] );
  glCat.uniformTexture( 'texture', framebufferRender.texture, 0 );

  gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
};

// ---

let update = () => {
  if ( !checkboxPlay.checked ) {
    requestAnimationFrame( update );
    return;
  }

  render();

  if ( checkboxSave.checked ) {
    saveFrame();
  }
  frame = ( frame + 1 ) % frames;

  console.log( frame );

  requestAnimationFrame( update );
};
update();

window.addEventListener( 'keydown', ( _e ) => {
  if ( _e.which === 27 ) {
    checkboxPlay.checked = false;
  }
} );
