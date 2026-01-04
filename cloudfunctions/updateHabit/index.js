// cloudfunctions/updateHabit/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { habitId, ...updateData } = event

  try {
    if (!habitId) {
      return { success: false, error: '习惯ID不能为空' }
    }

    const now = new Date()
    updateData.updatedAt = now

    await db.collection('habits')
      .where({
        _openid: wxContext.OPENID,
        _id: habitId
      })
      .update({
        data: updateData
      })

    return { success: true }
  } catch (err) {
    console.error('更新习惯失败:', err)
    return { success: false, error: err.message }
  }
}
