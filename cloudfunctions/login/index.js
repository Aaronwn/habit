// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 获取用户openid
    const openid = wxContext.OPENID

    // 查询用户是否存在
    const { data: users } = await db.collection('users')
      .where({
        _openid: openid
      })
      .get()

    const now = new Date()

    if (users.length === 0) {
      // 新用户，创建用户记录
      await db.collection('users').add({
        data: {
          _openid: openid,
          createdAt: now,
          updatedAt: now,
          settings: {
            notificationEnabled: false,
            notificationTime: '21:00'
          }
        }
      })
    } else {
      // 老用户，更新登录时间
      await db.collection('users')
        .doc(users[0]._id)
        .update({
          data: {
            updatedAt: now
          }
        })
    }

    return {
      success: true,
      openid: openid,
      userInfo: users.length > 0 ? {
        avatarUrl: users[0].avatarUrl || null,
        nickName: users[0].nickName || null,
        openid: openid
      } : { openid: openid }
    }
  } catch (err) {
    console.error('登录失败:', err)
    return {
      success: false,
      error: err
    }
  }
}
