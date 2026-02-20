import request from '@/utils/request'

/**
 * 统计 Telegram 点击
 * @param {Object} data
 */
export function trackTelegramClick(data) {
  return request.post('/track/telegram-click', data)
}

/** 验证用户 token 是否有效
 * @param {string} token 用户 token
 * @returns {Promise} 验证结果的 Promise 对象
 */
export function verifyToken(token) {
  return request.get(`/trojan/user/verify-token?token=${token}`)
}