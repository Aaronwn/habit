// components/habit-card/habit-card.js
Component({
  properties: {
    habit: {
      type: Object,
      value: null
    },
    checkIn: {
      type: Object,
      value: null
    },
    streak: {
      type: Number,
      value: 0
    }
  },

  data: {
    isCheckedToday: false,
    animating: false
  },

  lifetimes: {
    attached() {
      this.updateStatus()
    }
  },

  observers: {
    'checkIn': function(checkIn) {
      this.updateStatus()
    }
  },

  methods: {
    updateStatus() {
      const checkIn = this.data.checkIn
      this.setData({
        isCheckedToday: checkIn && checkIn.completed
      })
    },

    onTap() {
      this.triggerEvent('habittap', { habit: this.data.habit })
    },

    onLongPress() {
      wx.vibrateShort({ type: 'medium' })
      this.triggerEvent('habitlongpress', { habit: this.data.habit })
    },

    // 快速打卡按钮点击
    onQuickCheckIn(e) {
      // 阻止事件冒泡，避免触发卡片点击
      this.setData({ animating: true })

      setTimeout(() => {
        this.setData({ animating: false })
      }, 300)

      this.triggerEvent('quickcheckin', { habit: this.data.habit })
    }
  }
})
