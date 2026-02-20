import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginUser as apiLoginUser } from '@/api/permission' // 引入 API

// 辅助函数：将数据持久化到 localStorage
const persistToLocalStorage = (key, value) => {
    if (value === undefined || value === null || value === '') {
        localStorage.removeItem(key)
    } else {
        localStorage.setItem(key, value)
    }
}

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('token') || '')
    const isAdmin = ref(false) // 初始状态为非管理员

    /**
     * 设置用户 token 并持久化
     * @param {string} newToken - 新的 token 值
     */
    function setToken(newToken) {
        token.value = newToken
        persistToLocalStorage('token', newToken)
    }

    /**
     * 设置管理员状态
     * @param {boolean} bool - 是否为管理员
     */
    function setIsAdmin(bool) {
        isAdmin.value = !!bool
    }

    /**
     * 执行用户登录操作
     */
    async function login() {
        const res = await apiLoginUser()

        if (res.code === 200) {
            // 登录成功，根据 username 设置管理员状态
            setIsAdmin(res.data.username === 'admin')
        } else if (res.code === 201) {
            // 强制登出
            setToken('') // 清除 token
            setIsAdmin(false) // 清除管理员状态
            location.reload() // 刷新页面
        }

        return res
    }

    /**
     * 执行用户登出操作
     */
    function logout() {
        setToken('') // 清除 token
        setIsAdmin(false) // 清除管理员状态
        // 可能还需要跳转到登录页，具体取决于业务逻辑
    }


    return {
        token,
        isAdmin,
        setToken,
        setIsAdmin,
        login,
        logout
    }
})
