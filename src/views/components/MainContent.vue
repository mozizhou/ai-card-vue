<template>
  <div class="w-screen h-screen flex flex-col relative">
    <!-- 背景图层 -->
    <div class="absolute inset-0 z-[-2]">
      <img
          :src="user?.background || 'http://47.99.131.58:8000/photo?idx=1&image_type=background'"
          alt="Background"
          class="w-full h-full object-cover"
      />
    </div>

    <!-- 半透明遮罩层 -->
    <div class="absolute inset-0 bg-black/5 z-[-1]"></div>

    <!-- 直接聊天模式标题栏 -->
    <div v-if="directMode && user" class="w-full p-3 flex items-center justify-center z-10">
      <div class="px-6 py-2 bg-white/30 backdrop-blur-md rounded-full shadow-lg">
        <h3 class="text-center text-[1.5rem] font-bold text-[#1a1a1a] m-0 text-shadow-[0px_1px_2px_rgba(0,0,0,0.3),0px_0px_4px_rgba(255,255,255,0.7)]">
          {{ user.name }}
        </h3>
      </div>
    </div>

    <!-- 内容区域 -->
    <div
        class="flex-1 p-4 flex flex-col justify-between relative overflow-hidden"
        :style="{ height: contentHeight }"
    >
      <div class="flex-1 overflow-y-auto mb-2">
        <BubbleList
            ref="mainRef"
            :roles="rolesAsObject"
            :items="messageList"
        />
      </div>

      <!-- 输入区域 -->
      <div class="mt-4">
        <Input
            v-model="value"
            placeholder="输入消息..."
            :loading="loading"
            @keyup.enter="handleSendMessage"
        />
        <Button
            type="primary"
            class="mt-2 w-full"
            @click="handleSendMessage"
            :loading="loading"
        >
          发送
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Input, message as antMessage } from 'ant-design-vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { BubbleList } from '@ant-design/x-vue';
import { useMainStore } from '@/store/store'; // 假设Pinia store路径
import { Message, User, MessageData } from '@/types';
import { useMobileAudio } from '@/hooks/useMobileAudio';

// 定义组件props
const props = defineProps<{
  directMode?: boolean;
}>();

// 状态管理
const store = useMainStore();
const user = computed(() => store.user);
const messageData = computed(() => store.messageData);
const setMessageData = store.setMessageData;

// 响应式变量
const value = ref('');
const messageList = ref<Message[]>([]);
const currentPlayingId = ref<number | null>(null);
const mainRef = ref<InstanceType<typeof BubbleList> | null>(null);
const token = ref('');
const contentHeight = ref('calc(100vh - 120px)');
const loading = ref(false);

// 路由实例
const router = useRouter();

// 角色配置
const rolesAsObject = {
  ai: {
    placement: 'start',
    avatar: { icon: UserOutlined },
    typing: { step: 5, interval: 20 },
    style: {
      maxWidth: 500,
    },
  },
  user: {
    placement: 'end',
    avatar: { icon: UserOutlined, style: { background: '#87d068' } },
  },
};

// 音频播放逻辑
const { playAudio, stopAudio, isPlaying, error: audioError } = useMobileAudio({
  retryAttempts: 3,
  retryDelay: 800,
  onPlayStart: () => {
    console.log('音频开始播放');
  },
  onPlayEnd: () => {
    console.log('音频播放结束');
    messageList.value = messageList.value.map(data =>
        data.id === currentPlayingId.value ? { ...data, voiceType: 0 } : data
    );
    currentPlayingId.value = null;
  },
  onPlayError: (err) => {
    console.error('音频播放失败:', err);
    messageList.value = messageList.value.map(data =>
        data.id === currentPlayingId.value ? { ...data, voiceType: 0 } : data
    );
    currentPlayingId.value = null;
  }
});

// 处理音频播放切换
const togglePlay = (e: Message) => {
  // 停止当前播放
  if (currentPlayingId.value === e.id) {
    stopAudio();
    messageList.value = messageList.value.map(data =>
        data.id === e.id ? { ...data, voiceType: 0 } : data
    );
    currentPlayingId.value = null;
    return;
  }

  // 停止之前的播放
  if (currentPlayingId.value !== null) {
    stopAudio();
    messageList.value = messageList.value.map(data =>
        data.id === currentPlayingId.value ? { ...data, voiceType: 0 } : data
    );
  }

  currentPlayingId.value = e.id;
  messageList.value = messageList.value.map(data =>
      data.id === e.id ? { ...data, voiceType: 1 } : data
  );

  // 30秒超时保护
  const timeoutId = setTimeout(() => {
    console.warn('音频播放超时，强制停止动画');
    messageList.value = messageList.value.map(data =>
        data.id === e.id ? { ...data, voiceType: 0 } : data
    );
    currentPlayingId.value = null;
  }, 30000);

  // 请求并播放音频
  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_name: token.value,
      text: e.content,
      id: user.value?.id,
      direct_mode: props.directMode,
    }),
  }).then(res => {
    if (!res.ok) {
      clearTimeout(timeoutId);
      throw new Error(`TTS请求失败: ${res.status} ${res.statusText}`);
    }

    // 更新为播放动画状态
    messageList.value = messageList.value.map(data =>
        data.id === e.id ? { ...data, voiceType: 2 } : data
    );

    return res.blob();
  }).then(audioBlob => {
    if (audioBlob.size === 0) {
      clearTimeout(timeoutId);
      throw new Error('接收到空的音频数据');
    }

    // 显示音频大小信息
    const audioSizeKB = (audioBlob.size / 1024).toFixed(2);
    const audioSizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
    const sizeText = audioBlob.size > 1024 * 1024
        ? `${audioSizeMB} MB`
        : `${audioSizeKB} KB`;

    antMessage.info(`音频接收完成，大小: ${sizeText}`, 2);

    const audioUrl = URL.createObjectURL(audioBlob);

    return playAudio(audioUrl).then(success => {
      clearTimeout(timeoutId);

      // 清理URL对象
      setTimeout(() => {
        URL.revokeObjectURL(audioUrl);
      }, 1000);

      if (!success) {
        throw new Error('音频播放失败');
      }
    });
  }).catch(error => {
    console.error('TTS请求失败:', error);
    clearTimeout(timeoutId);
    messageList.value = messageList.value.map(data =>
        data.id === e.id ? { ...data, voiceType: 0 } : data
    );
    currentPlayingId.value = null;
  });
};

// 处理发送消息
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
  mainRef.value?.scrollTo({ key: 0, block: "nearest" });
};

// 处理消息数据更新
const handleSetMessageData = (message: Message[]) => {
  if (!user.value) return;

  const index = messageData.value.findIndex(e => e.name === user.value?.name);
  const updatedData = [...messageData.value];

  if (index === -1) {
    updatedData.push({
      name: user.value.name,
      message
    });
  } else {
    updatedData[index] = {
      name: user.value.name,
      message
    };
  }

  setMessageData(updatedData);
};

// 监听loading状态发送请求
watch(loading, (newVal) => {
  if (newVal && user.value) {
    // 准备消息数据
    const ary = messageList.value.map(e => ({
      role: e.role,
      content: e.content
    }));

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: token.value,
        messages: ary,
        id: user.value.id,
        direct_mode: props.directMode,
      }),
    })
        .then(res => res.json())
        .then(data => {
          loading.value = false;

          // 生成AI消息ID
          const id = messageList.value.length === 0
              ? 1
              : messageList.value[messageList.value.length - 1].id + 1;

          // 添加AI回复
          const newMessageList = [
            ...messageList.value,
            { id, type: "start", content: data.content, role: data.role }
          ];

          messageList.value = newMessageList;
          handleSetMessageData(newMessageList);

          // 滚动到底部
          nextTick(() => {
            mainRef.value?.scrollTo({ key: 0, block: "nearest" });
          });
        })
        .catch(err => {
          console.error('聊天请求失败:', err);
          loading.value = false;
        });
  }
});

// 初始化token
onMounted(() => {
  // 处理token
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    token.value = storedToken;
  } else if (!props.directMode) {
    router.push('/login');
  } else {
    token.value = 'direct_chat_user';
  }

  // 调整内容高度
  if (props.directMode) {
    contentHeight.value = 'calc(100vh - 160px)';
  }
});

// 监听用户变化加载消息
watch(user, (newUser) => {
  if (newUser) {
    loading.value = false;
    const msg = messageData.value.find(e => e.name === newUser.name);
    let msgList: Message[] = [];

    if (!msg || msg.message.length === 0) {
      msgList = [
        {
          id: newUser.id,
          content: newUser.greeting,
          type: "start",
          role: "assistant",
        },
      ];
    } else {
      msgList = msg.message || [];
    }

    messageList.value = msgList;
    handleSetMessageData(msgList);
  }
});

// 监听directMode变化调整高度
watch(() => props.directMode, (newVal) => {
  contentHeight.value = newVal
      ? 'calc(100vh - 160px)'
      : 'calc(100vh - 120px)';
});
</script>

<style scoped>
/* 可根据需要添加组件样式 */
</style>