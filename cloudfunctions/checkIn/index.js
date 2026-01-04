// cloudfunctions/checkIn/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { habitId, date, completed, value, note } = event

  try {
    if (!habitId || !date) {
      return { success: false, error: '习惯ID和日期不能为空' }
    }

    // 查询是否已存在该日期的打卡记录
    const { data: existingCheckIns } = await db.collection('check_ins')
      .where({
        _openid: wxContext.OPENID,
        habitId: habitId,
        date: date
      })
      .get()

    const now = new Date()

    if (existingCheckIns.length > 0) {
      // 更新已有记录
      await db.collection('check_ins')
        .doc(existingCheckIns[0]._id)
        .update({
          data: {
            completed: completed !== undefined ? completed : existingCheckIns[0].completed,
            value: value !== undefined ? value : existingCheckIns[0].value,
            note: note !== undefined ? note : existingCheckIns[0].note,
            updatedAt: now
          }
        })

      return {
        success: true,
        action: 'update',
        id: existingCheckIns[0]._id
      }
    } else {
      // 创建新记录
      const result = await db.collection('check_ins').add({
        data: {
          _openid: wxContext.OPENID,
          habitId,
          date,
          completed: completed !== undefined ? completed : false,
          value: value || null,
          note: note || '',
          createdAt: now,
          updatedAt: now
        }
      })

      return {
        success: true,
        action: 'create',
        id: result._id
      }
    }
  } catch (err) {
    console.error('打卡失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
