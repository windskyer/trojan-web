/**
 * 将字节数转换为可读格式
 * @param {number} bytes
 * @param {number} decimals 小数位数（默认 2）
 * @returns {string}
 */
export function readableBytes(bytes, decimals = 2) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 Bytes'
  if (bytes === 0) return '0 Bytes'

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )

  const value = bytes / Math.pow(1024, index)

  return `${parseFloat(value.toFixed(decimals))} ${units[index]}`
}

/**
 * Promise 版延迟函数
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * IPv4 校验
 * @param {string} ip
 * @returns {boolean}
 */
export function isValidIP(ip) {
  if (typeof ip !== 'string') return false

  const reg =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

  return reg.test(ip)
}

/**
 * 是否外部链接
 * @param {string} path
 * @returns {boolean}
 */
export function isExternal(path) {
  if (typeof path !== 'string') return false
  return /^(https?:|mailto:|tel:)/i.test(path)
}
