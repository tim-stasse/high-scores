const fp = require('lodash/fp');
const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  devtool: fp.getOr('eval-source-map')(process.env.STAGE)({
    production: 'source-map'
  }),
  entry: slsw.lib.entries,
  externals: [nodeExternals()],
  mode: fp.getOr('development')(process.env.STAGE)({
    production: 'production'
  }),
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: [
          {
            loader: 'eslint-loader'
          }
        ]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader'
      }
    ]
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.mjs', '.js', '.json', '.ts'],
    modules: [path.resolve(__dirname, './src'), 'node_modules']
  },
  target: 'node'
};
