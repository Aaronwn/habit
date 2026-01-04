// app.js
const config = require('./config.js')

App({
  globalData: {
    userInfo: null,
    openid: null,
    cloudEnvId: config.CLOUD_ENV_ID
  },

  onLaunch() {
    // 初始化云开发环境
    this.initCloud()

    // 检查登录状态
    this.checkLoginStatus()
  },

  // 初始化云开发
  initCloud() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }

    wx.cloud.init({
      env: this.globalData.cloudEnvId,
      traceUser: true
    })

    console.log('云开发环境初始化成功')
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      const openid = wx.getStorageSync('openid')
      const userInfo = wx.getStorageSync('userInfo')

      if (openid) {
        this.globalData.openid = openid
        console.log('用户已登录，openid:', openid)
      } else {
        console.log('用户未登录')
      }

      if (userInfo) {
        this.globalData.userInfo = userInfo
      }
    } catch (err) {
      console.error('检查登录状态失败:', err)
    }
  },

  // 用户登录
  async login() {
    try {
      wx.showLoading({
        title: '登录中...',
        mask: true
      })

      const res = await wx.cloud.callFunction({
        name: 'login'
      })

      if (res.result && res.result.openid) {
        this.globalData.openid = res.result.openid
        wx.setStorageSync('openid', res.result.openid)

        // 保存用户信息（头像、昵称等）
        if (res.result.userInfo) {
          this.globalData.userInfo = res.result.userInfo
          wx.setStorageSync('userInfo', res.result.userInfo)
        }

        wx.hideLoading()
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        return res.result
      } else {
        throw new Error('登录失败')
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
      console.error('登录失败:', err)
      throw err
    }
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })

      this.globalData.userInfo = userInfo
      wx.setStorageSync('userInfo', userInfo)

      return userInfo
    } catch (err) {
      console.error('获取用户信息失败:', err)
      throw err
    }
  }
})
