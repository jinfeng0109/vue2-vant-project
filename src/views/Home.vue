<template>
  <div class="home">
    <van-nav-bar title="首页" left-arrow @click-left="onClickLeft" />
    <div class="content">
      <van-cell-group>
        <van-cell title="用户列表" is-link @click="fetchUsers" />
        <van-cell title="关于页面" is-link url="/about" />
      </van-cell-group>
      <div v-if="users.length" class="user-list">
        <van-cell
          v-for="user in users"
          :key="user.id"
          :title="user.name"
          :label="user.email"
        />
      </div>
    </div>
  </div>
</template>

<script>
import userApi from '@/api/user'

export default {
  name: 'Home',
  data() {
    return {
      users: []
    }
  },
  methods: {
    onClickLeft() {
      this.$toast('已到达首页')
    },
    async fetchUsers() {
      try {
        const res = await userApi.getUserList({ page: 1, pageSize: 10 })
        this.users = res.list || []
        this.$toast(`加载成功，共${this.users.length}条`)
      } catch (e) {
        // 错误已在拦截器处理
      }
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f7f8fa;
}
.content {
  padding: 16px;
}
.user-list {
  margin-top: 16px;
}
</style>
