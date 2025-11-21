# 给Gemini 3.0的指令

## 任务：创建控制台Dashboard主页

路径：`app/dashboard/page.tsx`

---

## UI要求

### 布局
```
顶部导航栏
  - Logo
  - 搜索框
  - 导航菜单：首页 | 发现爆款 | 生成视频 | 自动发布 | 数据监控
  - 用户头像

主内容区
  - 欢迎标语
  - 4个统计卡片（网格布局）
    1. 已发现视频数
    2. 平均爆款分
    3. 已生成视频
    4. 已发布视频
  
  - 快捷操作（4个大按钮）
    1. 🔍 发现爆款 → /discover
    2. 🎬 生成视频 → /generate  
    3. 📤 自动发布 → /publish
    4. 📊 数据监控 → /monitoring
  
  - 最近活动列表（时间线）
    - 显示最近的操作记录
    - 图标 + 标题 + 时间 + 状态
```

### 设计风格
- 深色主题
- 渐变色按钮
- 卡片阴影效果
- 现代科技感

---

## 功能需求

1. 页面加载时获取统计数据
2. 显示最近活动
3. 点击快捷按钮跳转到对应页面
4. 响应式设计

---

## 技术要求

- Next.js 14 ('use client')
- TypeScript
- Tailwind CSS
- 使用 `contracts/dashboard.contract.ts` 的类型和Mock数据

---

## 输出

生成完整的 `app/dashboard/page.tsx` 文件
