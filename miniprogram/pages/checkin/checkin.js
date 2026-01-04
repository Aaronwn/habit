// pages/checkin/checkin.js
const api = require('../../utils/api')
const dateUtil = require('../../utils/date')
const storage = require('../../utils/storage')
const { DEFAULT_COLOR, DEFAULT_ICON } = require('../../utils/constants')

Page({
  data: {
    habitId: '',
    habit: null,
    date: '',
    dateDisplay: '',
    isToday: true,
    loading: true,
    saving: false,

    // 打卡数据
    completed: false,
    value: '',
    note: '',

    // 是否已存在打卡记录（用于判断是新增还是更新）
    existingCheckIn: null
  },

  onLoad(options) {
    const habitId = options.habitId
    const date = options.date || dateUtil.getToday()
    const isToday = dateUtil.isToday(date)

    this.setData({
      habitId,
      date,
      isToday,
      dateDisplay: dateUtil.getFriendlyDate(date)
    })

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: isToday ? '今日打卡' : dateUtil.getFriendlyDate(date) + ' 打卡'
    })

    this.loadData()
  },

  // 加载数据
  async loadData() {
    try {
      this.setData({ loading: true })

      // 并行加载习惯信息和打卡数据
      await Promise.all([
        this.loadHabitInfo(),
        this.loadCheckInData()
      ])

      this.setData({ loading: false })
    } catch (err) {
      console.error('加载数据失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
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
        this.updateNavBarColor(habit.color)
      }
    }

    // 从服务器获取最新数据
    try {
      const result = await api.getHabits(false)
      if (result && result.data) {
        const habit = result.data.find(h => h._id === habitId)
        if (habit) {
          this.setData({ habit })
          this.updateNavBarColor(habit.color)
        }
      }
    } catch (err) {
      console.error('获取习惯信息失败:', err)
    }
  },

  // 更新导航栏颜色
  updateNavBarColor(color) {
    if (color) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: color,
        animation: {
          duration: 300,
          timingFunc: 'easeIn'
        }
      })
    }
  },

  // 加载打卡数据
  async loadCheckInData() {
    const { habitId, date } = this.data

    try {
      const result = await api.getCheckIns({
        habitId,
        startDate: date,
        endDate: date
      })

      if (result && result.data && result.data.length > 0) {
        const checkIn = result.data[0]
        this.setData({
          existingCheckIn: checkIn,
          completed: checkIn.completed || false,
          value: checkIn.value ? String(checkIn.value) : '',
          note: checkIn.note || ''
        })
      }
    } catch (err) {
      console.error('获取打卡数据失败:', err)
    }
  },

  // 切换完成状态
  onCompletedChange(e) {
    this.setData({
      completed: e.detail.value
    })
  },

  // 快速完成打卡（一键完成）
  onQuickComplete() {
    const { habit, completed } = this.data

    if (completed) {
      // 已完成，取消完成
      this.setData({ completed: false })
    } else {
      // 未完成，标记完成
      this.setData({ completed: true })

      // 如果有目标值，自动填充
      if (habit && habit.targetValue) {
        this.setData({ value: String(habit.targetValue) })
      }
    }
  },

  // 输入完成数量
  onValueInput(e) {
    this.setData({
      value: e.detail.value
    })
  },

  // 增加数量
  onValueIncrease() {
    const { value } = this.data
    const current = parseFloat(value) || 0
    this.setData({
      value: String(current + 1)
    })
  },

  // 减少数量
  onValueDecrease() {
    const { value } = this.data
    const current = parseFloat(value) || 0
    if (current > 0) {
      this.setData({
        value: String(Math.max(0, current - 1))
      })
    }
  },

  // 输入备注
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  // 提交打卡
  async onSubmit() {
    const { habitId, date, completed, value, note, saving, existingCheckIn } = this.data

    if (saving) return

    try {
      this.setData({ saving: true })
      wx.showLoading({ title: '保存中...' })

      await api.checkIn({
        habitId,
        date,
        completed,
        value: value ? parseFloat(value) : null,
        note: note.trim()
      })

      wx.hideLoading()

      // 清除缓存，确保首页刷新
      storage.clearCheckInsCache()

      // 震动反馈
      if (completed) {
        wx.vibrateShort({ type: 'medium' })
      }

      wx.showToast({
        title: existingCheckIn ? '更新成功' : (completed ? '打卡成功' : '已保存'),
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      wx.hideLoading()
      console.error('打卡失败:', err)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ saving: false })
    }
  },

  // 删除打卡记录
  async onDelete() {
    const { existingCheckIn } = this.data

    if (!existingCheckIn) return

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条打卡记录吗？',
      confirmColor: '#FF6B6B',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' })

            // 通过设置 completed: false 和 value: null 来"删除"记录
            await api.checkIn({
              habitId: this.data.habitId,
              date: this.data.date,
              completed: false,
              value: null,
              note: ''
            })

            wx.hideLoading()
            storage.clearCheckInsCache()

            wx.showToast({
              title: '已删除',
              icon: 'success'
            })

            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          } catch (err) {
            wx.hideLoading()
            console.error('删除失败:', err)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})
