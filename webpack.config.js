const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    newtab: './src/newtab.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                noEmit: false,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/newtab.html',
      filename: 'newtab.html',
      chunks: ['newtab'],
      cache: false,
      inject: 'body',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public' }
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}; 