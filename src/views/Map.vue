<template>
  <div class="map-page">
    <!-- 左上角图层控制面板 -->
    <div class="layer-panel">
      <div class="panel-title">图层控制</div>
      <div class="checkbox-list">
        <van-checkbox name="projectRange" v-model="rangeChecked">项目区范围</van-checkbox>
        <van-checkbox name="facility" v-model="facilityChecked">设施</van-checkbox>
        <van-checkbox name="newFarmland" v-model="farmlandChecked">新增耕地</van-checkbox>
      </div>
    </div>

    <!-- 返回按钮 -->
    <div class="back-btn" @click="$router.back()">
      <van-icon name="arrow-left" size="20" />
    </div>

    <div id="map" class="map-container"></div>
  </div>
</template>

<script>
export default {
  name: 'MapPage',
  data() {
    return {
      map: null,
      view: null,
      token: '',
      // 选中的图层（checkbox 对应 name）
      checkedLayers: [],
      rangeChecked: false,
      facilityChecked: false,
      farmlandChecked: false,
      // 图层对象引用
      layers: {}
    }
  },
  created() {
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
      window.require(
        [
          'esri/Map',
          'esri/views/MapView',
          'esri/layers/WebTileLayer',
          'esri/layers/GraphicsLayer',
          'esri/Graphic',
          'esri/geometry/Polygon',
          'esri/geometry/Point',
          'esri/geometry/support/webMercatorUtils',
          'esri/graphics/SimpleFillSymbol',
          'esri/graphics/SimpleMarkerSymbol',
          'esri/Color'
        ],
        (
          Map,
          MapView,
          WebTileLayer,
          GraphicsLayer,
          Graphic,
          Polygon,
          Point,
          webMercatorUtils,
          SimpleFillSymbol,
          SimpleMarkerSymbol,
          Color
        ) => {
          // 天地图矢量底图
          const vecLayer = new WebTileLayer({
            urlTemplate:
              'https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}&tk={tk}',
            copyright: '天地图'
          })

          // 天地图注记
          const cvaLayer = new WebTileLayer({
            urlTemplate:
              'https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={col}&TILEROW={row}&TILEMATRIX={level}&tk={tk}',
            copyright: '天地图'
          })

          const map = new Map({
            basemap: { baseLayers: [vecLayer, cvaLayer] }
          })

          const view = new MapView({
            container: 'map',
            map: map,
            center: [104.11, 37.52],
            zoom: 4,
            padding: { top: 0, right: 0, bottom: 0, left: 0 }
          })

          // ---- 三个业务图层 ----

          // 1. 项目区范围（面图层）
          const projectRangeLayer = new GraphicsLayer({
            title: '项目区范围'
          })
          // 示例数据：一个多边形
          const pm = webMercatorUtils.geographicToWebMercator(
            new Polygon({
              rings: [
                [103.5, 37.0],
                [104.5, 37.0],
                [104.5, 38.0],
                [103.5, 38.0],
                [103.5, 37.0]
              ],
              spatialReference: { wkid: 4326 }
            })
          )
          projectRangeLayer.add(
            new Graphic({
              geometry: pm,
              symbol: new SimpleFillSymbol({
                color: [80, 180, 255, 0.25],
                outline: { color: [30, 120, 220], width: 2 }
              })
            })
          )

          // 2. 设施（点图层）
          const facilityLayer = new GraphicsLayer({
            title: '设施'
          })
          const points = [
            [103.8, 37.3],
            [104.2, 37.6],
            [104.0, 37.8]
          ]
          points.forEach((p) => {
            facilityLayer.add(
              new Graphic({
                geometry: webMercatorUtils.geographicToWebMercator(
                  new Point({
                    x: p[0],
                    y: p[1],
                    spatialReference: { wkid: 4326 }
                  })
                ),
                symbol: new SimpleMarkerSymbol({
                  style: 'circle',
                  size: '12px',
                  color: [255, 100, 50],
                  outline: { color: [255, 255, 255], width: 2 }
                }),
                attributes: { name: '设施点' },
                popupTemplate: { title: '设施', content: '设施信息' }
              })
            )
          })

          // 3. 新增耕地（面图层）
          const newFarmlandLayer = new GraphicsLayer({
            title: '新增耕地'
          })
          const fm = webMercatorUtils.geographicToWebMercator(
            new Polygon({
              rings: [
                [103.6, 37.2],
                [104.1, 37.2],
                [104.1, 37.6],
                [103.6, 37.6],
                [103.6, 37.2]
              ],
              spatialReference: { wkid: 4326 }
            })
          )
          newFarmlandLayer.add(
            new Graphic({
              geometry: fm,
              symbol: new SimpleFillSymbol({
                color: [80, 200, 80, 0.25],
                outline: { color: [30, 160, 30], width: 2 }
              })
            })
          )

          // 初始全部添加，通过 visible 控制显隐
          map.add(projectRangeLayer)
          map.add(facilityLayer)
          map.add(newFarmlandLayer)

          // 默认全部隐藏，等 checkbox 勾选再显示
          projectRangeLayer.visible = false
          facilityLayer.visible = false
          newFarmlandLayer.visible = false

          this.layers = {
            projectRange: projectRangeLayer,
            facility: facilityLayer,
            newFarmland: newFarmlandLayer
          }

          view.on('click', (event) => {
            console.log(
              '点击坐标:',
              event.mapPoint.longitude,
              event.mapPoint.latitude
            )
          })

          this.map = map
          this.view = view
        }
      )
    }
  },
  // checkbox 变化时同步图层显隐
  watch: {
    rangeChecked(val) {
      if (this.layers.projectRange) {
        this.layers.projectRange.visible = val
      }
    },
    facilityChecked(val) {
      if (this.layers.facility) {
        this.layers.facility.visible = val
      }
    },
    farmlandChecked(val) {
      if (this.layers.newFarmland) {
        this.layers.newFarmland.visible = val
      }
    }
  },
  beforeDestroy() {
    this.map = null
    this.view = null
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 返回按钮 */
.back-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1001;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

/* 图层控制面板 */
.layer-panel {
  position: absolute;
  top: 10px;
  left: 56px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 160px;
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  color: #969799;
  padding: 4px 16px 6px;
  letter-spacing: 0.5px;
}

.checkbox-list {
  padding: 4px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* checkbox 图标和文字间隔 2px */
.checkbox-list ::v-deep .van-checkbox__label {
  margin-left: 2px;
}
</style>
