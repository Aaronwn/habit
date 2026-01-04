// components/stats-card/stats-card.js
Component({
  properties: {
    // 标题
    title: {
      type: String,
      value: ''
    },
    // 数值
    value: {
      type: null, // 支持数字或字符串
      value: 0
    },
    // 单位
    unit: {
      type: String,
      value: ''
    },
    // 图标
    icon: {
      type: String,
      value: ''
    },
    // 主题颜色
    color: {
      type: String,
      value: '#6C5CE7'
    },
    // 副标题/描述
    subtitle: {
      type: String,
      value: ''
    },
    // 趋势 up/down/none
    trend: {
      type: String,
      value: 'none'
    },
    // 趋势值
    trendValue: {
      type: String,
      value: ''
    },
    // 尺寸 small/normal/large
    size: {
      type: String,
      value: 'normal'
    }
  },

  data: {
    trendIcon: '',
    trendClass: ''
  },

  observers: {
    'trend': function(trend) {
      let trendIcon = ''
      let trendClass = ''

      if (trend === 'up') {
        trendIcon = '↑'
        trendClass = 'trend-up'
      } else if (trend === 'down') {
        trendIcon = '↓'
        trendClass = 'trend-down'
      }

      this.setData({ trendIcon, trendClass })
    }
  }
})
