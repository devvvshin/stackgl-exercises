import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const createShader = require('gl-shader');
const createBuffer = require('gl-buffer');
const createVAO = require('gl-vao');
const createTexture = require('gl-texture2d');
const createFBO = require('gl-fbo');

const mat4 = require('gl-mat4');
const getNormals = require('polyline-normals');

class Particle1 extends Component {
  constructor(args) {
    super(args);

    this.BASE = 255;
    this.state = {
      gl: null,
      time: 0,
    }
  }

  genBufferSet(gl) {
    const { width, height, particleSize } = this.props;
    const range = (width > height) ? width : height;
    const scale = this.BASE * this.BASE / range;
    const shader = createShader(gl,
      require('./shader/buffer.vert'),
      require('./shader/buffer.frag'));
    shader.attributes.position.location = 0;

    const w = Math.ceil(Math.sqrt(particleSize));
    const h = Math.ceil(Math.sqrt(particleSize));

    const fboA = createFBO(gl, [w, h]);
    const fboB = createFBO(gl, [w, h]);

    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const buffer = createBuffer(gl,[
      -1, -1, 0,
       1, -1, 0,
      -1,  1, 0,
       1,  1, 0
    ]);

    const vao = createVAO(gl, [{
      size: 3,
      buffer
    }]);

    fboA.bind();
    shader.bind();
    shader.uniforms = {
      resolution: [w, h],
      scale,
      range
    }

    vao.bind();
    vao.draw(gl.TRIANGLE_STRIP, 4);
    vao.unbind();

    return {
      shader,
      buffer,
      vao,
      fboA,
      fboB
    }
  }


  genLogicSet(gl) {

    const shader = createShader(gl,
      require('./shader/logic.vert'),
      require('./shader/logic.frag'));

    const buffer = createBuffer(gl,[
      -1, -1, 0,
       1, -1, 0,
      -1,  1, 0,
       1,  1, 0
    ]);

    const vao = createVAO(gl, [{
      size: 3,
      buffer
    }]);

    return {
      shader,
      vao,
      buffer,
    }
  }
  genDrawSet(gl) {
    const { width, height, particleSize } = this.props;
    const shader = createShader(gl,
      require('./shader/draw.vert'),
      require('./shader/draw.frag'));
    shader.attributes.index.location = 0;

    let rowSize = Math.ceil(Math.sqrt(particleSize));
    let colSize = Math.ceil(Math.sqrt(particleSize));

    let arr = new Array(rowSize * colSize);
    let pointsIdx = [];
    for (let i = 0 ; i < arr.length ; i++) {
      let x = i % rowSize / rowSize;
      let y = Math.floor(i / rowSize) / colSize;
      pointsIdx.push(x);
      pointsIdx.push(y);
    }
    const buffer = createBuffer(gl, pointsIdx);

    const vao = createVAO(gl, [{
      size: 2,
      buffer
    }])

    return {
      shader,
      buffer,
      vao,
    }
  }

  componentDidMount() {
    const gl = this.refs.canvas.getContext('webgl');

    const { width, height } = this.props;

    const bufferSet = this.genBufferSet(gl);
    const drawSet = this.genDrawSet(gl);
    const logicSet = this.genLogicSet(gl);

    setInterval(() => {
      const { time } = this.state;
      this.setState({
        time: time + 1,
      });
    }, 1000/60);

    this.setState({
      gl,
      bufferSet,
      drawSet,
      logicSet,
    })
  }

  updateBuf(mode) {
    const { bufferSet, drawSet, logicSet } = this.state;
    
    if (mode == 0) { // position

    }
  }

  getCamera() {
    const { width, height } = this.props;
    const projection = mat4.perspective(
      mat4.create(),
      Math.PI / 4.0,
      width / height,
      0.001,
      1000
    );

    const view = mat4.lookAt(
      mat4.create(),
      [0, 0, 0.01],
      [0, 0, 0],
      [0, 1, 0]
    );

    return {
      projection,
      view
    };
  }

  renderGL() {
    const { width, height, particleSize } = this.props;
    const { projection, view } = this.getCamera();
    const { gl, drawSet, bufferSet, time } = this.state;
    const { shader, vao, } = drawSet;
    const range = (width > height) ? width : height;
    const scale = this.BASE * this.BASE / range;

    this.updateBuf(0);
    this.updateBuf(1);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shader.bind();
    shader.uniforms = {
      projection,
      view,
      buf: bufferSet.fboA.color[0].bind(0),
      resolution: [width, height],
      range,
      scale,
      time,
    };

    vao.bind();
    gl.drawArrays(gl.POINTS, 0, particleSize);
    vao.unbind();
  }

  render() {
    const { width, height } = this.props;
    if (this.state.gl) this.renderGL();

    return <canvas ref='canvas'
     width={width} height={height}></canvas>
  }
}

ReactDOM.render(
  <Particle1 width={600} height={600} particleSize={9} />,
  document.getElementById('app')
);
