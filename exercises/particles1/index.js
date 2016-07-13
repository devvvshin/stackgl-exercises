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
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

  genTestSet(gl) {

    const shader = createShader(gl,
      require('./shader/test.vert'),
      require('./shader/test.frag'));

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

  genObstacleSet(gl) {
    const { width, height } = this.props;
    const shader = createShader(gl,
      require('./shader/obstacle.vert'),
      require('./shader/obstacle.frag'));

    const fboA = createFBO(gl, [width, height]);

    const points = [0.0, 0.0];
    const buffer = createBuffer(gl, points);

    const vao = createVAO(gl, [{
      size: 2,
      buffer
    }]);

    fboA.bind();
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shader.bind();
    shader.uniforms = {
      resolution: [width, height]
    }
    vao.bind();
    gl.drawArrays(gl.POINTS, 0, points.length / 2);
    vao.unbind();

    return {
      shader,
      vao,
      buffer,
      points,
      fboA,
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
    const velocitySet = this.genBufferSet(gl);
    const obstacleSet = this.genObstacleSet(gl);
    const drawSet = this.genDrawSet(gl);
    const logicSet = this.genLogicSet(gl);
    const testSet = this.genTestSet(gl);

    setInterval(() => {
      const { time } = this.state;
      this.setState({
        time: time + 1,
      });
    }, 1000/60);

    this.setState({
      gl,
      bufferSet,
      velocitySet,
      obstacleSet,
      drawSet,
      logicSet,
      testSet,
    })
  }

  updateBuf(mode) {
    const { width, height, particleSize, gravity } = this.props;
    const { gl, bufferSet, velocitySet, obstacleSet, drawSet, logicSet, testSet, time } = this.state;
    const w = Math.ceil(Math.sqrt(particleSize));
    const h = Math.ceil(Math.sqrt(particleSize));
    const range = (width > height) ? width : height;
    const scale = this.BASE * this.BASE / range;
    const { shader, vao } = logicSet;

    (mode == 0) ? bufferSet.fboB.bind() : velocitySet.fboB.bind();
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shader.bind();

    shader.uniforms = {
      resolution: [w, h],
      viewResolution: [width, height],
      range,
      scale,
      bufTex: bufferSet.fboA.color[0].bind(0),
      velTex: velocitySet.fboA.color[0].bind(1),
      obsTex: obstacleSet.fboA.color[0].bind(2),
      mode,
      gravity,
      time,
    }

    vao.bind();
    vao.draw(gl.TRIANGLE_STRIP, 4);
    vao.unbind();

    if (mode == 0) { // position
      let tmp = bufferSet.fboB;
      bufferSet.fboB = bufferSet.fboA;
      bufferSet.fboA = tmp;
    } else {
      let tmp = velocitySet.fboB;
      velocitySet.fboB = velocitySet.fboA;
      velocitySet.fboA = tmp;
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
    const { gl, drawSet, bufferSet, obstacleSet, testSet, time } = this.state;
    const { shader, vao, } = drawSet;
    const range = (width > height) ? width : height;
    const scale = this.BASE * this.BASE / range;

    this.updateBuf(1);
    this.updateBuf(0);

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

    // for test
    // shader.uniforms = {
    //   projection,
    //   view,
    //   resolution: [width, height],
    //   texture: obstacleSet.fboA.color[0].bind(0),
    // };

    vao.bind();
    gl.drawArrays(gl.POINTS, 0, particleSize);
//    vao.draw(gl.TRIANGLE_STRIP, 4);
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
  <Particle1 width={600} height={600} particleSize={10000} gravity={0.2}/>,
  document.getElementById('app')
);
