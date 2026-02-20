import { defineStore } from 'pinia'
import { ref } from 'vue'

// 辅助函数：将数据持久化到 localStorage
const persistToLocalStorage = (key, value) => {
    if (value === undefined || value === null) {
        localStorage.removeItem(key)
    } else {
        localStorage.setItem(key, value)
    }
}

export const useSettingsStore = defineStore('settings', () => {
    const loglevel = ref(Object.prototype.hasOwnProperty.call(localStorage, 'loglevel') ? parseInt(localStorage.getItem('loglevel') || '1') : 1)
    const line = ref(Object.prototype.hasOwnProperty.call(localStorage, 'line') ? parseInt(localStorage.getItem('line') || '300') : 300)
    const type = ref(Object.prototype.hasOwnProperty.call(localStorage, 'type') ? (localStorage.getItem('type') || 'sing-box') : 'sing-box')
    const docTitle = ref(Object.prototype.hasOwnProperty.call(localStorage, 'docTitle') ? (localStorage.getItem('docTitle') || '') : '')
    const dialogWidth = ref('25%')
    const nprogress = ref(true)
    const noerror = ref(false)

    /**
     * 设置文档标题并持久化
     * @param {string} title - 新的文档标题
     */
    function setDocTitle(title) {
        docTitle.value = title || ''
        persistToLocalStorage('docTitle', docTitle.value)
    }

    /**
     * 设置全局弹窗宽度
     * @param {string} width - 弹窗宽度 (e.g., '25%', '50%')
     */
    function setDialogWidth(width) {
        dialogWidth.value = width || '25%'
    }

    /**
     * 设置 NProgress 加载条显示状态
     * @param {boolean} bool - 是否显示
     */
    function setNprogress(bool) {
        nprogress.value = !!bool
    }

    /**
     * 设置是否禁用错误提示
     * @param {boolean} bool - 是否禁用
     */
    function setNoError(bool) {
        noerror.value = !!bool
    }

    /**
     * 设置行数并持久化
     * @param {number} newLine - 新的行数
     */
    function setLine(newLine) {
        line.value = Number(newLine) || 300
        persistToLocalStorage('line', line.value)
    }

    /**
     * 设置日志级别并持久化
     * @param {number} newLoglevel - 新的日志级别
     */
    function setLoglevel(newLoglevel) {
        loglevel.value = Number(newLoglevel) || 1
        persistToLocalStorage('loglevel', loglevel.value)
    }

    /**
     * 设置类型并持久化
     * @param {string} newType - 新的类型 (e.g., 'sing-box')
     */
    function setType(newType) {
        type.value = newType || 'sing-box'
        persistToLocalStorage('type', type.value)
    }

    return {
        loglevel,
        line,
        type,
        docTitle,
        dialogWidth,
        nprogress,
        noerror,
        setDocTitle,
        setDialogWidth,
        setNprogress,
        setNoError,
        setLine,
        setLoglevel,
        setType
    }
})
