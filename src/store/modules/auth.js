import authApi from '@/api/auth'

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    localStorage.setItem('token', token)
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  },
  LOGOUT(state) {
    state.token = ''
    state.userInfo = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
  }
}

const actions = {
  async login({ commit }, loginData) {
    const res = await authApi.login(loginData)
    commit('SET_TOKEN', res.token)
    if (res.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken)
    }
    return res
  },
  async fetchUserInfo({ commit }) {
    const res = await authApi.getUserInfo()
    commit('SET_USER_INFO', res)
    return res
  },
  logout({ commit }) {
    authApi.logout().catch(() => {})
    commit('LOGOUT')
  }
}

export default { namespaced: true, state, mutations, actions }
