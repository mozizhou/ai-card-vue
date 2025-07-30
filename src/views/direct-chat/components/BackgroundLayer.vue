<template>
  <div class="absolute inset-0 z-[-2]">
    <img
        :src="backgroundUrl || 'http://47.99.131.58:8000/photo?idx=1&image_type=background'"
        alt="聊天背景图"
        class="absolute inset-0 w-full h-full object-cover"
    />
    <!-- 半透明遮罩 -->
    <div class="absolute inset-0 bg-black/5 z-[-1]"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  backgroundUrl?: string;
}>();
</script>