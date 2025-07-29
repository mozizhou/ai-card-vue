<template>
  <header class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 shadow-md">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <i class="fa fa-comment text-xl"></i>
        </div>
        <h1 class="text-xl font-bold">AI 聊天</h1>
      </div>
      <div class="flex items-center space-x-4">
        <button class="hover:text-gray-200 transition-colors">
          <i class="fa fa-history"></i>
        </button>
        <button class="hover:text-gray-200 transition-colors">
          <i class="fa fa-cog"></i>
        </button>
        <button class="hover:text-gray-200 transition-colors">
          <i class="fa fa-user-circle-o"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
// 头部组件逻辑
</script>

<style scoped>
header {
  backdrop-filter: blur(8px);
}
</style>