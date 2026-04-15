import request from '@/utils/request'

/** 验证用户 token 是否有效
 * @param {string} token 用户 token
 * @returns {Promise} 验证结果的 Promise 对象
 */
export function sendCode(data) {
  return request.post(`/trojan/user/send-code`, data)
}

export function generateOrder(data) {
  return request.post(`/trojan/user/generate-order`, data)
}

export function orderStatus(data) {
  return request.post(`/trojan/user/order-status`, data)
}
