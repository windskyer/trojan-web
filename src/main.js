import App from '@/App.vue'
import '@/icons'
import i18n from '@/lang'; // vue-i18n v11
import router from '@/router'
import pinia from '@/store'
import { useUserStore } from '@/store/user'
import { createApp } from 'vue'

// ElementPlus 样式和组件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 全局样式
import '@/styles/index.scss'

// SVG Icons
import SvgIcon from '@/components/SvgIcon'
import '@/icons'; // svg-sprite 资源
import 'virtual:svg-icons-register'

// ==================
// 权限配置
// ==================
const whiteList = ['/login', '/register', '/verify-success', '/verify-fail', '/404', '/free', '/pay']
const userHomePath = '/user/info'

// ==================
// 单独域名：强制进入 /free
// - VITE_FREE_DOMAIN: 单个域名（如 free.example.com）
// - VITE_FREE_DOMAINS: 多个域名，逗号分隔（如 free.example.com,landing.example.com）
// ==================
const freeDomainList = [
  import.meta.env.VITE_FREE_DOMAIN,
  ...(String(import.meta.env.VITE_FREE_DOMAINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)),
].filter(Boolean)
const freeDomains = new Set(freeDomainList)

// ==================
// 路由守卫
// ==================
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore(pinia)
  const token = userStore.token
  const isPayRoute = to.path === '/pay' || to.path.startsWith('/pay/')
  const isWhiteRoute = whiteList.includes(to.path) || isPayRoute
  const hostname = window.location.hostname
  const isFreeDomain = freeDomains.size > 0 && freeDomains.has(hostname)

  if (
    isFreeDomain &&
    to.path !== '/free' &&
    !isPayRoute &&
    to.path !== '/verify-success' &&
    to.path !== '/verify-fail' &&
    to.path !== '/404'
  ) {
    return next('/free')
  }

  // Public pages should not be blocked by stale/invalid token checks.
  if (to.path !== '/login' && isWhiteRoute) {
    return next()
  }

  if (token) {
    if (!userStore?.isAdmin) {
      try {
        await userStore.login()
      } catch (error) {
        userStore.logout()
        return next('/login')
      }
    }

    if (!userStore.isAdmin) {
      if (to.path === '/login') {
        return next({ path: userHomePath })
      }
      const needAdmin = to.matched.some(record => record.meta?.isAdmin === true)
      if (needAdmin) {
        return next({ path: userHomePath })
      }
      return next()
    }

    if (to.path === '/login') {
      return next({ path: '/' })
    }

    return next()
  } else {
    if (isWhiteRoute) {
      return next()
    }
    if (to.path === '/') {
      return next('/free')
    }
    return next('/login')
  }
})

// ==================
// 创建 App
// ==================
const app = createApp(App)
app.use(pinia)
app.use(ElementPlus)
app.use(router)
app.use(i18n)
app.component('svg-icon', SvgIcon)

// ==================
// 挂载
// ==================
app.mount('#app')
