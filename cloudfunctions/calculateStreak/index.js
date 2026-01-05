// cloudfunctions/calculateStreak/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 获取日期所在周的周一（ISO周：周一为一周开始）
function getWeekStart(dateStr) {
  const date = new Date(dateStr)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day // 周日时往回6天，其他时候往回到周一
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]
}

// 获取上一周的周一
function getPrevWeekStart(weekStart) {
  const date = new Date(weekStart)
  date.setDate(date.getDate() - 7)
  return date.toISOString().split('T')[0]
}

// 计算每日频率的连续天数
function calculateDailyStreak(checkIns) {
  if (checkIns.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  // 获取今天的日期
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 检查最近一次打卡是今天还是昨天
  const lastDate = new Date(checkIns[0].date)
  lastDate.setHours(0, 0, 0, 0)
  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  // 如果最后一次打卡在今天或昨天，开始计算当前连续天数
  if (daysDiff <= 1) {
    currentStreak = 1

    for (let i = 0; i < checkIns.length - 1; i++) {
      const date1 = new Date(checkIns[i].date)
      const date2 = new Date(checkIns[i + 1].date)

      date1.setHours(0, 0, 0, 0)
      date2.setHours(0, 0, 0, 0)

      const diff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))

      if (diff === 1) {
        currentStreak++
        tempStreak++
      } else {
        break
      }
    }
  }

  // 计算最长连续天数
  tempStreak = 1
  for (let i = 0; i < checkIns.length - 1; i++) {
    const date1 = new Date(checkIns[i].date)
    const date2 = new Date(checkIns[i + 1].date)

    date1.setHours(0, 0, 0, 0)
    date2.setHours(0, 0, 0, 0)

    const diff = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))

    if (diff === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { currentStreak, longestStreak }
}

// 计算每周频率的连续周数
function calculateWeeklyStreak(checkIns, timesPerWeek) {
  if (checkIns.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // 按周分组统计打卡次数
  const weekMap = {}
  checkIns.forEach(record => {
    const weekStart = getWeekStart(record.date)
    weekMap[weekStart] = (weekMap[weekStart] || 0) + 1
  })

  // 获取所有完成目标的周（按日期排序）
  const completedWeeks = Object.entries(weekMap)
    .filter(([_, count]) => count >= timesPerWeek)
    .map(([week]) => week)
    .sort((a, b) => b.localeCompare(a)) // 降序排列

  if (completedWeeks.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // 获取本周和上周的周一
  const today = new Date()
  const thisWeekStart = getWeekStart(today.toISOString().split('T')[0])
  const lastWeekStart = getPrevWeekStart(thisWeekStart)

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  // 计算当前连续周数
  // 检查本周或上周是否完成
  const latestCompletedWeek = completedWeeks[0]
  if (latestCompletedWeek === thisWeekStart || latestCompletedWeek === lastWeekStart) {
    currentStreak = 1
    let expectedWeek = getPrevWeekStart(latestCompletedWeek)

    for (let i = 1; i < completedWeeks.length; i++) {
      if (completedWeeks[i] === expectedWeek) {
        currentStreak++
        expectedWeek = getPrevWeekStart(expectedWeek)
      } else {
        break
      }
    }
  }

  // 计算最长连续周数
  tempStreak = 1
  for (let i = 0; i < completedWeeks.length - 1; i++) {
    const expectedPrev = getPrevWeekStart(completedWeeks[i])
    if (completedWeeks[i + 1] === expectedPrev) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { currentStreak, longestStreak }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { habitId } = event

  try {
    if (!habitId) {
      return { success: false, error: '习惯ID不能为空' }
    }

    // 获取习惯信息
    const { data: [habit] } = await db.collection('habits')
      .where({
        _openid: wxContext.OPENID,
        _id: habitId
      })
      .get()

    if (!habit) {
      return { success: false, error: '习惯不存在' }
    }

    // 兼容旧数据格式
    let frequency = habit.frequency
    if (!frequency || typeof frequency === 'string') {
      frequency = { type: 'daily' }
    }

    // 获取该习惯所有已完成的打卡记录，按日期降序
    const { data: checkIns } = await db.collection('check_ins')
      .where({
        _openid: wxContext.OPENID,
        habitId: habitId,
        completed: true
      })
      .orderBy('date', 'desc')
      .get()

    const totalCheckIns = checkIns.length

    if (totalCheckIns === 0) {
      return {
        success: true,
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0
      }
    }

    // 根据频率类型计算连续
    let streakResult
    if (frequency.type === 'weekly') {
      streakResult = calculateWeeklyStreak(checkIns, frequency.timesPerWeek || 3)
    } else {
      streakResult = calculateDailyStreak(checkIns)
    }

    return {
      success: true,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      totalCheckIns
    }
  } catch (err) {
    console.error('计算连续天数失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
