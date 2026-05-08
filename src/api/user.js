import request from '@/utils/request'

const userApi = {
  // 获取用户列表
  getUserList: (params) => request('/user/list', params, 'GET'),
  // 获取用户详情
  getUserDetail: (id) => request(`/user/${id}`, {}, 'GET'),
  // 创建用户
  createUser: (data) => request('/user', data, 'POST'),
  // 更新用户
  updateUser: (id, data) => request(`/user/${id}`, data, 'PUT'),
  // 删除用户
  deleteUser: (id) => request(`/user/${id}`, {}, 'DELETE')
}

export default userApi
