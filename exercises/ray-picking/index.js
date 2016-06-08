import React, {Component} from 'react';
import ReactDOM from 'react-dom';
const createShader = require('gl-shader');
const createBuffer = require('gl-buffer');
const createVAO = require('gl-vao');

const mat4 = require('gl-mat4');
const Ray = require('ray-3d');
const pick = require('camera-picking-ray');

class RayTest extends Component {
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
    ].map((v) => v/4);

    const colors = [
       1.0,  1.0, 1.0,
       1.0,  0.0, 0.0,
       0.0,  1.0, 0.0,
       0.0,  0.0, 1.0,
    ]
    const vao = createVAO(gl, [
      {
          buffer: createBuffer(gl, verts),
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
      verts
    });
  }

  renderGL() {
    const {
      gl,
      shader,
      vao,
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

  picking({
    clientX: x,
    clientY: y
  }) {

    const {
      gl,
      verts,
    } = this.state;

    const {
      view,
      projection: proj
    } = this.getCamera();

    const {
      width,
      height
    } = gl.canvas;

    const {
      top,
      left
    } = gl.canvas.getBoundingClientRect();

    const projView = mat4.multiply(mat4.create(), proj, view);
    const invProjView = mat4.invert(mat4.create(), projView);

    const ray = new Ray();
    const viewport = [0, 0, width, height];
    pick(ray.origin, ray.direction, [x - left, y - top], viewport, invProjView);

    if (ray.intersectsBox(
      [
        [verts[0], verts[1], verts[2]],
        [verts[9], verts[10], verts[11]],
      ]
    )) console.log('pick');
  }

  render() {
    this.renderGL();
    return (
      <canvas ref='canvas' onClick={(e) => this.picking(e)} width={600} height={600}></canvas>
    )
  }
}

ReactDOM.render(
  <RayTest />,
  document.getElementById('app')
);
