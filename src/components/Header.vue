<template>
  <header class="header-container">
    <div class="main-header bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div class="container mx-auto px-4 h-full">
        <!-- 桌面端与移动端布局容器 -->
        <div class="header-inner flex items-center justify-between h-full">
          <!-- 左侧：角色信息区域 -->
          <div class="left-section flex items-center gap-4">
            <!-- 移动端菜单按钮（仅在移动端显示） -->
            <button
                class="menu-toggle md:hidden"
                @click.stop="toggleMenu"
                aria-label="菜单"
            >
              <i class="fa fa-bars text-slate-700 dark:text-slate-200"></i>
            </button>

            <!-- 角色信息（全端显示） -->
            <div class="role-section flex items-center gap-3">
              <div class="avatar-wrapper">
                <img
                    :src="currentUser?.avatar || defaultAvatar"
                    :alt="currentUser?.name || 'AI助手'"
                    class="avatar"
                >
                <span class="status-indicator" title="在线"></span>
              </div>

              <div class="role-name-container">
                <p class="role-name">
                  {{ currentUser?.name || '智能助手' }}
                </p>
              </div>
            </div>
          </div>

          <!-- 右侧：功能区域 -->
          <div class="right-section flex items-center gap-4">
            <!-- 时间显示（PC端突出显示） -->
            <div class="time-display">
              <span class="time-text">{{ currentTime }}</span>
            </div>

            <!-- 功能下拉框 -->
            <div class="dropdown-container" @click.outside="closeDropdown">
              <button class="dropdown-trigger" @click.stop="toggleDropdown">
                <i class="fa fa-ellipsis-v"></i>
              </button>

              <div class="dropdown-menu" :class="{ 'show': isDropdownOpen }">
                <button class="dropdown-item">
                  <i class="fa fa-history mr-2"></i>历史记录
                </button>
                <button class="dropdown-item">
                  <i class="fa fa-cog mr-2"></i>设置
                </button>
                <button class="dropdown-item">
                  <i class="fa fa-user-circle-o mr-2"></i>用户中心
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div
        class="mobile-menu md:hidden"
        :class="{ 'show': showMobileMenu }"
    >
      <div class="mobile-menu-items">
        <button class="mobile-menu-item">
          <i class="fa fa-question-circle mr-2"></i>帮助中心
        </button>
        <button class="mobile-menu-item">
          <i class="fa fa-star mr-2"></i>我的收藏
        </button>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useMainStore } from '@/store/store';

// 状态管理
const store = useMainStore();
const currentUser = computed(() => store.user);
const showMobileMenu = ref(false);
const currentTime = ref('');
const isDropdownOpen = ref(false);
const defaultAvatar = 'https://picsum.photos/200/200?random=1';

// 切换下拉框
const toggleDropdown = (e: Event) => {
  e.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
  showMobileMenu.value = false;
};

// 关闭下拉框
const closeDropdown = () => {
  isDropdownOpen.value = false;
};

// 切换移动端菜单
const toggleMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  isDropdownOpen.value = false;
};

// 更新当前时间
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// 初始化
onMounted(() => {
  updateTime();
  const timer = setInterval(updateTime, 60000);
  const handleDocClick = () => closeDropdown();
  document.addEventListener('click', handleDocClick);

  onUnmounted(() => {
    clearInterval(timer);
    document.removeEventListener('click', handleDocClick);
  });
});
</script>

<style scoped>
/* 基础样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.header-container {
  font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
}

/* 主头部样式 */
.main-header {
  height: 56px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 头部内部容器 - 核心布局控制 */
.header-inner {
  width: 100%;
  display: flex;
  justify-content: space-between; /* PC端左右区域分离 */
  align-items: center;
}

/* 左侧区域 */
.left-section {
  display: flex;
  align-items: center;
}

/* 移动端菜单按钮 */
.menu-toggle {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.menu-toggle:hover {
  background-color: #f1f5f9;
}

/* 角色信息区域 */
.role-section {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  width: 38px;
  height: 38px;
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #f0f4f8;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #36d399;
  border: 2px solid white;
}

/* 角色名样式 */
.role-name-container {
  min-width: 0;
}

.role-name {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  dark-mode: color #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧功能区域 */
.right-section {
  display: flex;
  align-items: center;
}

/* 时间显示 - PC端优化 */
.time-display {
  color: #64748b;
  font-size: 13px;
  white-space: nowrap;
}

/* 下拉菜单区域 */
.dropdown-container {
  position: relative;
}

.dropdown-trigger {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background-color: transparent;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-trigger:hover {
  background-color: #f1f5f9;
  dark-mode: background-color #334155;
}

.dropdown-menu {
  position: absolute;
  top: 44px;
  right: 0;
  min-width: 160px;
  background-color: white;
  dark-mode: background-color #1e293b;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  dark-mode: border-color #334155;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 6px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(5px);
  transition: all 0.2s ease;
  z-index: 100;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  width: 100%;
  padding: 9px 16px;
  text-align: left;
  background: none;
  border: none;
  color: #334155;
  dark-mode: color #e2e8f0;
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
  dark-mode: background-color #334155;
}

/* 移动端菜单 */
.mobile-menu {
  background-color: white;
  dark-mode: background-color #1e293b;
  border-bottom: 1px solid #e4e7eb;
  dark-mode: border-bottom-color #334155;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease;
}

.mobile-menu.show {
  max-height: 150px;
}

.mobile-menu-items {
  padding: 8px 10px;
}

.mobile-menu-item {
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  background: none;
  border: none;
  color: #334155;
  dark-mode: color #e2e8f0;
  font-size: 14px;
  display: flex;
  align-items: center;
  border-radius: 6px;
}

.mobile-menu-item:hover {
  background-color: #f1f5f9;
  dark-mode: background-color #334155;
}

/* 响应式布局调整 */
@media (min-width: 768px) {
  /* PC端特有样式 */
  .header-inner {
    padding: 0 8px;
  }

  .role-section {
    gap: 12px;
  }

  .time-display {
    margin-right: 4px;
  }
}

@media (max-width: 767px) {
  /* 移动端特有样式 */
  .header-inner {
    padding: 0 4px;
  }

  .left-section {
    gap: 2px;
  }

  .right-section {
    gap: 2px;
  }

  .role-section {
    gap: 8px;
  }

  .avatar-wrapper {
    width: 34px;
    height: 34px;
  }

  .role-name {
    font-size: 14px;
  }

  .time-display {
    font-size: 12px;
  }

  .dropdown-trigger {
    width: 32px;
    height: 32px;
  }
}

/* 深色模式适配 */
.dark .status-indicator {
  border-color: #1e293b;
}

.dark .dropdown-trigger {
  color: #94a3b8;
}
</style>
