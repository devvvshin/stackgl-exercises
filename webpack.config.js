module.exports = {
  entry: {
    'projection': './examples/Projection/index.js'
  },
  output: {
    path: __dirname,
    filename: './[name].bundle.js'
  },
  module: {
    preLoaders: [
      {
        test: /\.(glsl|vert|frag)$/,
        exclude: /node_modules/,
        loader: 'raw'
      },
      {
        test: /\.(glsl|vert|frag)$/,
        exclude: /node_modules/,
        loader: 'glslify'
      }
    ],
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]

  }
}
