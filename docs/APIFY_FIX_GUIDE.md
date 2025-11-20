# Apify YouTube Scraper 问题修复指南

## 🔴 问题现象

```
Actor with this name was not found
path: /v2/acts/apify~youtube-scraper/runs
```

## 📋 原因分析

Apify平台上的YouTube Scraper Actor名称不正确或该Actor不存在。大多数YouTube scraper需要付费账户或有使用限制。

---

## ✅ 快速解决方案

### 方案1: 使用检查脚本找到可用的Scraper（推荐）

```bash
# 1. 确保.env文件中有Apify API Token
# 2. 运行检查脚本
node check-apify-actors.js
```

这个脚本会自动检查多个YouTube scraper，告诉你哪些可用。

---

### 方案2: 手动查找可用的Scraper

#### 步骤1: 访问Apify Store

前往 [https://apify.com/store](https://apify.com/store)

#### 步骤2: 搜索YouTube Scraper

在搜索框输入 "YouTube Scraper"

#### 步骤3: 选择一个Scraper

推荐选择：
- ⭐ **streamers/youtube-scraper** - 流行且功能完善
- ⭐ **clockworks/youtube-scraper** - 与TikTok scraper同作者
- ⭐ **bernardo/youtube-scraper** - 也比较常用

**注意事项：**
- 查看"Pricing"确认是否免费
- 查看"Runs"数量判断可靠性
- 查看"Last run"确认是否活跃维护

#### 步骤4: 测试Scraper

点击"Try for free"测试该Actor是否可用

---

### 方案3: 修改代码（如果需要）

如果自动尝试的scraper都不可用，你需要手动指定：

编辑 `lib/apify.ts` 文件，找到这部分代码：

```typescript
const scrapers = [
  'streamers/youtube-scraper',      // 优先选择
  'clockworks/youtube-scraper',     // 备选1
  'bernardo/youtube-scraper',       // 备选2
]
```

将找到的可用scraper名称添加到列表最前面：

```typescript
const scrapers = [
  'your-working-scraper-name',      // 你找到的可用scraper
  'streamers/youtube-scraper',
  'clockworks/youtube-scraper',
  'bernardo/youtube-scraper',
]
```

---

## 💰 关于Apify费用

### 免费账户限制

Apify免费账户通常包含：
- $5免费额度
- 有限的Actor运行次数
- 基础的代理访问

### YouTube Scraper成本

大多数YouTube scraper需要：
- **代理服务**（绕过YouTube限速）
- **计算资源**（处理视频数据）

预估成本：
- 每次运行（抓取20个视频）≈ $0.05 - $0.20
- 免费额度可以运行 25-100 次

### 升级选项

如果需要大量使用：
1. **Personal计划** - $49/月，$50额度
2. **Team计划** - $499/月，$500额度

访问 [https://apify.com/pricing](https://apify.com/pricing) 查看详情

---

## 🔧 其他解决方案

### 选项A: 仅使用TikTok功能

如果YouTube scraper成本太高，可以：

1. 专注于TikTok平台（免费且稳定）
2. 等待有YouTube需求时再付费

修改代码暂时禁用YouTube：

```typescript
// 在 app/api/discover/scrape/route.ts
if (platform === 'youtube') {
  return NextResponse.json(
    { error: 'YouTube功能暂未启用，请使用TikTok' },
    { status: 400 }
  )
}
```

### 选项B: 使用YouTube API直接调用

免费但有限制（每天10,000配额）：

1. 申请YouTube Data API v3密钥
2. 使用官方API代替Apify
3. 适合小规模使用

### 选项C: 自建爬虫（高级）

使用Puppeteer或Playwright自建爬虫：
- 完全免费
- 需要技术能力
- 需要处理反爬虫机制

---

## 🧪 测试步骤

### 1. 拉取最新代码

```bash
git pull origin main
```

### 2. 检查可用的Scraper

```bash
node check-apify-actors.js
```

### 3. 重启开发服务器

```bash
npm run dev
```

### 4. 测试爬取功能

访问 `http://localhost:3000` 并尝试搜索YouTube视频

---

## ❓ 常见问题

### Q1: 所有scraper都不可用怎么办？

**A:** 可能原因：
1. Apify账户没有额度
2. API Token权限不足
3. 账户需要验证

**解决：**
- 访问 [https://console.apify.com](https://console.apify.com)
- 检查账户余额
- 验证API Token权限
- 尝试添加付费方式（不会自动扣费）

### Q2: 爬取很慢怎么办？

**A:** 
- YouTube爬取通常需要30秒-2分钟
- 使用代理服务会增加时间
- 减少 `maxResults` 参数

### Q3: 能否批量爬取？

**A:**
- 可以，但会消耗更多额度
- 建议设置合理的 `maxResults`（10-50个）
- 考虑使用定时任务分批处理

---

## 📝 下一步

1. ✅ 运行 `node check-apify-actors.js` 找到可用scraper
2. ✅ 重启服务器测试
3. ✅ 如果仍有问题，考虑使用TikTok或YouTube API

---

**需要帮助？** 查看完整文档：`docs/TESTING_GUIDE.md`
