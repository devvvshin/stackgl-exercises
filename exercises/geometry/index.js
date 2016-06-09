import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const createShader = require('gl-shader');
const createBuffer = require('gl-buffer');
const createVAO = require('gl-vao');

const mat4 = require('gl-mat4');

const createGeometry = require('gl-geometry');
const normals = require('normals');

const parseOBJ = require('parse-wavefront-obj');

class GeometryTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gl: null,
      eye: [0.0, 120.0, 100.0]
    };
  }

  getCamera() {
    const { width, height } = this.props;
    const { eye } = this.state;

    const projection = mat4.perspective(
      mat4.create(),
      Math.PI / 4,
      width / height,
      0.0001,
      1000.0
    );

    const view = mat4.lookAt(
      mat4.create(),
      eye,
      [0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0]
    )

    return {
      projection,
      view
    };
  }

  componentDidMount() {
    const { width, height } = this.props;

    const gl = this.refs.canvas.getContext('webgl');

    const shader = createShader(gl,
      require('./shader/sample.vert'),
      require('./shader/sample.frag'));
    shader.attributes.position.location = 0;

    const sampleObj = parseOBJ((require('./obj/sample.obj')));

    const normal = normals.vertexNormals(sampleObj.cells, sampleObj.positions);

    const geom = createGeometry(gl);
    geom.faces(sampleObj.cells);
    geom.attr('position', sampleObj.positions);
    geom.attr('normal', normal);

    this.setState({
      gl,
      shader,
      geom,
    });
  }

  renderGL() {
    const { gl, shader, geom } = this.state;
    const { width, height } = this.props;
    const { view, projection } = this.getCamera();

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, width, height);

    geom.bind(shader);
    shader.uniforms = {
      projection,
      view,
    };
    geom.draw();
    geom.unbind();
  }

  render() {
    const { gl } = this.state;
    if (gl) this.renderGL();

    const { width, height } = this.props;
    return (
      <canvas ref='canvas' width={width} height={height}>
      </canvas>
    )
  }
}

ReactDOM.render(
  <GeometryTest width={600} height={600} />,
  document.getElementById('app')
)
