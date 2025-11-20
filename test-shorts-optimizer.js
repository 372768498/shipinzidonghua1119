/**
 * YouTube Shorts 优化爬取测试脚本
 * 
 * 使用方法：
 * node test-shorts-optimizer.js [preset] [category]
 * 
 * 示例：
 * node test-shorts-optimizer.js viral education
 * node test-shorts-optimizer.js potential tech
 * node test-shorts-optimizer.js blueOcean business
 */

require('dotenv').config();

const PRESETS = {
  viral: {
    name: '爆款发现',
    description: '已验证的高播放量内容',
    minViews: 100000,
    icon: '🔥',
  },
  potential: {
    name: '潜力挖掘',
    description: '早期高互动率内容',
    minViews: 10000,
    icon: '🚀',
  },
  blueOcean: {
    name: '蓝海机会',
    description: '低竞争高价值内容',
    minViews: 5000,
    icon: '🌊',
  },
};

const CATEGORIES = {
  education: { name: '教育', icon: '📚' },
  tech: { name: '科技', icon: '💻' },
  business: { name: '商业', icon: '💼' },
  lifestyle: { name: '生活', icon: '🏡' },
  quickKnowledge: { name: '快速知识', icon: '💡' },
};

async function main() {
  const preset = process.argv[2] || 'viral';
  const category = process.argv[3] || 'education';

  if (!PRESETS[preset]) {
    console.error('❌ 无效的preset:', preset);
    console.log('可选值:', Object.keys(PRESETS).join(', '));
    process.exit(1);
  }

  if (!CATEGORIES[category]) {
    console.error('❌ 无效的category:', category);
    console.log('可选值:', Object.keys(CATEGORIES).join(', '));
    process.exit(1);
  }

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   YouTube Shorts 优化爬取测试                         ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');
  
  const presetInfo = PRESETS[preset];
  const categoryInfo = CATEGORIES[category];
  
  console.log(`${presetInfo.icon} 预设模式: ${presetInfo.name}`);
  console.log(`   描述: ${presetInfo.description}`);
  console.log(`   最低播放: ${presetInfo.minViews.toLocaleString()}`);
  console.log('');
  console.log(`${categoryInfo.icon} 内容类别: ${categoryInfo.name}`);
  console.log('');

  // 检查环境变量
  if (!process.env.APIFY_API_KEY) {
    console.error('❌ 缺少 APIFY_API_KEY 环境变量');
    process.exit(1);
  }

  console.log('🔑 Apify API Key: ✓');
  console.log('');

  // 模拟爬取配置
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 爬取配置');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 获取优化后的关键词
  const keywords = getKeywordsForCategory(category);
  console.log('🔍 搜索关键词:');
  keywords.forEach((kw, i) => {
    console.log(`   ${i + 1}. "${kw}"`);
  });
  console.log('');

  // 筛选条件
  const filterConfig = getFilterConfig(preset);
  console.log('🎯 筛选条件:');
  console.log(`   ✓ 时长: ${filterConfig.minDuration}s - ${filterConfig.maxDuration}s`);
  console.log(`   ✓ 播放数: ≥ ${filterConfig.minViews.toLocaleString()}`);
  console.log(`   ✓ 互动率: ≥ ${filterConfig.minEngagementRate}%`);
  console.log(`   ✓ 新鲜度: ≤ ${filterConfig.maxDaysOld}天`);
  console.log(`   ✓ 订阅数: ${filterConfig.minSubscribers.toLocaleString()} - ${filterConfig.maxSubscribers.toLocaleString()}`);
  console.log('');

  // 评分维度
  console.log('📊 评分维度 (总分100):');
  console.log('   • 互动质量 (30分) - 点赞+评论率');
  console.log('   • 增长潜力 (25分) - 播放/订阅比');
  console.log('   • 内容质量 (25分) - 时长+标题分析');
  console.log('   • 时机把握 (10分) - 发布时间');
  console.log('   • 教育价值 (10分) - 关键词检测');
  console.log('');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 开始测试爬取');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  try {
    // 实际调用Apify
    const { ApifyClient } = require('apify-client');
    const client = new ApifyClient({
      token: process.env.APIFY_API_KEY,
    });

    console.log('⏳ 启动Apify任务...');
    
    const scrapers = [
      'streamers/youtube-scraper',
      'clockworks/youtube-scraper',
      'bernardo/youtube-scraper',
    ];

    let run;
    let usedScraper;

    for (const scraperName of scrapers) {
      try {
        console.log(`   尝试: ${scraperName}`);
        run = await client.actor(scraperName).call(
          {
            searchQueries: keywords,
            maxResults: 20,
            sortBy: 'views',
            proxy: {
              useApifyProxy: true,
              apifyProxyGroups: ['RESIDENTIAL'],
            },
          },
          {
            waitForFinish: 180, // 等待3分钟
          }
        );
        usedScraper = scraperName;
        console.log(`   ✓ 使用: ${scraperName}`);
        break;
      } catch (error) {
        console.log(`   ✗ ${scraperName} 不可用`);
        continue;
      }
    }

    if (!run) {
      throw new Error('所有爬虫都不可用');
    }

    console.log('');
    console.log(`✅ 任务完成: ${run.id}`);
    console.log(`⏱️  耗时: ${Math.round(run.stats.durationMillis / 1000)}s`);
    console.log('');

    // 获取结果
    console.log('📥 获取结果...');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`   原始视频数: ${items.length}`);
    console.log('');

    if (items.length === 0) {
      console.log('⚠️  未找到视频数据');
      console.log('   可能原因:');
      console.log('   1. 关键词太窄');
      console.log('   2. 筛选条件太严格');
      console.log('   3. Apify返回数据为空');
      return;
    }

    // 处理结果
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 数据分析');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 调试：显示数据结构
    console.log('🔍 数据结构（第一个视频）:');
    const firstVideo = items[0];
    console.log(JSON.stringify(firstVideo, null, 2).substring(0, 500) + '...');
    console.log('');

    // 应用筛选
    const filteredVideos = filterVideos(items, filterConfig);
    console.log(`🎯 通过筛选: ${filteredVideos.length} / ${items.length}`);
    console.log('');

    if (filteredVideos.length === 0) {
      console.log('⚠️  没有视频通过筛选条件');
      console.log('   建议:');
      console.log('   1. 降低minViews门槛');
      console.log('   2. 降低minEngagementRate');
      console.log('   3. 增加maxDaysOld天数');
      return;
    }

    // 计算评分
    console.log('📈 爆款评分 Top 10:');
    console.log('');

    const scoredVideos = filteredVideos
      .map(video => {
        const score = calculateScore(video, preset);
        return { video, score };
      })
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .slice(0, 10);

    scoredVideos.forEach((item, index) => {
      const { video, score } = item;
      const scoreEmoji = score.totalScore >= 80 ? '🔥' : 
                        score.totalScore >= 70 ? '⭐' : 
                        score.totalScore >= 60 ? '✓' : '○';
      
      console.log(`${scoreEmoji} #${index + 1} 评分: ${score.totalScore}/100`);
      console.log(`   标题: ${video.title?.substring(0, 60) || 'N/A'}...`);
      console.log(`   播放: ${formatNumber(getViews(video))} | 点赞: ${formatNumber(getLikes(video))} | 评论: ${formatNumber(getComments(video))}`);
      console.log(`   详细: 互动${score.breakdown.engagement} 增长${score.breakdown.growth} 质量${score.breakdown.quality} 时机${score.breakdown.timing} 教育${score.breakdown.content}`);
      console.log('');
    });

    // 统计信息
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 统计信息');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const highScore = scoredVideos.filter(v => v.score.totalScore >= 80).length;
    const mediumScore = scoredVideos.filter(v => v.score.totalScore >= 70 && v.score.totalScore < 80).length;
    const lowScore = scoredVideos.filter(v => v.score.totalScore < 70).length;

    console.log(`🔥 高分视频 (≥80分): ${highScore}`);
    console.log(`⭐ 中分视频 (70-79分): ${mediumScore}`);
    console.log(`○  低分视频 (<70分): ${lowScore}`);
    console.log('');

    const avgScore = scoredVideos.reduce((sum, v) => sum + v.score.totalScore, 0) / scoredVideos.length;
    console.log(`📊 平均分: ${avgScore.toFixed(1)}/100`);
    console.log('');

    // 成功建议
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 优化建议');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    if (highScore > 0) {
      console.log('✅ 发现高质量爆款内容！');
      console.log('   建议: 优先复制Top 3视频的创意');
    } else if (mediumScore > 0) {
      console.log('⚠️  中等质量内容较多');
      console.log('   建议: 提升教育价值和内容质量');
    } else {
      console.log('⚠️  未发现高分内容');
      console.log('   建议: 更换关键词或降低筛选标准');
    }
    console.log('');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('');
    console.error('详细错误:');
    console.error(error);
  }
}

// 辅助函数
function getKeywordsForCategory(category) {
  const keywordMap = {
    education: ['how to', 'tutorial', 'learn', 'explain', 'guide'],
    tech: ['AI', 'tech review', 'gadget', 'app', 'coding'],
    business: ['business tips', 'entrepreneur', 'startup', 'marketing'],
    lifestyle: ['life hack', 'DIY', 'organize', 'fitness'],
    quickKnowledge: ['did you know', 'fact', 'science', 'explained'],
  };
  return keywordMap[category] || keywordMap.education;
}

function getFilterConfig(preset) {
  const configs = {
    viral: {
      minDuration: 15,
      maxDuration: 60,
      minViews: 100000,
      minEngagementRate: 5,
      maxDaysOld: 7,
      minSubscribers: 1000,
      maxSubscribers: 10000000,
    },
    potential: {
      minDuration: 20,
      maxDuration: 60,
      minViews: 10000,
      minEngagementRate: 8,
      maxDaysOld: 3,
      minSubscribers: 500,
      maxSubscribers: 50000,
    },
    blueOcean: {
      minDuration: 30,
      maxDuration: 60,
      minViews: 5000,
      minEngagementRate: 10,
      maxDaysOld: 2,
      minSubscribers: 100,
      maxSubscribers: 10000,
    },
  };
  return configs[preset];
}

function getViews(video) {
  return parseInt(video.viewCount || video.views || video.statistics?.viewCount || '0');
}

function getLikes(video) {
  return parseInt(video.likeCount || video.likes || video.statistics?.likeCount || '0');
}

function getComments(video) {
  return parseInt(video.commentCount || video.comments || video.statistics?.commentCount || '0');
}

function getSubscribers(video) {
  return parseInt(video.subscriberCount || video.subscribers || '0');
}

function filterVideos(videos, config) {
  return videos.filter(video => {
    const views = getViews(video);
    const likes = getLikes(video);
    const comments = getComments(video);
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    
    return views >= config.minViews && engagementRate >= config.minEngagementRate;
  });
}

function calculateScore(video, preset) {
  const views = getViews(video);
  const likes = getLikes(video);
  const comments = getComments(video);
  const subscribers = getSubscribers(video);

  // 1. 互动质量 (30分)
  const engagementRate = (likes + comments * 2) / views;
  const engagementScore = Math.min(engagementRate * 3000, 30);

  // 2. 增长潜力 (25分)
  const viewToSubscriberRatio = views / Math.max(subscribers, 1);
  const growthScore = Math.min(Math.log10(viewToSubscriberRatio + 1) * 10, 25);

  // 3. 内容质量 (25分)
  const title = video.title || '';
  const qualityScore = analyzeContentQuality(title);

  // 4. 时机把握 (10分)
  const publishedAt = video.publishedAt || video.createTime;
  const daysOld = publishedAt ? 
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24) : 999;
  const timingScore = Math.max(10 - daysOld * 0.5, 0);

  // 5. 教育价值 (10分)
  const educationalScore = detectEducationalValue(title);

  const totalScore = Math.round(
    engagementScore + growthScore + qualityScore + timingScore + educationalScore
  );

  return {
    totalScore: Math.min(totalScore, 100),
    breakdown: {
      engagement: Math.round(engagementScore),
      growth: Math.round(growthScore),
      quality: Math.round(qualityScore),
      timing: Math.round(timingScore),
      content: Math.round(educationalScore),
    },
  };
}

function analyzeContentQuality(title) {
  let score = 0;
  const text = title.toLowerCase();

  const eduKeywords = ['how to', 'tutorial', 'learn', 'guide', 'tips', 'explain'];
  eduKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });

  if (/\d+/.test(title)) score += 2;
  if (title.includes('?')) score += 1;

  return Math.min(score, 25);
}

function detectEducationalValue(title) {
  let score = 0;
  const text = title.toLowerCase();

  const strongEducational = ['tutorial', 'course', 'lesson', 'learn', 'teach', 'explain', 'guide', 'how to'];
  strongEducational.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });

  const knowledgeSharing = ['fact', 'science', 'history', 'psychology', 'did you know', 'tips', 'tricks', 'hack'];
  knowledgeSharing.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });

  return Math.min(score, 10);
}

function formatNumber(num) {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

// 运行测试
main().catch(console.error);
