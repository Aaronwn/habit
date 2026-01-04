// utils/constants.js - 常量定义

// 习惯主题颜色
const HABIT_COLORS = [
  { name: '热情红', value: '#FF6B6B' },
  { name: '优雅紫', value: '#6C5CE7' },
  { name: '清新绿', value: '#00B894' },
  { name: '活力黄', value: '#FDCB6E' },
  { name: '天空蓝', value: '#74B9FF' },
  { name: '甜美粉', value: '#FD79A8' },
  { name: '淡雅紫', value: '#A29BFE' },
  { name: '薄荷绿', value: '#55EFC4' },
  { name: '珊瑚橙', value: '#FAB1A0' },
  { name: '湖水蓝', value: '#81ECEC' }
]

// 习惯图标（emoji）
const HABIT_ICONS = [
  { category: '运动健身', icons: ['🏃', '💪', '🚴', '⛹️', '🏊', '🧘', '🤸', '⚽', '🏀', '🎾'] },
  { category: '学习成长', icons: ['📚', '✍️', '🎯', '💡', '🧠', '📝', '🎓', '📖', '🖊️', '📊'] },
  { category: '生活习惯', icons: ['🌅', '💧', '🍎', '🥗', '☕', '🛌', '🚿', '🧹', '🌸', '🎵'] },
  { category: '工作效率', icons: ['💼', '⏰', '📧', '📱', '💻', '📅', '✅', '🎯', '📈', '🔔'] },
  { category: '兴趣爱好', icons: ['🎨', '🎸', '📷', '🎬', '🎮', '🎭', '🎪', '🎯', '🎲', '🎹'] },
  { category: '健康医疗', icons: ['💊', '🩺', '😴', '🧘', '💆', '🏥', '🌡️', '💉', '🩹', '🧴'] }
]

// 默认图标
const DEFAULT_ICON = '⭐'

// 默认颜色
const DEFAULT_COLOR = '#6C5CE7'

// 习惯频率类型
const FREQUENCY_TYPES = [
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly', disabled: true }, // 第一版暂不支持
  { label: '自定义', value: 'custom', disabled: true } // 第一版暂不支持
]

// 统计类型
const STATS_TYPES = {
  OVERVIEW: 'overview',    // 总览
  WEEKLY: 'weekly',        // 周报
  MONTHLY: 'monthly'       // 月报
}

// 打卡状态
const CHECK_IN_STATUS = {
  COMPLETED: true,    // 已完成
  NOT_COMPLETED: false // 未完成
}

// 分页配置
const PAGE_SIZE = 20  // 默认每页数量

// 缓存key
const STORAGE_KEYS = {
  OPENID: 'openid',
  USER_INFO: 'userInfo',
  HABITS_CACHE: 'habitsCache',
  CHECK_INS_CACHE: 'checkInsCache'
}

// 缓存过期时间（毫秒）
const CACHE_EXPIRE_TIME = {
  SHORT: 5 * 60 * 1000,      // 5分钟
  MEDIUM: 30 * 60 * 1000,    // 30分钟
  LONG: 24 * 60 * 60 * 1000  // 24小时
}

// 表单验证规则
const VALIDATION_RULES = {
  HABIT_NAME: {
    required: true,
    minLength: 1,
    maxLength: 20,
    message: '习惯名称为1-20个字符'
  },
  HABIT_DESCRIPTION: {
    required: false,
    maxLength: 100,
    message: '描述不超过100个字符'
  },
  HABIT_UNIT: {
    required: false,
    maxLength: 5,
    message: '单位不超过5个字符'
  },
  CHECK_IN_NOTE: {
    required: false,
    maxLength: 200,
    message: '备注不超过200个字符'
  }
}

// 错误提示信息
const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  LOGIN_REQUIRED: '请先登录',
  PERMISSION_DENIED: '没有访问权限',
  DATA_NOT_FOUND: '数据不存在',
  VALIDATION_FAILED: '数据验证失败',
  OPERATION_FAILED: '操作失败，请重试'
}

// 成功提示信息
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  CREATE_HABIT_SUCCESS: '创建习惯成功',
  UPDATE_HABIT_SUCCESS: '更新习惯成功',
  DELETE_HABIT_SUCCESS: '删除习惯成功',
  CHECK_IN_SUCCESS: '打卡成功',
  UPDATE_CHECK_IN_SUCCESS: '更新打卡成功'
}

// 云开发环境ID（从配置文件读取）
const config = require('../config.js')
const CLOUD_ENV_ID = config.CLOUD_ENV_ID

module.exports = {
  HABIT_COLORS,
  HABIT_ICONS,
  DEFAULT_ICON,
  DEFAULT_COLOR,
  FREQUENCY_TYPES,
  STATS_TYPES,
  CHECK_IN_STATUS,
  PAGE_SIZE,
  STORAGE_KEYS,
  CACHE_EXPIRE_TIME,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CLOUD_ENV_ID
}
