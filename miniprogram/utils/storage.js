// utils/storage.js - 本地存储封装

const { CACHE_EXPIRE_TIME } = require('./constants')

/**
 * 存储数据（同步）
 * @param {string} key - 存储键名
 * @param {any} value - 存储的值
 * @param {number} expireTime - 过期时间（毫秒），0表示永不过期
 */
function setStorage(key, value, expireTime = 0) {
  try {
    const data = {
      value,
      timestamp: Date.now(),
      expireTime
    }
    wx.setStorageSync(key, data)
    return true
  } catch (err) {
    console.error('存储数据失败:', err)
    return false
  }
}

/**
 * 获取存储数据（同步）
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 存储的值，如果不存在或过期则返回默认值
 */
function getStorage(key, defaultValue = null) {
  try {
    const data = wx.getStorageSync(key)

    if (!data) {
      return defaultValue
    }

    // 检查是否过期
    if (data.expireTime > 0) {
      const now = Date.now()
      if (now - data.timestamp > data.expireTime) {
        // 已过期，删除数据
        removeStorage(key)
        return defaultValue
      }
    }

    return data.value
  } catch (err) {
    console.error('获取存储数据失败:', err)
    return defaultValue
  }
}

/**
 * 删除存储数据（同步）
 * @param {string} key - 存储键名
 */
function removeStorage(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (err) {
    console.error('删除存储数据失败:', err)
    return false
  }
}

/**
 * 清空所有存储数据（同步）
 */
function clearStorage() {
  try {
    wx.clearStorageSync()
    return true
  } catch (err) {
    console.error('清空存储数据失败:', err)
    return false
  }
}

/**
 * 存储数据（异步）
 * @param {string} key - 存储键名
 * @param {any} value - 存储的值
 * @param {number} expireTime - 过期时间（毫秒），0表示永不过期
 */
async function setStorageAsync(key, value, expireTime = 0) {
  try {
    const data = {
      value,
      timestamp: Date.now(),
      expireTime
    }
    await wx.setStorage({
      key,
      data
    })
    return true
  } catch (err) {
    console.error('存储数据失败:', err)
    return false
  }
}

/**
 * 获取存储数据（异步）
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {Promise<any>} 存储的值
 */
async function getStorageAsync(key, defaultValue = null) {
  try {
    const res = await wx.getStorage({ key })
    const data = res.data

    if (!data) {
      return defaultValue
    }

    // 检查是否过期
    if (data.expireTime > 0) {
      const now = Date.now()
      if (now - data.timestamp > data.expireTime) {
        // 已过期，删除数据
        await removeStorageAsync(key)
        return defaultValue
      }
    }

    return data.value
  } catch (err) {
    return defaultValue
  }
}

/**
 * 删除存储数据（异步）
 * @param {string} key - 存储键名
 */
async function removeStorageAsync(key) {
  try {
    await wx.removeStorage({ key })
    return true
  } catch (err) {
    console.error('删除存储数据失败:', err)
    return false
  }
}

/**
 * 清空所有存储数据（异步）
 */
async function clearStorageAsync() {
  try {
    await wx.clearStorage()
    return true
  } catch (err) {
    console.error('清空存储数据失败:', err)
    return false
  }
}

/**
 * 缓存习惯列表
 * @param {Array} habits - 习惯列表
 */
function cacheHabits(habits) {
  return setStorage('habitsCache', habits, CACHE_EXPIRE_TIME.MEDIUM)
}

/**
 * 获取缓存的习惯列表
 * @returns {Array|null} 习惯列表
 */
function getCachedHabits() {
  return getStorage('habitsCache', null)
}

/**
 * 清除习惯缓存
 */
function clearHabitsCache() {
  return removeStorage('habitsCache')
}

/**
 * 缓存打卡记录
 * @param {string} date - 日期
 * @param {Array} checkIns - 打卡记录
 */
function cacheCheckIns(date, checkIns) {
  const key = `checkInsCache_${date}`
  return setStorage(key, checkIns, CACHE_EXPIRE_TIME.SHORT)
}

/**
 * 获取缓存的打卡记录
 * @param {string} date - 日期
 * @returns {Array|null} 打卡记录
 */
function getCachedCheckIns(date) {
  const key = `checkInsCache_${date}`
  return getStorage(key, null)
}

/**
 * 清除打卡记录缓存
 * @param {string} date - 日期（可选，不传则清除所有打卡缓存）
 */
function clearCheckInsCache(date) {
  if (date) {
    const key = `checkInsCache_${date}`
    return removeStorage(key)
  } else {
    // 清除所有打卡缓存（需要遍历所有key）
    try {
      const info = wx.getStorageInfoSync()
      const keys = info.keys
      keys.forEach(key => {
        if (key.startsWith('checkInsCache_')) {
          removeStorage(key)
        }
      })
      return true
    } catch (err) {
      console.error('清除打卡缓存失败:', err)
      return false
    }
  }
}

/**
 * 获取存储信息
 * @returns {object} 存储信息（keys, currentSize, limitSize）
 */
function getStorageInfo() {
  try {
    return wx.getStorageInfoSync()
  } catch (err) {
    console.error('获取存储信息失败:', err)
    return null
  }
}

module.exports = {
  // 同步方法
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,

  // 异步方法
  setStorageAsync,
  getStorageAsync,
  removeStorageAsync,
  clearStorageAsync,

  // 缓存方法
  cacheHabits,
  getCachedHabits,
  clearHabitsCache,
  cacheCheckIns,
  getCachedCheckIns,
  clearCheckInsCache,

  // 工具方法
  getStorageInfo
}
