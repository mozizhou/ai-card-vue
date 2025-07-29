<template>
  <div class="h-screen lg:pt-0 pt-10 relative flex">
    <!-- 移动端菜单按钮 -->
    <div class="lg:hidden fixed top-0 left-0 h-10 w-full flex justify-start items-center bg-white border-b border-gray-200">
      <img
          alt="mobile menu"
          class="ml-3 cursor-pointer"
          width="18"
          height="18"
          src="/mobile_menu.png"
          @click="handleMenuClick"
      />
    </div>

    <!-- 导航菜单 -->
    <div
        :class="['h-full layout fixed top-0 left-0 bottom-0 z-50 bg-white w-2/3 transition-transform duration-300 ease-in-out',
        showNavigation ? 'translate-x-0' : '-translate-x-full', 'lg:block']"
    >
      <Navigation @close="handleNavigationClose" />
    </div>

    <!-- 主内容 -->
    <component :is="MainContentComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Navigation from './Navigation.vue';
import type { Component } from 'vue';

const props = defineProps<{
  MainContentComponent: Component;
}>();

const showNavigation = ref(false);

const handleMenuClick = () => {
  showNavigation.value = !showNavigation.value;
};

const handleNavigationClose = () => {
  showNavigation.value = false;
};
</script>