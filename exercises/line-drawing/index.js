import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const createShader = require('gl-shader');
const createBuffer = require('gl-buffer');
const createVAO = require('gl-vao');
const mat4 = require('gl-mat4');
const getNormals = require('polyline-normals');

class DrawingLine extends Component {
  constructor(args) {
    super(args);

    this.state = {
      gl: null,
      path: [],//[[-0.2, 0.0], [-0.2, 0.4]],
    }
  }

  getUpdateData() {
    const { path } = this.state;

    const normals = getNormals(path);

    const verts = path.reduce((res, v, i, o) => {
      res.push(v[0]); res.push(v[1]); res.push(0.0);
      res.push(v[0]); res.push(v[1]); res.push(0.0);
      return res;
    }, []);

    const norms = normals.reduce((res, v, i, o) => {
      res.push(v[0][0]); res.push(v[0][1]);
      res.push(v[0][0]); res.push(v[0][1]);
      return res;
    }, []);

    const miters = normals.reduce((res, v, i, o) => {
      res.push(-v[1]);
      res.push(v[1]);
      return res;
    }, []);

    return {
      verts,
      norms,
      miters
    };
  }

  genVAO(gl) {

    const { verts, norms, miters } = this.getUpdateData();

    const vertBuf = createBuffer(gl, verts);
    const normalBuf = createBuffer(gl, norms);
    const miterBuf = createBuffer(gl, miters);

    const vao = createVAO(gl, [{
      size: 3,
      buffer: vertBuf,
    }, {
      size: 2,
      buffer: normalBuf,
    }, {
      size: 1,
      buffer: miterBuf,
    }]);

    return {
      vao,
      vertBuf,
      normalBuf,
      miterBuf,
    };
  }

  componentDidMount() {
    const gl = this.refs.canvas.getContext('webgl');
    const shader = createShader(gl,
      require('./shader/sample.vert'),
      require('./shader/sample.frag'));

    shader.attributes.position.location = 0;
    shader.attributes.normal.location = 1;
    shader.attributes.miter.location = 2;

    const lineDrawSet = this.genVAO(gl);

    this.setState({
      gl,
      shader,
      lineDrawSet,
    })
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
    const { gl, shader, lineDrawSet } = this.state;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shader.bind();
    shader.uniforms = {
      projection,
      view,
      resolution: [width, height],
      thickness: 0.05,
    };

    const {
      verts,
      norms,
      miters,
    } = this.getUpdateData();

    lineDrawSet.vertBuf.update(verts);
    lineDrawSet.normalBuf.update(norms);
    lineDrawSet.miterBuf.update(miters);

    lineDrawSet.vao.bind();
    lineDrawSet.vao.draw(gl.TRIANGLE_STRIP, verts.length / 3);
    lineDrawSet.vao.unbind();
  }

  mouseDown() {
    this.setState({
      drawing: true
    });
  }

  draw({ target, clientX, clientY }) {
    if (!this.state.drawing) return;
    const { width, height } = this.props;
    const { path } = this.state;
    const x = (clientX - target.offsetLeft) / width * 2 - 1;
    const y = 1.0 - (clientY - target.offsetTop) / height * 2;

    this.setState({
      path: [...path, [x, y]]
    })
  }

  mouseUp() {
    this.setState({
      drawing: false
    });
  }

  render() {
    const { width, height } = this.props;
    if (this.state.gl) this.renderGL();

    return <canvas ref='canvas'
     width={width} height={height}
     onMouseDown={(e) => this.mouseDown()}
     onMouseMove={(e) => this.draw(e)}
     onMouseUp={(e) => this.mouseUp()}
     ></canvas>
  }
}

ReactDOM.render(
  <DrawingLine width={600} height={600} />,
  document.getElementById('app')
);
