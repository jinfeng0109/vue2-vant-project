import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/map'
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('@/views/Map.vue'),
    meta: { title: '天地图' }
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Vue2 Vant App'
  next()
})

export default router
