const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,

  // Production build output directory
  outputDir: 'dist',

  // Public path for assets
  publicPath: '/',

  // Development server configuration (only used in development)
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:7000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        onProxyReq: function(proxyReq, req, res) {
          console.log('Proxying request:', req.method, req.url, '-> ' + (process.env.VUE_APP_API_URL || 'http://localhost:7000') + req.url);
        },
        onError: function(err, req, res) {
          console.error('Proxy error:', err);
        }
      }
    }
  },

  // Production build configuration
  productionSourceMap: false, // Disable source maps in production for security

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false)
      })
    ],
    // Optimize production build
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  }
})
