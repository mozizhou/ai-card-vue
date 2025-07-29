<template>
  <div class="w-screen h-screen flex flex-col relative">
    <!-- 背景图层 -->
    <div class="absolute inset-0 z-[-2]">
      <img
          :src="user?.background || 'http://47.99.131.58:8000/photo?idx=1&image_type=background'"
          alt="Background"
          class="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    <!-- 半透明遮罩 -->
    <div class="absolute inset-0 bg-black/5 z-[-1]"></div>

    <!-- 直接聊天模式标题栏 -->
    <div v-if="directMode && user" class="w-full p-3 flex items-center justify-center z-10">
      <div class="px-6 py-2 bg-white/30 backdrop-blur-md rounded-full shadow-lg">
        <h3
            style="
            margin: 0;
            text-align: center;
            text-shadow: 0px 1px 2px rgba(0,0,0,0.3), 0px 0px 4px rgba(255,255,255,0.7);
            font-weight: bold;
            color: #1a1a1a;
            font-size: 1.5rem;
          "
        >
          {{ user.name }}
        </h3>
      </div>
    </div>

    <div
        class=" p-4 flex flex-col justify-between relative overflow-hidden"
        :style="{ height: contentHeight }"
    >
      <!-- 消息列表区域 - 核心滚动容器 -->
      <div
          class="flex-1 overflow-y-auto mb--2 custom-scrollbar"
          ref="messageContainer"
          style="scroll-behavior: smooth; padding-right: 8px;"
      >
        <template v-if="user">
          <div class="space-y-4 pb-8"> <!-- 底部留白避免最后一条被输入框遮挡 -->
            <!-- 消息项 -->
            <div
                v-for="(e, index) in messageList"
                :key="e.id"
                class="flex"
                :class="{
                'justify-start': e.type === 'start',
                'justify-end': e.type === 'end'
              }"
            >
              <!-- 头像区域 -->
              <div v-if="e.type === 'start'" class="mr-2 mt-1">
                <div class="w-10 h-10 rounded-full overflow-hidden">
                  <img
                      v-if="user"
                      class="w-full h-full object-cover"
                      :src="user.avatar"
                      alt="AI Avatar"
                  />
                  <UserOutlined v-else class="w-full h-full" />
                </div>
              </div>

              <!-- 消息内容气泡 -->
              <div
                  class="max-w-[80%] px-4 py-3 rounded-2xl shadow-md"
                  :class="{
                  'bg-white/90': e.type === 'start',
                  'bg-green-500 text-white': e.type === 'end'
                }"
              >
                <p class="m-0">{{ e.content }}</p>

                <!-- 语音播放按钮 -->
                <div
                    v-if="e.type === 'start'"
                    class="mt-2 flex items-center cursor-pointer"
                    @click="togglePlay(e, index)"
                >
                  <template v-if="e.voiceType === 1">
                    <LoadingOutlined style="fontSize: 16px" />
                  </template>
                  <template v-else-if="e.voiceType === 2">
                    <img src="/playing.gif" alt="Playing" width="16" height="16" />
                  </template>
                  <template v-else>
                    <img src="/stop.png" alt="Stop" width="16" height="16" />
                  </template>
                </div>
              </div>

              <!-- 用户头像 -->
              <div v-if="e.type === 'end'" class="ml-2 mt-1">
                <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <UserOutlined class="text-white" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 未选择角色提示 -->
        <div v-else class="flex-1 flex items-center justify-center">
          <p class="text-lg">请选择角色</p>
        </div>
      </div>

      <!-- 输入区域 -->
      <InfoEntryBox
          class="allbtn"
          ref="infoEntry"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
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

// 路由和状态
const router = useRouter();
const store = useMainStore();
const user = computed(() => store.user);
const messageData = computed(() => store.messageData);
const setMessageData = (data: any) => store.setMessageData(data);

// 处理消息数据更新（提前定义，避免初始化顺序问题）
const handleSetMessageData = (message: Message[]) => {
  if (!user.value) return;
  const index = messageData.value.findIndex((e: any) => e.name === user.value.name);
  const newMessageData = [...messageData.value];
  if (index === -1) {
    newMessageData.push({
      name: user.value.name,
      message,
    });
  } else {
    newMessageData[index] = {
      name: user.value.name,
      message,
    };
  }
  setMessageData(newMessageData);
};

// 滚动到消息底部
const scrollToBottom = () => {
  // 使用 setTimeout 确保在 DOM 更新后执行
  setTimeout(() => {
    if (messageContainer.value) {
      // 平滑滚动到底部
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  }, 0);
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

// 监听用户和消息数据变化
watch([user, messageData], () => {
  if (user.value) {
    // loading.value = false;
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
    messageList.value = msgList;
    handleSetMessageData(msgList);
    scrollToBottom(); // 数据加载后滚动到底部
  }
}, { immediate: true });

// 调整内容区域高度
watch(() => props.directMode, (newVal) => {
  contentHeight.value = newVal
      ? 'calc(100vh - 200px)'
      : 'calc(100vh - 120px)';
}, { immediate: true });

// 语音播放控制
const togglePlay = (e: Message, index: number) => {
  messageList.value = messageList.value.map(data =>
      data.id === e.id ? { ...data, voiceType: 1 } : data
  );

  if (audio.value) {
    audio.value.pause();
    messageList.value = messageList.value.map(ele => ({
      ...ele,
      voiceType: ele.id === e.id ? 1 : 0
    }));
  }

  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_name: token.value,
      text: e.content,
      id: user.value?.id,
      direct_mode: props.directMode,
    }),
  })
      .then(async (res) => {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audio.value = new Audio(audioUrl);
        await audio.value.play();

        messageList.value = messageList.value.map(data =>
            data.id === e.id ? { ...data, voiceType: 2 } : data
        );

        audio.value.addEventListener('ended', () => {
          messageList.value = messageList.value.map(data =>
              data.id === e.id ? { ...data, voiceType: 0 } : data
          );
        });
      })
      .catch(console.error);
};

// 发送消息处理
const handleSendMessage = async () => {
  if (!value.value.trim()) return;

  loading.value = true;

  // 生成新消息ID
  const id = messageList.value.length === 0
      ? 1
      : messageList.value[messageList.value.length - 1].id + 1;

  // 添加用户消息
  messageList.value = [
    ...messageList.value,
    { id, type: "end", content: value.value, role: "user" }
  ];

  // 清空输入框
  value.value = '';

  // 滚动到底部
  await nextTick();
  messageContainer.value?.scrollTo({ key: 0, block: "nearest" });

  // 直接发送请求，不再通过watch监听loading
  if (user.value) {
    try {
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
        {id: aiId, type: "start", content: data.content, role: data.role}];
      messageList.value = newMessageList;
      handleSetMessageData(newMessageList);

      // 滚动到底部
      nextTick(() => {
        scrollToBottom()
      });
    } catch (err) {
      console.error('聊天请求失败:', err);
    } finally {
      loading.value = false;
    }
  }
};

// 取消发送
const handleCancel = () => {
  loading.value = false;
  antMessage.error('取消发送!');
};

// 监听 loading 状态发送请求
// watch(loading, (newVal) => {
//   if (newVal && user.value) {
//     const ary = messageList.value.map(e => ({
//       role: e.role,
//       content: e.content
//     }));
//
//     fetch('/api/chat', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         user_name: token.value,
//         messages: ary,
//         id: user.value.id,
//         direct_mode: props.directMode,
//       }),
//     })
//         .then(res => res.json())
//         .then((data) => {
//           loading.value = false;
//           const id = messageList.value.length === 0
//               ? 1
//               : messageList.value[messageList.value.length - 1].id + 1;
//
//           const newMessage: Message = {
//             id,
//             type: 'start',
//             content: data.content,
//             role: data.role,
//             voiceType: 0
//           };
//
//           messageList.value.push(newMessage);
//           handleSetMessageData(messageList.value);
//           scrollToBottom();
//         })
//         .catch(() => {
//           loading.value = false;
//         });
//   }
// });

const message = antMessage;
</script>

<style scoped>
/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px; /* 滚动条宽度 */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; /* 轨道透明 */
  margin: 10px 0; /* 轨道上下留白 */
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5); /* 滑块颜色 */
  border-radius: 3px; /* 滑块圆角 */
  transition: background-color 0.2s ease; /* 过渡效果 */
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8); /*  hover 状态颜色 */
}

/* 移动端触摸滚动优化 */
@media (max-width: 768px) {
  .custom-scrollbar {
    -webkit-overflow-scrolling: touch; /* 启用原生触摸滚动优化 */
  }
}

/* 消息项间距 */
.space-y-4 > div {
  margin-bottom: 1rem;
}

.allbtn {
  width: 100%;
  position: absolute;
  bottom: 0;
  z-index: 2;
}
</style>
