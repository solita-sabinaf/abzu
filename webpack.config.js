var path = require('path')
var webpack = require('webpack')

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './index'
  ],
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development'),
        'BABEL_ENV': JSON.stringify('development')
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: __dirname,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-1', 'react']
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        include: __dirname,
        loaders: ['style', 'css']
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?' + JSON.stringify(imageLoaderQuery)
        ]
      }
    ]
  }
}

var imageLoaderQuery = {
  mozjpeg: {
    progressive: true,
      quality: '55'
  },
  optipng: {
    optimizationLevel: 7,
  },
  pngquant: {
    quality: '55-80',
      speed: 10,
  },
}