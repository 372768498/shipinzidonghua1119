# 🚀 MVP开发工作流

## 📦 已完成 - 爆款发现模块

### ✅ 文件清单

```
contracts/
├── discover.contract.ts          # 接口契约 + Mock数据
└── PROMPT_FOR_GEMINI.md         # Gemini开发提示

app/api/discover/
├── videos/route.ts               # GET 获取视频列表
├── scrape/route.ts               # POST 启动爬取
└── videos/[id]/route.ts          # DELETE 删除视频
```

---

## 🎨 Gemini开发任务

### 1. 打开Gemini 3.0

### 2. 复制Prompt
将 `contracts/PROMPT_FOR_GEMINI.md` + `contracts/discover.contract.ts` 发给Gemini

### 3. 要求输出
生成 `app/dashboard/discover/page.tsx`

### 4. 保存到正确路径
`C:\Users\jojo1\Desktop\shipinzidonghua1119\app\dashboard\discover\page.tsx`

---

## 🧪 测试

```bash
# 进入项目目录
cd C:\Users\jojo1\Desktop\shipinzidonghua1119

# 启动开发服务器
npm run dev

# 访问
http://localhost:3000/dashboard/discover
```

---

## ⏭️ 下一步

1. ✅ 爆款发现
2. ⏭️ 视频生成
3. ⏭️ YouTube发布
4. ⏭️ Dashboard总览
