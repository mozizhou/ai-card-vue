<template>
  <div class="flex flex-col h-screen">
    <!-- 聊天内容区域 -->
    <div class="flex-1 overflow-y-auto p-4 bg-gray-100" ref="chatContainer">
      <div class="max-w-3xl mx-auto space-y-4">
        <!-- 系统消息 -->
        <MessageItem
            v-if="chatHistory.length === 0"
            :message="{
            id: 'system-welcome',
            role: 'system',
            content: '你好！我是你的AI聊天助手。有什么我可以帮助你的吗？',
            timestamp: new Date().toISOString()
          }"
        />

        <!-- 历史消息 -->
        <MessageItem
            v-for="message in chatHistory"
            :key="message.id"
            :message="message"
        />

        <!-- 正在输入提示 -->
        <div v-show="isLoading" class="flex items-start space-x-3">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <i class="fa fa-robot"></i>
          </div>
          <div class="bg-white p-4 rounded-lg shadow-md max-w-md">
            <div class="flex space-x-1">
              <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="p-4 border-t border-gray-200 bg-white">
      <div class="max-w-3xl mx-auto">
        <form @submit.prevent="sendMessage" class="flex space-x-3">
          <textarea
              v-model="userInput"
              placeholder="输入消息..."
              class="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300"
              :rows="calculateRows(userInput)"
              max-rows="5"
          ></textarea>
          <button
              type="submit"
              class="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-3 transition-all duration-300 flex items-center justify-center min-w-[60px]"
              :disabled="isLoading || !userInput.trim()"
          >
            <i class="fa fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, watch, computed} from 'vue'
import {useChatStore} from '@/stores/chatStore'
import MessageItem from '@/components/MessageItem.vue'

const chatStore = useChatStore()
const chatContainer = ref<HTMLElement | null>(null)
const userInput = ref('')
const isLoading = ref(false)

// 滚动到底部
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  // 添加用户消息
  const userMessage = {
    id: `user-${Date.now()}`,
    role: 'user' as const,
    content: userInput.value,
    timestamp: new Date().toISOString()
  }
  chatStore.addMessage(userMessage)
  userInput.value = ''
  scrollToBottom()

  // 模拟AI响应
  isLoading.value = true
  try {
    // 实际项目中这里应该调用API
    // fetch("/api/chat", {
    //   method: "POST",
    //   headers: {"Content-Type": "application/json"},
    //   body: JSON.stringify({
    //     user_name: 'direct_chat_user',
    //     messages: ary,
    //     id: user.id,
    //     direct_mode: directMode,
    //   }),
    // })
    //     .then((res) => res.json())
    //     .then((data) => {
    //       console.log(data);
    //       setLoading(false);
    //       let id = 0;
    //       if (messageList.length === 0) {
    //         id = 1;
    //       } else {
    //         id = messageList[messageList.length - 1].id + 1;
    //       }
    //       const arr: Message[] = [
    //         ...messageList,
    //         {id, type: "start", content: data.content, role: data.role},
    //       ];
    //       setMessageList(arr);
    //       handleSetMessageData(arr);
    //       mainRef.current?.scrollTo({key: 0, block: "nearest"});
    //     });
    await simulateAIResponse(userMessage.content)
  } catch (error) {
    console.error('Error generating response:', error)
    chatStore.addMessage({
      id: `error-${Date.now()}`,
      role: 'system' as const,
      content: '抱歉，生成回复时出现错误。请稍后再试。',
      timestamp: new Date().toISOString()
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 模拟AI响应
const simulateAIResponse = async (userMessage: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        "感谢你的提问。我理解你想了解的是...",
        "这是一个很好的问题。根据我的分析...",
        "我对这个话题有以下见解...",
        "基于你提供的信息，我建议...",
        "这是一个复杂的问题，让我分几点来解释..."
      ]
      const randomIndex = Math.floor(Math.random() * responses.length)
      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant' as const,
        content: responses[randomIndex],
        timestamp: new Date().toISOString()
      }
      chatStore.addMessage(aiMessage)
      resolve(true)
    }, 1000 + Math.random() * 1000) // 1-2秒的随机延迟
  })
}

// 计算文本域的行数
const calculateRows = (text: string) => {
  const lines = text.split('\n')
  const lineCount = lines.length
  const maxRows = 5
  return Math.min(Math.max(lineCount, 1), maxRows)
}

// 监听消息变化，自动滚动到底部
watch(() => chatStore.chatHistory, () => {
  scrollToBottom()
}, {deep: true})

onMounted(() => {
  scrollToBottom()
})

const chatHistory = computed(() => chatStore.chatHistory)
</script>

<style scoped>
/* 自定义样式 */
</style>