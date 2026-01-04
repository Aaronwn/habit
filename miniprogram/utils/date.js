// utils/date.js - 日期处理工具

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  if (!date) {
    date = new Date()
  } else if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @returns {string} 格式化后的日期时间字符串
 */
function formatDateTime(date) {
  if (!date) {
    date = new Date()
  } else if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date)
  }

  const dateStr = formatDate(date)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${dateStr} ${hours}:${minutes}:${seconds}`
}

/**
 * 获取今天的日期
 * @returns {string} YYYY-MM-DD格式的今天日期
 */
function getToday() {
  return formatDate(new Date())
}

/**
 * 获取昨天的日期
 * @returns {string} YYYY-MM-DD格式的昨天日期
 */
function getYesterday() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDate(yesterday)
}

/**
 * 获取明天的日期
 * @returns {string} YYYY-MM-DD格式的明天日期
 */
function getTomorrow() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDate(tomorrow)
}

/**
 * 获取本周第一天（周一）
 * @returns {string} YYYY-MM-DD格式的日期
 */
function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day // 周日为0，需要特殊处理
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + diff)
  return formatDate(weekStart)
}

/**
 * 获取本周最后一天（周日）
 * @returns {string} YYYY-MM-DD格式的日期
 */
function getWeekEnd() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 0 : 7 - day
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() + diff)
  return formatDate(weekEnd)
}

/**
 * 获取本月第一天
 * @returns {string} YYYY-MM-DD格式的日期
 */
function getMonthStart() {
  const now = new Date()
  return formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

/**
 * 获取本月最后一天
 * @returns {string} YYYY-MM-DD格式的日期
 */
function getMonthEnd() {
  const now = new Date()
  return formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}

/**
 * 计算两个日期之间的天数差
 * @param {string|Date} date1 - 日期1
 * @param {string|Date} date2 - 日期2
 * @returns {number} 天数差（绝对值）
 */
function getDaysDiff(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)

  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)

  const diff = Math.abs(d1.getTime() - d2.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * 判断是否是今天
 * @param {string|Date} date - 日期
 * @returns {boolean} 是否是今天
 */
function isToday(date) {
  return formatDate(date) === getToday()
}

/**
 * 判断是否是昨天
 * @param {string|Date} date - 日期
 * @returns {boolean} 是否是昨天
 */
function isYesterday(date) {
  return formatDate(date) === getYesterday()
}

/**
 * 获取日期的星期几
 * @param {string|Date} date - 日期
 * @returns {string} 星期几（如：周一、周二...）
 */
function getWeekDay(date) {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(date)
  return weekDays[d.getDay()]
}

/**
 * 获取友好的日期显示
 * @param {string|Date} date - 日期
 * @returns {string} 友好的日期显示（如：今天、昨天、12月25日）
 */
function getFriendlyDate(date) {
  if (isToday(date)) {
    return '今天'
  }

  if (isYesterday(date)) {
    return '昨天'
  }

  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()

  return `${month}月${day}日`
}

/**
 * 获取某个月的天数
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {number} 该月的天数
 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/**
 * 生成日期范围数组
 * @param {string|Date} startDate - 开始日期
 * @param {string|Date} endDate - 结束日期
 * @returns {Array<string>} 日期数组（YYYY-MM-DD格式）
 */
function getDateRange(startDate, endDate) {
  const dates = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  while (start <= end) {
    dates.push(formatDate(new Date(start)))
    start.setDate(start.getDate() + 1)
  }

  return dates
}

/**
 * 获取日历数据（包含上月末尾和下月开头的日期，填充完整周）
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {Array<object>} 日历数据数组
 */
function getCalendarData(year, month) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const calendar = []

  // 补充上月末尾的日期
  const prevMonthDays = getDaysInMonth(year, month - 1)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 2, prevMonthDays - i)
    calendar.push({
      date: formatDate(date),
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false
    })
  }

  // 当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    calendar.push({
      date: formatDate(date),
      day: day,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false
    })
  }

  // 补充下月开头的日期，填充完整周
  const remainingDays = 7 - (calendar.length % 7)
  if (remainingDays < 7) {
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month, day)
      calendar.push({
        date: formatDate(date),
        day: day,
        isCurrentMonth: false,
        isPrevMonth: false,
        isNextMonth: true
      })
    }
  }

  return calendar
}

module.exports = {
  formatDate,
  formatDateTime,
  getToday,
  getYesterday,
  getTomorrow,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  getDaysDiff,
  isToday,
  isYesterday,
  getWeekDay,
  getFriendlyDate,
  getDaysInMonth,
  getDateRange,
  getCalendarData
}
