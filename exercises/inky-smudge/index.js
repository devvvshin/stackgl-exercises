import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const createShader = require('gl-shader');
const createBuffer = require('gl-buffer');
const createVAO = require('gl-vao');
const createTexture = require('gl-texture2d');
const createFBO = require('gl-fbo');

const mat4 = require('gl-mat4');
const getNormals = require('polyline-normals');

class InkySmudge extends Component {
  constructor(args) {
    super(args);

    this.state = {
      gl: null,
      path: [],//[[-0.2, 0.0], [-0.2, 0.4]],
      time: 0,
    }
  }

  genBlurBuffer(gl, img) {
    const { width, height } = this.props;
    const shader = createShader(gl,
      require('./shader/common.vert'),
      require('./shader/blur.frag'));

    const texture = createTexture(gl, img);

    const vao = createVAO(gl, [{
      size: 3,
      buffer: createBuffer(gl, [
        -1, -1, 0,
         1, -1, 0,
        -1,  1, 0,
         1,  1, 0
      ])
    }]);

    let prevFBO = createFBO(gl, [img.width, img.height]);
    let currFBO = createFBO(gl, [img.width, img.height]);

    for (var i = 0; i < 8; i++) {
      var radius = (8 - i);

      currFBO.bind()

      shader.bind()
      shader.uniforms = {
        resolution: [width, height],
        texResolution: [img.width, img.height],
        texture: i === 0 ? texture.bind() : prevFBO.color[0].bind(),
        direction: i % 2 === 0 ? [radius, 0] : [0, radius]
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      vao.bind();
      vao.draw(gl.TRIANGLE_STRIP, 4);
      vao.unbind();

      var t = currFBO;
      currFBO = prevFBO;
      prevFBO = t
    }

    return {
      width: img.width,
      height: img.height,
      origin: texture,
      blur: currFBO.color[0],
    };
  }

  componentDidMount() {
    const gl = this.refs.canvas.getContext('webgl');

    const p = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const blurBuf = this.genBlurBuffer(gl, img);
        resolve(blurBuf);
      }
      img.src = '/img/text1.jpg';
    });

    p.then((blurBuf) => {

      const { width, height } = this.props;
      const shader = createShader(gl,
        require('./shader/smudge.vert'),
        require('./shader/smudge.frag'));

      shader.attributes.position.location = 0;
      shader.attributes.aTexCoord.location = 1;

      const x = 0;
      const y = -1;
      const w = blurBuf.width / width * 2;
      const h = blurBuf.height / height * 2;

      const vao = createVAO(gl, [{
        size: 3,
        buffer: createBuffer(gl, [
          x, y, 0,
          x, y + h, 0,
          x + w,  y, 0,
          x + w,  y + h, 0
        ])
      },
      {
        size: 2,
        buffer: createBuffer(gl, [
          0, 0,
          0, 1,
          1, 0,
          1, 1
        ])
      }]);

      setInterval(() => {
        const { time } = this.state;
        this.setState({
          gl,
          shader,
          vao,
          blurBuf,
          time: time + 1,
        });
      }, 1000/60);
    });
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
    const { gl, shader, vao, blurBuf, time } = this.state;


    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shader.bind();
    shader.uniforms = {
      projection,
      view,
      resolution: [width, height],
      texResolution: [blurBuf.width, blurBuf.height],
      texture: blurBuf.origin.bind(0),
      blurTexture: blurBuf.blur.bind(1),
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
     width={width} height={height}
     ></canvas>
  }
}

ReactDOM.render(
  <InkySmudge width={600} height={600} />,
  document.getElementById('app')
);
