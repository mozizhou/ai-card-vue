import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// 显式指定路由数组类型为 RouteRecordRaw[]
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login'  // 默认重定向到登录页
    },
    {
        path: '/login',
        name: 'Home',
        component: () => import('@/views/login/index.vue')
    },
    {
        path: '/direct-chat',
        name: 'DirectChat',
        component: () => import('@/views/direct-chat/index.vue')
    },
    {
        path: '/direct-chat/info',
        name: 'DirectChatInfo',
        component: () => import('@/views/direct-chat/info/index.vue')
    },
    {
        path: '/boxing',
        name: 'Boxing',
        component: () => import('@/views/boxing/index.vue'),
        meta: { hideHeader: true }
    },
    {
        path: '/hotel-card',
        name: 'HotelCard',
        component: () => import('@/views/hotel-card/index.vue'),
        meta: { hideHeader: true }
    },
    {
        path: '/links',
        name: 'Links',
        component: () => import('@/views/links/index.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;