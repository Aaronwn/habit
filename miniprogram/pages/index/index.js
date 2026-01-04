// pages/index/index.js - 首页（习惯列表）
const api = require('../../utils/api')
const dateUtil = require('../../utils/date')
const storage = require('../../utils/storage')

Page({
  data: {
    habits: [],
    streaks: {}, // 连续打卡天数 {habitId: streak}
    loading: true,
    refreshing: false,
    today: '',
    todayFormatted: '',
    weekDay: '',
    todayCheckIns: {}, // 今日打卡状态 {habitId: checkInData}
    completedCount: 0, // 今日已完成数量
    totalCount: 0 // 总习惯数量
  },

  onLoad() {
    const today = dateUtil.getToday()
    this.setData({
      today: today,
      todayFormatted: dateUtil.getFriendlyDate(today),
      weekDay: dateUtil.getWeekDay(today)
    })
  },

  onShow() {
    this.loadData()
  },

  // 加载所有数据
  async loadData() {
    await Promise.all([
      this.loadHabits(),
      this.loadTodayCheckIns()
    ])
  },

  // 加载习惯列表
  async loadHabits() {
    try {
      if (!this.data.refreshing) {
        this.setData({ loading: true })
      }

      // 先尝试从缓存获取
      const cachedHabits = storage.getCachedHabits()
      if (cachedHabits && cachedHabits.length > 0) {
        this.setData({
          habits: cachedHabits,
          totalCount: cachedHabits.length,
          loading: false
        })
      }

      // 从服务器获取最新数据
      const result = await api.getHabits(true)

      if (result && result.data) {
        this.setData({
          habits: result.data,
          totalCount: result.data.length,
          loading: false
        })

        // 更新缓存
        storage.cacheHabits(result.data)

        // 加载每个习惯的连续打卡天数
        this.loadStreaks(result.data)
      } else {
        this.setData({ loading: false })
      }
    } catch (err) {
      console.error('加载习惯列表失败:', err)
      this.setData({ loading: false })
    }
  },

  // 加载连续打卡天数
  async loadStreaks(habits) {
    const streaks = {}
    for (const habit of habits) {
      try {
        const result = await api.calculateStreak(habit._id)
        if (result && result.success) {
          streaks[habit._id] = result.currentStreak || 0
        }
      } catch (err) {
        console.error('加载连续天数失败:', err)
      }
    }
    this.setData({ streaks })
  },

  // 加载今日打卡状态
  async loadTodayCheckIns() {
    try {
      const today = this.data.today
      const result = await api.getTodayCheckIns(today)

      if (result && result.data) {
        const checkIns = {}
        let completedCount = 0

        result.data.forEach(item => {
          checkIns[item.habitId] = item
          if (item.completed) {
            completedCount++
          }
        })

        this.setData({
          todayCheckIns: checkIns,
          completedCount: completedCount
        })
      }
    } catch (err) {
      console.error('加载今日打卡状态失败:', err)
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ refreshing: true })
    await this.loadData()
    this.setData({ refreshing: false })
    wx.stopPullDownRefresh()
  },

  // 跳转到添加习惯页面
  goToAddHabit() {
    wx.navigateTo({
      url: '/pages/habit/habit'
    })
  },

  // 点击习惯卡片 - 跳转打卡页面
  onHabitTap(e) {
    const habit = e.detail.habit
    wx.navigateTo({
      url: `/pages/checkin/checkin?habitId=${habit._id}`
    })
  },

  // 快速打卡
  async onQuickCheckIn(e) {
    const habit = e.detail.habit
    const habitId = habit._id
    const today = this.data.today
    const currentCheckIn = this.data.todayCheckIns[habitId]

    // 如果已经打卡，跳转到打卡页面编辑
    if (currentCheckIn && currentCheckIn.completed) {
      wx.navigateTo({
        url: `/pages/checkin/checkin?habitId=${habitId}`
      })
      return
    }

    // 快速打卡
    try {
      wx.showLoading({ title: '打卡中...' })

      await api.checkIn({
        habitId,
        date: today,
        completed: true,
        value: null,
        note: ''
      })

      wx.hideLoading()
      wx.showToast({
        title: '打卡成功！',
        icon: 'success'
      })

      // 刷新数据
      this.loadTodayCheckIns()
      this.loadStreaks(this.data.habits)

      // 振动反馈
      wx.vibrateShort({ type: 'medium' })

    } catch (err) {
      wx.hideLoading()
      console.error('快速打卡失败:', err)
    }
  },

  // 长按习惯卡片
  onHabitLongPress(e) {
    const habit = e.detail.habit
    const habitId = habit._id

    wx.showActionSheet({
      itemList: ['编辑习惯', '查看历史', '删除习惯'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: `/pages/habit/habit?id=${habitId}`
          })
        } else if (res.tapIndex === 1) {
          wx.navigateTo({
            url: `/pages/history/history?habitId=${habitId}`
          })
        } else if (res.tapIndex === 2) {
          this.deleteHabit(habitId, habit.name)
        }
      }
    })
  },

  // 删除习惯
  deleteHabit(habitId, habitName) {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除习惯"${habitName}"吗？删除后相关数据将无法恢复。`,
      confirmColor: '#FF6B6B',
      confirmText: '删除',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' })
            await api.deleteHabit(habitId)
            wx.hideLoading()

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })

            // 清除缓存并刷新列表
            storage.clearHabitsCache()
            this.loadHabits()
          } catch (err) {
            wx.hideLoading()
            console.error('删除习惯失败:', err)
          }
        }
      }
    })
  }
})
