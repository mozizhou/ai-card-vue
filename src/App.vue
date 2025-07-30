<template>
  <div class="flex flex-col h-screen">
    <Header v-if="!$route.meta.hideHeader" />
    <router-view class="flex-1 overflow-hidden" />
  </div>
</template>

<script lang="ts" setup>
import Header from './components/Header.vue'
</script>

<style scoped>
/* 全局样式 */
.container {
  width: 100%;
  padding-right: 16px;
  padding-left: 16px;
  margin-right: auto;
  margin-left: auto;
  box-sizing: border-box;
}

@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
}

/* 全局触控目标样式 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 在按钮组件中应用 */
button, .btn {
  @extend .touch-target;
}

/* 导航项适配 */
.nav-item {
  @extend .touch-target;
}
</style>