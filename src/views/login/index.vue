<template>
  <div class="login-page flex items-center justify-center min-h-screen relative overflow-hidden">
    <!-- 动态背景图层 -->
    <div class="dynamic-bg absolute inset-0 z-0">
      <!-- 背景图片轮播 -->
      <div
          class="bg-images absolute inset-0 transition-opacity duration-1500 ease-in-out"
          :style="{
          opacity: currentBgIndex === 0 ? 1 : 0,
          backgroundImage: `url(${bgImages[0]})`
        }"
      ></div>
      <div
          class="bg-images absolute inset-0 transition-opacity duration-1500 ease-in-out"
          :style="{
          opacity: currentBgIndex === 1 ? 1 : 0,
          backgroundImage: `url(${bgImages[1]})`
        }"
      ></div>
      <div
          class="bg-images absolute inset-0 transition-opacity duration-1500 ease-in-out"
          :style="{
          opacity: currentBgIndex === 2 ? 1 : 0,
          backgroundImage: `url(${bgImages[2]})`
        }"
      ></div>

      <!-- 动态装饰元素 -->
      <div class="decor-elements">
        <div class="decor-circle circle-1"></div>
        <div class="decor-circle circle-2"></div>
        <div class="decor-wave wave-1"></div>
        <div class="decor-wave wave-2"></div>
      </div>

      <!-- 渐变遮罩 -->
      <div class="bg-overlay absolute inset-0"></div>
    </div>

    <!-- 登录卡片容器 -->
    <div class="login-card-container">
      <div class="login-card">
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="text-center mb-6">
            <h2 class="text-[clamp(1.5rem,5vw,2rem)] font-bold text-gray-800 mb-1">欢迎回来</h2>
            <p class="text-gray-500 text-sm">请登录您的账号继续使用</p>
          </div>
        </div>

        <!-- 登录表单 -->
        <a-form
            :model="formState"
            :rules="rules"
            class="login-form"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
        >
          <a-form-item name="username" class="form-item">
            <label class="form-label">用户名</label>
            <a-input
                id="username"
                class="form-control"
                placeholder="请输入用户名"
                v-model:value="formState.username"
            />
          </a-form-item>

          <a-form-item name="password" class="form-item">
            <div class="form-label-group">
              <label class="form-label">密码</label>
              <a href="#" class="text-xs text-primary hover:text-primary-dark transition-colors">忘记密码?</a>
            </div>
            <a-input-password
                type="password"
                id="password"
                class="form-control"
                placeholder="请输入密码"
                v-model:value="formState.password"
            />
          </a-form-item>

          <a-form-item :label="null" class="form-actions">
            <a-button
                type="primary"
                html-type="submit"
                :loading="isLoading"
                class="login-btn w-full"
            >
              <span>登录</span>
              <i class="icon-arrow-right ml-2"></i>
            </a-button>
          </a-form-item>

          <!-- 注册链接 -->
          <div class="register-link text-center">
            <p class="text-gray-600 text-sm">
              还没有账号?
              <a href="#" class="text-primary hover:text-primary-dark font-medium transition-colors">立即注册</a>
            </p>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useMainStore } from '@/store/store';

// 引入路由
const router = useRouter();

// 背景图片列表
const bgImages = [
  'http://47.99.131.58:8000/photo?idx=4&image_type=background',
  'http://47.99.131.58:8000/photo?idx=2&image_type=background',
  'http://47.99.131.58:8000/photo?idx=3&image_type=background',
  'http://47.99.131.58:8000/photo?idx=6&image_type=background'
];

// 当前显示的背景索引
const currentBgIndex = ref(0);

// 登录状态管理
const isLoading = ref(false);
const store = useMainStore();

// 表单状态
const formState = ref({
  username: '',
  password: '',
  remember: true
});

// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入账号!' }],
  password: [{ required: true, message: '请输入密码!' }]
};

// 自动切换背景图和加载本地存储数据
onMounted(() => {
  // 背景图轮播
  const bgInterval = setInterval(() => {
    currentBgIndex.value = (currentBgIndex.value + 1) % bgImages.length;
  }, 5000);

  // 清理定时器
  return () => clearInterval(bgInterval);
});

// 从本地存储加载数据
onMounted(() => {
  const uname = localStorage.getItem('username') || '';
  const pwd = localStorage.getItem('password') || '';

  if (uname && pwd) {
    formState.value = {
      username: uname,
      password: pwd,
      remember: true
    };
  }
});

// 表单提交处理
const onFinish = async () => {
  isLoading.value = true;
  const { remember, password, username } = formState.value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formState.value)
    });

    if (response.status === 200) {
      // 保存token
      localStorage.setItem('token', username || '');

      // 根据记住账号选项处理本地存储
      if (remember) {
        localStorage.setItem('username', username || '');
        localStorage.setItem('password', password || '');
      } else {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
      }

      // 跳转首页
      router.push('/links');
    } else {
      const data = await response.json();
      message.error(data.detail || '登录失败，请检查账号密码');
    }
  } catch (error) {
    console.error('登录请求失败:', error);
    message.error('网络错误，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

// 表单验证失败处理
const onFinishFailed = (errorInfo: any) => {
  console.log('表单验证失败:', errorInfo);
};
</script>

<style scoped lang="scss">
// 引入项目基础变量
@import '@/assets/base.css';

// 主题色定义
$primary-color: #0faef2;
$primary: #0faef2;
$primary-dark: #0d96d6;
$primary-light: #e6f7ff;
$text-dark: #1f2329;
$text-gray: #666;
$border-color: #ddd;

// 基础样式
.login-page {
  font-family: 'Inter', sans-serif;
  width: 100vw;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 卡片容器
.login-card-container {
  width: 100%;
  max-width: 400px;
  padding: 8px;
}

// 登录卡片核心样式
.login-card {
  width: 100%;
  padding: 28px 24px;
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
}

// 表单样式
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px; // 统一表单元素间距
}

// 表单项样式
.form-item {
  margin-bottom: 0 !important;

  // 修复Ant Design表单样式冲突
  &:deep(.ant-form-item-control-input) {
    min-height: auto;
  }

  &:deep(.ant-form-item-explain-error) {
    margin-top: 4px;
    font-size: 12px;
  }
}

// 标签样式
.form-label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: $text-dark;
  margin-bottom: 8px;
}

// 标签组样式（密码+忘记密码）
.form-label-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

// 输入框样式
.form-control {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  border: 1px solid $border-color;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:focus {
    border-color: $primary;
    box-shadow: 0 0 0 2px rgba(15, 174, 242, 0.2);
    outline: none;
  }
}

// 登录按钮样式
.login-btn {
  height: 46px;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 500;
  background-color: $primary;
  color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: $primary-dark;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 174, 242, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(15, 174, 242, 0.25);
  }

  .icon-arrow-right {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
  }

  &:hover .icon-arrow-right {
    transform: translateX(3px);
  }
}

// 注册链接样式
.register-link {
  margin-top: 16px;
  font-size: 14px;
}

// 动态背景样式
.dynamic-bg {
  .bg-images {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: brightness(0.7);
  }

  .bg-overlay {
    background: linear-gradient(
            135deg,
            rgba(15, 174, 242, 0.18) 0%,
            rgba(0, 0, 0, 0.45) 100%
    );
    backdrop-filter: blur(2px);
  }

  .decor-elements {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  // 装饰圆形
  .decor-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.25;
    animation: float 20s infinite ease-in-out;
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, $primary-color 0%, transparent 70%);
    top: -300px;
    right: -200px;
    animation-delay: 0s;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, #f5426d 0%, transparent 70%);
    bottom: -200px;
    left: -150px;
    animation-delay: 8s;
  }

  // 装饰波浪
  .decor-wave {
    position: absolute;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
    animation: waveMotion 18s infinite ease-in-out;
  }

  .wave-1 {
    width: 500px;
    height: 500px;
    top: 15%;
    left: 5%;
    animation-delay: 3s;
  }

  .wave-2 {
    width: 350px;
    height: 350px;
    bottom: 5%;
    right: 10%;
    animation-delay: 10s;
  }
}

// 动画定义
@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(40px, -60px) rotate(5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

@keyframes waveMotion {
  0% {
    transform: translate(0, 0) rotate(0deg);
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  }
  50% {
    transform: translate(30px, -40px) rotate(5deg);
    border-radius: 50% 50% 30% 70% / 50% 30% 70% 40%;
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  }
}

// 响应式调整 - 平板及以下
@media screen and (max-width: 768px) {
  .login-card {
    padding: 24px 20px;
    max-width: 340px;
    margin: 0 auto;
  }

  .login-form {
    gap: 16px;
  }

  .login-btn {
    height: 44px;
    font-size: 15px;
  }

  .decor-circle {
    filter: blur(60px);
  }

  .circle-1 { width: 350px; height: 350px; }
  .circle-2 { width: 250px; height: 250px; }
  .wave-1 { width: 400px; height: 400px; }
  .wave-2 { width: 300px; height: 300px; }
}

// 小屏手机适配
@media screen and (max-width: 360px) {
  .login-page {
    padding: 12px;
  }

  .login-card {
    padding: 20px 16px;
    max-width: 280px;
  }

  .form-control {
    padding: 11px 12px;
    font-size: 14px;
  }

  .login-btn {
    height: 42px;
    font-size: 14px;
  }

  .register-link {
    font-size: 13px;
  }

  .text-center h2 {
    font-size: 1.4rem;
  }
}

// 处理移动端键盘弹出问题
@media (max-width: 768px) and (orientation: portrait) {
  .login-page {
    min-height: auto;
    padding-top: 40px;
    padding-bottom: 40px;
  }
}
</style>
