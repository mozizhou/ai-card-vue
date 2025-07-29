<script setup>
import ContactsIcon from '@/assets/images/navigation/contacts.png'
import CommunityIcon from '@/assets/images/navigation/community.png'
import AvatarIcon from '@/assets/images/navigation/avatar.png'
import { useJumpContacts } from '@/hooks/useContacts/useJumpContacts'
import { nextTick, onActivated, onMounted, reactive, ref } from 'vue'
import { ApiGetFriendNotify, ApiGetHistoryList, ApiGetNotification } from '@/api/chat'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/store/menu'
import { getConversationList } from '@/utils'

const { onJumpToContactsList } = useJumpContacts()
const name = ref(JSON.parse(localStorage.getItem('userInfo')).name)
const userId = ref(JSON.parse(localStorage.getItem('userInfo')).userId)

const datas = reactive({
  list: [],
  showShadow: false,
  FriendNotify: 0,
  isAna: false,
  info: {
    avatar: JSON.parse(localStorage.getItem('userInfo')).avatar,
  },
})

const menuStore = useMenuStore()

const router = useRouter()

const scrollBox = ref(null)

const HandleGoMine = () => {
  if (location.href.includes('/mine')) {
    location.reload()
  }
  router.push('/mine')
}

onMounted(() => {
  let timeout = null
  scrollBox.value.addEventListener('scroll', () => {
    datas.showShadow = true
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      datas.showShadow = false
    }, 200)
  })
})

const HandleLinkChannel = (item) => {
  if (item.conversationInfo.folded) {
    router.push({
      path: '/message',
      query: {
        id: item.conversationInfo.id,
      },
    })
    return
  }
  if (location.href.includes('chat')) {
    router.replace({
      path: '/chat',
      query: {
        id: item.conversationInfo.id,
        createBy: item.conversationInfo.createBy,
      },
    })
    setTimeout(() => {
      location.reload()
    })
  } else {
    router.push({
      path: '/chat',
      query: {
        id: item.conversationInfo.id,
        createBy: item.conversationInfo.createBy,
      },
    })
  }
}

const HandleData = () => {
  if (localStorage.getItem('isAnonymous')) {
    datas.isAna = true
  }
  name.value = JSON.parse(localStorage.getItem('userInfo')).nickName
  datas.info.avatar = JSON.parse(localStorage.getItem('userInfo')).avatar
  datas.list = JSON.parse(localStorage.getItem('historyList'))
  if (localStorage.getItem('isAnonymous')) return
  ApiGetFriendNotify()
    .then((res) => {
      datas.FriendNotify = res.value
    })
    .catch(() => {})
  ApiGetHistoryList({
    user: name.value,
  })
    .then((res) => {
      datas.list = res.value
      for (let i = 0; i < res.value.length; i++) {
        let name = []
        for (let j = 0; j < res.value[i].memberInfoList.length; j++) {
          if (
            res.value[i].memberInfoList[j].id != JSON.parse(localStorage.getItem('userInfo')).id
          ) {
            name.push(res.value[i].memberInfoList[j].name)
          }
        }
        res.value[i].conversationInfo.chatName = name.join('、')
      }

      let newarr = []
      for (let i = 0; i < res.value.length; i++) {
        let childarr = []
        for (let j = 0; j < res.value[i].memberInfoList.length; j++) {
          if (
            JSON.parse(localStorage.getItem('userInfo')).userId !=
            res.value[i].memberInfoList[j].userId
          ) {
            childarr.push(res.value[i].memberInfoList[j])
          }
        }
        res.value[i].memberInfoList = childarr

        newarr.push(getConversationList(res.value[i]))
      }
      datas.list = newarr
      localStorage.setItem('historyList', JSON.stringify(newarr))
    })
    .catch(() => {})
}

const handleGoCommunity = () => {
  if (location.href.includes('/community')) {
    location.reload()
  }
  router.push('/community')
}

defineExpose({
  HandleData,
})
</script>

<template>
  <div class="menu-container flex flex-col">
    <div class="operation">
      <t-button class="menu-button cmoonicon item" variant="text" @click="handleGoCommunity">
        <div class="l">
          <img class="icon" src="../../../assets/icon.png" />
          <span class="titles">CMOON</span>
        </div>
      </t-button>
      <t-button class="menu-button item" variant="text" @click="onJumpToContactsList">
        <div class="l">
          <img class="icon" src="../../../assets/contacts.png" />
          <span class="titles">{{ $t('contacts') }}</span>
        </div>
        <div class="notify" v-if="datas.FriendNotify && !isAna">
          {{ datas.FriendNotify > 99 ? '99' : datas.FriendNotify }}
        </div>
      </t-button>
    </div>
    <div class="parting-line" :class="datas.showShadow ? 'shadow' : ''"></div>
    <div ref="scrollBox" class="list-box flex flex-col">
      <t-button
        class="user-item menu-button"
        variant="text"
        v-for="(item, index) in datas.list"
        @click="HandleLinkChannel(item)"
        :key="index"
      >
        <div class="avatar" :class="'avatar' + item.memberInfoList.length">
          <div
            class="img_wrap"
            :class="imgs.userId == userId ? 'noShow_img' : ''"
            v-for="(imgs, i) in item.memberInfoList"
            :key="i"
          >
            <img :src="imgs.avatar" v-if="imgs.userId != userId && imgs.avatar" alt="" />
          </div>
        </div>
        <div class="cost" v-if="item.conversationInfo.unreadCount">
          {{ item.conversationInfo.unreadCount }}
        </div>
        <div class="name">{{ item.conversationInfo.name }}</div>
      </t-button>
    </div>
    <t-button variant="text" class="menu-button user-center" @click="HandleGoMine">
      <div class="l">
        <div class="avatar_icon">
          <img class="icon" v-if="datas.info.avatar" :src="datas.info.avatar" />
        </div>
        <div class="message">
          <div class="name">{{ name }}</div>
          <div class="hint">{{ $t('freeSub') }}</div>
        </div>
      </div>
      <div class="r"></div>
    </t-button>
    <div class="hint">Alpha</div>
  </div>
</template>

<style lang="scss" scoped>
.menu-container {
  box-sizing: border-box;
  height: 100%;
  width: 560px;
  background: white;
}

.plb {
  padding-left: 32px;
}

.menu-button {
  :deep(.t-button__content) {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  }
}

.title {
  font-size: 36px;
  line-height: 80px;
  margin-bottom: 8px;
  padding: 0 68px;
}

.operation {
  display: flex;
  flex-direction: column;
  height: 200px;
  padding-top: 40px;
  .cmoonicon {
    margin-bottom: 8px;
    padding-left: 0;
    img {
      width: 40px;
    }
  }
  .titles {
    font-size: 32px;
  }
  > .item {
    height: 96px;
    line-height: 96px;
    padding-left: 68px;
  }
  :deep(.t-button__content) {
    gap: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    img {
      margin-right: 20px;
    }
    .notify {
      width: 40px;
      height: 40px;
      background: #f85351;
      border-radius: 50%;
      line-height: 40px;
      color: white;
      text-align: center;
      font-size: 22px;
    }
  }
  .icon {
    width: 40px;
    height: 40px;
  }
}

.parting-line {
  height: 2px;
  margin: 0 32px;
  margin-top: 24px;
  background-color: #dcdfe0;
  position: relative;
  z-index: 2;
}
.shadow {
  &:after {
    content: '';
    width: 100%;
    height: 60px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
    position: absolute;
  }
}

.list-box {
  height: calc(100% - 244px);
  padding-bottom: 144px;
  overflow: scroll;
  padding-top: 24px;
  width: 544px;
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #efefef;
    border-radius: 5px;
  }

  // &::-webkit-scrollbar-thumb:hover {
  //   background: yellow;
  // }
  > .user-item {
    height: 80px;
    margin-bottom: 16px;
    padding: 0 68px;
    position: relative;

    .cost {
      position: absolute;
      left: 100px;
      top: 0px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      z-index: 20;
      background: red;
      text-align: center;
      line-height: 32px;
      color: white;
      font-size: 20px;
    }

    .avatar {
      width: 56px;
      height: 56px;
      background-size: cover;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
      background: #efefef;

      .img_wrap {
        width: 100%;
        height: 100%;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .noShow_img {
        display: none;
      }
    }
    .avatar1 {
      .img_wrap {
        display: flex;
        img {
          width: 56px;
        }
      }
    }
    .avatar2 {
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 52px;
      padding: 0 2px;
      .img_wrap {
        width: 25px;
        height: 25px;
        display: flex;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
        }
      }
    }
    .avatar3 {
      border-radius: 50%;
      overflow: hidden;
      position: relative;
      .img_wrap {
        width: 23px;
        height: 23px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        position: absolute;
        img {
          width: 56px;
        }
        &:nth-of-type(1) {
          top: 2px;
          left: 17px;
        }
        &:nth-of-type(2) {
          bottom: 7px;
          left: 4px;
        }
        &:nth-of-type(3) {
          bottom: 7px;
          right: 4px;
        }
      }
    }
    .avatar4 {
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      justify-content: space-between;
      align-content: space-between;
      flex-flow: wrap;
      background: white;
      border: 1px solid #efefef;
      .img_wrap {
        display: flex;
        width: 27px;
        height: 27px;
        img {
          width: 27px;
          height: 27px;
        }
        &:nth-of-type(1) {
          top: -26px;
          left: -26px;
        }
        &:nth-of-type(2) {
          top: -26px;
          right: -26px;
        }
        &:nth-of-type(3) {
          top: 26px;
          left: -26px;
        }
        &:nth-of-type(4) {
          top: 26px;
          right: -26px;
        }
      }
    }
    .name {
      width: 80%;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 26px;
    }
  }
}
.hint {
  margin: 20px 0 32px 0;
  text-align: right;
  padding-right: 36px;
  font-size: 24px;
  color: #cccccc;
}

.l {
  display: flex;
  align-items: center;
  justify-content: center;
  .avatar_icon {
    width: 80px;
    height: 80px;
    background: #bbb;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    img {
      width: 100%;
      height: auto;
    }
  }
}
.r {
  width: 30px;
  height: 30px;
  background: url('../../../assets/more.png') no-repeat;
  background-size: 100%;
}

.user-center {
  height: 152px;
  width: 498px;
  margin: 0 auto;
  border: 1px solid #0000001a;
  background: #ffffff99;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: absolute;
  bottom: 70px;
  left: 32px;
  z-index: 30;
  :deep(.t-button__content) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .l {
    .message {
      display: flex;
      flex-flow: column;
      .name {
        width: 280px;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 36px;
      }
      .hint {
        line-height: 30px;
        margin: 0;
        text-align: left;
        margin-top: 14px;
        color: #f59a23;
        font-size: 24px;
        padding: 0;
      }
    }
  }
}

.user-center .icon {
  width: 56px;
}
.titles {
  color: #323333;
  font-size: 28px;
}

@media screen and (min-width: 768px) {
  .menu-container {
    width: 243px;
  }

  .plb {
    padding-left: 14px;
  }

  .menu-button {
    :deep(.t-button__content) {
      gap: 4px;
      .notify {
        width: 18px;
        height: 18px;
        background: #f85351;
        border-radius: 50%;
        line-height: 18px;
        color: white;
        text-align: center;
        font-size: 12px;
      }
    }
  }

  .title {
    font-size: 15px;
    line-height: 34px;
    margin-bottom: 3.4px;
    padding: 0 30px;
  }

  .operation {
    height: 87px;
    padding-top: 40px;
    .cmoonicon {
      margin-bottom: 8px;
      img {
        width: 17px;
      }
    }
    .titles {
      font-size: 14px;
    }
    > .item {
      height: 42px;
      line-height: 42px;
      padding-left: 30px;
    }
    :deep(.t-button__content) {
      img {
        margin-right: 8.6px;
      }
      .notify {
        width: 18px;
        height: 18px;
        background: #f85351;
        border-radius: 50%;
        line-height: 18px;
        color: white;
        text-align: center;
        font-size: 10px;
      }
    }
    .icon {
      width: 17px;
      height: 17px;
    }
  }

  .parting-line {
    margin: 0 14px;
    margin-top: 10px;
  }
  .shadow {
    &:after {
      height: 26px;
    }
  }

  .list-box {
    height: calc(100% - 106px);
    padding-bottom: 62.6px;
    padding-top: 10px;
    width: 236px;
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 2.2px;
    }
    > .user-item {
      height: 35px;
      margin-bottom: 7px;
      padding: 0 29px;

      .cost {
        position: absolute;
        left: 43px;
        top: 0px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        z-index: 20;
        background: red;
        text-align: center;
        line-height: 14px;
        color: white;
        font-size: 10px;
      }

      .avatar {
        width: 24px;
        height: 24px;
      }
      .avatar1 {
        .img_wrap {
          img {
            width: 24px;
          }
        }
      }
      .avatar2 {
        width: 22px;
        .img_wrap {
          width: 11px;
          height: 11px;
        }
      }
      .avatar3 {
        .img_wrap {
          width: 10px;
          height: 10px;
          img {
            width: 24px;
          }
          &:nth-of-type(1) {
            top: 1px;
            left: 7px;
          }
          &:nth-of-type(2) {
            bottom: 3px;
            left: 1.5px;
          }
          &:nth-of-type(3) {
            bottom: 3px;
            right: 1.5px;
          }
        }
      }
      .avatar4 {
        .img_wrap {
          display: flex;
          width: 11px;
          height: 11px;
          img {
            width: 11px;
            height: 11px;
          }
          &:nth-of-type(1) {
            top: -11px;
            left: -11px;
          }
          &:nth-of-type(2) {
            top: -11px;
            right: -11px;
          }
          &:nth-of-type(3) {
            top: 11px;
            left: -11px;
          }
          &:nth-of-type(4) {
            top: 11px;
            right: -11px;
          }
        }
      }
      .name {
        font-size: 11px;
      }
    }
  }
  .hint {
    margin: 8.5px 0 14px 0;
    padding-right: 15px;
    font-size: 10px;
  }

  .l {
    .avatar_icon {
      width: 35px;
      height: 35px;
      margin-right: 8.5px;
    }
  }
  .r {
    width: 13px;
    height: 13px;
  }

  .user-center {
    height: 66px;
    width: 216px;
    backdrop-filter: blur(8.5);
    -webkit-backdrop-filter: blur(8.5);
    bottom: 30px;
    left: 13px;
    :deep(.t-button__content) {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .l {
      .message {
        .name {
          width: 121px;
          line-height: 15px;
        }
        .hint {
          line-height: 13px;
          margin-top: 6px;
          font-size: 10px;
        }
      }
    }
  }

  .user-center .icon {
    width: 24px;
  }
  .titles {
    font-size: 12px;
  }
}
</style>
