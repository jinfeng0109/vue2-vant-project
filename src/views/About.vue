<template>
  <div class="about-page">
    <van-nav-bar title="关于" left-arrow @click-left="$router.back()" />
    <div class="about-content">
      <van-cell-group>
        <van-cell title="框架" value="Vue 2.x" />
        <van-cell title="UI" value="Vant 2.x" />
        <van-cell title="HTTP" value="Axios" />
        <van-cell title="路由" value="Vue Router 3.x" />
        <van-cell title="状态管理" value="Vuex 3.x" />
      </van-cell-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #f7f8fa;
}
.about-content {
  padding: 16px;
}
</style>
