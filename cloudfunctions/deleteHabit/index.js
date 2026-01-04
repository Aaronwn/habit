// cloudfunctions/deleteHabit/index.js
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

    // 软删除：设置isActive为false
    await db.collection('habits')
      .where({
        _openid: wxContext.OPENID,
        _id: habitId
      })
      .update({
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      })

    return { success: true }
  } catch (err) {
    console.error('删除习惯失败:', err)
    return { success: false, error: err.message }
  }
}
