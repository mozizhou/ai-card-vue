<template>
  <div class="chat-container w-screen h-screen flex flex-col relative overflow-hidden">
    <!-- 背景图层 -->
    <BackgroundLayer :background-url="user?.background" />

    <!-- 消息列表区域 - 核心滚动容器 -->
    <MessageListContainer
        :message-list="messageList"
        :user="user"
        :message-container="messageContainer"
        @toggle-play="handleTogglePlay"
    />

    <!-- 未选择角色提示 -->
    <NoRolePrompt v-if="!user" />

    <!-- 输入区域 - 固定在底部 -->
    <div class="input-container px-4 py-3 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-20">
      <InfoEntryBox
          class="w-full"
          :loading="loading"
          @cancel="$emit('cancel')"
          @send-message="$emit('send-message', $event)"
          :handle-send-message="handleSendMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { message as antMessage } from 'ant-design-vue';
import { useMainStore } from '@/store/store';
import { useChatLogic } from '@/views/direct-chat/api/useChatLogic';
import { useAudioPlayer } from '@/views/direct-chat/api/useAudioPlayer';

// 组件导入
import BackgroundLayer from '@/views/direct-chat/components/BackgroundLayer.vue';
import MessageListContainer from '@/views/direct-chat/components/MessageListContainer.vue';
import NoRolePrompt from '@/views/direct-chat/components/NoRolePrompt.vue';

// 类型定义
import type { Message, User } from '@/types';
import InfoEntryBox from "@/views/direct-chat/components/Info-entry-box.vue";

// Props 定义
interface ChatInterfaceProps {
  directMode?: boolean;
}

const props = withDefaults(defineProps<ChatInterfaceProps>(), {
  directMode: false
});

// 状态管理
const messageList = ref<Message[]>([]);
const messageContainer = ref<HTMLDivElement | null>(null);
const loading = ref(false);
const token = ref('');
const audio = ref<HTMLAudioElement | null>(null);

// 路由和状态
const router = useRouter();
const store = useMainStore();
const user = computed<User | null>(() => store.user);
const messageData = computed(() => store.messageData);

// 组合式函数
const { handleSetMessageData } = useChatLogic(store, user, messageData, messageList);
const { togglePlay } = useAudioPlayer(audio, messageList);

// 优化滚动到底部的实现
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
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
    router.push('/login').catch(err => console.error('路由跳转失败:', err));
  } else {
    token.value = 'direct_chat_user';
  }
});

// 监听用户和消息数据变化
watch([user, messageData], () => {
  if (!user.value) return;

  const msg = messageData.value.find((e: any) => e.name === user.value!.name);
  let msgList: Message[] = [];

  if (!msg || msg.message.length === 0) {
    msgList = [
      {
        id: user.value.id,
        content: user.value.greeting,
        type: 'start',
        role: 'assistant',
        voiceType: 0,
        isLoading: false
      },
    ];
  } else {
    msgList = msg.message || [];
  }

  if (JSON.stringify(messageList.value) !== JSON.stringify(msgList)) {
    messageList.value = msgList;
    handleSetMessageData(msgList);
    scrollToBottom();
  }
}, { immediate: true, deep: true });

// 处理语音播放
const handleTogglePlay = (message: Message, index: number) => {
  togglePlay(message, index, user.value, token.value, props.directMode);
};

// 处理发送消息
const handleSendMessage = async (content: string) => {
  if (!content.trim() || !user.value) return;

  loading.value = true;
  try {
    // 生成用户消息ID
    const userId = messageList.value.length === 0
        ? 1
        : messageList.value[messageList.value.length - 1].id + 1;

    // 添加用户消息
    const newUserMessage: Message = {
      id: userId,
      type: "end",
      content,
      role: "user",
      voiceType: 0,
      isLoading: false
    };
    messageList.value = [...messageList.value, newUserMessage];
    scrollToBottom();

    // 生成AI加载中消息
    const loadingId = userId + 1;
    const loadingMessage: Message = {
      id: loadingId,
      type: "start",
      content: "",
      role: "assistant",
      voiceType: 0,
      isLoading: true
    };
    messageList.value = [...messageList.value, loadingMessage];
    scrollToBottom();

    // 准备消息数据
    const messages = messageList.value
        .filter(msg => !msg.isLoading)
        .map(e => ({
          role: e.role,
          content: e.content
        }));

    // 发送请求
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: token.value,
        messages,
        id: user.value.id,
        direct_mode: props.directMode,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // 替换加载中消息为实际回复
    messageList.value = messageList.value.map(msg =>
        msg.id === loadingId
            ? {
              id: loadingId,
              type: "start",
              content: data.content,
              role: data.role,
              voiceType: 0,
              isLoading: false
            }
            : msg
    );

    handleSetMessageData(messageList.value);
    scrollToBottom();
  } catch (err) {
    console.error('聊天请求失败:', err);
    // 出错时移除加载中消息
    messageList.value = messageList.value.filter(msg => !msg.isLoading);
    antMessage.error('发送失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 取消发送
const handleCancel = () => {
  loading.value = false;
  antMessage.error('取消发送!');
};
</script>

<style scoped>
.chat-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

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

/* 移动端适配 */
@media (max-width: 768px) {
  .custom-scrollbar {
    -webkit-overflow-scrolling: touch;
  }
}

/* 确保输入容器始终在底部 */
.input-container {
  width: 100%;
  box-sizing: border-box;
}

/* 移动端适配 */
@media (max-width: 768px) {
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
</style>
