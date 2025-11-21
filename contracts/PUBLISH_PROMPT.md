# 给Gemini 3.0的指令

## 任务：创建YouTube发布页面

路径：`app/dashboard/publish/page.tsx`

---

## UI要求

### 布局
```
Dashboard导航栏（复用）
  - 左侧：Logo + 项目名称
  - 导航菜单：概览 | 爆款发现 | 视频生成 | 自动发布 | 数据监控
  - 右侧：用户头像

主内容区
  顶部：YouTube连接状态卡片（全宽）
    未连接状态：
      - 大图标：YouTube logo + 断开图标
      - 标题："连接你的YouTube频道"
      - 描述："授权后可自动上传视频到你的频道"
      - \"连接YouTube\"按钮（红色，YouTube品牌色）
    
    已连接状态：
      - 左侧：频道头像 + 频道信息
        * 频道名称
        * 订阅数 | 视频数
        * 连接时间
      - 右侧：\"断开连接\"按钮（次要按钮）

  统计面板（4个统计卡片，网格布局）
    1. 总发布数 (total_published)
    2. 待发布数 (total_scheduled)  
    3. 总播放量 (total_views)
    4. API配额 (quota_used / quota_limit) + 进度条

  主内容区（左右分栏）
    左侧：创建发布任务面板 (固定宽度 420px)
      - 标题："创建发布任务"
      - 视频选择器（下拉菜单）
        * 从已生成的视频中选择
        * 显示缩略图 + 标题
      - 视频元数据表单：
        * 标题输入框（必填，最多100字符）
        * 描述输入框（文本域，最多5000字符）
        * 标签输入（支持输入多个，用逗号分隔）
        * 分类选择（下拉菜单，从categories中选）
        * 隐私设置（Radio：公开/不公开/私享）
        * 是否儿童内容（开关）
      - 定时发布（可选）
        * 开关：\"立即发布\" / \"定时发布\"
        * 如果选定时，显示日期时间选择器
      - \"创建任务\"按钮（渐变色，大尺寸）

    右侧：发布任务列表 (flex-1)
      - 筛选栏
        * 状态筛选：全部/草稿/定时/发布中/已发布/失败
        * 排序：创建时间/发布时间/播放量
        * 搜索框
      - 任务卡片（列表布局）
        每个任务卡片包含：
        * 左侧：视频缩略图（16:9，宽度160px）
        * 中间：
          - 视频标题
          - 状态徽章（不同颜色）
          - 元数据预览：隐私状态 | 分类 | 标签数
          - 如果已发布：播放数 | 点赞数 | 评论数
          - 如果定时：发布时间倒计时
          - 如果发布中：进度条
        * 右侧：操作按钮
          - 草稿：编辑 | 立即发布 | 删除
          - 定时：编辑 | 取消定时 | 删除
          - 发布中：查看进度
          - 已发布：查看YouTube | 查看数据
          - 失败：重试 | 删除
      - 分页器
```

### 状态颜色和图标
- draft: 灰色 📝
- scheduled: 蓝色 ⏰ + 倒计时
- publishing: 蓝色动画 + 进度条 ⬆️
- published: 绿色 + YouTube图标 ✅
- failed: 红色 + 警告图标 ❌

### 设计风格
- 深色主题（与其他页面统一）
- YouTube品牌色点缀（红色 #FF0000）
- 卡片阴影效果
- 流畅的动画过渡
- 发布中任务的进度条有动画
- 连接按钮使用YouTube品牌色

---

## 功能需求

### 1. OAuth连接管理
- **未连接状态**：
  - 显示\"连接YouTube\"按钮
  - 点击后调用 `connectYouTube()` 获取授权URL
  - 跳转到Google OAuth页面
  
- **已连接状态**：
  - 显示频道信息
  - 显示Token过期时间
  - 点击\"断开连接\"需要确认
  - 断开后调用 `disconnectYouTube()`

### 2. 创建发布任务
- 表单验证：
  - 必须选择视频
  - 标题不能为空且≤100字符
  - 描述≤5000字符
  - 至少1个标签
- 实时字符计数
- 提交后调用 `createTask()`
- 成功后显示Toast并刷新列表

### 3. 任务列表管理
- 页面加载时调用 `getTasks()` 和 `getStats()`
- 支持筛选和搜索
- 发布中任务每3秒自动刷新状态
- 定时任务显示倒计时

### 4. 任务操作
- **立即发布**：调用 `uploadTask(taskId)`
- **编辑**：打开编辑模态框，修改元数据
- **删除**：需要确认，调用 `deleteTask(taskId)`
- **重试**：失败任务可以重新尝试发布
- **查看YouTube**：已发布任务打开YouTube视频链接

### 5. 交互反馈
- 所有异步操作显示Loading状态
- 成功/失败Toast提示
- 删除/断开连接需要确认对话框
- 表单验证错误提示

---

## 技术要求

- Next.js 14 ('use client')
- TypeScript
- Tailwind CSS
- 使用 `contracts/publish.contract.ts` 的类型和API函数
- 初始数据：
  - `mockConnection` - OAuth连接状态
  - `mockStats` - 统计数据
  - `mockTasks` - 发布任务列表
  - `mockCategories` - YouTube分类
- API函数：
  - `getConnection()` - 获取连接状态
  - `connectYouTube()` - 发起连接
  - `disconnectYouTube()` - 断开连接
  - `getTasks()` - 获取任务列表
  - `createTask()` - 创建任务
  - `uploadTask()` - 立即发布
  - `deleteTask()` - 删除任务
  - `getStats()` - 获取统计
  - `getCategories()` - 获取分类

---

## 状态管理

```typescript
// OAuth连接状态
const [connection, setConnection] = useState<OAuthConnection>(mockConnection)
const [isConnecting, setIsConnecting] = useState(false)

// 发布统计
const [stats, setStats] = useState<PublishStats>(mockStats)

// 任务列表
const [tasks, setTasks] = useState<PublishTask[]>(mockTasks)
const [filters, setFilters] = useState<TaskFilters>({})

// 表单状态
const [selectedVideoId, setSelectedVideoId] = useState<string>('')
const [metadata, setMetadata] = useState<VideoMetadata>({
  title: '',
  description: '',
  tags: [],
  privacy_status: 'public',
  made_for_kids: false
})
const [isScheduled, setIsScheduled] = useState(false)
const [scheduledTime, setScheduledTime] = useState<Date | null>(null)

// 分类列表
const [categories, setCategories] = useState<CategoryOption[]>(mockCategories)
```

---

## 特殊处理

### 1. OAuth流程
```typescript
const handleConnect = async () => {
  setIsConnecting(true)
  try {
    const response = await connectYouTube(window.location.origin + '/callback')
    if (response.success && response.auth_url) {
      window.location.href = response.auth_url
    }
  } catch (error) {
    // 显示错误Toast
  } finally {
    setIsConnecting(false)
  }
}
```

### 2. 倒计时显示
```typescript
// 对于scheduled任务，显示距离发布的剩余时间
const getTimeUntilPublish = (scheduledTime: string) => {
  const diff = new Date(scheduledTime).getTime() - Date.now()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return `${hours}小时${minutes}分钟后发布`
}
```

### 3. 进度轮询
```typescript
// 对于publishing状态的任务，每3秒刷新一次
useEffect(() => {
  const publishingTasks = tasks.filter(t => t.status === 'publishing')
  if (publishingTasks.length > 0) {
    const interval = setInterval(async () => {
      const response = await getTasks(filters)
      if (response.success) {
        setTasks(response.tasks)
      }
    }, 3000)
    return () => clearInterval(interval)
  }
}, [tasks, filters])
```

### 4. 字符计数
```typescript
// 实时显示标题和描述的字符数
<div className=\"text-sm text-gray-400\">
  {metadata.title.length} / 100
</div>
```

### 5. API配额警告
```typescript
// 当配额使用超过80%时显示警告
const quotaPercentage = (stats.quota_used / stats.quota_limit) * 100
const quotaColor = quotaPercentage > 80 ? 'text-red-400' : 'text-blue-400'
```

---

## 特殊组件需求

### 1. 视频选择器
```typescript
// 下拉菜单，显示已生成的视频（从generate模块获取）
// 暂时可以mock几个选项
<select>
  <option value="">选择要发布的视频...</option>
  <option value="1">AI编程教学视频 (8秒)</option>
  <option value="2">Prompt工程技巧 (6秒)</option>
  // ...
</select>
```

### 2. 标签输入
```typescript
// 支持输入多个标签，用逗号分隔
// 实时显示标签列表（chip样式）
<input 
  placeholder="输入标签，用逗号分隔..."
  value={tagInput}
  onChange={(e) => {
    const tags = e.target.value.split(',').map(t => t.trim())
    setMetadata({...metadata, tags})
  }}
/>
<div className=\"flex flex-wrap gap-2 mt-2\">
  {metadata.tags.map(tag => (
    <span className=\"px-2 py-1 bg-blue-500/20 rounded\">
      {tag}
      <button onClick={() => removeTag(tag)}>×</button>
    </span>
  ))}
</div>
```

### 3. 日期时间选择器
```typescript
// 如果选择定时发布，显示日期时间选择器
// 最小时间为当前时间+1小时
<input 
  type=\"datetime-local\"
  min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
  value={scheduledTime}
  onChange={(e) => setScheduledTime(new Date(e.target.value))}
/>
```

---

## 连接状态变化

页面需要根据连接状态动态调整：

**未连接时**：
- 隐藏创建任务面板
- 显示大型\"连接提示\"卡片
- 统计数据显示为 \"--\"
- 任务列表显示\"请先连接YouTube频道\"

**已连接时**：
- 显示完整功能
- 显示真实统计数据
- 可以创建和管理任务

---

## 输出

生成完整的 `app/dashboard/publish/page.tsx` 文件

---

## 参考

- 契约文件：`contracts/publish.contract.ts`
- 类似页面：`app/dashboard/generate/page.tsx` (布局和交互参考)
- Dashboard布局：`app/dashboard/page.tsx` (导航栏参考)
- 状态管理：`app/dashboard/discover/page.tsx` (筛选和列表管理参考)

---

## 重要提醒

1. YouTube品牌色 `#FF0000` 用于主要按钮和重点元素
2. OAuth连接是核心功能，需要明显的视觉提示
3. 定时任务需要显示倒计时，增强紧迫感
4. 发布中任务需要实时进度反馈
5. 已发布任务显示YouTube数据（播放、点赞、评论）
6. API配额显示很重要，避免超限
7. 所有操作都要有明确的成功/失败反馈
