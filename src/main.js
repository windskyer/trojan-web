import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import pinia from '@/store'
import i18n from '@/lang' // vue-i18n v11
import { useUserStore } from '@/store/user'
import '@/icons'

// ElementPlus 样式和组件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 全局样式
import '@/styles/index.scss'

// SVG Icons
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import '@/icons' // svg-sprite 资源

// ==================
// 权限配置
// ==================
const whiteList = ['/login', '/register', '/verify-success', '/verify-fail', '/404']
const userHomePath = '/user/info'

// ==================
// 路由守卫
// ==================
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore(pinia)
  const token = userStore.token

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
    if (whiteList.includes(to.path)) {
      return next()
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
