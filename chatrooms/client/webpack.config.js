const path = require('path')
module.exports = {
  entry: path.join(__dirname, '/index.js'),
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bandle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /(\.jsx|\.js)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env', 'react'
            ]
          }
        },
        exclude: /node_modules/
      }
    ]
  }
}