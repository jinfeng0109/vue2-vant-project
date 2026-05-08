import request from '@/utils/request'

const authApi = {
  // 登录
  login: (data) => request('/auth/login', data, 'POST'),
  // 登出
  logout: () => request('/auth/logout', {}, 'POST'),
  // 刷新 token
  refreshToken: (data) => request('/auth/refresh', data, 'POST'),
  // 获取用户信息
  getUserInfo: () => request('/auth/user-info', {}, 'GET')
}

export default authApi
