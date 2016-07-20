import React, {Component} from 'react';
import ReactDOM from 'react-dom';
const createShader = require('gl-shader');
const createBuffer = require('gl-buffer');
const createVAO = require('gl-vao');
const createTexture = require('gl-texture2d');
const mat4 = require('gl-mat4');

class BlendTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gl: null,
      uTime: 0.0,
    }
  }

  componentDidMount() {
    const canvas = this.refs.canvas;
    const gl = canvas.getContext('webgl');
    const shader = createShader(gl,
      require('./shader/scratch.vert'),
      require('./shader/scratch.frag'));
    shader.attributes.aPosition.location = 0;
    shader.attributes.aUv.location = 1;

    const bufferArray = [
      -1.0, -1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0,  1.0, 0.0,
    ]

    const buffer = createBuffer(gl, bufferArray);
    const vao = createVAO(gl, [
      {
          buffer,
          size: 3
      },
      {
          buffer: createBuffer(gl, [
             0.0,  0.0,
             1.0,  0.0,
             0.0,  1.0,
             1.0,  1.0,
          ]),
          size: 2
      },
    ])

    const brushImg = new Image();
    brushImg.onload = () => {
      const brushTexture = createTexture(gl, brushImg);
      const scratchMetas = this.genScratchMeta(100, {w: brushImg.width, h: brushImg.height});

      const sampleImg = new Image();
      sampleImg.onload = () =>{
        const sampleTexture = createTexture(gl, sampleImg);

        this.setState({
          gl,
          shader,
          bufferArray,
          buffer,
          vao,
          scratchMetas,
          brushTexture,
          sampleTexture
        });

        setInterval(() => {
          const uTime = this.state.uTime;
          this.setState({
            uTime: uTime + 1.0
          })
        }, 1000/60);
      }
      sampleImg.src = './exercises/blend1/img/sample.png';
    }
    brushImg.src = './exercises/blend1/img/brush1.png';
  }

  genScratchMeta(count, brushSize) {
    const { width, height } = this.props;
    const frac = (f) => f % 1;
    return Array.from(new Array(count), (d, i) => {
      const s = Math.random() + 0.5;
      const w = brushSize.w / width * s;
      const h = brushSize.h / height * s;
      const x = (-0.5 + Math.random() * 0.8) * 2.0;
      const y = (-0.5 + Math.random() * 0.8) * 2.0;
      const r = (-0.5 + Math.random()) * 2.0;
      return {
        x,y,w,h,r
      }
    })
  }

  renderGL() {
    const {
      gl,
      shader,
      vao,
      camera,
      buffer,
      brushTexture,
      sampleTexture,
      scratchMetas,
      uTime,
    } = this.state

    const { width, height } = this.props;

    if (!gl) return;
    const {
      view,
      projection,
    } = this.getCamera();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);


    shader.bind();
    const x = -1.0;
    const y = -1.0;
    const w = 2.0;
    const h = 2.0;

    const bufferArray = [
      x, y, 0.0,
      x, y + h, 0.0,
      x + w, y, 0.0,
      x + w, y + h, 0.0
    ];
    buffer.update(bufferArray);
    shader.uniforms = {
      view,
      projection,
      resolution: [width, height],
      uTime,
      brush: sampleTexture.bind(0),
      rotate: 1.5708,
      op: 1.0,
    };

    vao.bind();
    vao.draw(gl.TRIANGLE_STRIP, 4);
    vao.unbind();


    scratchMetas.forEach(({x, y, w, h, r}) => {
      shader.bind();
      const bufferArray = [
        x, y, 0.0,
        x, y + h, 0.0,
        x + w, y, 0.0,
        x + w, y + h, 0.0
      ];
      buffer.update(bufferArray);
      shader.uniforms = {
        view,
        projection,
        resolution: [width, height],
        uTime,
        brush: brushTexture.bind(0),
        rotate: r,
        op: Math.abs(Math.sin(uTime / 100)),
      };

      vao.bind();
      vao.draw(gl.TRIANGLE_STRIP, 4);
      vao.unbind();
    });
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
      [0.0, 0.0, 0.01],
      [0.0, 0.0, 0.0],
      [0.0, 1.0, 0.0]
    )

    return {
      projection,
      view
    }
  }

  render() {
    const { width, height } = this.props;
    this.renderGL();
    return (
      <canvas ref='canvas' width={width} height={height}></canvas>
    )
  }
}

ReactDOM.render(
  <BlendTest  width={794} height={633}/>,
  document.getElementById('app')
);
