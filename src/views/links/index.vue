<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <!-- 标题区域 -->
      <div class="text-center mb-10 md:mb-16 relative">
        <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-70"></div>
        <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold text-gray-900 mb-4 relative inline-block">
          页面导航
          <span class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></span>
        </h1>
        <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          选择您想要访问的功能页面，快速导航至目标内容
        </p>
      </div>

      <!-- 滚动容器 -->
      <div class="scroll-container max-h-[70vh] overflow-y-auto pr-2 mb-8 rounded-xl">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
          <div
              v-for="(link, index) in links"
              :key="index"
              class="group bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
          >
            <div :class="`h-2 ${link.color.split(' ')[0]} transition-all duration-500 group-hover:h-3`"></div>
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <h2 class="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {{ link.title }}
                </h2>
                <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  ID: {{ index + 1 }}
                </span>
              </div>
              <p class="text-gray-600 mb-5 text-sm leading-relaxed">
                {{ link.description }}
              </p>
              <router-link :to="link.url">
                <a-button
                    :class="`${link.color} transition-all duration-300 transform group-hover:scale-105`"
                >
                  访问页面
                  <i class="fa fa-arrow-right ml-1"></i>
                </a-button>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 返回按钮 -->
      <div class="mt-6 text-center">
        <a-button
            type="default"
            @click="$router.push('/')"
            class="bg-gray-800 hover:bg-gray-900 text-white transition-all duration-300 px-6 py-2 rounded-lg shadow-md hover:shadow-lg"
        >
          <i class="fa fa-home mr-2"></i>返回首页
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
    description: "与 AI 角色进行自然流畅的对话交互，获取智能回应",
    url: "/direct-chat?id=1",
    color: "bg-blue-500 hover:bg-blue-600 text-white"
  },
  {
    title: "AI 对话 (ID=2)",
    description: "与 ID=7 的角色对话，体验不同的AI交互风格",
    url: "/direct-chat?id=2",
    color: "bg-green-500 hover:bg-green-600 text-white"
  },
  {
    title: "静态页面 (ID=7)",
    description: "浏览预设的静态页面内容，获取固定信息展示",
    url: "/direct-chat?id=7",
    color: "bg-indigo-500 hover:bg-indigo-600 text-white"
  },
  {
    title: "酒店房卡",
    description: "查看酒店房卡页面，获取住宿相关信息与服务",
    url: "/hotel-card",
    color: "bg-purple-500 hover:bg-purple-600 text-white"
  },
  {
    title: "拳击页面",
    description: "浏览拳击训练相关内容，获取健身指导与技巧",
    url: "/boxing",
    color: "bg-red-500 hover:bg-red-600 text-white"
  },
  {
    title: "角色信息",
    description: "查看所有可用的AI角色详细信息与功能介绍",
    url: "/direct-chat/info",
    color: "bg-yellow-500 hover:bg-yellow-600 text-white"
  }
];
</script>

<style scoped>
/* 引入Font Awesome图标 */
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");

/* 基础变量定义 */
:root {
  --primary: #3b82f6;
}

/* 滚动容器样式优化 */
.scroll-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f1f5f9;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 10px;
  border: 1px solid transparent;
  background-clip: content-box;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

/* 卡片动画与交互效果 */
.group {
  cursor: pointer;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .scroll-container {
    max-height: 60vh; /* 使用标准CSS属性写法 */
  }

  .text-center {
    margin-bottom: 8px;
  }
}
</style>
