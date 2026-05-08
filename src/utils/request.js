import axios from 'axios'
import { Toast } from 'vant'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 是否正在刷新 token
let isRefreshing = false
// 重试队列
let requestsQueue = []

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
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

    // 根据后端返回的 code 判断
    if (res.code !== 200 && res.code !== 0) {
      Toast({ message: res.message || '请求失败', duration: 2000 })

      // 401: token 过期，尝试刷新
      if (res.code === 401) {
        return handleTokenExpired(response)
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
          // 刷新 token 逻辑
          return handleTokenExpired(error.response)
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

// 处理 token 过期
function handleTokenExpired(response) {
  return new Promise((resolve) => {
    if (!isRefreshing) {
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        // 没有 refresh token，直接跳转登录
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        router.push('/login')
        return resolve(Promise.reject(new Error('未登录')))
      }

      // 调用刷新 token 接口
      axios.post(`${process.env.VUE_APP_BASE_API}/auth/refresh`, {
        refreshToken
      }).then(res => {
        const { token, refreshToken: newRefreshToken } = res.data
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', newRefreshToken)

        // 更新原请求 header
        if (response) {
          response.config.headers['Authorization'] = `Bearer ${token}`
        }

        // 重试队列中的请求
        requestsQueue.forEach(cb => cb(token))
        requestsQueue = []

        // 重试原请求
        return resolve(axios(response.config))
      }).catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        router.push('/login')
        requestsQueue = []
        resolve(Promise.reject(new Error('登录已过期')))
      }).finally(() => {
        isRefreshing = false
      })
    } else {
      // 正在刷新 token，将请求加入队列
      return new Promise((resolve2) => {
        requestsQueue.push((token) => {
          if (response) {
            response.config.headers['Authorization'] = `Bearer ${token}`
          }
          resolve2(axios(response.config))
        })
      })
    }
  })
}

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
