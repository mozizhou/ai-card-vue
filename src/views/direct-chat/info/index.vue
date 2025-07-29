<template>
  <div class="page-container h-screen flex flex-col bg-gray-50">
    <!-- 顶部导航栏 - 固定不动 -->
    <header class="bg-white border-b p-4 shadow-sm z-10">
      <h1 class="text-xl font-bold text-gray-800">角色信息列表</h1>
    </header>
    <!--    <a-card class="mb-6">-->
    <!--      <p class="mb-4">您可以通过以下URL格式直接与指定角色聊天，无需登录：</p>-->
    <!--      <code class="block bg-gray-100 p-2 rounded">-->
    <!--        {{ origin ? `${origin}/direct-chat?id=角色ID` : '/direct-chat?id=角色ID' }}-->
    <!--      </code>-->
    <!--      <p class="mt-4">例如：</p>-->
    <!--      <code class="block bg-gray-100 p-2 rounded">-->
    <!--        {{ origin ? `${origin}/direct-chat?id=1` : '/direct-chat?id=1' }}-->
    <!--      </code>-->
    <!--    </a-card>-->

    <div v-if="loading">
      <p>加载中...</p>
    </div>
    <main class="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
      <div class="container mx-auto p-4 ">
        <!-- 角色列表 -->
        <div class="space-y-6 py-4">
          <a-list
              :grid="{ gutter: 16, xs: 1, sm:2 ,md:2, lg: 3, xl: 4, xxl: 5, xxxl:6 }"
              :data-source="characters"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-card
                    :title="`${item.name} (ID: ${item.id})`"
                >
                  <template #cover>
                    <div class="h-48 relative">
                      <img
                          :src="item.avatar"
                          :alt="item.name"
                          class="w-full h-full object-cover"
                      />
                    </div>
                  </template>
                  <a-card-meta
                      :title="item.name"
                      :description="`${item.greeting.substring(0, 100)}...`"
                  />
                  <template #actions>
                    <router-link :to="`/direct-chat?id=${item.id}`">
                      <a-button type="primary">开始聊天</a-button>
                    </router-link>
                  </template>
                </a-card>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {Card as ACard, List as AList, Button as AButton, CardMeta as ACardMeta} from 'ant-design-vue';
import {useRouter} from 'vue-router';

interface User {
  id: number;
  name: string;
  greeting: string;
  avatar: string;
  background?: string;
}

const characters = ref<User[]>([]);
const loading = ref(true);
const origin = ref('');

onMounted(() => {
  // 设置origin
  origin.value = window.location.origin;

  // 获取所有角色信息
  fetch('/api/get_info')
      .then((res) => res.json())
      .then((data) => {
        characters.value = data.characters;
        loading.value = false;
      })
      .catch((err) => {
        console.error('获取角色信息失败:', err);
        loading.value = false;
      });
});
</script>

<style scoped>
/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
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

/* 滚动行为优化 */
.scroll-smooth {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* 移动端平滑滚动 */
}

/* 防止内容被滚动条挤压 */
.container {
  padding-right: calc(1rem + 6px); /* 预留滚动条宽度 */
}

/* 移动端触摸滚动优化 */
@media (max-width: 768px) {
  .scrollbar-thin {
    -webkit-overflow-scrolling: touch; /* 启用平滑触摸滚动 */
  }
}
</style>