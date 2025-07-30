<template>
  <div>
    <!-- 静态页面组件 (id=7) -->
    <template v-if="characterId === '7'">
      <div class="w-screen h-screen">
        <iframe
            src="src/index/index.html"
            class="w-full h-full border-0"
            title="静态页面"
        />
      </div>
    </template>

    <!-- 加载状态 -->
    <template v-else-if="loading">
      <div class="w-full h-screen flex items-center justify-center">
        加载中...
      </div>
    </template>

    <!-- 错误状态 -->
    <template v-else-if="error">
      <div class="w-full h-screen flex items-center justify-center flex-col">
        <div class="text-red-500 mb-4">{{ error }}</div>
        <a-button
            type="primary"
            @click="handleGoToInfo"
        >
          查看可用角色
        </a-button>
      </div>
    </template>

    <!-- 主内容区域 -->
    <template v-else>
      <MainContent :direct-mode="true" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMainStore } from '@/store/store';
import MainContent from '@/views/components/MainContent.vue';
import { User } from '@/types';

// 路由与状态管理
const route = useRoute();
const router = useRouter();
const store = useMainStore();
const setUser = store.setUser;

// 响应式状态
const loading = ref(true);
const error = ref('');
const characterId = computed(() => route.query.id as string | null);
const actualCharacterId = computed(() => {
  return characterId.value === '2' ? '7' : characterId.value;
});

// 跳转至角色信息页
const handleGoToInfo = () => {
  router.push('/direct-chat/info');
};

// 初始化获取角色信息
onMounted(() => {
  console.log(route.params)
  if (!characterId.value) {
    error.value = '请在URL中指定角色ID';
    loading.value = false;
    return;
  }

  // 获取角色信息
  fetch('/api/get_info')
      .then((res) => res.json())
      .then((data) => {
        if (!data.characters || data.characters.length === 0) {
          error.value = '获取角色列表失败';
          loading.value = false;
          return;
        }

        const character = data.characters.find(
            (c: any) => `${c.id}` === actualCharacterId.value
        );

        if (character) {
          // 构造用户信息
          const user: User = {
            id: character.id,
            name: character.name,
            greeting: character.greeting || `你好，我是${character.name}`,
            avatar: character.avatar,
            background: character.background,
            message: []
          };
          setUser(user);
          loading.value = false;
        } else {
          error.value = '找不到指定的角色';
          loading.value = false;
        }
      })
      .catch((err) => {
        console.error('获取角色信息失败:', err);
        error.value = '获取角色信息失败';
        loading.value = false;
      });
});
</script>