import { recordVisit } from '@/api/analytics'

const STATS_PREFIX = 'vs_'
const VISITOR_UUID_KEY = 'visitor_uuid'
const RETURNING_KEY = 'returning_visitor'
const MAX_DAYS = 30

function getTodayKey() {
  return STATS_PREFIX + new Date().toISOString().slice(0, 10)
}

function getOrCreateUUID() {
  let uuid = localStorage.getItem(VISITOR_UUID_KEY)
  if (!uuid) {
    uuid = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(VISITOR_UUID_KEY, uuid)
  }
  return uuid
}

export function getDeviceInfo() {
  const ua = navigator.userAgent

  let device = 'desktop'
  if (/Mobi|Android|iPhone|iPod/.test(ua)) device = 'mobile'
  else if (/iPad|Tablet/.test(ua)) device = 'tablet'

  let browser = 'Other'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\//.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua)) browser = 'Safari'

  let os = 'Other'
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  return { device, browser, os }
}

function emptyStats() {
  return {
    pageViews: {},
    visitors: [],
    newVisitors: 0,
    returningVisitors: 0,
    hourly: {},
    devices: {},
    browsers: {},
    os: {},
    referrers: {},
  }
}

function parseStats(raw) {
  try {
    return JSON.parse(raw) || emptyStats()
  } catch {
    return emptyStats()
  }
}

export function getTodayStats() {
  return parseStats(localStorage.getItem(getTodayKey()))
}

export function getStatsForDate(dateStr) {
  return parseStats(localStorage.getItem(STATS_PREFIX + dateStr))
}

export function trackPageView(path) {
  const stats = getTodayStats()
  const uuid = getOrCreateUUID()
  const hour = new Date().getHours()
  const { device, browser, os } = getDeviceInfo()
  const isNew = !localStorage.getItem(RETURNING_KEY)

  // Page views (every navigation)
  stats.pageViews[path] = (stats.pageViews[path] || 0) + 1

  // Hourly distribution (every navigation)
  stats.hourly[hour] = (stats.hourly[hour] || 0) + 1

  // Per-visitor metrics (only once per visitor per day)
  const isFirstVisitToday = !stats.visitors.includes(uuid)
  if (isFirstVisitToday) {
    stats.visitors.push(uuid)

    if (isNew) {
      stats.newVisitors = (stats.newVisitors || 0) + 1
      localStorage.setItem(RETURNING_KEY, '1')
    } else {
      stats.returningVisitors = (stats.returningVisitors || 0) + 1
    }

    stats.devices[device] = (stats.devices[device] || 0) + 1
    stats.browsers[browser] = (stats.browsers[browser] || 0) + 1
    stats.os[os] = (stats.os[os] || 0) + 1
  }

  // Referrer (every navigation)
  let referrer = 'direct'
  try {
    if (document.referrer) referrer = new URL(document.referrer).hostname
  } catch {}
  stats.referrers[referrer] = (stats.referrers[referrer] || 0) + 1

  localStorage.setItem(getTodayKey(), JSON.stringify(stats))
  cleanOldStats()

  // Fire-and-forget to backend (backend may not have this endpoint yet)
  recordVisit({ path, uuid, device, browser, os, referrer, isNew, hour }).catch(() => {})
}

export function getWeekStats() {
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const stats = getStatsForDate(dateStr)
    const total = Object.values(stats.pageViews).reduce((a, b) => a + b, 0)
    result.push({
      date: dateStr,
      pageViews: total,
      uniqueVisitors: stats.visitors.length,
    })
  }
  return result
}

function cleanOldStats() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - MAX_DAYS)
  const cutoffKey = STATS_PREFIX + cutoff.toISOString().slice(0, 10)
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STATS_PREFIX) && k < cutoffKey)
    .forEach((k) => localStorage.removeItem(k))
}
