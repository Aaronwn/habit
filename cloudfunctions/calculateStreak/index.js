// cloudfunctions/calculateStreak/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { habitId } = event

  try {
    if (!habitId) {
      return { success: false, error: '习惯ID不能为空' }
    }

    // 获取该习惯所有已完成的打卡记录，按日期降序
    const { data } = await db.collection('check_ins')
      .where({
        _openid: wxContext.OPENID,
        habitId: habitId,
        completed: true
      })
      .orderBy('date', 'desc')
      .get()

    if (data.length === 0) {
      return {
        success: true,
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0
      }
    }

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    // 获取今天的日期（YYYY-MM-DD格式）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // 检查最近一次打卡是今天还是昨天
    const lastDate = new Date(data[0].date)
    lastDate.setHours(0, 0, 0, 0)
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    // 如果最后一次打卡在今天或昨天，开始计算当前连续天数
    if (daysDiff <= 1) {
      currentStreak = 1

      // 计算连续天数
      for (let i = 0; i < data.length - 1; i++) {
        const date1 = new Date(data[i].date)
        const date2 = new Date(data[i + 1].date)

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
    for (let i = 0; i < data.length - 1; i++) {
      const date1 = new Date(data[i].date)
      const date2 = new Date(data[i + 1].date)

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

    return {
      success: true,
      currentStreak,
      longestStreak,
      totalCheckIns: data.length
    }
  } catch (err) {
    console.error('计算连续天数失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
