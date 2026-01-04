// pages/history/history.js
const api = require('../../utils/api')
const dateUtil = require('../../utils/date')
const storage = require('../../utils/storage')
const { DEFAULT_COLOR, DEFAULT_ICON } = require('../../utils/constants')

Page({
  data: {
    habitId: '',
    habit: null,
    checkIns: [],
    checkInData: {}, // 日历用的打卡数据 { 'YYYY-MM-DD': { completed: true, value: 5 } }
    selectedDate: '',
    selectedCheckIn: null,
    loading: true,

    // 统计数据
    totalDays: 0,
    completedDays: 0,
    currentStreak: 0,
    completionRate: 0  // 完成率百分比（整数）
  },

  onLoad(options) {
    const habitId = options.habitId
    const today = dateUtil.getToday()

    this.setData({
      habitId,
      selectedDate: today
    })

    this.loadData()
  },

  onShow() {
    // 页面显示时刷新数据（从打卡页面返回时）
    if (this.data.habitId) {
      this.loadData()
    }
  },

  // 加载数据
  async loadData() {
    try {
      this.setData({ loading: true })

      await Promise.all([
        this.loadHabitInfo(),
        this.loadHistory()
      ])

      this.setData({ loading: false })
    } catch (err) {
      console.error('加载数据失败:', err)
      this.setData({ loading: false })
    }
  },

  // 加载习惯信息
  async loadHabitInfo() {
    const { habitId } = this.data

    // 先从缓存获取
    const cachedHabits = storage.getCachedHabits()
    if (cachedHabits) {
      const habit = cachedHabits.find(h => h._id === habitId)
      if (habit) {
        this.setData({ habit })
        wx.setNavigationBarTitle({ title: habit.name + ' - 历史记录' })
      }
    }

    // 从服务器获取
    try {
      const result = await api.getHabits(false)
      if (result && result.data) {
        const habit = result.data.find(h => h._id === habitId)
        if (habit) {
          this.setData({ habit })
          wx.setNavigationBarTitle({ title: habit.name + ' - 历史记录' })
        }
      }
    } catch (err) {
      console.error('获取习惯信息失败:', err)
    }
  },

  // 加载历史记录
  async loadHistory() {
    const { habitId } = this.data

    try {
      const result = await api.getCheckIns({ habitId })

      if (result && result.data) {
        const checkIns = result.data

        // 转换为日历需要的格式
        const checkInData = {}
        checkIns.forEach(item => {
          checkInData[item.date] = {
            completed: item.completed,
            value: item.value,
            note: item.note
          }
        })

        // 计算统计数据
        const completedDays = checkIns.filter(c => c.completed).length
        const totalDays = checkIns.length
        const completionRate = totalDays > 0 ? Math.round(completedDays / totalDays * 100) : 0

        // 计算连续天数
        const currentStreak = this.calculateStreak(checkIns)

        this.setData({
          checkIns,
          checkInData,
          totalDays,
          completedDays,
          currentStreak,
          completionRate
        })

        // 更新选中日期的打卡信息
        this.updateSelectedCheckIn()
      }
    } catch (err) {
      console.error('加载历史记录失败:', err)
    }
  },

  // 计算连续打卡天数
  calculateStreak(checkIns) {
    if (!checkIns || checkIns.length === 0) return 0

    // 筛选已完成的打卡，按日期降序排序
    const completedCheckIns = checkIns
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    if (completedCheckIns.length === 0) return 0

    const today = dateUtil.getToday()
    const yesterday = dateUtil.getYesterday()

    // 检查最近的打卡是今天还是昨天
    const latestDate = completedCheckIns[0].date
    if (latestDate !== today && latestDate !== yesterday) {
      return 0
    }

    let streak = 1
    let currentDate = new Date(latestDate)

    for (let i = 1; i < completedCheckIns.length; i++) {
      const prevDate = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateStr = dateUtil.formatDate(prevDate)

      if (completedCheckIns[i].date === prevDateStr) {
        streak++
        currentDate = prevDate
      } else {
        break
      }
    }

    return streak
  },

  // 更新选中日期的打卡信息
  updateSelectedCheckIn() {
    const { selectedDate, checkIns } = this.data
    const selectedCheckIn = checkIns.find(c => c.date === selectedDate) || null
    this.setData({ selectedCheckIn })
  },

  // 日历日期选择
  onDateSelect(e) {
    const { date } = e.detail
    this.setData({ selectedDate: date })
    this.updateSelectedCheckIn()
  },

  // 日历月份变化
  onMonthChange(e) {
    // 可以在这里加载更多月份的数据
    console.log('月份变化:', e.detail)
  },

  // 点击打卡详情，跳转到打卡页面编辑
  onCheckInTap() {
    const { habitId, selectedDate } = this.data
    wx.navigateTo({
      url: `/pages/checkin/checkin?habitId=${habitId}&date=${selectedDate}`
    })
  },

  // 点击历史记录项
  onHistoryItemTap(e) {
    const { date } = e.currentTarget.dataset
    const { habitId } = this.data

    wx.navigateTo({
      url: `/pages/checkin/checkin?habitId=${habitId}&date=${date}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
