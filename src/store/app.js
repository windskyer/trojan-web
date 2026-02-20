import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { getLanguage } from '@/lang/index' // 假设此路径正确

export const useAppStore = defineStore('app', () => {
    // 侧边栏状态逻辑，确保正确处理 localStorage 中的字符串 '0'
    const initialSidebarStatus = localStorage.getItem('sidebarStatus')
    const sidebar = reactive({
        // 如果 localStorage 中 sidebarStatus 为 '0'（关闭），则 opened 为 false，否则为 true
        opened: initialSidebarStatus === '0' ? false : true,
        withoutAnimation: false
    })
    const language = ref(getLanguage())
    const device = ref('desktop')

    /**
     * 切换侧边栏的打开/关闭状态
     */
    function toggleSideBar() {
        sidebar.opened = !sidebar.opened
        sidebar.withoutAnimation = false // 切换时通常伴随动画
        localStorage.setItem('sidebarStatus', sidebar.opened ? '1' : '0')
    }

    /**
     * 关闭侧边栏
     * @param {boolean} withoutAnimation - 是否禁用动画
     */
    function closeSideBar(withoutAnimation) {
        localStorage.setItem('sidebarStatus', '0')
        sidebar.opened = false
        sidebar.withoutAnimation = withoutAnimation
    }

    /**
     * 切换设备类型 (desktop/mobile)
     * @param {string} newDevice - 新的设备类型
     */
    function toggleDevice(newDevice) {
        device.value = newDevice
    }

    /**
     * 设置语言
     * @param {string} newLanguage - 新的语言代码
     */
    function setLanguage(newLanguage) {
        language.value = newLanguage
        localStorage.setItem('language', newLanguage)
    }

    return {
        sidebar,
        language,
        device,
        toggleSideBar,
        closeSideBar,
        toggleDevice,
        setLanguage
    }
})
