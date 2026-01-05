// pages/habit/habit.js
const api = require("../../utils/api");
const storage = require("../../utils/storage");
const {
  HABIT_COLORS,
  DEFAULT_COLOR,
  DEFAULT_ICON,
} = require("../../utils/constants");

Page({
  data: {
    habitId: "",
    isEdit: false,
    loading: false,
    showIconPicker: false,

    // 表单数据
    name: "",
    icon: DEFAULT_ICON,
    color: DEFAULT_COLOR,

    // 频率设置
    frequencyType: "daily", // 'daily' | 'weekly'
    timesPerWeek: 3, // 每周次数，1-7
    timesOptions: [1, 2, 3, 4, 5, 6, 7],

    // 配置
    colors: HABIT_COLORS,
  },

  onLoad(options) {
    const habitId = options.id;
    if (habitId) {
      this.setData({
        habitId,
        isEdit: true,
      });
      wx.setNavigationBarTitle({ title: "编辑习惯" });
      this.loadHabit(habitId);
    } else {
      wx.setNavigationBarTitle({ title: "添加习惯" });
    }
  },

  // 加载习惯详情
  async loadHabit(habitId) {
    try {
      this.setData({ loading: true });

      // 先从缓存获取
      const cachedHabits = storage.getCachedHabits();
      if (cachedHabits) {
        const habit = cachedHabits.find((h) => h._id === habitId);
        if (habit) {
          this.setHabitData(habit);
        }
      }

      // 从服务器获取最新数据
      const result = await api.getHabits(false);
      if (result && result.data) {
        const habit = result.data.find((h) => h._id === habitId);
        if (habit) {
          this.setHabitData(habit);
        }
      }

      this.setData({ loading: false });
    } catch (err) {
      console.error("加载习惯详情失败:", err);
      this.setData({ loading: false });
      wx.showToast({
        title: "加载失败",
        icon: "none",
      });
    }
  },

  // 设置习惯数据到表单
  setHabitData(habit) {
    // 兼容旧数据格式
    let frequencyType = "daily";
    let timesPerWeek = 3;

    if (habit.frequency) {
      if (typeof habit.frequency === "object") {
        // 新格式: { type: 'daily' } 或 { type: 'weekly', timesPerWeek: 3 }
        frequencyType = habit.frequency.type || "daily";
        timesPerWeek = habit.frequency.timesPerWeek || 3;
      } else if (typeof habit.frequency === "string") {
        // 旧格式: 'daily'
        frequencyType = habit.frequency;
      }
    }

    console.log("回显习惯数据:", {
      frequency: habit.frequency,
      frequencyType,
      timesPerWeek,
    });

    this.setData({
      name: habit.name || "",
      icon: habit.icon || DEFAULT_ICON,
      color: habit.color || DEFAULT_COLOR,
      frequencyType,
      timesPerWeek,
    });
  },

  // 打开图标选择器
  openIconPicker() {
    this.setData({ showIconPicker: true });
  },

  // 关闭图标选择器
  closeIconPicker() {
    this.setData({ showIconPicker: false });
  },

  // 选择图标
  onIconSelect(e) {
    const icon = e.detail.icon;
    this.setData({ icon });
  },

  // 选择颜色
  onColorSelect(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({ color });
  },

  // 输入事件
  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  // 频率类型切换
  onFrequencyTypeChange(e) {
    const frequencyType = e.currentTarget.dataset.type;
    this.setData({ frequencyType });
  },

  // 每周次数变更
  onTimesChange(e) {
    const index = e.detail.value;
    this.setData({ timesPerWeek: this.data.timesOptions[index] });
  },

  // 表单验证
  validateForm() {
    const { name } = this.data;

    if (!name || name.trim().length === 0) {
      wx.showToast({
        title: "请输入习惯名称",
        icon: "none",
      });
      return false;
    }

    if (name.trim().length > 20) {
      wx.showToast({
        title: "习惯名称不超过20个字符",
        icon: "none",
      });
      return false;
    }

    return true;
  },

  // 提交表单
  async onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const { isEdit, habitId, name, icon, color, frequencyType, timesPerWeek } =
      this.data;

    try {
      wx.showLoading({ title: isEdit ? "保存中..." : "创建中..." });

      // 构建频率对象
      const frequency = { type: frequencyType };
      if (frequencyType === "weekly") {
        frequency.timesPerWeek = timesPerWeek;
      }

      const habitData = {
        name: name.trim(),
        icon,
        color,
        frequency,
      };

      console.log("提交习惯数据:", habitData);

      if (isEdit) {
        await api.updateHabit(habitId, habitData);
      } else {
        await api.createHabit(habitData);
      }

      wx.hideLoading();

      // 清除缓存
      storage.clearHabitsCache();

      wx.showToast({
        title: isEdit ? "保存成功" : "创建成功",
        icon: "success",
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.hideLoading();
      console.error("保存习惯失败:", err);
      wx.showToast({
        title: "操作失败，请重试",
        icon: "none",
      });
    }
  },
});
