// utils/api.js - API封装

const { ERROR_MESSAGES } = require('./constants')

/**
 * 检查网络状态
 * @returns {Promise<boolean>} 是否联网
 */
function checkNetwork() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success(res) {
        resolve(res.networkType !== 'none')
      },
      fail() {
        resolve(false)
      }
    })
  })
}

/**
 * 显示统一的错误提示
 * @param {Error} err - 错误对象
 * @param {string} defaultMessage - 默认提示
 */
function showError(err, defaultMessage = ERROR_MESSAGES.OPERATION_FAILED) {
  let message = defaultMessage

  // 根据错误类型判断
  if (err) {
    const errMsg = err.message || err.errMsg || ''

    if (errMsg.includes('network') || errMsg.includes('timeout') || errMsg.includes('request:fail')) {
      message = ERROR_MESSAGES.NETWORK_ERROR
    } else if (errMsg.includes('cloud') || errMsg.includes('server') || errMsg.includes('500')) {
      message = ERROR_MESSAGES.SERVER_ERROR
    } else if (errMsg.includes('permission') || errMsg.includes('auth')) {
      message = ERROR_MESSAGES.PERMISSION_DENIED
    } else if (errMsg.includes('not found') || errMsg.includes('404')) {
      message = ERROR_MESSAGES.DATA_NOT_FOUND
    }
  }

  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2500
  })
}

/**
 * 调用云函数的通用方法
 * @param {string} name - 云函数名称
 * @param {object} data - 传递的参数
 * @param {object} options - 配置选项
 * @param {boolean} options.showLoading - 是否显示加载提示，默认true
 * @param {string} options.loadingText - 加载提示文字
 * @param {boolean} options.showError - 是否显示错误提示，默认true
 * @returns {Promise} 云函数返回结果
 */
async function callFunction(name, data = {}, options = {}) {
  const {
    showLoading = true,
    loadingText = '加载中...',
    showErrorToast = true
  } = options

  try {
    // 检查网络
    const isOnline = await checkNetwork()
    if (!isOnline) {
      throw new Error('network:fail')
    }

    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true
      })
    }

    const res = await wx.cloud.callFunction({
      name,
      data
    })

    if (showLoading) {
      wx.hideLoading()
    }

    if (res.result) {
      // 检查云函数返回的错误码
      if (res.result.code !== undefined && res.result.code !== 0) {
        const err = new Error(res.result.message || '云函数业务错误')
        err.code = res.result.code
        throw err
      }
      return res.result
    } else {
      throw new Error('云函数返回结果异常')
    }
  } catch (err) {
    if (showLoading) {
      wx.hideLoading()
    }

    console.error(`云函数 ${name} 调用失败:`, err)

    if (showErrorToast) {
      showError(err)
    }

    throw err
  }
}

/**
 * 静默调用云函数（不显示loading和错误提示）
 * @param {string} name - 云函数名称
 * @param {object} data - 传递的参数
 * @returns {Promise} 云函数返回结果
 */
async function callFunctionSilent(name, data = {}) {
  return callFunction(name, data, {
    showLoading: false,
    showErrorToast: false
  })
}

// ========== 用户相关 API ==========

/**
 * 用户登录
 */
function login() {
  return callFunction('login', {}, { loadingText: '登录中...' })
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  return callFunction('getUserInfo')
}

/**
 * 更新用户信息（头像、昵称等）
 * @param {object} data - 用户信息
 * @param {string} data.avatarUrl - 头像URL
 * @param {string} data.nickName - 昵称
 */
function updateUserInfo(data) {
  return callFunctionSilent('updateUserInfo', data)
}

// ========== 习惯相关 API ==========

/**
 * 获取习惯列表
 * @param {boolean} activeOnly - 是否只获取激活的习惯
 */
function getHabits(activeOnly = true) {
  return callFunction('getHabits', { activeOnly })
}

/**
 * 创建习惯
 * @param {object} habitData - 习惯数据
 * @param {string} habitData.name - 习惯名称
 * @param {string} habitData.icon - 图标
 * @param {string} habitData.color - 颜色
 * @param {string} habitData.description - 描述
 * @param {string} habitData.unit - 单位
 * @param {number} habitData.targetValue - 目标值
 */
function createHabit(habitData) {
  return callFunction('createHabit', habitData, { loadingText: '创建中...' })
}

/**
 * 更新习惯
 * @param {string} habitId - 习惯ID
 * @param {object} habitData - 更新的习惯数据
 */
function updateHabit(habitId, habitData) {
  return callFunction('updateHabit', { habitId, ...habitData }, { loadingText: '保存中...' })
}

/**
 * 删除习惯（软删除）
 * @param {string} habitId - 习惯ID
 */
function deleteHabit(habitId) {
  return callFunction('deleteHabit', { habitId }, { loadingText: '删除中...' })
}

// ========== 打卡相关 API ==========

/**
 * 打卡
 * @param {object} checkInData - 打卡数据
 * @param {string} checkInData.habitId - 习惯ID
 * @param {string} checkInData.date - 日期 YYYY-MM-DD
 * @param {boolean} checkInData.completed - 是否完成
 * @param {number} checkInData.value - 完成数量
 * @param {string} checkInData.note - 备注
 */
function checkIn(checkInData) {
  return callFunction('checkIn', checkInData, { loadingText: '保存中...' })
}

/**
 * 删除打卡记录
 * @param {object} params - 删除参数
 * @param {string} params.habitId - 习惯ID
 * @param {string} params.date - 日期
 */
function deleteCheckIn(params) {
  return callFunction('deleteCheckIn', params, { loadingText: '删除中...' })
}

/**
 * 获取打卡记录
 * @param {object} params - 查询参数
 * @param {string} params.habitId - 习惯ID（可选）
 * @param {string} params.date - 日期（可选）
 * @param {string} params.startDate - 开始日期（可选）
 * @param {string} params.endDate - 结束日期（可选）
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 */
function getCheckIns(params = {}) {
  return callFunction('getCheckIns', params)
}

/**
 * 获取某天所有习惯的打卡状态
 * @param {string} date - 日期 YYYY-MM-DD
 */
function getTodayCheckIns(date) {
  return callFunctionSilent('getCheckIns', { date })
}

// ========== 统计相关 API ==========

/**
 * 获取统计数据
 * @param {object} params - 查询参数
 * @param {string} params.habitId - 习惯ID（可选，不传则获取所有习惯统计）
 * @param {string} params.type - 统计类型：overview/weekly/monthly
 * @param {string} params.startDate - 开始日期（可选）
 * @param {string} params.endDate - 结束日期（可选）
 */
function getStats(params = {}) {
  return callFunction('getStats', params)
}

/**
 * 计算连续打卡天数
 * @param {string} habitId - 习惯ID
 */
function calculateStreak(habitId) {
  return callFunctionSilent('calculateStreak', { habitId })
}

// 导出 API
module.exports = {
  // 工具方法
  callFunction,
  callFunctionSilent,
  checkNetwork,
  showError,

  // 用户相关
  login,
  getUserInfo,
  updateUserInfo,

  // 习惯相关
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,

  // 打卡相关
  checkIn,
  deleteCheckIn,
  getCheckIns,
  getTodayCheckIns,

  // 统计相关
  getStats,
  calculateStreak
}
