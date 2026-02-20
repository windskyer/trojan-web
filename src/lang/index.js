import { createI18n } from 'vue-i18n'
import elementEnLocale from './element/en'       // ElementPlus 英文
import elementZhLocale from './element/zh-cn'   // ElementPlus 中文
import enLocale from './en'
import zhLocale from './zh'

// ==================
// 合并消息
// ==================
const messages = {
  en: {
    ...enLocale,
    ...elementEnLocale
  },
  zh: {
    ...zhLocale,
    ...elementZhLocale
  }
}

// ==================
// 获取默认语言
// ==================
function getLanguage() {
  const saved = localStorage.getItem('language')
  if (saved) return saved

  const browserLang = (navigator.language || navigator.browserLanguage || 'en').slice(0, 2)
  return Object.keys(messages).includes(browserLang) ? browserLang : 'en'
}

// ==================
// 创建 i18n 实例
// ==================
const i18n = createI18n({
  legacy: false,          // 使用 Composition API
  locale: getLanguage(),
  fallbackLocale: 'en',
  globalInjection: true,  // 允许模板中直接 $t('xxx')
  messages,
  warnHtmlMessage: false
})

export { getLanguage }
export default i18n
