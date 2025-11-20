#!/usr/bin/env node

/**
 * Apify Actor检查脚本
 * 帮助查找可用的YouTube Scraper
 */

require('dotenv').config();
const { ApifyClient } = require('apify-client');

const APIFY_API_KEY = process.env.APIFY_API_KEY || process.env.APIFY_API_TOKEN;

if (!APIFY_API_KEY) {
  console.error('❌ 错误: 未找到APIFY_API_KEY或APIFY_API_TOKEN环境变量');
  console.log('\n请在.env文件中设置:');
  console.log('APIFY_API_TOKEN=your_api_token_here\n');
  process.exit(1);
}

const client = new ApifyClient({ token: APIFY_API_KEY });

console.log('🔍 检查可用的YouTube Scraper...\n');
console.log('='.repeat(60));

// 常见的YouTube Scraper列表
const scrapers = [
  { name: 'streamers/youtube-scraper', description: '流行的第三方scraper' },
  { name: 'clockworks/youtube-scraper', description: '与TikTok scraper同作者' },
  { name: 'bernardo/youtube-scraper', description: '功能完善的scraper' },
  { name: 'apify/youtube-scraper', description: '官方scraper（可能需要付费）' },
  { name: 'epctex/youtube-scraper', description: 'Epctex系列scraper' },
  { name: 'anchor/youtube-scraper', description: 'Anchor开发的scraper' },
];

async function checkScraper(scraperName) {
  try {
    // 尝试获取Actor信息
    const actor = await client.actor(scraperName).get();
    
    return {
      available: true,
      name: scraperName,
      title: actor.title || scraperName,
      version: actor.taggedBuilds?.latest || 'unknown',
      stats: actor.stats || {},
    };
  } catch (error) {
    return {
      available: false,
      name: scraperName,
      error: error.message,
    };
  }
}

async function main() {
  const results = [];

  for (const scraper of scrapers) {
    process.stdout.write(`检查 ${scraper.name} ... `);
    const result = await checkScraper(scraper.name);
    results.push({ ...result, description: scraper.description });
    
    if (result.available) {
      console.log('✅ 可用');
    } else {
      console.log('❌ 不可用');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 检查结果:\n');

  const available = results.filter(r => r.available);
  const unavailable = results.filter(r => !r.available);

  if (available.length > 0) {
    console.log('✅ 可用的Scraper:');
    available.forEach(r => {
      console.log(`\n  📦 ${r.name}`);
      console.log(`     描述: ${r.description}`);
      if (r.stats.totalRuns) {
        console.log(`     使用次数: ${r.stats.totalRuns.toLocaleString()}`);
      }
    });
    
    console.log('\n💡 推荐使用: ' + available[0].name);
  } else {
    console.log('❌ 未找到可用的YouTube Scraper');
  }

  if (unavailable.length > 0) {
    console.log('\n\n⚠️  不可用的Scraper:');
    unavailable.forEach(r => {
      console.log(`\n  ${r.name}`);
      console.log(`  原因: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📝 下一步操作:\n');
  
  if (available.length > 0) {
    console.log('1. 代码已更新为自动尝试可用的scraper');
    console.log('2. 重新启动开发服务器: npm run dev');
    console.log('3. 测试爬取功能');
  } else {
    console.log('1. 访问 https://apify.com/store');
    console.log('2. 搜索 "YouTube Scraper"');
    console.log('3. 选择一个免费的scraper');
    console.log('4. 在 lib/apify.ts 中更新scraper名称');
  }
  
  console.log('\n💰 提示: 大多数YouTube scraper需要Apify付费计划或信用额度');
  console.log('   访问 https://apify.com/pricing 查看价格\n');
}

main().catch(console.error);
