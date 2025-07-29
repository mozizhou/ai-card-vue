<template>
  <div class="flex flex-col h-screen">
    <Header />
    <router-view class="flex-1 overflow-hidden" />
  </div>
</template>

<script lang="ts" setup>
import Header from './components/Header.vue'
</script>

<style scoped>
/* 全局样式 */
</style>