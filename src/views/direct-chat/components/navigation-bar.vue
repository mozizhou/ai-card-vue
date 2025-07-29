<script setup>
import Menu from './menu.vue'
import { ref, onUnmounted, onDeactivated, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiGetNotification } from '@/api/chat'
import { useMenuStore } from '@/store/menu'
const props = defineProps({
  name: String,
  color: String,
  more: Boolean,
  isBack: Boolean,
  showdow: Boolean,
})

const leftMenuVisible = ref(false)
const router = useRouter()
const route = useRoute()
const menu = ref(null)
const menuStore = useMenuStore()
const isAnaonymous = ref(false)
const onOpenNavigation = () => {
  if (props.isBack) {
    router.back()
  } else {
    menu.value.HandleData()
    leftMenuVisible.value = true
  }
}

onActivated(() => {
  GetNotification()
  if (localStorage.getItem('isAnonymous')) {
    isAnaonymous.value = true
  }
})

const onCloseNavigation = () => (leftMenuVisible.value = false)

onUnmounted(() => {
  onCloseNavigation()
})

onDeactivated(() => {
  onCloseNavigation()
})

const GetNotification = () => {
  if (localStorage.getItem('isAnonymous')) return
  ApiGetNotification()
    .then((res) => {
      menuStore.HandleShowNotify(res.value)
    })
    .catch(() => {})
}

const goPath = () => {
  router.push({
    path: '/more',
    query: {
      id: route.query.id,
      nochat: route.query.nochat == 'true' ? true : false,
      isUse: route.query.nomore != '1' ? true : false,
      isCommunity: route.query.conversation ? true : false,
    },
  })
}

defineExpose({
  onCloseNavigation,
})
</script>


<template>
  <t-navbar
    class="navigation-bar"
    :class="
      showdow
        ? isBack
          ? 'back shaTitle ' + color
          : 'shaTitle ' + color
        : isBack
        ? 'back ' + color
        : color
    "
    :title="name"
    :fixed="false"
  >
    <template #left>
      <div class="left" @click="onOpenNavigation">
        <div class="menu"></div>
        <div class="notify" v-if="menuStore.showGlobalNotify && isBack == false && !isAnaonymous">
          {{ menuStore.showGlobalNotify > 99 ? 99 : menuStore.showGlobalNotify }}
        </div>
      </div>
    </template>
    <template #right v-if="more">
      <div @click="goPath()"></div>
    </template>
  </t-navbar>
  <t-popup v-model="leftMenuVisible" placement="left">
    <Menu ref="menu" />
  </t-popup>
</template>


<style lang="scss" scoped>
.navigation-bar {
  height: 88px;
  position: relative;
  z-index: 4;
  :deep(.t-navbar__content) {
    background-color: transparent;
    display: flex;
    align-items: center;
    .t-navbar__left {
      width: 52px;
      height: 52px;
      background: url('../../../assets/menu.png') no-repeat;
      background-size: 100%;
      position: relative;
      z-index: 20;
      .menu {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
      }
      .notify {
        position: absolute;
        right: -6px;
        top: -6px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        line-height: 32px;
        font-size: 22px;
        color: white;
        text-align: center;
        background: #ff3b30;
      }
    }
    .t-navbar__right {
      width: 44px;
      height: 44px;
      background: url('../../../assets/more.png') no-repeat;
      background-size: 100%;
      margin-top: 22px;
      div {
        width: 100%;
        height: 100%;
      }
    }
  }
  :deep(.t-navbar__center) {
    position: absolute;
    width: 100%;
    text-align: center;
  }
  :deep(.t-navbar__center-title) {
    font-size: 30px;
    color: #323333;
    width: 60%;
  }
  :deep(.t-navbar__left svg) {
    width: 44px;
  }
  :deep(.t-navbar__right svg) {
    width: 44px;
  }
}

.shaTitle {
  background: red;
  background: #ffffff33;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.left-icon {
  transform: rotate(90deg);
}

.white {
  :deep(.t-navbar__content) {
    background-color: transparent;
    .t-navbar__left {
      background: url('../../../assets/whitemenu.png') no-repeat;
      background-size: 100%;
    }
  }
}
.back {
  :deep(.t-navbar__content) {
    .t-navbar__left {
      background: url('../../../assets/back.png') no-repeat;
      background-size: 100%;
    }
  }
}
@media screen and (min-width: 768px) {
  .navigation-bar {
    height: 40px;
    :deep(.t-navbar__content) {
      background-color: transparent;
      height: 38px;
      .t-navbar__left {
        width: 28px;
        height: 28px;
        .menu {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
        }
        .notify {
          position: absolute;
          right: -2px;
          top: -2px;
          width: 14px;
          height: 14px;
          line-height: 14px;
          font-size: 10px;
          color: white;
          text-align: center;
        }
      }
      .t-navbar__right {
        width: 20px;
        height: 20px;
        margin-top: 10px;
      }
    }
    :deep(.t-navbar__center) {
      position: absolute;
      width: 100%;
      text-align: center;
      height: 38px;
    }
    :deep(.t-navbar__center-title) {
      font-size: 13.5px;
      height: 38px;
    }
    :deep(.t-navbar__left svg) {
      width: 20px;
    }
    :deep(.t-navbar__right svg) {
      width: 20px;
    }
  }

  .shaTitle {
    backdrop-filter: blur(9px);
    -webkit-backdrop-filter: blur(9px);
  }
}
</style>
