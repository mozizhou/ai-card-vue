<template>
  <a-app>
    <Suspense>
      <template #default>
        <DirectChatContent />
      </template>
      <template #fallback>
        <div class="w-full h-screen flex items-center justify-center">
          加载中...
        </div>
      </template>
    </Suspense>
  </a-app>
</template>

<script setup lang="ts">
import { Suspense } from 'vue';
import { App as AApp } from 'ant-design-vue';
import DirectChatContent from './DirectChatContent.vue';
</script>