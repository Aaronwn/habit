// cloudfunctions/updateUserInfo/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const { avatarUrl, nickName } = event
    const updateData = { updatedAt: new Date() }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl
    }
    if (nickName !== undefined) {
      updateData.nickName = nickName
    }

    await db.collection('users')
      .where({ _openid: openid })
      .update({
        data: updateData
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('更新用户信息失败:', err)
    return {
      success: false,
      error: err
    }
  }
}
