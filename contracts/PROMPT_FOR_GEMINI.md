# 给Gemini 3.0的开发Prompt

---

## 任务：创建爆款发现页面

根据接口契约 `contracts/discover.contract.ts` 创建前端页面。

### 页面路径
`app/dashboard/discover/page.tsx`

### UI要求
- 深色主题，科技感设计
- 顶部：标题 + 统计信息
- 爬取面板：可折叠，包含平台选择、关键词输入、数量设置、启动按钮
- 筛选栏：平台、爆款分、时间、排序、搜索框
- 视频展示：网格布局，每个卡片显示缩略图、标题、作者、数据指标、爆款分

### 功能
1. 爬取控制：提交表单调用 `startScrape()`
2. 视频加载：页面挂载时调用 `getVideos()`
3. 筛选搜索：实时过滤本地数据
4. 删除视频：确认后调用 `deleteVideo()`
5. 加载状态：爬取中显示进度提示
6. 空状态：无数据时显示引导信息

### 技术栈
- Next.js 14 ('use client')
- TypeScript
- Tailwind CSS
- 使用contract中的类型和mock数据测试

### 约束
- 保持代码简洁，避免过度抽象
- 统一错误处理：`try/catch` + `alert()` 或 toast
- 响应式设计：mobile/tablet/desktop

---

**开始开发吧！生成完整的 page.tsx 文件。**
