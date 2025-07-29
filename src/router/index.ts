import { createRouter, createWebHistory } from 'vue-router';
// import Home from '@/views/Home.vue';
import DirectChat from '@/views/direct-chat/index.vue';
import Boxing from '@/views/boxing/index.vue';
import HotelCard from '@/views/hotel-card/index.vue';
import Links from '@/views/links/index.vue';

const routes = [
    { path: '/direct-chat', component: DirectChat },
    { path: '/direct-chat/:id', component: DirectChat },
    { path: '/boxing', component: Boxing },
    { path: '/hotel-card', component: HotelCard },
    { path: '/links', component: Links }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;