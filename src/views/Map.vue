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
// 示例：引入 API 模块调用接口（以下为注释示例，实际使用时取消注释即可）
// import { mapApi } from '@/api/index'

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
    // 示例：调用后端接口获取数据（以下为注释示例，实际使用时取消注释即可）
    // this.fetchMapData()
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
    },

    /**
     * 示例：调用后端接口获取地图数据
     * 以下为注释示例，实际使用时取消注释即可
     */
    // async fetchMapData() {
    //   try {
    //     // 示例 1：GET 请求
    //     const res = await mapApi.getMapConfig()
    //     console.log('地图配置:', res)
    //
    //     // 示例 2：POST 请求
    //     const res2 = await mapApi.savePosition({
    //       lng: 104.11,
    //       lat: 37.52,
    //       level: 4
    //     })
    //     console.log('保存位置:', res2)
    //   } catch (error) {
    //     // 错误已在 axios 拦截器统一处理
    //     // 如果 token 过期，拦截器会自动通知小程序
    //     if (error.message === 'TOKEN_EXPIRED') {
    //       console.warn('Token 已过期，等待小程序处理...')
    //     }
    //   }
    // }
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
