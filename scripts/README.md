# 🧪 快速测试 V2 API

## 运行自动化测试

```bash
# 方法1：使用tsx（推荐）
npx tsx scripts/test-api-v2.ts

# 方法2：使用ts-node
npx ts-node scripts/test-api-v2.ts

# 方法3：编译后运行
npx tsc scripts/test-api-v2.ts && node scripts/test-api-v2.js
```

## 测试内容

测试脚本会自动验证：

1. ✅ **专业评分系统**（5个测试案例）
2. ✅ **相对定义功能**（3个测试案例）
3. ✅ **分享率权重**（1个测试案例）
4. ✅ **预设模式标准**（1个测试案例）

## 预期输出

```
🧪 YouTube Shorts 优化器 V2 - 完整测试套件
======================================================================

📊 测试1: 专业评分系统
...
测试完成: 5通过, 0失败

📏 测试2: 相对定义功能
...
测试完成: 3通过, 0失败

🔗 测试3: 分享率权重验证
...
测试完成: 1通过, 0失败

🎯 测试4: 预设模式验证
...
测试完成: 1通过, 0失败

📊 测试总结报告
======================================================================
测试用例总数: 10
通过: 10
失败: 0
通过率: 100.0%
耗时: 0.15秒

🎉 所有测试通过！V2 API运行正常！
```

## 手动测试API

### 1. 获取预设列表

```bash
curl "http://localhost:3000/api/viral-discovery/shorts-optimized?action=list-presets"
```

### 2. 启动爬取任务

```bash
curl -X POST "http://localhost:3000/api/viral-discovery/shorts-optimized" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "preset": "viral",
    "category": "education",
    "maxResults": 10
  }'
```

## 故障排除

### 问题：找不到模块

```bash
# 安装依赖
npm install

# 或单独安装tsx
npm install -D tsx
```

### 问题：TypeScript错误

```bash
# 确保项目配置正确
npm run build

# 或跳过类型检查
npx tsx --no-check scripts/test-api-v2.ts
```

## 详细文档

查看完整测试指南：[docs/V2_API_TESTING_GUIDE.md](../docs/V2_API_TESTING_GUIDE.md)
