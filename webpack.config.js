module.exports = {
  entry: {
    'inky-metaball': './exercises/inky-metaball/index.js',
    'noise': './exercises/noise/index.js',
    'pattern2': './exercises/pattern2/index.js',
    'pattern1': './exercises/pattern1/index.js',
    'geometry': './exercises/geometry/index.js',
    'projection': './exercises/projection/index.js',
    'raypicking': './exercises/ray-picking/index.js'
  },
  output: {
    path: __dirname,
    filename: './[name].bundle.js'
  },
  module: {
    preLoaders: [
      {
        test: /\.(obj|glsl|vert|frag)$/,
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
