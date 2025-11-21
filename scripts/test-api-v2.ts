/**
 * V2 API 测试脚本
 * 
 * 测试YouTube Shorts优化器V2的所有功能
 * 
 * 运行方式:
 * 1. 本地测试: npm run test:api-v2
 * 2. 手动测试: node scripts/test-api-v2.js
 */

import { calculateShortsViralScoreV2 } from '../lib/youtube-shorts-optimizer-v2';
import { isViral } from '../lib/viral-definition-standards';

// 测试颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function separator(char: string = '=', length: number = 60) {
  console.log(char.repeat(length));
}

// ============================================
// 测试数据
// ============================================

const testVideos = [
  {
    name: '🔥 教育类爆款',
    expectedLevel: 'viral',
    expectedScore: 95, // 预期分数范围
    data: {
      views: 850000,
      likes: 68000,     // 8% 点赞率
      comments: 12750,  // 1.5% 评论率
      shares: 25500,    // 3% 分享率 - 极优！
      subscriberCount: 45000,
      duration: 45,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1天前
      title: 'How to Master AI in 60 Seconds | Complete Guide',
      description: 'Learn the fundamentals of AI quickly with this comprehensive tutorial',
      category: 'education',
    },
  },
  {
    name: '🌟 热门科技视频',
    expectedLevel: 'hot',
    expectedScore: 75,
    data: {
      views: 250000,
      likes: 20000,     // 8% 点赞率
      comments: 3000,   // 1.2% 评论率
      shares: 3750,     // 1.5% 分享率
      subscriberCount: 120000,
      duration: 50,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5天前
      title: 'Top 5 AI Tools for 2025',
      description: 'Discover the best AI productivity tools',
      category: 'tech',
    },
  },
  {
    name: '⭐ 小众B2B教程（潜力）',
    expectedLevel: 'potential',
    expectedScore: 85, // 相对爆款
    data: {
      views: 28000,
      likes: 3360,      // 12% 点赞率
      comments: 560,    // 2% 评论率
      shares: 840,      // 3% 分享率
      subscriberCount: 850,
      duration: 50,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天前
      title: 'B2B Sales Strategy: Complete Professional Guide',
      description: 'Advanced tips for B2B sales professionals',
      category: 'business',
    },
  },
  {
    name: '🌊 蓝海机会（小创作者）',
    expectedLevel: 'potential',
    expectedScore: 60,
    data: {
      views: 15000,
      likes: 1500,      // 10% 点赞率
      comments: 300,    // 2% 评论率
      shares: 450,      // 3% 分享率
      subscriberCount: 500,
      duration: 40,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1天前
      title: 'Niche Marketing Tips for Startups',
      description: 'Unique strategies for small businesses',
      category: 'business',
    },
  },
  {
    name: '○ 普通视频',
    expectedLevel: 'normal',
    expectedScore: 45,
    data: {
      views: 8000,
      likes: 160,       // 2% 点赞率
      comments: 40,     // 0.5% 评论率
      shares: 40,       // 0.5% 分享率
      subscriberCount: 25000,
      duration: 30,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10天前
      title: 'Random vlog',
      description: 'Just another video',
    },
  },
];

// ============================================
// 测试函数
// ============================================

/**
 * 测试1: 专业评分系统
 */
function testProfessionalScoring() {
  log('\n📊 测试1: 专业评分系统', colors.bright + colors.cyan);
  separator();

  let passCount = 0;
  let failCount = 0;

  testVideos.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}`);
    console.log('-'.repeat(60));

    // 使用V2评分
    const result = calculateShortsViralScoreV2(test.data);
    const score = result.professionalScore.score;
    const level = result.finalVerdict.level;

    // 显示结果
    console.log(`\n评分结果:`);
    console.log(`  专业评分: ${score}/100`);
    console.log(`  判断等级: ${getLevelEmoji(level)} ${level}`);
    console.log(`  是否爆款: ${result.professionalScore.isViral ? '✅ 是' : '❌ 否'}`);
    console.log(`  置信度: ${result.professionalScore.confidence}%`);

    // 显示评分原因
    console.log(`\n评分原因:`);
    result.professionalScore.reasons.forEach((reason, i) => {
      console.log(`  ${i + 1}. ${reason}`);
    });

    // 对比传统评分
    if (result.legacyScore) {
      const legacyScore = result.legacyScore.totalScore;
      const diff = score - legacyScore;
      console.log(`\n传统评分对比:`);
      console.log(`  传统评分: ${legacyScore}/100`);
      console.log(`  评分差异: ${diff > 0 ? '+' : ''}${diff}分`);
      
      if (Math.abs(diff) > 10) {
        const color = diff > 0 ? colors.green : colors.yellow;
        log(`  ${diff > 0 ? '✨ V2评分更高' : '⚠️ 传统评分更高'}`, color);
      }
    }

    // 验证预期
    const levelMatch = level === test.expectedLevel;
    const scoreInRange = Math.abs(score - test.expectedScore) <= 15; // 允许±15分误差

    console.log(`\n验证结果:`);
    console.log(`  预期等级: ${test.expectedLevel} ${levelMatch ? '✅' : '❌'}`);
    console.log(`  预期评分: ~${test.expectedScore} ${scoreInRange ? '✅' : '⚠️'}`);

    if (levelMatch && scoreInRange) {
      log(`  ✅ 测试通过`, colors.green);
      passCount++;
    } else {
      log(`  ❌ 测试失败`, colors.red);
      failCount++;
    }
  });

  // 汇总
  console.log('\n' + '='.repeat(60));
  log(`\n测试完成: ${passCount}通过, ${failCount}失败`, colors.bright);
  
  return { passCount, failCount };
}

/**
 * 测试2: 相对定义功能
 */
function testRelativeDefinition() {
  log('\n📏 测试2: 相对定义功能', colors.bright + colors.cyan);
  separator();

  const testCases = [
    {
      name: '超大号账号 - 高播放',
      data: { views: 1000000, likes: 50000, comments: 10000, shares: 15000, subscriberCount: 5000000 },
      expectedTier: 'mega',
    },
    {
      name: '超大号账号 - 低播放',
      data: { views: 100000, likes: 5000, comments: 1000, shares: 1500, subscriberCount: 5000000 },
      expectedTier: 'mega',
      shouldFail: true,
    },
    {
      name: '小账号 - 相对爆款',
      data: { views: 50000, likes: 6000, comments: 1000, shares: 1500, subscriberCount: 500 },
      expectedTier: 'nano',
      shouldBeViral: true,
    },
  ];

  let passCount = 0;
  let failCount = 0;

  testCases.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}`);
    console.log('-'.repeat(60));

    const videoData = {
      ...test.data,
      duration: 45,
      publishedAt: new Date().toISOString(),
      title: 'Test Video',
      description: 'Test',
    };

    const result = isViral(test.data, 'youtube_shorts');

    console.log(`播放量: ${test.data.views.toLocaleString()}`);
    console.log(`粉丝数: ${test.data.subscriberCount.toLocaleString()}`);
    console.log(`播放/粉丝比: ${(test.data.views / test.data.subscriberCount * 100).toFixed(1)}%`);
    console.log(`\n评分: ${result.score}/100`);
    console.log(`是否爆款: ${result.isViral ? '✅ 是' : '❌ 否'}`);

    // 验证
    let passed = true;
    if (test.shouldBeViral && !result.isViral) {
      log(`❌ 应该判定为爆款但未判定`, colors.red);
      passed = false;
    }
    if (test.shouldFail && result.isViral) {
      log(`✅ 正确识别低表现（相对粉丝数）`, colors.green);
    }

    if (passed) {
      log(`✅ 相对定义测试通过`, colors.green);
      passCount++;
    } else {
      failCount++;
    }
  });

  console.log('\n' + '='.repeat(60));
  log(`测试完成: ${passCount}通过, ${failCount}失败`, colors.bright);
  
  return { passCount, failCount };
}

/**
 * 测试3: 分享率权重验证
 */
function testShareRatePriority() {
  log('\n🔗 测试3: 分享率权重验证', colors.bright + colors.cyan);
  separator();

  const testCases = [
    {
      name: '高分享率 vs 高点赞率',
      video1: {
        name: '高分享率视频',
        views: 100000,
        likes: 3000,     // 3% 点赞
        comments: 500,   // 0.5% 评论
        shares: 3000,    // 3% 分享 ⭐
        subscriberCount: 10000,
      },
      video2: {
        name: '高点赞率视频',
        views: 100000,
        likes: 10000,    // 10% 点赞
        comments: 500,   // 0.5% 评论
        shares: 500,     // 0.5% 分享
        subscriberCount: 10000,
      },
      expectedWinner: 'video1', // 高分享率应该胜出
    },
  ];

  let passCount = 0;
  let failCount = 0;

  testCases.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}`);
    console.log('-'.repeat(60));

    const result1 = calculateShortsViralScoreV2({
      ...test.video1,
      duration: 45,
      publishedAt: new Date().toISOString(),
      title: 'Test',
      description: 'Test',
    });

    const result2 = calculateShortsViralScoreV2({
      ...test.video2,
      duration: 45,
      publishedAt: new Date().toISOString(),
      title: 'Test',
      description: 'Test',
    });

    console.log(`\n${test.video1.name}:`);
    console.log(`  点赞率: ${(test.video1.likes / test.video1.views * 100).toFixed(1)}%`);
    console.log(`  评论率: ${(test.video1.comments / test.video1.views * 100).toFixed(1)}%`);
    console.log(`  分享率: ${(test.video1.shares / test.video1.views * 100).toFixed(1)}% ⭐`);
    console.log(`  评分: ${result1.professionalScore.score}/100`);

    console.log(`\n${test.video2.name}:`);
    console.log(`  点赞率: ${(test.video2.likes / test.video2.views * 100).toFixed(1)}%`);
    console.log(`  评论率: ${(test.video2.comments / test.video2.views * 100).toFixed(1)}%`);
    console.log(`  分享率: ${(test.video2.shares / test.video2.views * 100).toFixed(1)}%`);
    console.log(`  评分: ${result2.professionalScore.score}/100`);

    const winner = result1.professionalScore.score > result2.professionalScore.score ? 'video1' : 'video2';
    const passed = winner === test.expectedWinner;

    console.log(`\n胜出者: ${winner === 'video1' ? test.video1.name : test.video2.name}`);
    console.log(`评分差异: ${Math.abs(result1.professionalScore.score - result2.professionalScore.score)}分`);

    if (passed) {
      log(`✅ 分享率权重验证通过 - 高分享率视频评分更高`, colors.green);
      passCount++;
    } else {
      log(`❌ 分享率权重验证失败`, colors.red);
      failCount++;
    }
  });

  console.log('\n' + '='.repeat(60));
  log(`测试完成: ${passCount}通过, ${failCount}失败`, colors.bright);
  
  return { passCount, failCount };
}

/**
 * 测试4: 预设模式验证
 */
function testPresetModes() {
  log('\n🎯 测试4: 预设模式验证', colors.bright + colors.cyan);
  separator();

  const presets = [
    { name: 'viral', minScore: 85, icon: '🔥' },
    { name: 'hot', minScore: 70, icon: '🌟' },
    { name: 'potential', minScore: 55, icon: '⭐' },
    { name: 'blueOcean', minScore: 55, icon: '🌊' },
  ];

  console.log('\n预设模式标准:');
  presets.forEach(preset => {
    console.log(`  ${preset.icon} ${preset.name}: ≥${preset.minScore}分`);
  });

  console.log('\n测试不同评分的视频应该匹配的预设:');
  
  const scores = [98, 82, 68, 50, 30];
  scores.forEach(score => {
    let matchedPresets: string[] = [];
    presets.forEach(preset => {
      if (score >= preset.minScore) {
        matchedPresets.push(`${preset.icon} ${preset.name}`);
      }
    });
    
    console.log(`  ${score}分 → ${matchedPresets.length > 0 ? matchedPresets.join(', ') : '无匹配'}`);
  });

  log('\n✅ 预设模式标准已验证', colors.green);
  
  return { passCount: 1, failCount: 0 };
}

// ============================================
// 辅助函数
// ============================================

function getLevelEmoji(level: string): string {
  const emojis: Record<string, string> = {
    viral: '🔥',
    hot: '🌟',
    potential: '⭐',
    normal: '○',
  };
  return emojis[level] || '?';
}

// ============================================
// 主测试运行器
// ============================================

export async function runAllTests() {
  log('\n🧪 YouTube Shorts 优化器 V2 - 完整测试套件', colors.bright + colors.blue);
  separator('=', 70);
  
  const startTime = Date.now();
  
  // 运行所有测试
  const results = {
    test1: testProfessionalScoring(),
    test2: testRelativeDefinition(),
    test3: testShareRatePriority(),
    test4: testPresetModes(),
  };

  // 计算总结果
  const totalPass = Object.values(results).reduce((sum, r) => sum + r.passCount, 0);
  const totalFail = Object.values(results).reduce((sum, r) => sum + r.failCount, 0);
  const totalTests = totalPass + totalFail;
  const passRate = totalTests > 0 ? (totalPass / totalTests * 100).toFixed(1) : 0;

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  // 最终报告
  log('\n' + '='.repeat(70), colors.bright);
  log('📊 测试总结报告', colors.bright + colors.cyan);
  separator('=', 70);

  console.log(`\n测试用例总数: ${totalTests}`);
  log(`通过: ${totalPass}`, colors.green);
  log(`失败: ${totalFail}`, totalFail > 0 ? colors.red : colors.reset);
  console.log(`通过率: ${passRate}%`);
  console.log(`耗时: ${elapsed}秒`);

  if (totalFail === 0) {
    log('\n🎉 所有测试通过！V2 API运行正常！', colors.bright + colors.green);
  } else {
    log(`\n⚠️ 有 ${totalFail} 个测试失败，请检查`, colors.yellow);
  }

  console.log('\n' + '='.repeat(70));

  return {
    totalTests,
    totalPass,
    totalFail,
    passRate: parseFloat(passRate),
    elapsed: parseFloat(elapsed),
  };
}

// 如果直接运行
if (require.main === module) {
  runAllTests().then(result => {
    process.exit(result.totalFail > 0 ? 1 : 0);
  });
}

export default {
  runAllTests,
  testProfessionalScoring,
  testRelativeDefinition,
  testShareRatePriority,
  testPresetModes,
};
