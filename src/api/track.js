import request from '@/utils/request'

/**
 * 统计 Telegram 点击
 * @param {Object} data
 */
export function trackTelegramClick(data) {
  return request.post('/track/telegram-click', data)
}
