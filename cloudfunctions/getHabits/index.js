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

    return {
      success: true,
      data: data
    }
  } catch (err) {
    console.error('获取习惯列表失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
