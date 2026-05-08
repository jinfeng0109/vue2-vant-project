import axios from 'axios'
import { Toast } from 'vant'

/**
 * 从 URL 获取 token
 * 小程序 webview 嵌入时 URL 格式：xxx/map?token=xxx
 */
function getToken() {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') || ''
}

/**
 * 通知小程序 token 过期
 * 通过 window.postMessage 发送消息给小程序
 */
function notifyMiniProgramTokenExpired() {
  // 通知小程序 token 过期
  if (window.postMessage) {
    window.postMessage({
      type: 'TOKEN_EXPIRED',
      message: '登录已过期，请重新登录'
    }, '*')
  }

  // 同时尝试调用微信小程序的 postMessage API
  if (typeof window.wxPostMessage === 'function') {
    window.wxPostMessage({
      type: 'TOKEN_EXPIRED',
      message: '登录已过期，请重新登录'
    })
  }

  console.warn('[TokenExpired] Authorization token 已过期，已通知小程序')
}

// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data

    // 根据后端返回的 code 判断（常见约定：code === 200 或 0 表示成功）
    if (res.code !== 200 && res.code !== 0) {
      Toast({ message: res.message || '请求失败', duration: 2000 })

      // 401: token 过期
      if (res.code === 401) {
        notifyMiniProgramTokenExpired()
        return Promise.reject(new Error('TOKEN_EXPIRED'))
      }

      return Promise.reject(new Error(res.message || 'Error'))
    }

    return res
  },
  error => {
    let message = '网络异常，请稍后重试'

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          notifyMiniProgramTokenExpired()
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = `连接错误${error.response.status}`
      }
    } else if (error.message.includes('timeout')) {
      message = '请求超时，请检查网络'
    } else if (error.message.includes('Network')) {
      message = '网络连接失败'
    }

    Toast({ message, duration: 2000 })
    return Promise.reject(error)
  }
)

/**
 * 封装请求方法
 * @param {string} url - 请求地址
 * @param {object} params - 请求参数
 * @param {string} method - 请求方法 GET/POST/PUT/DELETE
 * @param {object} config - 额外的 axios config
 */
function request(url, params = {}, method = 'GET', config = {}) {
  if (method.toUpperCase() === 'GET') {
    return service.get(url, { params, ...config })
  }
  if (method.toUpperCase() === 'POST') {
    return service.post(url, params, config)
  }
  if (method.toUpperCase() === 'PUT') {
    return service.put(url, params, config)
  }
  if (method.toUpperCase() === 'DELETE') {
    return service.delete(url, { params, ...config })
  }
  return service.request({ url, method: method.toUpperCase(), data: params, ...config })
}

export default request
