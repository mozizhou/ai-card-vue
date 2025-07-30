<template>
  <div class="intr_wrap">
    <!-- 选中的图片预览 -->
    <div class="top" v-if="datas.image">
      <div class="list">
        <div class="close" @click="closeimage" title="移除图片"></div>
        <img :src="datas.image" :alt="`预览图: ${datas.image.split('/').pop()}`" />
      </div>
    </div>

    <!-- 主输入区域 -->
    <div class="info-entry-box flex flex-col gap-2" :class="{ active: moreBlockState }">
      <div class="flex w-full gap-2 items-center" :class="datas.row > 0 ? 'items-end' : ''">
        <!-- 切换按钮 -->
<!--        <div class="navigation">-->
<!--          <div class="keyboard" v-if="status === 2" @click="status = 1" title="切换到文字输入"></div>-->
<!--          <div class="audit_btn" v-if="status === 1" @click="status = 2" title="切换到语音输入"></div>-->
<!--        </div>-->

        <!-- 文字输入区域 -->
        <div class="text_wrap" :class="'input' + datas.row" v-if="status === 1">
          <textarea
              class="input_message"
              @input="HandleChange"
              v-model="datas.message"
              placeholder="输入消息..."
              @keyup.enter="handleSendMessage"
              @keyup="HandleIsShowModel"
              @focus="moreBlockState = false"
              :disabled="isLoading"
          ></textarea>
        </div>

        <!-- 语音输入区域 -->
        <div class="flex-1 flex voice-wrap" v-if="status === 2">
          <t-button class="voice-button" shape="round" :disabled="isLoading">
            按住说话
          </t-button>
          <div
              class="wraps"
              @touchstart="HandleShowAudit"
              @touchmove="HandleAudioMove"
              @touchend="HandleAudioEnd"
              @mousedown="HandleShowAudit"
              @mouseup="HandleAudioEnd"
              @mousemove="HandleAudioMove"
              :style="{ pointerEvents: isLoading ? 'none' : 'auto' }"
          ></div>
        </div>

        <!-- 发送按钮/更多选项 -->
        <div class="more_child">
<!--          <div-->
<!--              class="add-btn"-->
<!--              v-if="status === 1 && !datas.message && !isLoading"-->
<!--              @click="onClickAddCircle"-->
<!--              title="更多选项"-->
<!--          >-->
<!--            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--              <circle cx="12" cy="12" r="10" stroke="#646566" stroke-width="2"/>-->
<!--              <line x1="12" y1="6" x2="12" y2="18" stroke="#646566" stroke-width="2" stroke-linecap="round"/>-->
<!--              <line x1="6" y1="12" x2="18" y2="12" stroke="#646566" stroke-width="2" stroke-linecap="round"/>-->
<!--            </svg>-->
<!--          </div>-->

          <div
              class="send-btn"
              @click="HandleSendMessage"
              title="发送消息"
              :class="{ 'loading': isLoading }"
              :disabled="isLoading"
          >
            <svg v-if="!isLoading" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13L2 2L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 2L15 22L11 13L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <!-- 更多选项区域 -->
      <div class="more-options" v-if="moreBlockState && !isLoading">
        <div class="option-item" @click="onClickAddCircle">
          <input type="file" class="upload" @change="getFile" accept="image/*" />
          <div class="icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#646566" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="#646566" stroke-width="2"/>
              <path d="M12 14V17" stroke="#646566" stroke-width="2" stroke-linecap="round"/>
              <path d="M15 16H9" stroke="#646566" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span>图片</span>
        </div>

        <!-- 可以添加更多选项 -->
        <div class="option-item" @click="onClickAddCircle">
          <div class="icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#646566" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="#646566" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 13H8" stroke="#646566" stroke-width="2" stroke-linecap="round"/>
              <path d="M16 17H8" stroke="#646566" stroke-width="2" stroke-linecap="round"/>
              <path d="M10 9H9H8" stroke="#646566" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span>文件</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Toast } from 'tdesign-mobile-vue'
import { ref, reactive, onMounted, defineEmits, defineProps } from 'vue'
import Recorder from 'js-audio-recorder'
import { useSystemStore } from '@/store/system'
import { useMenuStore } from '@/store/menu'

// 定义接收的props
const props = defineProps({
  handleSendMessage: {
    type: Function,
    required: true,
    description: '用于处理消息发送的回调方法'
  }
})

const ststemStore = useSystemStore()
const menuStore = useMenuStore()

const moreBlockState = ref(false)
const datas = reactive({
  message: '',
  row: 0,
  image: '',
  lastMentionNode: null,
  isPC: false,
})
const status = ref(1) // 1 文本输入 2 语音输入
const isLoading = ref(false) // 新增：加载状态

const emits = defineEmits([
  'HandEmitEvent',
  'HandEmitMessage',
  'HandleCloseStyle',
  'HandleShowSelectModel',
  'HandleAudioEnd'
])

onMounted(() => {
  // 检测设备类型
  datas.isPC = !/Mobi|Android|iPhone/i.test(navigator.userAgent)

  // 为输入框添加自动聚焦动画
  setTimeout(() => {
    const input = document.querySelector('.input_message')
    if (input) input.classList.add('focus-visible')
  }, 300)
})

const onClickAddCircle = () => {
  moreBlockState.value = !moreBlockState.value
}

const HandleShowAudit = () => {
  if (localStorage.getItem('isAnonymous')) {
    menuStore.HandleShowLogin(true)
    return
  }
  if (ststemStore.getCanAudio) {
    emits('HandEmitEvent')
    if (datas.isPC) {
      window.addEventListener('mouseup', HandleAudioEnd)
      window.addEventListener('mousemove', HandleAudioMove)
    }
  } else {
    Recorder.getPermission().then(
        () => {
          ststemStore.handleCanAudio(true)
        },
        (error) => {
          Toast('noMedio')
        },
    )
  }
}

const handleSendMessage = async (event) => {
  // 支持Enter发送和按钮点击发送
  if ((event && event.key === 'Enter') || !event) {
    // 阻止回车键默认行为（如换行）
    event?.preventDefault();

    if (localStorage.getItem('isAnonymous')) {
      menuStore.HandleShowLogin(true)
      return
    }

    // 加载状态下不执行
    if (isLoading.value) return;

    const dom = document.querySelector('.input_message')
    if (dom) dom.blur()

    const message = datas.message.trim()
    if (!message) return

    datas.row = 0

    // 显示加载状态
    isLoading.value = true

    try {
      // 调用父组件的发送方法，并等待其完成
      await props.handleSendMessage(message)

      // 发送成功后清空输入框
      datas.message = ''

      // 添加发送成功动画
      if (dom) dom.classList.add('sent-animation')
      setTimeout(() => dom?.classList.remove('sent-animation'), 300)
    } catch (error) {
      console.error('发送消息失败:', error)
      Toast('发送失败，请重试')
    } finally {
      // 无论成功失败都关闭加载状态
      isLoading.value = false
    }
  }
}

const HandleIsShowModel = (event) => {
  if (datas.message[datas.message.length - 1] === '@' && event.key !== 'Backspace') {
    document.querySelector('.input_message')?.blur()
    emits('HandleShowSelectModel')
  }
}

const HandleClearMessage = () => {
  datas.message = ''
  datas.image = ''
}

const HandleAudioMove = (event) => {
  let x, y
  if (datas.isPC) {
    x = event.clientX / window.innerWidth
    y = (window.innerHeight - event.clientY) / window.innerWidth
    emits('HandleCloseStyle', x > 0.47 && x < 0.533 && y > 0.17 && y < 0.234)
  } else {
    const touch = event.changedTouches[event.changedTouches.length - 1]
    x = touch.clientX / window.innerWidth
    y = (window.innerHeight - touch.clientY) / window.innerWidth
    emits('HandleCloseStyle', x > 0.4 && x < 0.61 && y > 0.38 && y < 0.6)
  }
}

const HandleAudioEnd = (event) => {
  if (localStorage.getItem('isAnonymous')) return

  let x, y
  if (datas.isPC) {
    x = event.clientX / window.innerWidth
    y = (window.innerHeight - event.clientY) / window.innerWidth
    emits('HandleAudioEnd', !(x > 0.47 && x < 0.533 && y > 0.17 && y < 0.234))
    window.removeEventListener('mouseup', HandleAudioEnd)
    window.removeEventListener('mousemove', HandleAudioMove)
  } else {
    const touch = event.changedTouches[event.changedTouches.length - 1]
    x = touch.clientX / window.innerWidth
    y = (window.innerHeight - touch.clientY) / window.innerWidth
    emits('HandleAudioEnd', !(x > 0.4 && x < 0.61 && y > 0.38 && y < 0.6))
  }
}

const HandleSelectAi = (text) => {
  text.forEach(item => {
    datas.message += `@${item} `
  })
  datas.message = datas.message.replaceAll('@@', '@')
}

const HandleChange = () => {
  // 动态计算输入框高度
  let byteSize = 0
  for (let i = 0; i < datas.message.length; i++) {
    const charCode = datas.message.charCodeAt(i)
    byteSize += charCode <= 0x7f ? 1 : 1.714
  }
  datas.row = Math.min(3, Math.floor(Math.ceil(byteSize) / 32))
}

const getFile = (file) => {
  const formData = new FormData()
  formData.append('name', file.target.files[0].name)
  formData.append('file', file.target.files[0])
  menuStore.handleShowLoading(true)
  // 注释掉的上传功能
  // upload(formData)
  //   .then((res) => {
  //     menuStore.handleShowLoading(false)
  //     datas.image = res.value
  //   })
  //   .catch((err) => {
  //     menuStore.handleShowLoading(false)
  //   })
}

const closeimage = () => {
  datas.image = ''
}

defineExpose({
  status,
  HandleSelectAi,
  HandleClearMessage,
})
</script>

<style lang="scss" scoped>
// 基础样式变量
$primary-color: #0faef2;
$primary-dark: #0d96d6;
$bg-light: #f2f4f5;
$text-dark: #1a1a1a;
$text-gray: #646566;
$white: #ffffff;
$border-radius: 24px;
$shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

// 主容器
.intr_wrap {
  width: 100%;
  box-sizing: border-box;
}

// 图片预览区域
.top {
  margin-bottom: 12px;
  padding-left: 12px;

  .list {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    background: #292929;
    overflow: hidden;
    position: relative;
    box-shadow: $shadow;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &::after {
      content: '';
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.6);
      position: absolute;
      right: -20px;
      top: -20px;
      transform: rotate(45deg);
    }

    .close {
      width: 24px;
      height: 24px;
      background: url('../../../assets/closewhite.png') no-repeat center;
      background-size: 14px;
      position: absolute;
      right: 4px;
      top: 4px;
      z-index: 2;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

// 输入框主容器
.info-entry-box {
  padding: 12px;
  background-color: $bg-light;
  border-radius: 16px 16px 0 0;
  transition: all 0.3s ease;
  min-height: 60px;

  &.active {
    padding-bottom: 16px;
  }
}

// 导航按钮（语音/文字切换）
.navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: $white;
  box-shadow: $shadow;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  .audit_btn, .keyboard {
    width: 24px;
    height: 24px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
  }

  .audit_btn {
    background-image: url('../../../assets/audit_btn.png');
  }

  .keyboard {
    background-image: url('../../../assets/text.png');
  }
}

// 语音输入区域
.voice-wrap {
  height: 44px;
  flex: 1;
  position: relative;

  .voice-button {
    --td-button-default-bg-color: $white;
    --td-button-default-color: $text-dark;
    height: 100%;
    width: 100%;
    font-size: 15px;
    border-radius: 22px;
    box-shadow: $shadow;
    transition: all 0.2s;
    display: flex;        /* 添加flex布局 */
    align-items: center;  /* 垂直居中 */
    justify-content: center; /* 水平居中 */

    &:active {
      background-color: #f0f0f0;
    }

    &::after {
      border: none;
    }

    &:disabled {
      background-color: #f5f5f5;
      color: #a0a0a0;
      cursor: not-allowed;
    }
  }

  .wraps {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 22px;
  }
}

// 文字输入区域
.text_wrap {
  flex: 1;
  position: relative;
  min-height: 44px;
  padding: 12px 16px;
  background: $white;
  border-radius: 22px;
  box-shadow: $shadow;
  transition: all 0.2s;

  .input_message {
    width: 100%;
    height: 100%;
    border: none;
    font-size: 15px;
    overflow: auto;
    padding: 0;
    line-height: 1.5;
    outline: none;
    resize: none;
    color: $text-dark;
    background: transparent;

    &::placeholder {
      color: #a0a0a0;
    }

    &.focus-visible {
      animation: focusPulse 0.3s ease;
    }

    &.sent-animation {
      animation: sentPulse 0.3s ease;
    }

    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }
}

// 输入框高度调整
.input0 {
  .input_message {
    height: 20px;
  }
}

.input1 {
  min-height: 60px;
  .input_message {
    height: 40px;
  }
}

.input2 {
  min-height: 90px;
  .input_message {
    height: 70px;
  }
}

// 更多选项和发送按钮区域
.more_child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  .add-btn, .send-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-btn {
    background-color: $white;
    box-shadow: $shadow;

    &:hover {
      transform: scale(1.05);
      background-color: #f9f9f9;
    }
  }

  .send-btn {
    background-color: $primary-color;
    box-shadow: 0 2px 8px rgba(15, 174, 242, 0.4);

    &:hover {
      background-color: $primary-dark;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    &:disabled {
      background-color: #94ccf2;
      cursor: not-allowed;
      transform: none;
    }

    &.loading {
      background-color: #94ccf2;
    }
  }
}

// 加载动画
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

// 更多选项区域
.more-options {
  display: flex;
  gap: 16px;
  padding: 8px 0 4px 48px; // 与导航按钮对齐

  .option-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s;
    width: 60px;

    &:hover {
      transform: translateY(-3px);
    }

    .upload {
      position: absolute;
      width: 60px;
      height: 60px;
      opacity: 0;
      cursor: pointer;
    }

    .icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background-color: $white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: $shadow;
      margin-bottom: 6px;
    }

    span {
      font-size: 12px;
      color: $text-gray;
      text-align: center;
    }
  }
}

// 动画效果
@keyframes focusPulse {
  0% { box-shadow: 0 0 0 0 rgba(15, 174, 242, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(15, 174, 242, 0); }
  100% { box-shadow: 0 0 0 0 rgba(15, 174, 242, 0); }
}

@keyframes sentPulse {
  0% { background-color: rgba(15, 174, 242, 0.1); }
  100% { background-color: transparent; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .info-entry-box {
    padding: 8px;
    border-radius: 12px 12px 0 0;
  }

  .top {
    margin-bottom: 8px;
    padding-left: 8px;

    .list {
      width: 80px;
      height: 80px;
    }
  }

  .navigation,
  .more_child,
  .add-btn,
  .send-btn {
    width: 38px;
    height: 38px;
  }

  .text_wrap {
    padding: 10px 14px;
    min-height: 38px;

    .input_message {
      font-size: 14px;
    }
  }

  .voice-wrap {
    height: 38px;

    .voice-button {
      font-size: 13px;
      display: flex;        /* 添加flex布局 */
      align-items: center;  /* 垂直居中 */
      justify-content: center; /* 水平居中 */
    }
  }

  .more-options {
    gap: 12px;
    padding-left: 42px;

    .option-item {
      width: 50px;

      .icon-wrap {
        width: 38px;
        height: 38px;
      }
    }
  }

  .loading-spinner {
    width: 18px;
    height: 18px;
  }
}

// 桌面端适配
@media screen and (min-width: 769px) {
  .info-entry-box {
    max-width: 800px;
    margin: 0 auto;
  }
}

/* 在 Info-entry-box.vue 中补充 */
@media screen and (max-width: 360px) {
  .info-entry-box {
    padding: 8px 6px;
  }

  .navigation,
  .more_child,
  .add-btn,
  .send-btn {
    width: 34px;
    height: 34px;
  }

  .text_wrap {
    padding: 8px 12px;
  }

  .more-options {
    gap: 8px;
    padding-left: 38px;
  }
}
</style>
