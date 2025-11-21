# 给Gemini 3.0的指令

## 任务：创建视频生成页面

路径：`app/generate/page.tsx`

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
  左侧：创建任务面板 (固定宽度 400px)
    - 标题："创建视频生成任务"
    - Prompt输入框（大型文本框，高度150px）
    - 模型选择器（4个模型卡片）
      * 每个卡片显示：
        - 模型名称
        - 简短描述
        - 价格标签 ($x/秒)
        - 速度/质量指示器
        - 可用状态（可选/不可用）
    - 高级选项（折叠面板）
      * 时长滑块 (1-10秒)
      * 宽高比选择 (16:9, 9:16, 1:1)
      * 关联源视频（可选）
    - 预估成本显示
    - "开始生成"按钮（渐变色，大尺寸）

  右侧：任务列表 (flex-1)
    - 筛选栏
      * 状态筛选：全部/进行中/已完成/失败
      * 模型筛选：全部/Minimax/Runway/Kling/Sora
      * 搜索框
    - 任务卡片（网格布局，2列）
      * 缩略图（16:9）
      * 任务标题
      * 状态徽章（不同颜色）
      * 进度条（仅进行中任务）
      * 模型标签
      * 时长 + 成本
      * 操作按钮：
        - 查看详情
        - 下载视频（已完成）
        - 重试（失败）
        - 删除
    - 分页器
```

### 状态颜色
- pending: 灰色/蓝色
- processing: 蓝色（动画）+ 进度条
- completed: 绿色 + 播放图标
- failed: 红色 + 重试按钮

### 设计风格
- 深色主题
- 左右分栏布局
- 卡片阴影效果
- 流畅的动画过渡
- 进行中任务的进度条有动画
- 渐变色按钮

---

## 功能需求

1. **创建任务**
   - 验证Prompt不能为空
   - 必须选择一个模型
   - 实时计算预估成本
   - 提交后显示成功Toast

2. **任务列表**
   - 加载时获取任务列表
   - 支持筛选和搜索
   - 进行中任务每5秒自动刷新
   - 支持删除任务（需确认）

3. **任务详情**
   - 点击任务卡片显示详情模态框
   - 显示完整Prompt
   - 如果已完成，显示视频播放器
   - 显示生成参数和时间线

4. **交互反馈**
   - 创建任务时禁用按钮
   - Loading状态
   - 成功/失败Toast提示
   - 删除确认对话框

---

## 技术要求

- Next.js 14 ('use client')
- TypeScript
- Tailwind CSS
- 使用 `contracts/generate.contract.ts` 的类型和API函数
- 使用 `mockModels` 和 `mockTasks` 作为初始数据
- 使用 `createTask()`, `getTasks()`, `deleteTask()` 函数

---

## 状态管理

```typescript
const [tasks, setTasks] = useState<GenerateTask[]>(mockTasks)
const [selectedModel, setSelectedModel] = useState<VideoModel | null>(null)
const [prompt, setPrompt] = useState('')
const [duration, setDuration] = useState(5)
const [filters, setFilters] = useState<TaskFilters>({})
```

---

## 特殊处理

1. **成本计算**
   ```typescript
   const estimatedCost = selectedModel 
     ? models.find(m => m.id === selectedModel)!.cost_per_second * duration
     : 0
   ```

2. **进度动画**
   - 进行中任务的进度条使用 Tailwind `animate-pulse`
   - 每5秒轮询更新进度

3. **模型不可用处理**
   - Sora模型显示"即将推出"标签
   - 点击时显示Toast："该模型暂未开放"

---

## 输出

生成完整的 `app/generate/page.tsx` 文件

---

## 参考

- 契约文件：`contracts/generate.contract.ts`
- 类似页面：`app/discover/page.tsx` (布局参考)
- Dashboard：`app/dashboard/page.tsx` (导航栏参考)
