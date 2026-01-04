// cloudfunctions/getCheckIns/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { habitId, date, startDate, endDate, page = 0, pageSize = 20 } = event

  try {
    const query = {
      _openid: wxContext.OPENID
    }

    if (habitId) {
      query.habitId = habitId
    }

    if (date) {
      query.date = date
    }

    if (startDate && endDate) {
      query.date = db.command.gte(startDate).and(db.command.lte(endDate))
    }

    const { data } = await db.collection('check_ins')
      .where(query)
      .orderBy('date', 'desc')
      .skip(page * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: data
    }
  } catch (err) {
    console.error('获取打卡记录失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
