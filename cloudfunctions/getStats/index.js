// cloudfunctions/getStats/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { habitId, type = 'overview' } = event

  try {
    // 获取所有激活的习惯
    const { data: habits } = await db.collection('habits')
      .where({
        _openid: wxContext.OPENID,
        isActive: true
      })
      .get()

    if (habits.length === 0) {
      return {
        success: true,
        data: {
          totalCheckIns: 0,
          currentStreak: 0,
          weeklyRate: 0,
          monthlyRate: 0,
          habitsStats: []
        }
      }
    }

    // 获取统计数据
    const stats = {
      totalCheckIns: 0,
      currentStreak: 0,
      weeklyRate: 0,
      monthlyRate: 0,
      habitsStats: []
    }

    // 简化版本：仅统计基础数据
    for (const habit of habits) {
      const { data: checkIns } = await db.collection('check_ins')
        .where({
          _openid: wxContext.OPENID,
          habitId: habit._id,
          completed: true
        })
        .get()

      stats.totalCheckIns += checkIns.length

      // 调用calculateStreak获取详细统计
      // 在实际环境中可以直接调用，这里简化处理
      stats.habitsStats.push({
        habitId: habit._id,
        name: habit.name,
        icon: habit.icon,
        currentStreak: 0,
        totalCheckIns: checkIns.length,
        rate: 0
      })
    }

    return {
      success: true,
      data: stats
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
