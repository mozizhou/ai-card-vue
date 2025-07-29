<template>
  <div id="ListeningToAudio">
    <div class="container">
      <div class="wrap">
        <div class="audit_animal" :class="datas.hoverClose ? 'audit_close' : ''">
          <div v-if="!datas.nosend" class="list_wrap">
            <div
              class="list"
              v-for="(item, index) in datas.auditList"
              :key="index"
              :style="{ height: 5.6 + item + '%' }"
            ></div>
          </div>
          <div class="send" v-if="datas.nosend"></div>
        </div>
      </div>
      <div class="bottom">{{ $t('UpSend') }}</div>
    </div>
    <div class="close_btn" :class="datas.hoverClose ? 'hover_btn' : ''"></div>
  </div>
</template>

<script setup>
import { onActivated, onMounted, reactive } from 'vue'
import Recorder from 'js-audio-recorder'
import { Toast } from 'tdesign-mobile-vue'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/store/menu'

const { t } = useI18n()
const emits = defineEmits(['HandleEmitEnd'])

const datas = reactive({
  auditList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  hoverClose: false,
  recorder: null,
  nosend: false,
})

const clearAll = () => {
  datas.auditList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  datas.hoverClose = false
  datas.reactive = null
  datas.nosend = false
  HandleAuditStart()
}

// 开始录音
const HandleAuditStart = () => {
  datas.recorder = new Recorder()
  Recorder.getPermission().then(
    (e) => {
      datas.recorder.start() // 开始录音
      HandleStyle()
    },
    (error) => {
      Toast(t('noMedio'))
    },
  )
}
// 结束录音
const HandleAuditEnd = () => {
  datas.nosend = true
  if (datas.recorder == null || datas.recorder.duration === 0) {
    emits('HandleEmitEnd')
  } else {
    datas.recorder.stopPlay()
    emits('HandleEmitEnd', datas.recorder)
  }
}
// 监听语音输入
const HandleStyle = () => {
  datas.recorder.onprogress = (params) => {
    let auditSize = Math.floor(params.vol / 10)
    auditSize = auditSize > 3 ? auditSize - 2 : 0
    datas.auditList.splice(0, 1)
    datas.auditList.push(auditSize)
  }
}
// 滑动到取消模块
const HandleCancelMove = (bool) => {
  datas.hoverClose = bool
}

defineExpose({
  HandleCancelMove,
  HandleAuditEnd,
  clearAll,
})
</script>

<style lang="scss" scoped>
#ListeningToAudio {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  .wrap {
    position: absolute;
    bottom: 550px;
    left: calc(50% - 186px);
    .audit_animal {
      width: 376px;
      height: 178px;
      background: #0faef2;
      border-radius: 24px;
      margin: 0 auto;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      &::after {
        content: '';
        width: 32px;
        height: 32px;
        background: #0eadf2;
        display: flex;
        position: absolute;
        bottom: -14px;
        transform: rotate(45deg);
        left: calc(50% - 16px);
        border-radius: 4px;
      }
      .send {
        width: 48px;
        height: 48px;
        background: url('../../../assets/loading.png') no-repeat;
        background-size: 100%;
        transform: rotate(0deg);
        animation: rotates 3s linear infinite;
      }
      .list_wrap {
        width: 232px;
        height: 100%;
        padding: 0 72px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .list {
          width: 6px;
          background: white;
          border-radius: 3px;
        }
      }
    }
    .audit_close {
      background: #f5426d;
      &::after {
        background: #f5426d;
      }
    }
  }
  .bottom {
    position: absolute;
    bottom: -30px;
    left: 0;
    width: 860px;
    height: 363px;
    background: url('../../../assets/audit_bottom.png') no-repeat;
    background-size: 1277px 294px;
    background-position: -208px 99px;
    text-align: center;
    font-size: 32px;
    color: rgba(255, 255, 255, 0.6);
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE/Edge */
    user-select: none; /* 标准语法 */
  }
  .close_btn {
    position: absolute;
    bottom: 363px;
    left: 248px;
    width: 132px;
    height: 132px;
    margin-left: 120px;
    margin-top: 178px;
    background: url('../../../assets/closewhite.png') no-repeat;
    background-size: 32px 32px;
    background-position: 50px 50px;
    background-color: rgba(50, 51, 51, 0.5);
    border-radius: 50%;
  }
  .hover_btn {
    background: url('../../../assets/closeblack.png') no-repeat;
    background-size: 32px 32px;
    background-position: 50px 50px;
    background-color: white;
    border-radius: 50%;
  }
}

@keyframes rotates {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media screen and (min-width: 768px) {
  #ListeningToAudio {
    .wrap {
      bottom: 239px;
      left: calc(50% - 81px);
      .audit_animal {
        width: 163.5px;
        height: 77px;
        border-radius: 10px;
        &::after {
          width: 14px;
          height: 14px;
          bottom: -6px;
          left: calc(50% - 7px);
          border-radius: 1.5px;
        }
        .send {
          width: 20px;
          height: 20px;
        }
        .list_wrap {
          width: 100px;
          padding: 0 31px;

          .list {
            width: 2.2px;
            border-radius: 1.3px;
          }
        }
      }
    }
    .bottom {
      bottom: -13px;
      width: 375px;
      height: 158px;
      background-size: 555px 127px;
      background-position: -90px 42px;
      font-size: 14px;
    }
    .close_btn {
      bottom: 158px;
      left: 108px;
      width: 57px;
      height: 57px;
      margin-left: 52px;
      margin-top: 77px;
      background-size: 14px 14px;
      background-position: 22px 22px;
    }
    .hover_btn {
      background-size: 14px 14px;
      background-position: 22px 22px;
    }
  }
}
</style>