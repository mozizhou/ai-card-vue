<template>
  <div class="flex items-start space-x-3" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
    <!-- 用户消息 -->
    <div v-if="message.role === 'user'" class="flex flex-col items-end">
      <div class="bg-blue-500 text-white p-4 rounded-lg shadow-md max-w-md break-words">
        <div v-html="parseMessageContent(message.content)"></div>
      </div>
      <span class="text-xs text-gray-500 mt-1">{{ formatTimestamp(message.timestamp) }}</span>
    </div>

    <!-- AI 消息 -->
    <div v-else-if="message.role === 'assistant'" class="flex items-start space-x-3">
      <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
        <i class="fa fa-robot"></i>
      </div>
      <div class="flex flex-col">
        <div class="bg-white p-4 rounded-lg shadow-md max-w-md break-words">
          <div v-html="parseMessageContent(message.content)"></div>
        </div>
        <span class="text-xs text-gray-500 mt-1">{{ formatTimestamp(message.timestamp) }}</span>
      </div>
    </div>

    <!-- 系统消息 -->
    <div v-else class="flex items-center justify-center">
      <div class="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm max-w-md text-center">
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      role: 'user',
      content: '',
      timestamp: ''
    })
  }
})

// 格式化时间戳
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 解析消息内容（支持简单的markdown）
const parseMessageContent = (content: string) => {
  // 简单的markdown解析，支持换行和粗体
  return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
}
</script>

<style scoped>
/* 消息气泡样式 */
</style>