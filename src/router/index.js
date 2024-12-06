// File: src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import Stakeholders from '@/components/Stakeholders.vue';
import Ratings from '@/components/Ratings.vue';

const routes = [
    {
        path: '/',
        redirect: '/stakeholders',
    },
    {
        path: '/stakeholders',
        name: 'Stakeholders',
        component: Stakeholders,
    },
    {
        path: '/ratings',
        name: 'Ratings',
        component: Ratings,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;