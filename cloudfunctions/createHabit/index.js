// cloudfunctions/createHabit/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { name, icon = '⭐', color = '#6C5CE7', frequency = { type: 'daily' } } = event

  try {
    // 验证必填字段
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: '习惯名称不能为空'
      }
    }

    // 获取当前用户的习惯数量，用于设置sort
    const { total } = await db.collection('habits')
      .where({ _openid: wxContext.OPENID })
      .count()

    const now = new Date()

    const result = await db.collection('habits').add({
      data: {
        _openid: wxContext.OPENID,
        name: name.trim(),
        icon,
        color,
        frequency,
        sort: total,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    })

    return {
      success: true,
      id: result._id
    }
  } catch (err) {
    console.error('创建习惯失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
