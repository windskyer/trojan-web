import { loginUser } from '@/api/permission'

export default {
  async loginUser({ commit }) {
      const res = await loginUser()
      
      if (res.code === 200) {
        // 仅 admin 用户设置管理员状态
        commit('SET_ADMIN', res.data.username === 'admin')
      } else if (res.code === 201) {
        // 强制登出
        commit('LOGIN_OUT')
        location.reload()
      }

      return res
  }
}
