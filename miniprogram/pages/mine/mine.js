// pages/mine/mine.js
const app = getApp()
const api = require('../../utils/api')
const storage = require('../../utils/storage')

Page({
  data: {
    userInfo: null,
    hasLogin: false,
    displayOpenid: '******',  // 显示用的 openid 后8位

    // 统计概览
    totalHabits: 0,
    totalCheckIns: 0,
    currentStreak: 0,

    // 缓存大小
    cacheSize: '0 KB',

    // 版本信息
    version: '1.0.0'
  },

  onLoad() {
    this.checkLoginStatus()
    this.loadStats()
    this.calculateCacheSize()
  },

  onShow() {
    this.checkLoginStatus()
    this.loadStats()
  },

  // 检查登录状态
  checkLoginStatus() {
    const openid = app.globalData.openid
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')

    // 计算显示用的 openid 后8位
    let displayOpenid = '******'
    if (userInfo && userInfo.openid) {
      displayOpenid = userInfo.openid.slice(-8)
    }

    this.setData({
      hasLogin: !!openid,
      userInfo: userInfo,
      displayOpenid: displayOpenid
    })
  },

  // 加载统计数据
  async loadStats() {
    try {
      const [habitsResult, checkInsResult] = await Promise.all([
        api.getHabits(),
        api.getCheckIns({})
      ])

      const habits = habitsResult?.data || []
      const checkIns = checkInsResult?.data || []
      const completedCheckIns = checkIns.filter(c => c.completed)

      // 计算连续天数
      const currentStreak = this.calculateStreak(habits, checkIns)

      this.setData({
        totalHabits: habits.length,
        totalCheckIns: completedCheckIns.length,
        currentStreak
      })
    } catch (err) {
      console.error('加载统计数据失败:', err)
    }
  },

  // 计算连续打卡天数
  calculateStreak(habits, checkIns) {
    if (habits.length === 0) return 0

    const dateMap = {}
    checkIns.forEach(c => {
      if (!dateMap[c.date]) dateMap[c.date] = new Set()
      if (c.completed) dateMap[c.date].add(c.habitId)
    })

    const completeDates = Object.keys(dateMap)
      .filter(date => dateMap[date].size >= habits.length)
      .sort((a, b) => new Date(b) - new Date(a))

    if (completeDates.length === 0) return 0

    const today = this.formatDate(new Date())
    const yesterday = this.formatDate(new Date(Date.now() - 86400000))

    if (!completeDates.includes(today) && !completeDates.includes(yesterday)) return 0

    let streak = 1
    let currentDate = new Date(completeDates[0])

    for (let i = 1; i < completeDates.length; i++) {
      currentDate.setDate(currentDate.getDate() - 1)
      const expectedDate = this.formatDate(currentDate)
      if (completeDates[i] === expectedDate) {
        streak++
      } else {
        break
      }
    }

    return streak
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 计算缓存大小
  calculateCacheSize() {
    try {
      const info = wx.getStorageInfoSync()
      const sizeKB = info.currentSize
      let cacheSize = ''

      if (sizeKB < 1024) {
        cacheSize = `${sizeKB} KB`
      } else {
        cacheSize = `${(sizeKB / 1024).toFixed(2)} MB`
      }

      this.setData({ cacheSize })
    } catch (err) {
      console.error('获取缓存大小失败:', err)
    }
  },

  // 登录
  async onLogin() {
    try {
      wx.showLoading({ title: '登录中...' })
      await app.login()
      this.checkLoginStatus()
      this.loadStats()
      wx.hideLoading()
      wx.showToast({ title: '登录成功', icon: 'success' })
    } catch (err) {
      wx.hideLoading()
      console.error('登录失败:', err)
      wx.showToast({ title: '登录失败', icon: 'none' })
    }
  },

  // 选择头像
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    if (!avatarUrl) return

    try {
      wx.showLoading({ title: '上传中...' })

      // 上传到云存储
      const cloudPath = `avatars/${app.globalData.openid}_${Date.now()}.png`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: avatarUrl
      })

      // 保存到本地和 globalData
      const newAvatarUrl = uploadRes.fileID
      const userInfo = { ...this.data.userInfo, avatarUrl: newAvatarUrl, openid: app.globalData.openid }
      wx.setStorageSync('userInfo', userInfo)
      app.globalData.userInfo = userInfo
      this.setData({ userInfo })

      // 更新数据库
      await api.updateUserInfo({ avatarUrl: newAvatarUrl })

      wx.hideLoading()
      wx.showToast({ title: '头像已更新', icon: 'success' })
    } catch (err) {
      wx.hideLoading()
      console.error('更新头像失败:', err)
      wx.showToast({ title: '更新失败', icon: 'none' })
    }
  },

  // 编辑昵称
  onEditNickname() {
    const currentNickname = this.data.userInfo?.nickName || ''

    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入昵称',
      content: currentNickname,
      confirmColor: '#6C5CE7',
      success: async (res) => {
        if (res.confirm && res.content) {
          const newNickName = res.content.trim()
          if (!newNickName) return

          try {
            wx.showLoading({ title: '保存中...' })

            // 保存到本地和 globalData
            const userInfo = { ...this.data.userInfo, nickName: newNickName, openid: app.globalData.openid }
            wx.setStorageSync('userInfo', userInfo)
            app.globalData.userInfo = userInfo
            this.setData({ userInfo })

            // 更新数据库
            await api.updateUserInfo({ nickName: newNickName })

            wx.hideLoading()
            wx.showToast({ title: '昵称已更新', icon: 'success' })
          } catch (err) {
            wx.hideLoading()
            console.error('更新昵称失败:', err)
            wx.showToast({ title: '更新失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 清除缓存
  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？这不会删除您的云端数据。',
      confirmColor: '#6C5CE7',
      success: (res) => {
        if (res.confirm) {
          try {
            // 保留登录信息
            const openid = app.globalData.openid
            const userInfo = wx.getStorageSync('userInfo')

            // 清除所有缓存
            wx.clearStorageSync()

            // 恢复登录信息
            if (userInfo) {
              wx.setStorageSync('userInfo', userInfo)
            }

            this.calculateCacheSize()

            wx.showToast({
              title: '缓存已清除',
              icon: 'success'
            })
          } catch (err) {
            console.error('清除缓存失败:', err)
            wx.showToast({
              title: '清除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 反馈与建议
  onFeedback() {
    wx.showModal({
      title: '反馈与建议',
      content: '如有问题或建议，欢迎通过小程序官方渠道反馈~',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#6C5CE7'
    })
  },

  // 关于我们
  onAbout() {
    wx.showModal({
      title: '关于习惯打卡',
      content: '习惯打卡是一款帮助你养成好习惯的小工具。\n\n每天坚持打卡，21天养成一个好习惯！\n\n版本：v' + this.data.version,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#6C5CE7'
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '习惯打卡 - 坚持每一天，成就更好的自己',
      path: '/pages/index/index'
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadStats()
    this.calculateCacheSize()
    wx.stopPullDownRefresh()
  }
})
