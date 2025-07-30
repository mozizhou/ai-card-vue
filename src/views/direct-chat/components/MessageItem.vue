<template>
  <div
      class="flex items-start message-item"
      :class="{
      'justify-start': message.type === 'start',
      'justify-end': message.type === 'end'
    }"
  >
    <!-- 左侧头像（AI） -->
    <div v-if="message.type === 'start'" class="mr-3 mt-1 flex-shrink-0 z-10">
      <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 shadow-sm">
        <img
            v-if="user"
            class="w-full h-full object-cover"
            :src="user.avatar"
            alt="AI头像"
        />
        <UserOutlined v-else class="w-full h-full"/>
      </div>
    </div>

    <!-- 消息内容气泡容器 -->
    <div class="flex items-center">
      <!-- 消息内容气泡 -->
      <div
          class="px-4 py-2.5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 inline-block"
          :class="{
          'bg-white/90 rounded-tl-none': message.type === 'start',
          'bg-[#95EC69]/90 text-white rounded-tr-none': message.type === 'end',
          'hover:shadow-lg': true
        }"
      >
        <!-- 加载中状态显示 -->
        <template v-if="message.isLoading">
          <div class="flex space-x-1">
            <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
            <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </template>
        <!-- 正常消息内容 -->
        <template v-else>
          <p v-html="displayedContent" class="m-0 text-sm leading-relaxed"></p>
          <div v-if="isTyping" class="typing-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>

          <!-- 语音播放按钮 -->
          <div
              v-if="message.type === 'start'"
              class="mt-2 flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
              @click.stop="$emit('toggle-play', message)"
          >
            <template v-if="message.voiceType === 1">
              <LoadingOutlined style="fontSize: 16px"/>
            </template>
            <template v-else-if="message.voiceType === 2">
              <img src="/playing.gif" alt="正在播放" width="16" height="16"/>
            </template>
            <template v-else>
              <img src="/stop.png" alt="播放语音" width="16" height="16"/>
            </template>
            <span class="ml-2 text-sm">点击播放</span>
          </div>
        </template>
      </div>
    </div>

    <!-- 右侧头像（用户） -->
    <div v-if="message.type === 'end'" class="ml-3 mt-1 flex-shrink-0 z-10">
      <div
          class="w-10 h-10 rounded-full bg-gradient-to-r from-green-500/80 to-green-600/80 flex items-center justify-center border-2 border-white/80 shadow-sm">
        <UserOutlined class="text-white"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, ref, onMounted, watch} from 'vue';
import {UserOutlined, LoadingOutlined} from '@ant-design/icons-vue';
import type {Message, User} from '@/types';

const props = defineProps<{
  message: Message;
  user: User | null;
}>();

defineEmits<{
  (e: 'toggle-play', message: Message): void;
}>();

// 打字机效果相关状态
const displayedContent = ref('')
const isTyping = ref(false)

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// 处理消息内容中的换行
const processContent = (content: string) => {
  return content.replace(/\n/g, '<br>');
};

// 打字机效果实现
const startTyping = (content: string) => {
  // 只对助手消息应用打字效果
  if (props.message.role !== 'assistant') {
    displayedContent.value = processContent(content);
    return;
  }

  isTyping.value = true;
  displayedContent.value = '';
  const processedContent = processContent(content);
  let index = 0;

  const typingInterval = setInterval(() => {
    if (index < processedContent.length) {
      displayedContent.value += processedContent.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval);
      isTyping.value = false;
    }
  }, 20); // 打字速度，数值越小越快
};

// 监听消息内容变化，重新开始打字效果
watch(
    () => props.message.content,
    (newContent) => {
      if (newContent) {
        startTyping(newContent);
      }
    },
    {immediate: true}
);
</script>

<style scoped>
/* 消息项布局优化 */
.message-item {
  position: relative;
  padding: 4px 0;
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

/* 气泡样式调整 */
.rounded-tl-none {
  border-top-left-radius: 4px !important;
}

.rounded-tr-none {
  border-top-right-radius: 4px !important;
}

/* 加载动画 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.message-content p {
  padding: 10px 14px;
  border-radius: 18px;
  margin: 0;
  line-height: 1.5;
}

/* 不同角色的样式 */
.message-item.assistant .message-content p {
  background-color: #e9f5ff;
}

.message-item.user .message-content p {
  background-color: #0078d4;
  color: white;
}


/* 打字指示器样式 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 14px;
}

.typing-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #666;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>