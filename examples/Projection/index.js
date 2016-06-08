import React, {Component} from 'react';
import ReactDOM from 'react-dom';
const createShader = require('gl-shader');
const createBuffer = require('gl-buffer');
const createVAO = require('gl-vao');

const mat4 = require('gl-mat4');

class ProjectionTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gl: null
    }
  }

  componentDidMount() {
    const canvas = this.refs.canvas;
    const gl = canvas.getContext('webgl');
    const shader = createShader(gl,
      require('./shader/sample.vert'),
      require('./shader/sample.frag'));
    shader.attributes.position.location = 0;
    shader.attributes.vColor.location = 1;

    const verts = [
      -1.0, -1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0,  1.0, 0.0,
    ]
    const colors = [
       1.0,  1.0, 1.0,
       1.0,  0.0, 0.0,
       0.0,  1.0, 0.0,
       0.0,  0.0, 1.0,
    ]
    const vao = createVAO(gl, [
      {
          buffer: createBuffer(gl, verts.map((v) => v/4)),
          size: 3
      },
      {
          buffer: createBuffer(gl, colors),
          size: 3
      },
    ])

    this.setState({
      gl,
      shader,
      vao,
    });
  }

  renderGL() {
    const {
      gl,
      shader,
      vao,
      camera,
    } = this.state

    if (!gl) return;

    const {
      view,
      projection,
    } = this.getCamera();

    shader.bind();
    shader.uniforms = {
      view,
      projection
    };

    vao.bind();
    vao.draw(gl.TRIANGLE_STRIP, 4);
    vao.unbind();
  }

  getCamera() {
    const {
      gl
    } = this.state;
    const {
      width,
      height
    } = gl.canvas

    const projection = mat4.perspective(
      mat4.create(),
      Math.PI / 4.0,
      width / height,
      0.0001,
      1000.0
    )

    const view = mat4.lookAt(
      mat4.create(),
      [0.0, 2.0, 2.0],
      [0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0]
    )

    return {
      projection,
      view
    }
  }

  render() {
    this.renderGL();
    return (
      <canvas ref='canvas' width={600} height={600}></canvas>
    )
  }
}

ReactDOM.render(
  <ProjectionTest />,
  document.getElementById('app')
);
