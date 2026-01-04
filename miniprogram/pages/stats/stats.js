// pages/stats/stats.js - 统计页面
const api = require('../../utils/api')
const dateUtil = require('../../utils/date')
const storage = require('../../utils/storage')

Page({
  data: {
    loading: true,

    // 时间范围选择
    timeRange: 'week', // week, month, all
    timeRangeOptions: [
      { value: 'week', label: '本周' },
      { value: 'month', label: '本月' },
      { value: 'all', label: '全部' }
    ],

    // 总览统计
    totalCheckIns: 0,
    currentStreak: 0,
    longestStreak: 0,
    checkInRate: 0,

    // 习惯列表及统计
    habits: [],
    habitsStats: [],

    // 周数据（用于图表）
    weekData: [],
    weekLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadData()
  },

  // 加载数据
  async loadData() {
    try {
      this.setData({ loading: true })

      // 并行加载习惯列表和打卡记录
      const [habitsResult, checkInsResult] = await Promise.all([
        api.getHabits(),
        api.getCheckIns({})
      ])

      const habits = habitsResult?.data || []
      const checkIns = checkInsResult?.data || []

      // 计算统计数据
      this.calculateStats(habits, checkIns)

      this.setData({ loading: false })
    } catch (err) {
      console.error('加载统计数据失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 计算统计数据
  calculateStats(habits, checkIns) {
    const { timeRange } = this.data
    const today = dateUtil.getToday()

    // 根据时间范围筛选打卡记录
    let filteredCheckIns = checkIns
    let startDate = null

    if (timeRange === 'week') {
      startDate = dateUtil.getWeekStart()
      filteredCheckIns = checkIns.filter(c => c.date >= startDate && c.date <= today)
    } else if (timeRange === 'month') {
      startDate = dateUtil.getMonthStart()
      filteredCheckIns = checkIns.filter(c => c.date >= startDate && c.date <= today)
    }

    // 计算总览数据
    const completedCheckIns = filteredCheckIns.filter(c => c.completed)
    const totalCheckIns = completedCheckIns.length

    // 计算打卡率
    let checkInRate = 0
    if (habits.length > 0 && startDate) {
      const days = dateUtil.getDaysDiff(startDate, today) + 1
      const expectedCheckIns = habits.length * days
      checkInRate = expectedCheckIns > 0 ? Math.round(totalCheckIns / expectedCheckIns * 100) : 0
    } else if (habits.length > 0 && !startDate) {
      // 全部时间范围
      const allCompleted = checkIns.filter(c => c.completed).length
      const uniqueDates = [...new Set(checkIns.map(c => c.date))]
      const expectedAll = habits.length * uniqueDates.length
      checkInRate = expectedAll > 0 ? Math.round(allCompleted / expectedAll * 100) : 0
    }

    // 计算连续打卡天数（全局）
    const { currentStreak, longestStreak } = this.calculateGlobalStreak(habits, checkIns)

    // 计算每个习惯的统计
    const habitsStats = habits.map(habit => {
      const habitCheckIns = filteredCheckIns.filter(c => c.habitId === habit._id)
      const completed = habitCheckIns.filter(c => c.completed).length
      const total = habitCheckIns.length

      // 计算该习惯的连续天数
      const allHabitCheckIns = checkIns.filter(c => c.habitId === habit._id)
      const streak = this.calculateHabitStreak(allHabitCheckIns)

      // 计算进度百分比
      let rate = 0
      if (startDate) {
        const days = dateUtil.getDaysDiff(startDate, today) + 1
        rate = days > 0 ? Math.round(completed / days * 100) : 0
      } else {
        rate = total > 0 ? Math.round(completed / total * 100) : 0
      }

      return {
        habitId: habit._id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        currentStreak: streak,
        totalCheckIns: completed,
        rate: Math.min(rate, 100)
      }
    })

    // 计算周数据（用于图表）
    const weekData = this.calculateWeekData(habits, checkIns)

    this.setData({
      habits,
      totalCheckIns,
      currentStreak,
      longestStreak,
      checkInRate,
      habitsStats,
      weekData
    })
  },

  // 计算全局连续打卡天数（所有习惯都完成才算一天）
  calculateGlobalStreak(habits, checkIns) {
    if (habits.length === 0) return { currentStreak: 0, longestStreak: 0 }

    // 按日期分组打卡记录
    const dateMap = {}
    checkIns.forEach(c => {
      if (!dateMap[c.date]) {
        dateMap[c.date] = new Set()
      }
      if (c.completed) {
        dateMap[c.date].add(c.habitId)
      }
    })

    // 找出所有习惯都完成的日期
    const completeDates = Object.keys(dateMap)
      .filter(date => dateMap[date].size >= habits.length)
      .sort((a, b) => new Date(b) - new Date(a))

    if (completeDates.length === 0) return { currentStreak: 0, longestStreak: 0 }

    const today = dateUtil.getToday()
    const yesterday = dateUtil.getYesterday()

    // 计算当前连续天数
    let currentStreak = 0
    if (completeDates.includes(today) || completeDates.includes(yesterday)) {
      const startDate = completeDates.includes(today) ? today : yesterday
      currentStreak = 1
      let checkDate = new Date(startDate)

      for (let i = 1; i < completeDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1)
        const checkDateStr = dateUtil.formatDate(checkDate)
        if (completeDates.includes(checkDateStr)) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // 计算最长连续天数
    let longestStreak = 0
    let tempStreak = 1

    for (let i = 1; i < completeDates.length; i++) {
      const prevDate = new Date(completeDates[i - 1])
      const currDate = new Date(completeDates[i])
      const diff = (prevDate - currDate) / (1000 * 60 * 60 * 24)

      if (diff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

    return { currentStreak, longestStreak }
  },

  // 计算单个习惯的连续天数
  calculateHabitStreak(checkIns) {
    const completedCheckIns = checkIns
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    if (completedCheckIns.length === 0) return 0

    const today = dateUtil.getToday()
    const yesterday = dateUtil.getYesterday()
    const latestDate = completedCheckIns[0].date

    if (latestDate !== today && latestDate !== yesterday) return 0

    let streak = 1
    let currentDate = new Date(latestDate)

    for (let i = 1; i < completedCheckIns.length; i++) {
      currentDate.setDate(currentDate.getDate() - 1)
      const expectedDate = dateUtil.formatDate(currentDate)

      if (completedCheckIns[i].date === expectedDate) {
        streak++
      } else {
        break
      }
    }

    return streak
  },

  // 计算周数据
  calculateWeekData(habits, checkIns) {
    const weekStart = dateUtil.getWeekStart()
    const weekData = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateStr = dateUtil.formatDate(date)

      const dayCheckIns = checkIns.filter(c => c.date === dateStr && c.completed)
      const count = dayCheckIns.length
      const rate = habits.length > 0 ? Math.round(count / habits.length * 100) : 0

      weekData.push({
        date: dateStr,
        count,
        rate,
        isToday: dateStr === dateUtil.getToday()
      })
    }

    return weekData
  },

  // 切换时间范围
  onTimeRangeChange(e) {
    const index = e.detail.value
    const timeRange = this.data.timeRangeOptions[index].value
    this.setData({ timeRange })

    // 重新计算统计
    const { habits } = this.data
    api.getCheckIns({}).then(result => {
      const checkIns = result?.data || []
      this.calculateStats(habits, checkIns)
    })
  },

  // 跳转到习惯历史
  onHabitStatTap(e) {
    const { habitid } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/history/history?habitId=${habitid}`
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadData()
    wx.stopPullDownRefresh()
  }
})
