import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import DirectChat from '@/views/direct-chat/index.vue';
import DirectChatInfo from '@/views/direct-chat/info/index.vue';
import Boxing from '@/views/boxing/index.vue';
import HotelCard from '@/views/hotel-card/index.vue';
import Links from '@/views/links/index.vue';
import Login from '@/views/login/index.vue';

// 显式指定路由数组类型为 RouteRecordRaw[]
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login'  // 默认重定向到登录页
    },
    {
        path: '/login',
        component: Login  // 添加登录页路由
    },
    {
        path: '/direct-chat',
        component: DirectChat
    },
    {
        path: '/direct-chat/info',
        component: DirectChatInfo
    },
    {
        path: '/direct-chat/:id',
        component: DirectChat
    },
    {
        path: '/boxing',
        component: Boxing
    },
    {
        path: '/hotel-card',
        component: HotelCard
    },
    {
        path: '/links',
        component: Links
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;