import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import Antd from 'ant-design-vue';
import typewriter from './views/direct-chat/api/typewrite';

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(Antd);
// 注册指令
app.directive('typewriter', typewriter);
app.mount('#app');