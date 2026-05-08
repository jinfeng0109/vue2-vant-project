import request from '@/utils/request'

const mapApi = {
  /**
   * 获取地图配置
   * GET 请求示例
   */
  getMapConfig: () => request('/map/config', {}, 'GET'),

  /**
   * 保存用户位置
   * POST 请求示例
   */
  savePosition: (data) => request('/map/position', data, 'POST'),

  /**
   * 查询地图标记
   * GET 请求带参数示例
   */
  getMarkers: (params) => request('/map/markers', params, 'GET'),

  /**
   * 更新标记信息
   * PUT 请求示例
   */
  updateMarker: (id, data) => request(`/map/markers/${id}`, data, 'PUT'),

  /**
   * 删除标记
   * DELETE 请求示例
   */
  deleteMarker: (id) => request(`/map/markers/${id}`, {}, 'DELETE')
}

export default mapApi
