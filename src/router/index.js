import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/views/layout'

export const constantRoutes = [
    {
        path: '/verify-success',
        component: () => import('@/views/login/verifySuccess'),
        hidden: true
    },
    {
        path: '/verify-fail',
        component: () => import('@/views/login/verifyFail'),
        hidden: true
    },
    {
        path: '/login',
        component: () => import('@/views/login/login'),
        hidden: true
    },
    {
        path: '/register',
        component: () => import('@/views/login/register'),
        hidden: true
    },
    {
        path: '/free',
        component: () => import('@/views/user/free'),
        hidden: true
    },
    {
        path: '/pay/:order?',
        component: () => import('@/views/user/pay'),
        hidden: true
    },
    {
        path: '/404',
        component: () => import('@/views/errorPage/404'),
        hidden: true
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index'),
                meta: { title: 'dashboard', icon: 'dashboard', isAdmin: true }
            }
        ]
    },
    {
        path: '/trojan',
        component: Layout,
        children: [
            {
                path: '',
                name: 'trojan',
                component: () => import('@/views/trojan/index'),
                meta: { title: 'trojan', icon: 'documentation', isAdmin: true }
            }
        ]
    },
    {
        path: '/user',
        component: Layout,
        children: [
            {
                path: '',
                name: 'user',
                component: () => import('@/views/user/index'),
                meta: { title: 'user', icon: 'user', isAdmin: true }
            },
            {
                path: 'info',
                name: 'userInfo',
                component: () => import('@/views/user/info'),
                hidden: false,
                meta: { title: 'user', icon: 'user', isAdmin: false }
            }
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/404', hidden: true }
]

const router = createRouter({
    history: createWebHashHistory(),
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
})

export default router
