<script setup>
import { Toast } from 'tdesign-mobile-vue'
import { ref, reactive, onActivated, defineEmits, onMounted } from 'vue'
import Recorder from 'js-audio-recorder'
import { useSystemStore } from '@/store/system'
// import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/store/menu'
// import { upload } from '@/api/list'
const ststemStore = useSystemStore()

const moreBlockState = ref(false)
const datas = reactive({
  message: '',
  row: 0,
  image: '',
  lastMentionNode: null,
  isPC: false,
})
const status = ref(1) // 1 文本输入 2 语音输入
// const { t } = useI18n()
const menuStore = useMenuStore()

const emits = defineEmits([
  'HandEmitEvent',
  'HandEmitMessage',
  'HandleCloseStyle',
  'HandleShowSelectModel',
])

onMounted(() => {
  if (!/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    datas.isPC = true
  }
})

const onClickAddCircle = () => {
  if (moreBlockState.value) {
    moreBlockState.value = false
  } else {
    moreBlockState.value = true
  }
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

const HandleSendMessage = (event) => {
  if (event.key == 'Enter' || !event.key) {
    if (localStorage.getItem('isAnonymous')) {
      menuStore.HandleShowLogin(true)
      return
    }
    let dom = document.querySelector('.input_message')
    if (dom) {
      dom.blur()
    }
    if (!datas.message) return
    datas.row = 0
    emits('HandEmitMessage', datas.image ? `![](${datas.image})${datas.message}` : datas.message)
  }
}

const HandleIsShowModel = (event) => {
  if (datas.message[datas.message.length - 1] == '@') {
    if (event.key != 'Backspace') {
      document.querySelector('.input_message').blur()
      emits('HandleShowSelectModel')
    }
  }
}

const HandleClearMessage = () => {
  datas.message = ''
  datas.image = ''
}

const HandleAudioMove = (event) => {
  if (datas.isPC) {
    let x = event.clientX / window.innerWidth
    let y = (window.innerHeight - event.clientY) / window.innerWidth
    if (x > 0.47 && x < 0.533 && y > 0.17 && y < 0.234) {
      emits('HandleCloseStyle', true)
    } else {
      emits('HandleCloseStyle', false)
    }
  } else {
    let x = event.changedTouches[event.changedTouches.length - 1].clientX / window.innerWidth
    let y =
      (window.innerHeight - event.changedTouches[event.changedTouches.length - 1].clientY) /
      window.innerWidth
    if (x > 0.4 && x < 0.61 && y > 0.38 && y < 0.6) {
      emits('HandleCloseStyle', true)
    } else {
      emits('HandleCloseStyle', false)
    }
  }
}

const HandleAudioEnd = (event) => {
  if (localStorage.getItem('isAnonymous')) return
  if (datas.isPC) {
    let x = event.clientX / window.innerWidth
    let y = (window.innerHeight - event.clientY) / window.innerWidth
    if (x > 0.47 && x < 0.533 && y > 0.17 && y < 0.234) {
      emits('HandleAudioEnd', false)
    } else {
      emits('HandleAudioEnd', true)
    }
  } else {
    let x = event.changedTouches[event.changedTouches.length - 1].clientX / window.innerWidth
    let y =
      (window.innerHeight - event.changedTouches[event.changedTouches.length - 1].clientY) /
      window.innerWidth
    if (x > 0.4 && x < 0.61 && y > 0.38 && y < 0.6) {
      emits('HandleAudioEnd', false)
    } else {
      emits('HandleAudioEnd', true)
    }
  }
}

const HandleSelectAi = (text) => {
  for (let i = 0; i < text.length; i++) {
    datas.message = datas.message + `@${text[i]} `
    datas.message = datas.message.replaceAll('@@', '@')
  }
}

const HandleChange = () => {
  let byteSize = 0
  for (let i = 0; i < datas.message.length; i++) {
    const charCode = datas.message.charCodeAt(i)
    if (charCode <= 0x7f) {
      byteSize += 1
    } else {
      byteSize += 1.714
    }
  }
  if (Math.ceil(byteSize) / 32 <= 3) {
    datas.row = Math.floor(Math.ceil(byteSize) / 32)
  }
}

const getFile = (file) => {
  var formData = new FormData()
  formData.append('name', file.target.files[0].name)
  formData.append('file', file.target.files[0])
  menuStore.handleShowLoading(true)
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

<template>
  <div class="intr_wrap">
    <div class="top" v-if="datas.image">
      <div class="list">
        <div class="close" @click="closeimage"></div>
        <img :src="datas.image" alt="" />
      </div>
    </div>
    <div class="info-entry-box flex flex-col gap-2" :class="{ active: moreBlockState }">
      <div class="flex w-full gap-2" :class="datas.row == 0 ? 'items-center' : 'items-end'">
        <div class="navigation">
          <div class="showall"></div>
          <div class="keyboard" v-if="status == 2" @click="status = 1"></div>
          <div class="audit_btn" v-if="status == 1" @click="status = 2"></div>
        </div>
        <div class="text_wrap" :class="'input' + datas.row" v-if="status == 1">
          <textarea
            class="input_message"
            @input="HandleChange"
            v-model="datas.message"
            placeholder=""
            @keydown="HandleSendMessage"
            @keyup="HandleIsShowModel"
          ></textarea>
          <!-- <div
          class="input_message"
          v-html="datas.message"
          @keydown="HandleSendMessage"
          contenteditable="true"
          @input="HandleChange"
          id="inputField"
        ></div> -->
        </div>
        <div class="flex-1 flex voice-wrap" v-if="status == 2">
          <t-button class="voice-button" shape="round">
            {{ 'PressAudit' }}
          </t-button>
          <div
            class="wraps"
            @touchstart="HandleShowAudit"
            @touchmove="HandleAudioMove"
            @touchend="HandleAudioEnd"
            @mousedown="HandleShowAudit"
          ></div>
        </div>
        <div class="more_child">
          <!-- <t-icon
            name="add-circle"
            v-if="status == 1 && datas.message == ''"
            size="22px"
            @click="onClickAddCircle"
          /> -->
          <!-- v-if="status == 1 && datas.message.length > 0" -->
          <div class="text" v-if="status == 1" @click="HandleSendMessage">
            {{ 'send' }}
          </div>
        </div>
      </div>
      <div class="image">
        <div class="list">
          <input type="file" class="upload" @change="getFile" accept="image/*" />
          <div class="img_wrap">
            <img src="../../../assets/image.png" alt="" />
          </div>
          <div class="text">{{ 'image' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.info-entry-box {
  padding: 20px 20px 30px;
  background-color: #f2f4f5;
  height: 66px;
  transition: height 300ms;

  &.active {
    height: 240px;
  }
}
.top {
  margin-bottom: 25px;
  .list {
    width: 160px;
    height: 160px;
    border-radius: 8px;
    background: #292929;
    overflow: hidden;
    margin-left: 32px;
    position: relative;
    img {
      width: 160px;
    }
    &::after {
      content: '';
      width: 86px;
      height: 86px;
      display: inline-block;
      background: #00000099;
      position: absolute;
      right: -40px;
      top: -40px;
      transform: rotate(45deg);
    }
    .close {
      width: 48px;
      height: 48px;
      background: url('../../../assets/closewhite.png') no-repeat;
      background-size: 12px 12px;
      background-position: 24px 12px;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 2;
    }
  }
}

.image {
  display: flex;
  align-items: center;
  .list {
    width: 100px;
    height: 148px;
    position: relative;
    .upload {
      width: 100%;
      height: 100%;
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
    }
    .img_wrap {
      width: 100px;
      height: 100px;
      border-radius: 12px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 48px;
        height: 48px;
      }
    }
    .text {
      font-size: 26px;
      color: #646566;
      text-align: center;
      margin-top: 12px;
    }
  }
}
.navigation {
  .showall {
  }
}
.audit_btn {
  width: 56px;
  height: 56px;
  background: url('../../../assets/audit_btn.png') no-repeat;
  background-size: 49px 49px;
  background-position: 3px 3px;
}

.keyboard {
  width: 56px;
  height: 56px;
  background: url('../../../assets/text.png') no-repeat;
  background-size: 49px 49px;
  background-position: 3px 3px;
}
.voice-wrap {
  height: 84px;
  width: 700px;
  position: relative;
  .voice-button {
    --td-button-default-bg-color: white;
    height: 84px;
    width: 700px;
    font-size: 30px;
    &::after {
      border: none;
    }
  }
  .wraps {
    height: 84px;
    width: 700px;
    position: absolute;
    top: 0;
    left: 0;
  }
}

.text_wrap {
  height: 120px;
  padding: 20px 24px 20px 24px;
  background: white;
  border-radius: 42px;
  flex: 1;
}

.input_message {
  width: 100%;
  height: 100%;
  border: 0;
  font-size: 28px;
  overflow: hidden;
  padding: 0;
  line-height: 42px;
  outline: none;
  resize: none;
}

.input0 {
  height: 44px;
}

.input1 {
  height: 80px;
}

.list {
  margin-left: 60px;
}
.icon {
  width: 100px;
  height: 100px;
  margin-top: 24px;
  background-image: url('../../../assets/image.png');
  background-repeat: no-repeat;
  background-color: white;
  background-size: 48px 48px;
  background-position: 26px 26px;
  border-radius: 12px;
}

.file_icon {
  background-image: url('../../../assets/file.png');
  background-repeat: no-repeat;
  background-color: white;
  background-size: 48px 48px;
  background-position: 26px 26px;
}
.name {
  font-size: 26px;
  color: #646566;
  text-align: center;
  margin-top: 12px;
}
.more_child {
  .text {
    padding: 18px 32px;
    background: #0faef2;
    border-radius: 42px;
    text-align: center;
    font-size: 28px;
    color: white;
  }
}

@media screen and (max-width: 768px) {
  .info-entry-box {
    padding: 8.5px 8.5px 13px;
    border-top-left-radius: 14px;
    border-top-right-radius: 14px;
    height: 30px;
    &.active {
      height: 104px;
    }
  }

  .top {
    margin-bottom: 11px;
    .list {
      width: 69.5px;
      height: 69.5px;
      border-radius: 3px;
      background: #292929;
      overflow: hidden;
      margin-left: 14px;
      position: relative;
      img {
        width: 69.5px;
      }
      &::after {
        content: '';
        width: 37.3px;
        height: 37.3px;
        display: inline-block;
        background: #00000099;
        position: absolute;
        right: -17.3;
        top: -17.3;
        transform: rotate(45deg);
      }
      .close {
        width: 21px;
        height: 21px;
        background: url('../../../assets/closewhite.png') no-repeat;
        background-size: 5px 5px;
        background-position: 10px 5px;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 2;
      }
    }
  }

  .image {
    display: flex;
    align-items: center;
    .list {
      width: 43.5px;
      height: 64.3px;
      position: relative;
      .upload {
        width: 100%;
        height: 100%;
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
      }
      .img_wrap {
        width: 43.5px;
        height: 43.5px;
        border-radius: 5px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 21px;
          height: 21px;
        }
      }
      .text {
        font-size: 12px;
        color: #646566;
        text-align: center;
        margin-top: 5px;
      }
    }
  }
  .audit_btn {
    width: 24px;
    height: 24px;
    background-size: 21px 21px;
    background-position: 1.2px 1.2px;
  }

  .keyboard {
    width: 24px;
    height: 24px;
    background-size: 21px 21px;
    background-position: 1.2px 1.2px;
  }
  .voice-wrap {
    height: 36.5px;
    width: 304px;
    .voice-button {
      height: 36.5px;
      width: 304px;
      font-size: 13px;
    }
    .wraps {
      height: 36.5px;
      width: 304px;
    }
  }

  .text_wrap {
    width: 234px;
    height: 52px;
    padding: 8.5px 13px 8.5px 13px;
    background: white;
    border-radius: 18px;
  }

  .input_message {
    font-size: 12px;
    line-height: 18px;
  }

  .input0 {
    height: 19px;
  }

  .input1 {
    height: 35px;
  }

  .list {
    margin-left: 26px;
  }
  .icon {
    margin-top: 10px;
    background-size: 21px 21px;
    background-position: 12px 12px;
    border-radius: 5px;
  }

  .file_icon {
    background-size: 21px 21px;
    background-position: 12px 12px;
  }
  .name {
    font-size: 12px;
    margin-top: 5px;
  }
  .more_child {
    .text {
      padding: 8px 14px;
      border-radius: 18px;
      font-size: 12px;
    }
  }
}
</style>
