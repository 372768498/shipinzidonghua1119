# 🎨 UI组件设计系统 (UI Components & Design System)

> **文档目的**: 定义Jilo.ai的完整UI设计系统和组件规范  
> **创建日期**: 2024-11-19  
> **版本**: V1.0  
> **基于**: shadcn/ui + Tailwind CSS

---

## 📋 目录

1. [设计系统概览](#设计系统概览)
2. [颜色系统](#颜色系统)
3. [字体系统](#字体系统)
4. [间距系统](#间距系统)
5. [组件库](#组件库)
6. [shadcn/ui集成](#shadcnui集成)
7. [响应式设计](#响应式设计)
8. [无障碍设计](#无障碍设计)
9. [动画系统](#动画系统)

---

## 设计系统概览

### 🎯 设计原则

**1. 简洁高效 (Simplicity & Efficiency)**
```
❌ 不要: 过度装饰、复杂的视觉层次
✅ 要: 清晰的信息层级、最小化认知负担
```

**2. 专业可信 (Professional & Trustworthy)**
```
色彩: 以蓝色和紫色为主，传递科技感和专业性
布局: 使用网格系统，保持视觉秩序
字体: 使用系统字体，确保易读性
```

**3. 即时反馈 (Instant Feedback)**
```
所有交互都有即时的视觉反馈
加载状态清晰可见
错误提示具体且友好
```

**4. 一致性 (Consistency)**
```
相同的交互模式在整个应用中保持一致
组件的视觉样式统一
术语和文案风格统一
```

### 🏗️ 设计架构

```
Design System
│
├── Foundation Layer (基础层)
│   ├── Colors (颜色)
│   ├── Typography (字体)
│   ├── Spacing (间距)
│   ├── Shadows (阴影)
│   └── Borders (边框)
│
├── Component Layer (组件层)
│   ├── Primitives (基础组件)
│   │   ├── Button
│   │   ├── Input
│   │   ├── Select
│   │   └── ...
│   │
│   └── Composite (复合组件)
│       ├── VideoCard
│       ├── GenerationProgress
│       ├── QuotaDisplay
│       └── ...
│
└── Pattern Layer (模式层)
    ├── Navigation
    ├── Forms
    ├── Data Display
    └── Feedback
```

---

## 颜色系统

### 🎨 主色调 (Primary Colors)

基于shadcn/ui的颜色系统，使用HSL色彩空间：

```css
/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        // 品牌主色 - 蓝紫色
        primary: {
          50: 'hsl(252, 100%, 97%)',
          100: 'hsl(252, 96%, 95%)',
          200: 'hsl(252, 96%, 90%)',
          300: 'hsl(252, 95%, 82%)',
          400: 'hsl(252, 93%, 73%)',
          500: 'hsl(252, 91%, 64%)',  // 主色
          600: 'hsl(252, 82%, 57%)',
          700: 'hsl(252, 71%, 50%)',
          800: 'hsl(252, 70%, 42%)',
          900: 'hsl(252, 66%, 35%)',
          950: 'hsl(252, 72%, 23%)',
        },
        
        // 辅助色 - 青色
        secondary: {
          50: 'hsl(198, 100%, 97%)',
          100: 'hsl(198, 92%, 93%)',
          200: 'hsl(198, 91%, 87%)',
          300: 'hsl(198, 90%, 77%)',
          400: 'hsl(198, 86%, 65%)',
          500: 'hsl(198, 79%, 54%)',  // 辅助色
          600: 'hsl(198, 74%, 45%)',
          700: 'hsl(198, 70%, 37%)',
          800: 'hsl(198, 68%, 31%)',
          900: 'hsl(198, 64%, 26%)',
          950: 'hsl(198, 72%, 17%)',
        },
        
        // 中性色 - 灰色
        gray: {
          50: 'hsl(210, 40%, 98%)',
          100: 'hsl(210, 40%, 96%)',
          200: 'hsl(214, 32%, 91%)',
          300: 'hsl(213, 27%, 84%)',
          400: 'hsl(215, 20%, 65%)',
          500: 'hsl(215, 16%, 47%)',
          600: 'hsl(215, 19%, 35%)',
          700: 'hsl(215, 25%, 27%)',
          800: 'hsl(217, 33%, 17%)',
          900: 'hsl(222, 47%, 11%)',
          950: 'hsl(229, 84%, 5%)',
        },
      }
    }
  }
}
```

### 📊 语义化颜色 (Semantic Colors)

```css
:root {
  /* 成功 */
  --success: hsl(142, 76%, 36%);
  --success-light: hsl(142, 76%, 96%);
  --success-dark: hsl(142, 76%, 26%);
  
  /* 警告 */
  --warning: hsl(38, 92%, 50%);
  --warning-light: hsl(38, 92%, 96%);
  --warning-dark: hsl(38, 92%, 40%);
  
  /* 错误 */
  --error: hsl(0, 84%, 60%);
  --error-light: hsl(0, 84%, 96%);
  --error-dark: hsl(0, 84%, 50%);
  
  /* 信息 */
  --info: hsl(221, 83%, 53%);
  --info-light: hsl(221, 83%, 96%);
  --info-dark: hsl(221, 83%, 43%);
}
```

### 🌈 使用示例

```tsx
// 主要操作按钮
<Button className="bg-primary-600 hover:bg-primary-700">
  生成视频
</Button>

// 成功提示
<Alert className="bg-success-light border-success text-success-dark">
  视频生成成功！
</Alert>

// 配额不足警告
<div className="bg-warning-light border-l-4 border-warning p-4">
  <p className="text-warning-dark">配额不足，请升级套餐</p>
</div>

// 错误消息
<div className="bg-error-light text-error-dark rounded-lg p-3">
  生成失败，请重试
</div>
```

### 🎭 深色模式支持

```css
/* 自动切换 */
@media (prefers-color-scheme: dark) {
  :root {
    --background: hsl(222, 47%, 11%);
    --foreground: hsl(210, 40%, 98%);
    
    --card: hsl(222, 47%, 14%);
    --card-foreground: hsl(210, 40%, 98%);
    
    --primary: hsl(252, 91%, 64%);
    --primary-foreground: hsl(210, 40%, 98%);
  }
}
```

---

## 字体系统

### 📝 字体族 (Font Families)

```css
/* 主字体 - 用于正文 */
--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;

/* 代码字体 - 用于代码和数据 */
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Monaco,
  Consolas, "Liberation Mono", "Courier New", monospace;

/* 标题字体 - 用于醒目标题（可选） */
--font-display: "Inter", ui-sans-serif, system-ui, sans-serif;
```

### 📏 字体大小 (Font Sizes)

```css
/* Tailwind CSS 配置 */
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px
}
```

### 🎯 使用规范

| 用途 | 类名 | 字号 | 行高 | 字重 |
|------|------|------|------|------|
| 页面标题 | `text-3xl font-bold` | 30px | 36px | 700 |
| 区块标题 | `text-2xl font-semibold` | 24px | 32px | 600 |
| 卡片标题 | `text-xl font-semibold` | 20px | 28px | 600 |
| 小标题 | `text-lg font-medium` | 18px | 28px | 500 |
| 正文 | `text-base` | 16px | 24px | 400 |
| 辅助文本 | `text-sm text-gray-600` | 14px | 20px | 400 |
| 说明文字 | `text-xs text-gray-500` | 12px | 16px | 400 |
| 按钮文字 | `text-sm font-medium` | 14px | 20px | 500 |

### ✍️ 示例代码

```tsx
// 页面标题
<h1 className="text-3xl font-bold text-gray-900">
  Dashboard
</h1>

// 卡片标题
<h2 className="text-xl font-semibold text-gray-800 mb-2">
  最近生成的视频
</h2>

// 正文
<p className="text-base text-gray-700 leading-relaxed">
  这是一段描述性文字，解释功能的工作原理。
</p>

// 辅助信息
<span className="text-sm text-gray-500">
  2小时前
</span>

// 提示文字
<p className="text-xs text-gray-400">
  * 生成时间约3-5分钟
</p>
```

---

## 间距系统

### 📐 间距刻度 (Spacing Scale)

使用8px基础单位的间距系统：

```css
spacing: {
  '0': '0px',
  '0.5': '2px',   // 0.125rem
  '1': '4px',     // 0.25rem
  '2': '8px',     // 0.5rem (基础单位)
  '3': '12px',    // 0.75rem
  '4': '16px',    // 1rem
  '5': '20px',    // 1.25rem
  '6': '24px',    // 1.5rem
  '8': '32px',    // 2rem
  '10': '40px',   // 2.5rem
  '12': '48px',   // 3rem
  '16': '64px',   // 4rem
  '20': '80px',   // 5rem
  '24': '96px',   // 6rem
}
```

### 🎯 使用场景

**内边距 (Padding)**
```tsx
// 卡片内边距
<div className="p-6">...</div>           // 24px

// 按钮内边距
<button className="px-4 py-2">...</button>  // 16px / 8px

// 大容器
<div className="p-8">...</div>           // 32px
```

**外边距 (Margin)**
```tsx
// 组件间距
<div className="mb-4">...</div>          // 下边距 16px

// 区块间距
<section className="mt-8">...</section>  // 上边距 32px

// 标题间距
<h2 className="mb-6">...</h2>            // 下边距 24px
```

**间隔 (Gap)**
```tsx
// Flexbox布局
<div className="flex gap-4">...</div>    // 16px间隔

// Grid布局
<div className="grid grid-cols-3 gap-6">...</div>  // 24px间隔
```

---

## 组件库

### 🔘 按钮组件 (Button)

#### 变体 (Variants)

```tsx
// 1. 主要按钮 (Primary)
<Button variant="default" size="default">
  生成视频
</Button>
// 样式: bg-primary-600 text-white hover:bg-primary-700

// 2. 次要按钮 (Secondary)
<Button variant="secondary">
  取消
</Button>
// 样式: bg-gray-200 text-gray-900 hover:bg-gray-300

// 3. 轮廓按钮 (Outline)
<Button variant="outline">
  预览
</Button>
// 样式: border border-gray-300 bg-transparent hover:bg-gray-50

// 4. 幽灵按钮 (Ghost)
<Button variant="ghost">
  查看详情
</Button>
// 样式: bg-transparent hover:bg-gray-100

// 5. 危险按钮 (Destructive)
<Button variant="destructive">
  删除
</Button>
// 样式: bg-red-600 text-white hover:bg-red-700

// 6. 链接按钮 (Link)
<Button variant="link">
  了解更多
</Button>
// 样式: text-primary-600 underline-offset-4 hover:underline
```

#### 尺寸 (Sizes)

```tsx
<Button size="sm">小按钮</Button>
// h-8 px-3 text-sm

<Button size="default">默认按钮</Button>
// h-10 px-4 py-2

<Button size="lg">大按钮</Button>
// h-11 px-8 text-lg

<Button size="icon">
  <IconPlus />
</Button>
// h-10 w-10 (正方形图标按钮)
```

#### 状态 (States)

```tsx
// 加载中
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  生成中...
</Button>

// 禁用
<Button disabled>
  配额不足
</Button>

// 带图标
<Button>
  <IconDownload className="mr-2 h-4 w-4" />
  下载视频
</Button>
```

---

### 📝 输入框组件 (Input)

#### 基础输入框

```tsx
// 标准输入框
<Input 
  type="text" 
  placeholder="输入视频描述..." 
/>

// 带标签
<div className="space-y-2">
  <Label htmlFor="prompt">视频Prompt</Label>
  <Input 
    id="prompt"
    placeholder="描述你想要的视频内容..."
  />
</div>

// 错误状态
<div className="space-y-2">
  <Input 
    className="border-red-500 focus:ring-red-500"
    placeholder="邮箱地址"
  />
  <p className="text-sm text-red-500">
    请输入有效的邮箱地址
  </p>
</div>
```

#### 文本域 (Textarea)

```tsx
<Textarea 
  placeholder="详细描述视频内容..."
  rows={4}
  maxLength={500}
/>

// 带字数统计
<div className="space-y-2">
  <Textarea 
    value={prompt}
    onChange={(e) => setPrompt(e.target.value)}
    maxLength={500}
  />
  <p className="text-xs text-gray-500 text-right">
    {prompt.length} / 500
  </p>
</div>
```

#### 搜索框

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
  <Input 
    className="pl-10"
    placeholder="搜索爆款视频..."
  />
</div>
```

---

### 🃏 卡片组件 (Card)

#### 基础卡片

```tsx
<Card>
  <CardHeader>
    <CardTitle>视频标题</CardTitle>
    <CardDescription>
      这是一段描述文字
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>卡片内容区域</p>
  </CardContent>
  <CardFooter>
    <Button>操作按钮</Button>
  </CardFooter>
</Card>
```

#### 视频卡片

```tsx
<Card className="overflow-hidden">
  {/* 视频缩略图 */}
  <div className="aspect-video relative bg-gray-100">
    <img 
      src={video.thumbnail} 
      alt={video.title}
      className="object-cover w-full h-full"
    />
    {/* 时长标签 */}
    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
      0:30
    </div>
  </div>
  
  <CardHeader>
    <CardTitle className="line-clamp-2">
      {video.title}
    </CardTitle>
    <CardDescription>
      <div className="flex items-center gap-4 text-sm">
        <span>👁️ {video.views}</span>
        <span>❤️ {video.likes}</span>
        <span className="text-gray-400">{video.created_at}</span>
      </div>
    </CardDescription>
  </CardHeader>
  
  <CardFooter className="gap-2">
    <Button variant="outline" size="sm" className="flex-1">
      预览
    </Button>
    <Button size="sm" className="flex-1">
      发布
    </Button>
  </CardFooter>
</Card>
```

#### 统计卡片

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">
      本月配额
    </CardTitle>
    <Video className="h-4 w-4 text-gray-500" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">45 / 100</div>
    <p className="text-xs text-gray-500 mt-1">
      剩余55个视频生成配额
    </p>
    <Progress value={45} className="mt-3" />
  </CardContent>
</Card>
```

---

### 📊 进度条组件 (Progress)

```tsx
// 基础进度条
<Progress value={60} className="w-full" />

// 带标签
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>上传中...</span>
    <span className="text-gray-500">60%</span>
  </div>
  <Progress value={60} />
</div>

// 不同颜色
<Progress 
  value={80} 
  className="[&>div]:bg-green-500"  // 成功
/>

<Progress 
  value={30} 
  className="[&>div]:bg-yellow-500"  // 警告
/>

// 不确定状态 (Indeterminate)
<Progress value={null} className="animate-pulse" />
```

---

### 🔔 提示组件 (Alert)

```tsx
// 信息提示
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>提示</AlertTitle>
  <AlertDescription>
    视频正在生成中，预计需要3-5分钟
  </AlertDescription>
</Alert>

// 成功提示
<Alert variant="success" className="bg-green-50 border-green-200">
  <CheckCircle className="h-4 w-4 text-green-600" />
  <AlertTitle className="text-green-800">成功</AlertTitle>
  <AlertDescription className="text-green-700">
    视频生成完成！
  </AlertDescription>
</Alert>

// 警告提示
<Alert variant="warning" className="bg-yellow-50 border-yellow-200">
  <AlertTriangle className="h-4 w-4 text-yellow-600" />
  <AlertTitle className="text-yellow-800">注意</AlertTitle>
  <AlertDescription className="text-yellow-700">
    您的配额即将用完，剩余5个
  </AlertDescription>
</Alert>

// 错误提示
<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>错误</AlertTitle>
  <AlertDescription>
    生成失败，请检查网络连接后重试
  </AlertDescription>
</Alert>
```

---

### 🎬 视频播放器组件 (VideoPlayer)

```tsx
// 自定义视频播放器组件
<VideoPlayer
  src={video.url}
  poster={video.thumbnail}
  controls
  className="w-full rounded-lg"
>
  {/* 加载状态 */}
  <VideoPlayer.Loading>
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  </VideoPlayer.Loading>
  
  {/* 错误状态 */}
  <VideoPlayer.Error>
    <div className="flex flex-col items-center justify-center h-full">
      <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
      <p className="text-gray-600">视频加载失败</p>
    </div>
  </VideoPlayer.Error>
</VideoPlayer>

// 基础HTML5视频
<video 
  className="w-full aspect-video rounded-lg shadow-lg"
  controls
  poster={video.thumbnail}
>
  <source src={video.url} type="video/mp4" />
  您的浏览器不支持视频播放
</video>
```

---

### 🎛️ 选择器组件 (Select)

```tsx
// 基础下拉选择
<Select value={model} onValueChange={setModel}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="选择AI模型" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="minimax">
      Minimax Video-01
    </SelectItem>
    <SelectItem value="runway">
      Runway Gen-3
    </SelectItem>
    <SelectItem value="kling">
      Kling AI
    </SelectItem>
  </SelectContent>
</Select>

// 带图标和描述
<Select>
  <SelectTrigger>
    <SelectValue placeholder="选择模型" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="minimax">
      <div className="flex items-start gap-3">
        <Zap className="h-5 w-5 mt-0.5" />
        <div>
          <div className="font-medium">Minimax Video-01</div>
          <div className="text-xs text-gray-500">
            快速 | 性价比高
          </div>
        </div>
      </div>
    </SelectItem>
    {/* ... */}
  </SelectContent>
</Select>
```

---

### 💬 对话框组件 (Dialog)

```tsx
// 确认对话框
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button variant="destructive">删除视频</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>确认删除</DialogTitle>
      <DialogDescription>
        此操作不可撤销，确定要删除这个视频吗？
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        取消
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        确认删除
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// 表单对话框
<Dialog>
  <DialogTrigger asChild>
    <Button>创建新项目</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>创建新项目</DialogTitle>
      <DialogDescription>
        输入项目信息并保存
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">项目名称</Label>
        <Input id="name" placeholder="我的新项目" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">项目描述</Label>
        <Textarea id="desc" placeholder="描述..." />
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">创建</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 🍞 提示消息组件 (Toast)

```tsx
import { useToast } from "@/hooks/use-toast"

function Component() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "视频生成成功",
          description: "您可以在'我的视频'中查看",
        })
      }}
    >
      显示提示
    </Button>
  )
}

// 不同类型的Toast
// 成功
toast({
  title: "操作成功",
  description: "视频已成功发布到YouTube",
  variant: "success",
})

// 错误
toast({
  title: "操作失败",
  description: "请检查网络连接后重试",
  variant: "destructive",
})

// 警告
toast({
  title: "配额不足",
  description: "本月配额已用完，请升级套餐",
  variant: "warning",
})

// 带操作按钮
toast({
  title: "视频生成中",
  description: "预计需要3-5分钟",
  action: (
    <Button variant="outline" size="sm">
      查看进度
    </Button>
  ),
})
```

---

## shadcn/ui集成

### 📦 已安装的组件

```bash
# 查看已安装的组件
npx shadcn-ui@latest list

# 安装新组件
npx shadcn-ui@latest add [component-name]
```

**当前项目使用的组件：**

```
✅ button
✅ input
✅ textarea
✅ label
✅ card
✅ alert
✅ progress
✅ select
✅ dialog
✅ toast
✅ dropdown-menu
✅ avatar
✅ badge
✅ tabs
✅ accordion
✅ popover
✅ tooltip
```

### ⚙️ 主题配置

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;
    
    --primary: 252 91% 64%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 252 91% 64%;
    
    --radius: 0.5rem;
  }
}
```

---

## 响应式设计

### 📱 断点系统

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // 手机
      'md': '768px',   // 平板
      'lg': '1024px',  // 小型桌面
      'xl': '1280px',  // 桌面
      '2xl': '1536px', // 大屏幕
    }
  }
}
```

### 📐 布局适配

```tsx
// 响应式网格
<div className="
  grid
  grid-cols-1        // 移动端: 1列
  md:grid-cols-2     // 平板: 2列
  lg:grid-cols-3     // 桌面: 3列
  xl:grid-cols-4     // 大屏: 4列
  gap-4
">
  {videos.map(video => (
    <VideoCard key={video.id} {...video} />
  ))}
</div>

// 响应式容器
<div className="
  container
  mx-auto
  px-4              // 移动端: 16px边距
  sm:px-6           // 平板: 24px
  lg:px-8           // 桌面: 32px
">
  {children}
</div>

// 响应式文字
<h1 className="
  text-2xl          // 移动端: 24px
  md:text-3xl       // 平板: 30px
  lg:text-4xl       // 桌面: 36px
  font-bold
">
  标题
</h1>

// 响应式隐藏/显示
<div className="
  hidden            // 默认隐藏
  md:block          // 平板及以上显示
">
  侧边栏内容
</div>

<Button className="
  w-full            // 移动端: 全宽
  md:w-auto         // 平板及以上: 自动宽度
">
  操作按钮
</Button>
```

### 🖱️ 触摸优化

```tsx
// 更大的点击区域
<button className="
  min-h-[44px]      // 最小高度44px (iOS推荐)
  min-w-[44px]
  touch-manipulation  // 禁用双击缩放
">
  <IconClose />
</button>

// 触摸友好的间距
<div className="
  space-y-4         // 桌面: 16px间距
  sm:space-y-6      // 移动端: 24px间距 (更易点击)
">
  {/* ... */}
</div>
```

---

## 无障碍设计

### ♿ WCAG 2.1 AA标准

**1. 颜色对比度**
```
文本 vs 背景:
- 正文文字: 至少 4.5:1
- 大号文字(18px+): 至少 3:1
- UI组件边框: 至少 3:1

检查工具:
- Chrome DevTools: Lighthouse
- WebAIM Contrast Checker
```

**2. 键盘导航**
```tsx
// 确保所有交互元素可通过Tab访问
<button className="focus:ring-2 focus:ring-primary-500">
  点击我
</button>

// 跳过导航链接
<a href="#main-content" className="sr-only focus:not-sr-only">
  跳到主内容
</a>
```

**3. 屏幕阅读器**
```tsx
// 使用语义化HTML
<main>
  <article>
    <h1>标题</h1>
    <p>内容</p>
  </article>
</main>

// ARIA标签
<button aria-label="关闭对话框">
  <X />
</button>

<img src="..." alt="详细的图片描述" />

// 状态提示
<div role="status" aria-live="polite">
  视频生成中...
</div>

// 隐藏装饰性元素
<div aria-hidden="true">
  <IconDecoration />
</div>
```

**4. 表单无障碍**
```tsx
<div className="space-y-2">
  <Label htmlFor="email">
    邮箱地址 <span className="text-red-500" aria-label="必填">*</span>
  </Label>
  <Input 
    id="email"
    type="email"
    required
    aria-describedby="email-error"
    aria-invalid={hasError}
  />
  {hasError && (
    <p id="email-error" className="text-sm text-red-500" role="alert">
      请输入有效的邮箱地址
    </p>
  )}
</div>
```

---

## 动画系统

### 🎬 过渡效果

```css
/* 全局过渡配置 */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

### ✨ 常用动画

```tsx
// 淡入淡出
<div className="
  opacity-0
  animate-in
  fade-in
  duration-300
">
  内容
</div>

// 滑入
<div className="
  animate-in
  slide-in-from-bottom-4
  duration-500
">
  从底部滑入
</div>

// 缩放
<div className="
  transform
  hover:scale-105
  transition-transform
  duration-200
">
  悬停放大
</div>

// 加载动画
<Loader2 className="h-4 w-4 animate-spin" />

// 脉冲
<div className="animate-pulse">
  加载中...
</div>

// 弹跳
<div className="animate-bounce">
  ↓
</div>
```

### 🎯 自定义动画

```css
/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        // 进度条动画
        "progress": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        // 成功提示
        "success-check": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "progress": "progress 1s ease-in-out",
        "success-check": "success-check 0.6s ease-out",
      }
    }
  }
}
```

---

## 📝 组件使用清单

| 组件 | 用途 | 页面 | 状态 |
|------|------|------|------|
| Button | 所有交互操作 | 全局 | ✅ |
| Input | 文本输入 | 注册、生成 | ✅ |
| Card | 视频展示、数据展示 | Dashboard、发现 | ✅ |
| Dialog | 确认操作、表单弹窗 | 全局 | ✅ |
| Alert | 提示信息 | 全局 | ✅ |
| Progress | 生成进度、配额使用 | 生成、Dashboard | ✅ |
| Select | 模型选择、筛选 | 生成、发现 | ✅ |
| Toast | 操作反馈 | 全局 | ✅ |
| Avatar | 用户头像 | Header | ✅ |
| Badge | 标签、状态 | 视频卡片 | ✅ |
| Tabs | 内容切换 | Dashboard | ✅ |
| Tooltip | 补充说明 | 全局 | ✅ |

---

<div align="center">

**文档版本**: V1.0  
**最后更新**: 2024-11-19  
**基于**: shadcn/ui + Tailwind CSS  

[返回文档目录](../README.md) | [查看原型设计](./PROTOTYPE.md) | [查看用户流程](./USER_FLOWS.md)

</div>
