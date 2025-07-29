<template>
  <div class="w-screen h-screen flex flex-col relative overflow-hidden">
    <!-- 背景图层 -->
    <div class="absolute inset-0 z-[-2]">
      <img
          :src="user?.background || 'http://47.99.131.58:8000/photo?idx=1&image_type=background'"
          alt="聊天背景图"
          class="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    <!-- 半透明遮罩 -->
    <div class="absolute inset-0 bg-black/5 z-[-1]"></div>

    <!-- 直接聊天模式标题栏 -->

    <!-- 消息列表区域 - 核心滚动容器 -->
    <div
        class="flex-1 overflow-y-auto p-4 custom-scrollbar"
        ref="messageContainer"
        style="scroll-behavior: smooth; padding-right: 8px;"
    >
      <template v-if="user">
        <div class="space-y-6 pb-24">
          <!-- 消息项 -->
          <div
              v-for="(e, index) in messageList"
              :key="e.id"
              class="flex items-start message-item"
              :class="{
              'justify-start': e.type === 'start',
              'justify-end': e.type === 'end'
            }"
          >
            <!-- 左侧头像（AI） -->
            <div v-if="e.type === 'start'" class="mr-3 mt-1 flex-shrink-0 z-10">
              <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 shadow-sm">
                <img
                    v-if="user"
                    class="w-full h-full object-cover"
                    :src="user.avatar"
                    alt="AI头像"
                />
                <UserOutlined v-else class="w-full h-full" />
              </div>
            </div>

            <!-- 消息内容气泡容器 -->
            <div class="flex items-center">
              <!-- 消息内容气泡 - 带透明效果的微信风格 -->
              <div
                  class="px-4 py-2.5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-200 inline-block"
                  :class="{
                  'bg-white/90 rounded-tl-none': e.type === 'start',
                  'bg-[#95EC69]/90 text-white rounded-tr-none': e.type === 'end',
                  'hover:shadow-lg': true
                }"
              >
                <p class="m-0 text-sm leading-relaxed">{{ e.content }}</p>

                <!-- 语音播放按钮 -->
                <div
                    v-if="e.type === 'start'"
                    class="mt-2 flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
                    @click="togglePlay(e, index)"
                >
                  <template v-if="e.voiceType === 1">
                    <LoadingOutlined style="fontSize: 16px" />
                  </template>
                  <template v-else-if="e.voiceType === 2">
                    <img src="/playing.gif" alt="正在播放" width="16" height="16" />
                  </template>
                  <template v-else>
                    <img src="/stop.png" alt="播放语音" width="16" height="16" />
                  </template>
                  <span class="ml-2 text-sm">点击播放</span>
                </div>
              </div>
            </div>

            <!-- 右侧头像（用户） -->
            <div v-if="e.type === 'end'" class="ml-3 mt-1 flex-shrink-0 z-10">
              <div class="w-10 h-10 rounded-full bg-gradient-to-r from-green-500/80 to-green-600/80 flex items-center justify-center border-2 border-white/80 shadow-sm">
                <UserOutlined class="text-white" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 未选择角色提示 -->
      <div v-else class="flex-1 flex items-center justify-center">
        <p class="text-lg text-gray-600 bg-white/80 px-6 py-3 rounded-full">请选择角色</p>
      </div>
    </div>

    <!-- 输入区域 - 固定在底部 -->
    <div class="input-container px-4 py-3 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-20">
      <InfoEntryBox
          class="w-full"
          ref="infoEntry"
          :loading="loading"
          @cancel="handleCancel"
          :handle-send-message="handleSendMessage"/>
    </div>
  </div>
</template>

<script setup lang="ts">
// 脚本部分保持不变
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { UserOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { message as antMessage } from 'ant-design-vue';
import { useMainStore } from '@/store/store';
import type { Message } from '@/types';
import InfoEntryBox from "@/views/direct-chat/components/Info-entry-box.vue";

// Props 定义
interface MainContentProps {
  directMode?: boolean;
}
const props = withDefaults(defineProps<MainContentProps>(), {
  directMode: false
});

// 状态管理
const value = ref('');
const messageList = ref<Message[]>([]);
const messageContainer = ref<HTMLDivElement | null>(null);
const loading = ref(false);
const token = ref('');
const contentHeight = ref('calc(100vh - 120px)');
const audio = ref<HTMLAudioElement | null>(null);
const mainRef = ref<HTMLElement | null>(null);
// 添加标记防止循环更新
const isUpdating = ref(false);

// 路由和状态
const router = useRouter();
const store = useMainStore();
const user = computed(() => store.user);
const messageData = computed(() => store.messageData);
const setMessageData = (data: any) => store.setMessageData(data);

// 处理消息数据更新
const handleSetMessageData = (message: Message[]) => {
  // 防止递归更新
  if (isUpdating.value || !user.value) return;

  isUpdating.value = true;
  try {
    const index = messageData.value.findIndex((e: any) => e.name === user.value.name);
    const newMessageData = [...messageData.value];
    if (index === -1) {
      newMessageData.push({
        name: user.value.name,
        message,
      });
    } else {
      // 仅在数据不同时更新
      if (JSON.stringify(newMessageData[index].message) !== JSON.stringify(message)) {
        newMessageData[index] = {
          name: user.value.name,
          message,
        };
      } else {
        return; // 数据相同则不更新
      }
    }
    setMessageData(newMessageData);
  } finally {
    isUpdating.value = false;
  }
};

// 优化滚动到底部的实现
const scrollToBottom = () => {
  // 使用nextTick确保DOM已更新
  nextTick(() => {
    if (messageContainer.value) {
      // 避免重复设置相同的值
      const currentScrollTop = messageContainer.value.scrollTop;
      const targetScrollTop = messageContainer.value.scrollHeight - messageContainer.value.clientHeight;

      if (Math.abs(currentScrollTop - targetScrollTop) > 1) {
        messageContainer.value.scrollTop = targetScrollTop;
      }
    }
  });
};

// 初始化 token
onMounted(() => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    token.value = storedToken;
  } else if (!props.directMode) {
    router.push('/login');
  } else {
    token.value = 'direct_chat_user';
  }
});

// 优化watch监听，防止循环触发
watch([user, messageData], () => {
  if (isUpdating.value || !user.value) return;

  isUpdating.value = true;
  try {
    const msg = messageData.value.find((e: any) => e.name === user.value.name);
    let msgList: Message[] = [];

    if (!msg || msg.message.length === 0) {
      msgList = [
        {
          id: user.value.id,
          content: user.value.greeting,
          type: 'start',
          role: 'assistant',
          voiceType: 0
        },
      ];
    } else {
      msgList = msg.message || [];
    }

    // 仅在消息列表不同时更新
    if (JSON.stringify(messageList.value) !== JSON.stringify(msgList)) {
      messageList.value = msgList;
      handleSetMessageData(msgList);
      scrollToBottom();
    }
  } finally {
    isUpdating.value = false;
  }
}, { immediate: true, deep: true });

// 调整内容区域高度
watch(() => props.directMode, (newVal) => {
  contentHeight.value = newVal
      ? 'calc(100vh - 200px)'
      : 'calc(100vh - 120px)';
}, { immediate: true });

// 优化语音播放控制，减少状态更新
const togglePlay = async (e: Message, index: number) => {
  // 先暂停当前播放
  if (audio.value) {
    audio.value.pause();
  }

  // 一次性更新所有消息的语音状态
  messageList.value = messageList.value.map(data => {
    if (data.id === e.id) {
      return { ...data, voiceType: 1 };
    }
    // 只重置正在播放的状态，避免不必要的更新
    if (data.voiceType === 2) {
      return { ...data, voiceType: 0 };
    }
    return data;
  });

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: token.value,
        text: e.content,
        id: user.value?.id,
        direct_mode: props.directMode,
      }),
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    audio.value = new Audio(audioUrl);
    await audio.value.play();

    // 更新为播放状态
    messageList.value = messageList.value.map(data =>
        data.id === e.id ? { ...data, voiceType: 2 } : data
    );

    audio.value.addEventListener('ended', () => {
      // 播放结束后更新状态
      messageList.value = messageList.value.map(data =>
          data.id === e.id ? { ...data, voiceType: 0 } : data
      );
    });
  } catch (error) {
    console.error('语音播放失败:', error);
    // 出错时重置状态
    messageList.value = messageList.value.map(data =>
        data.id === e.id ? { ...data, voiceType: 0 } : data
    );
  }
};

// 优化发送消息处理
const handleSendMessage = async (date) => {
  if (!date.trim()) return;

  loading.value = true;
  try {
    // 生成新消息ID
    const id = messageList.value.length === 0
        ? 1
        : messageList.value[messageList.value.length - 1].id + 1;

    // 添加用户消息
    const newUserMessage = { id, type: "end", content: date, role: "user", voiceType: 0 };
    messageList.value = [...messageList.value, newUserMessage];

    // 直接发送请求
    if (user.value) {
      // 准备消息数据
      const ary = messageList.value.map(e => ({
        role: e.role,
        content: e.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          user_name: token.value,
          messages: ary,
          id: user.value.id,
          direct_mode: props.directMode,
        }),
      });

      const data = await response.json();

      // 生成AI消息ID
      const aiId = messageList.value.length + 1;

      // 添加AI回复
      const newMessageList = [
        ...messageList.value,
        {id: aiId, type: "start", content: data.content, role: data.role, voiceType: 0}
      ];

      messageList.value = newMessageList;
      handleSetMessageData(newMessageList);

      // 滚动到底部
      scrollToBottom();
    }
  } catch (err) {
    console.error('聊天请求失败:', err);
  } finally {
    loading.value = false;
  }
};

// 取消发送
const handleCancel = () => {
  loading.value = false;
  antMessage.error('取消发送!');
};

const message = antMessage;
</script>

<style scoped>
/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  margin: 10px 0;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}

/* 微信风格气泡样式 - 带透明效果 */
.max-w-[80%] {
/* 移除强制换行属性，仅在必要时换行 */
  word-wrap: unset;
  word-break: unset;
}

.rounded-tl-none {
  border-top-left-radius: 4px !important;
}

.rounded-tr-none {
  border-top-right-radius: 4px !important;
}

/* 消息项布局优化 */
.message-item {
  position: relative;
  padding: 4px 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .custom-scrollbar {
    -webkit-overflow-scrolling: touch;
  }

  .input-container {
    padding-bottom: calc(55px + env(safe-area-inset-bottom));
    padding-top: 12px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  }
}

/* 平板及桌面端样式 */
@media (min-width: 769px) {
  .input-container {
    padding-bottom: 55px;
  }
}

/* 消息项间距 */
.space-y-6 > div {
  margin-bottom: 1.5rem;
}

/* 确保输入容器始终在底部 */
.input-container {
  width: 100%;
  box-sizing: border-box;
}
</style>
