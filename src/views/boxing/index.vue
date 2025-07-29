<template>
  <div class="w-screen h-screen relative">
    <!-- 使用原生img标签替代Next.js的Image组件 -->
    <img
        src="/static-image.png"
        alt="拳击图片"
        class="absolute inset-0 w-full h-full"
        style="object-fit: fill"
    />
  </div>
</template>

<script setup lang="ts">
// 组件逻辑（当前无额外逻辑，保持简洁）
</script>

<style scoped>
/* 如需添加样式可在此处编写，使用scoped确保样式隔离 */
</style>