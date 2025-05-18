const webpack = require('webpack');
const { override, addWebpackPlugin, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  // Use Preact instead of React in production
  addWebpackAlias({
    'react': 'preact/compat',
    'react-dom': 'preact/compat'
  }),

  // Optimize bundle size
  addWebpackPlugin(
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ),

  // Custom config for Tizen
  (config) => {
    if (process.env.NODE_ENV === 'production') {
      // Disable source maps in production
      config.devtool = false;

      // Optimize splitChunks
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20
          }
        }
      };

      // Minimize output
      config.optimization.minimize = true;
    }

    return config;
  }
); 