<template>
  <div class="h-full">
    <!-- 移动端关闭按钮 -->
    <div class="lg:hidden flex justify-end p-2">
      <CloseOutlined class="cursor-pointer" @click="onClose"/>
    </div>

    <!-- 对话列表组件 -->
    <Conversations
        :onActiveChange="handleActiveChange"
        :accessKey="userId"
        :items="userList"
        defaultActiveKey="1"
        :style="style"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import {Avatar, theme} from 'antd';
import {CloseOutlined} from '@ant-design/icons';
import {Conversations} from '@ant-design/x';
import {useMainStore} from '@/store/store'; // 假设Pinia store路径
import {User} from '@/types';

// 定义组件props
const props = defineProps<{
  onClose: () => void;
}>();

// 状态管理
const userId = ref("1");
const userList = ref<any[]>([]); // 实际项目中建议定义更具体的类型
const store = useMainStore();

// 获取主题样式
const {token} = theme.useToken();
const style = {
  width: 242,
  background: token.colorBgContainer,
  borderRadius: token.borderRadius,
};

// 加载用户信息
const getUserInfo = async () => {
  try {
    const response = await fetch("/api/get_info");
    const data = await response.json();

    const formattedList
    // 格式化用户列表数据
  //   const formattedList = data.characters.map((e: any) => ({
  //     key: `${e.id}`,
  //     label: e.name,
  //     icon: <Avatar src = {e.avatar}
  //   />,
  //   message: [],
  // ...
  //   e
  // }))
  //   ;

    userList.value = formattedList;
    if (formattedList.length > 0) {
      store.setUser(formattedList[0] as User);
    }
  } catch (error) {
    console.error("Failed to fetch user info:", error);
  }
};

// 监听用户ID变化，更新选中用户
watch(userId, (newId) => {
  const selectedUser = userList.value.find((e: User) => `${e.id}` === newId);
  if (selectedUser) {
    store.setUser(selectedUser);
    props.onClose(); // 选择用户后关闭导航
  }
});

// 处理选中项变化
const handleActiveChange = (key: string) => {
  userId.value = key;
};

// 组件挂载时加载数据
onMounted(() => {
  getUserInfo();
});
</script>