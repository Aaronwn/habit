// components/icon-picker/icon-picker.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    selected: {
      type: String,
      value: ''
    }
  },

  data: {
    categories: [
      {
        name: '运动健身',
        icons: ['🏃', '💪', '🚴', '⛹️', '🏊', '🧘', '🤸', '⚽', '🏀', '🎾', '🏋️', '🚶', '🧗', '🏄', '⛷️']
      },
      {
        name: '学习成长',
        icons: ['📚', '✍️', '🎯', '💡', '🧠', '📝', '🎓', '📖', '🖊️', '📊', '💻', '🔬', '📐', '🎨', '🎹']
      },
      {
        name: '生活习惯',
        icons: ['🌅', '💧', '🍎', '🥗', '☕', '🛌', '🚿', '🧹', '🌸', '🎵', '🌙', '☀️', '🍳', '🧘‍♀️', '🏠']
      },
      {
        name: '工作效率',
        icons: ['💼', '⏰', '📧', '📱', '📅', '✅', '📈', '🔔', '📋', '🗂️', '💰', '🎤', '✈️', '🚗', '📦']
      },
      {
        name: '健康医疗',
        icons: ['💊', '🩺', '😴', '💆', '🏥', '🌡️', '💉', '🩹', '🧴', '🦷', '👁️', '❤️', '🧬', '🥛', '🥦']
      },
      {
        name: '兴趣爱好',
        icons: ['🎮', '🎬', '📷', '🎸', '🎭', '🎪', '🎲', '♟️', '🎧', '📺', '🎨', '✂️', '🧶', '🎣', '🏕️']
      }
    ],
    activeCategory: 0
  },

  methods: {
    // 切换分类
    onCategoryChange(e) {
      const index = e.currentTarget.dataset.index
      this.setData({ activeCategory: index })
    },

    // 选择图标
    onSelectIcon(e) {
      const icon = e.currentTarget.dataset.icon
      this.triggerEvent('select', { icon })
      this.triggerEvent('close')
    },

    // 关闭弹窗
    onClose() {
      this.triggerEvent('close')
    },

    // 阻止冒泡
    preventBubble() {}
  }
})
