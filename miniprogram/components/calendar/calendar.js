// components/calendar/calendar.js
const dateUtil = require('../../utils/date')

Component({
  properties: {
    // 打卡日期数据 { 'YYYY-MM-DD': { completed: true, value: 5 } }
    checkInData: {
      type: Object,
      value: {}
    },
    // 主题颜色
    color: {
      type: String,
      value: '#6C5CE7'
    },
    // 选中的日期
    selectedDate: {
      type: String,
      value: ''
    }
  },

  data: {
    year: 0,
    month: 0,
    currentYear: 0,   // 当前真实年份（用于判断是否显示"返回今天"）
    currentMonth: 0,  // 当前真实月份
    calendarData: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    today: ''
  },

  observers: {
    'year, month': function(year, month) {
      if (year && month) {
        this.generateCalendar()
      }
    }
  },

  lifetimes: {
    attached() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      this.setData({
        year: currentYear,
        month: currentMonth,
        currentYear: currentYear,
        currentMonth: currentMonth,
        today: dateUtil.getToday()
      })
    }
  },

  methods: {
    // 生成日历数据
    generateCalendar() {
      const { year, month } = this.data
      const calendarData = dateUtil.getCalendarData(year, month)
      this.setData({ calendarData })
    },

    // 上个月
    prevMonth() {
      let { year, month } = this.data
      month--
      if (month < 1) {
        month = 12
        year--
      }
      this.setData({ year, month })
      this.triggerEvent('monthchange', { year, month })
    },

    // 下个月
    nextMonth() {
      let { year, month } = this.data
      month++
      if (month > 12) {
        month = 1
        year++
      }
      this.setData({ year, month })
      this.triggerEvent('monthchange', { year, month })
    },

    // 回到今天
    goToday() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const today = dateUtil.getToday()

      this.setData({ year, month })
      this.triggerEvent('dateselect', { date: today })
      this.triggerEvent('monthchange', { year, month })
    },

    // 点击日期
    onDateTap(e) {
      const { date, iscurrentmonth } = e.currentTarget.dataset

      // 如果不是当月日期，切换到对应月份
      if (!iscurrentmonth) {
        const d = new Date(date)
        this.setData({
          year: d.getFullYear(),
          month: d.getMonth() + 1
        })
      }

      this.triggerEvent('dateselect', { date })
    },

    // 获取日期的打卡状态
    getCheckInStatus(date) {
      const checkIn = this.data.checkInData[date]
      if (!checkIn) return null
      return checkIn
    },

    // 判断日期是否已打卡
    isCheckedIn(date) {
      const checkIn = this.data.checkInData[date]
      return checkIn && checkIn.completed
    }
  }
})
