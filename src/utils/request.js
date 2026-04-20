import i18n from '@/lang'
import pinia from '@/store'
import { useSettingsStore } from '@/store/settings'
import { useUserStore } from '@/store/user'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false })

const userStore = useUserStore(pinia)
const settingsStore = useSettingsStore(pinia)

/**
 * HTTP 状态码统一处理
 * 注意：401 不在此处理——需要区分登录接口的密码错误与 token 过期，
 * 二者都返回 401，但只有后者才应该 logout + reload。
 * 401 的实际处理在响应错误拦截器中按请求 URL 区分。
 */
function validateStatus(status) {
  const { t } = i18n.global

  switch (status) {
    case 400:
      ElMessage.error(t('request.requestError'))
      break

    case 401:
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
const isProd = import.meta.env.PROD

const instance = axios.create({
  timeout: 10000,
  baseURL: isProd ? '/' : '/api',
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

// 登录接口白名单：这些接口返回 401 表示"凭据错误"，不应触发全局 logout+reload
const authEndpoints = ['/auth/login', '/auth/register']

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

    if (error.response) {
      const status = error.response.status
      const url = error.config?.url || ''

      if (status === 401 && !authEndpoints.some(e => url.includes(e))) {
        // token 过期或失效：通知用户并强制重新登录
        ElMessage.warning(i18n.global.t('request.authFail'))
        userStore.logout()
        setTimeout(() => window.location.reload(), 1000)
      }
    } else if (!settingsStore.noerror) {
      ElMessage.error(i18n.global.t('request.connectError'))
    }

    return Promise.reject(error.response || error)
  }
)

export default instance
