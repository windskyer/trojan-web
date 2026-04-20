import request from '@/utils/request'

export function recordVisit(data) {
  return request.post('/analytics/visit', data)
}

export function triggerDailyReport(date) {
  return request.post('/analytics/daily-report', { date })
}
