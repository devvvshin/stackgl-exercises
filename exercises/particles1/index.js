import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const createShader = require('gl-shader');
const createBuffer = require('gl-buffer');
const createVAO = require('gl-vao');
const createTexture = require('gl-texture2d');
const createFBO = require('gl-fbo');

const mat4 = require('gl-mat4');
const getNormals = require('polyline-normals');

class DynamicFluid extends Component {
  constructor(args) {
    super(args);

    this.state = {
      gl: null,
      path: [],//[[-0.2, 0.0], [-0.2, 0.4]],
      time: 0,
    }
  }

  componentDidMount() {
    const gl = this.refs.canvas.getContext('webgl');

    const { width, height } = this.props;
    const shader = createShader(gl,
      require('./shader/fluid.vert'),
      require('./shader/fluid.frag'));

    shader.attributes.position.location = 0;

    const x = -1;
    const y = -1;
    const w = 2;
    const h = 2;

    const vao = createVAO(gl, [{
      size: 3,
      buffer: createBuffer(gl, [
        x, y, 0,
        x, y + h, 0,
        x + w,  y, 0,
        x + w,  y + h, 0
      ])
    }]);

    const bufferShader = createShader(gl,
      require('./shader/buffer.vert'),
      require('./shader/buffer.frag'));

    bufferShader.attributes.position.location = 0;

    const buffer = createFBO(gl, [500, 500]);

    buffer.bind();
    bufferShader.bind();
    vao.bind();
    vao.draw(gl.TRIANGLE_STRIP, 4);
    vao.unbind();

    setInterval(() => {
      const { time } = this.state;
      this.setState({
        gl,
        shader,
        vao,
        buffer,
        time: time + 1,
      });
    }, 1000/60);
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
    const { width, height } = this.props;
    const { projection, view } = this.getCamera();
    const { gl, shader, vao, time } = this.state;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shader.bind();
    shader.uniforms = {
      projection,
      view,
      resolution: [width, height],
      time,
    };

    vao.bind();
    vao.draw(gl.TRIANGLE_STRIP, 4);
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
  <DynamicFluid width={600} height={600} />,
  document.getElementById('app')
);
