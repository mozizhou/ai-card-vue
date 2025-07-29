<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">直接聊天功能使用说明</h1>

    <a-card class="mb-6">
      <p class="mb-4">您可以通过以下URL格式直接与指定角色聊天，无需登录：</p>
      <code class="block bg-gray-100 p-2 rounded">
        {{ origin ? `${origin}/direct-chat?id=角色ID` : '/direct-chat?id=角色ID' }}
      </code>
      <p class="mt-4">例如：</p>
      <code class="block bg-gray-100 p-2 rounded">
        {{ origin ? `${origin}/direct-chat?id=1` : '/direct-chat?id=1' }}
      </code>
    </a-card>

    <h2 class="text-xl font-bold mb-4">可用角色列表：</h2>
    <template v-if="loading">
      <p>加载中...</p>
    </template>
    <template v-else>
      <a-list
          :grid="{ gutter: 16, column: 3 }"
          :data-source="characters"
      >
        <template #renderItem="item">
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Card as ACard, List as AList, Button as AButton, CardMeta as ACardMeta } from 'ant-design-vue';
import { useRouter } from 'vue-router';

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