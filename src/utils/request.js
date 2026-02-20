import axios from 'axios'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import i18n from '@/lang'
import pinia from '@/store'
import { useUserStore } from '@/store/user'
import { useSettingsStore } from '@/store/settings'

NProgress.configure({ showSpinner: false })

const userStore = useUserStore(pinia)
const settingsStore = useSettingsStore(pinia)

/**
 * HTTP 状态码统一处理
 */
function validateStatus(status) {
  const { t } = i18n.global

  switch (status) {
    case 400:
      ElMessage.error(t('request.requestError'))
      break

    case 401:
      ElMessage.warning(t('request.authFail'))
      userStore.logout()
      setTimeout(() => window.location.reload(), 1000)
      return false

    case 403:
      ElMessage.warning(t('request.accessDenied'))
      break

    case 404:
      ElMessage.warning(t('request.notFound'))
      break

    case 500:
      if (!settingsStore.noerror) {
        ElMessage.warning(t('request.serverError'))
      }
      break
  }

  return status >= 200 && status < 300
}

/**
 * 创建 axios 实例
 */
const instance = axios.create({
  timeout: 10000,
  baseURL: '/api',   // ✅ Vite 正确写法
  validateStatus
})

/**
 * 不需要进度条的接口
 */
const progressWhiteList = ['/auth/loginUser']

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
  config => {
    const nprogress = settingsStore.nprogress
    const token = userStore.token

    if (nprogress && !progressWhiteList.includes(config.url)) {
      NProgress.start()
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
  response => {
    NProgress.done()
    return response.data
  },
  error => {
    NProgress.done()

    if (!error.response && !settingsStore.noerror) {
      ElMessage.error(i18n.global.t('request.connectError'))
    }

    return Promise.reject(error.response || error)
  }
)

export default instance
