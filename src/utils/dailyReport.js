import { triggerDailyReport } from '@/api/analytics'

const LAST_REPORT_KEY = 'last_tg_report_date'

function getYesterdayDate() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export async function checkAndSendDailyReport() {
  const yesterday = getYesterdayDate()
  if (localStorage.getItem(LAST_REPORT_KEY) === yesterday) return

  // Mark first to prevent duplicate sends across tabs
  localStorage.setItem(LAST_REPORT_KEY, yesterday)

  try {
    await triggerDailyReport(yesterday)
  } catch (e) {
    localStorage.removeItem(LAST_REPORT_KEY)
    console.error('[dailyReport] failed:', e)
  }
}
