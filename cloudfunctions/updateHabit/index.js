// cloudfunctions/updateHabit/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { habitId, ...updateData } = event

  try {
    if (!habitId) {
      return { success: false, error: '习惯ID不能为空' }
    }

    console.log('更新习惯:', { habitId, updateData })

    const now = new Date()
    updateData.updatedAt = now

    // 规范化频率字段，确保写入对象格式
    if (updateData.frequency) {
      const { type = 'daily', timesPerWeek = 3 } = updateData.frequency
      updateData.frequency = _.set({
        type,
        timesPerWeek: type === 'weekly' ? timesPerWeek : undefined
      })
    }

    // 先验证该习惯属于当前用户
    const { data: [habit] } = await db.collection('habits')
      .where({
        _id: habitId,
        _openid: wxContext.OPENID
      })
      .get()

    if (!habit) {
      return { success: false, error: '习惯不存在或无权限' }
    }

    // 使用 doc().update() 方式更新
    await db.collection('habits').doc(habitId).update({
      data: updateData
    })

    console.log('更新成功')

    return { success: true }
  } catch (err) {
    console.error('更新习惯失败:', err)
    return { success: false, error: err.message }
  }
}
