<template>
  <div class="map-page">
    <van-nav-bar
      title="天地图"
      left-arrow
      @click-left="$router.back()"
    />
    <div id="map" class="map-container"></div>
  </div>
</template>

<script>
export default {
  name: 'MapPage',
  data() {
    return {
      map: null,
      token: ''
    }
  },
  created() {
    // 从 URL 获取 token 参数
    const params = new URLSearchParams(window.location.search)
    this.token = params.get('token') || ''
    if (this.token) {
      sessionStorage.setItem('mapToken', this.token)
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      // 使用 window.require 避免 webpack 打包 AMD 模块
      window.require(['esri/Map', 'esri/views/MapView', 'esri/layers/WebTileLayer'],
        (Map, MapView, WebTileLayer) => {

          // 天地图矢量图层
          const vecLayer = new WebTileLayer({
            urlTemplate: 'https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}&tk={tk}',
            subdomains: [''],
            copyright: '天地图'
          })

          // 天地图矢量注记图层
          const cvaLayer = new WebTileLayer({
            urlTemplate: 'https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}&tk={tk}',
            subdomains: [''],
            copyright: '天地图'
          })

          const map = new Map({
            basemap: {
              baseLayers: [vecLayer, cvaLayer]
            }
          })

          const view = new MapView({
            container: 'map',
            map: map,
            center: [104.11, 37.52], // 中国中心
            zoom: 4,
            padding: { top: 50 } // 给 NavBar 留空间
          })

          // 点击事件示例
          view.on('click', (event) => {
            console.log('点击坐标:', event.mapPoint.longitude, event.mapPoint.latitude)
          })

          this.map = map
        }
      )
    }
  },
  beforeDestroy() {
    if (this.map) {
      this.map = null
    }
  }
}
</script>

<style scoped>
.map-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background: #f7f8fa;
}

.map-container {
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
