<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">页面导航</h1>
        <p class="text-xl text-gray-600">选择要访问的页面</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
            v-for="(link, index) in links"
            :key="index"
            class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
        >
          <div :class="`h-3 ${link.color.split(' ')[0]}`"></div>
          <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ link.title }}</h2>
            <p class="text-gray-600 mb-4">{{ link.description }}</p>
            <div class="flex justify-between items-center">
              <router-link :to="link.url">
                <a-button :class="link.color">
                  访问页面
                </a-button>
              </router-link>
              <span class="text-sm text-gray-500">ID: {{ index + 1 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <a-button
            type="default"
            @click="$router.push('/')"
            class="mx-2"
        >
          返回首页
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button as AButton } from 'ant-design-vue';
import { useRouter } from 'vue-router';

// 初始化路由
const router = useRouter();

// 链接列表数据
const links = [
  {
    title: "AI 对话 (ID=1)",
    description: "与 AI 角色进行对话",
    url: "/direct-chat?id=1",
    color: "bg-blue-500 hover:bg-blue-600"
  },
  {
    title: "AI 对话 (ID=2)",
    description: "与 ID=7 的角色对话",
    url: "/direct-chat?id=2",
    color: "bg-green-500 hover:bg-green-600"
  },
  {
    title: "静态页面 (ID=7)",
    description: "显示静态页面内容",
    url: "/direct-chat?id=7",
    color: "bg-indigo-500 hover:bg-indigo-600"
  },
  {
    title: "酒店房卡",
    description: "查看酒店房卡页面",
    url: "/hotel-card",
    color: "bg-purple-500 hover:bg-purple-600"
  },
  {
    title: "拳击页面",
    description: "查看拳击训练页面",
    url: "/boxing",
    color: "bg-red-500 hover:bg-red-600"
  },
  {
    title: "角色信息",
    description: "查看所有可用角色",
    url: "/direct-chat/info",
    color: "bg-yellow-500 hover:bg-yellow-600"
  }
];
</script>