const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    // ArcGIS AMD 模块不让 webpack 打包
    externals: {
      'esri/Map': 'esri/Map',
      'esri/views/MapView': 'esri/views/MapView',
      'esri/layers/WebTileLayer': 'esri/layers/WebTileLayer',
      'esri/layers/TileLayer': 'esri/layers/TileLayer',
      'esri/geometry/Point': 'esri/geometry/Point'
    }
  },
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
})
