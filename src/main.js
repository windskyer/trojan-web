import { createApp } from 'vue'
import App from '@/App'
import ElementPlus from 'element-plus'
import '@/styles/index.scss' // global css
import store from '@/store/index'
import router from '@/router/index'
import i18n from './lang/index' // internationalization
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'// svg组件
import '@/icons'

const whiteList = ['/login', '/register', '/registerUser', '/verify-fail', '/verify-success', '/404'] // no redirect whitelist
const adminList = ['/trojan', '/user'] // need admin role

router.beforeEach(async (to, from, next) => {
    if (store.state.UserToken) {
        if (store.state.isAdmin === null) {
            try {
                await store.dispatch('loginUser')
            } catch (error) {
                // 权限获取失败，清除 Token 并跳转登录
                store.commit('setUserToken', '')
                next('/login')
                return
            }
        }
        
        // ✅ 权限检查：不是管理员访问管理页面
        if (!store.state.isAdmin && adminList.includes(to.path)) {
            next('/404')  // 禁止访问，跳转 404
            return
        }
        
        // ✅ 已登录用户不能进入登录页
        if (to.path === '/login') {
            next({ path: '/' })
        } else {
            next()
        }
    } else {
        // ✅ 白名单检查
        if (whiteList.includes(to.path)) {
            next()
        } else {
            next('/login')
        }
    }
})

createApp(App)
    .use(ElementPlus)
    .use(router)
    .use(store)
    .use(i18n)
    .component('svg-icon', SvgIcon)
    .mount('#app')
