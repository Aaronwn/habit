// cloudfunctions/getHabits/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { activeOnly = true } = event

  try {
    const query = {
      _openid: wxContext.OPENID
    }

    if (activeOnly) {
      query.isActive = true
    }

    const { data } = await db.collection('habits')
      .where(query)
      .orderBy('sort', 'asc')
      .orderBy('createdAt', 'desc')
      .get()

    // 兼容频率字段旧格式，统一返回对象
    const normalized = data.map(item => {
      let frequency = { type: 'daily', timesPerWeek: 3 }
      if (item.frequency) {
        if (typeof item.frequency === 'object') {
          frequency = {
            type: item.frequency.type || 'daily',
            timesPerWeek: item.frequency.timesPerWeek || 3
          }
        } else if (typeof item.frequency === 'string') {
          frequency = { type: item.frequency, timesPerWeek: 3 }
        }
      }
      return {
        ...item,
        frequency
      }
    })

    return {
      success: true,
      data: normalized
    }
  } catch (err) {
    console.error('获取习惯列表失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
