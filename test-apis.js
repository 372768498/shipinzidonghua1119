// 测试Apify和Gemini API配置
require('dotenv').config({ path: '.env.local' })
const { ApifyClient } = require('apify-client')
const { GoogleGenerativeAI } = require('@google/generative-ai')

async function testApify() {
  console.log('\n🔍 测试Apify配置...\n')

  const apiKey = process.env.APIFY_API_KEY

  if (!apiKey) {
    console.error('❌ APIFY_API_KEY 未配置！')
    console.log('请在 .env.local 中添加：')
    console.log('APIFY_API_KEY=your_apify_api_key')
    return false
  }

  console.log('✅ API密钥已配置')
  console.log(`   密钥前缀: ${apiKey.substring(0, 15)}...`)

  try {
    const client = new ApifyClient({ token: apiKey })

    // 测试：获取账户信息
    console.log('\n📊 获取账户信息...')
    const user = await client.user().get()
    console.log(`✅ 账户: ${user.username}`)
    console.log(`   邮箱: ${user.email}`)

    // 测试：列出可用的Actors
    console.log('\n📋 检查可用的Actors...')
    const actors = await client.actors().list()
    console.log(`✅ 可访问 ${actors.total} 个Actors`)

    // 测试：运行一个简单的测试Actor
    console.log('\n🧪 测试运行TikTok Scraper...')
    console.log('   （这可能需要1-2分钟）')

    const run = await client.actor('clockworks/tiktok-scraper').call({
      hashtags: ['test'],
      resultsPerPage: 1,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
    })

    console.log(`✅ Actor运行成功！`)
    console.log(`   Run ID: ${run.id}`)
    console.log(`   状态: ${run.status}`)

    // 获取结果
    const { items } = await client.dataset(run.defaultDatasetId).listItems()
    console.log(`✅ 获取到 ${items.length} 条数据`)

    if (items.length > 0) {
      console.log('\n示例数据:')
      console.log('   标题:', items[0].text?.substring(0, 50))
      console.log('   作者:', items[0].authorMeta?.nickName)
      console.log('   播放量:', items[0].playCount)
    }

    return true
  } catch (error) {
    console.error('\n❌ Apify测试失败:', error.message)
    console.log('\n可能的原因:')
    console.log('1. API密钥无效')
    console.log('2. 账户配额已用完')
    console.log('3. 网络连接问题')
    console.log('\n请访问 https://console.apify.com 检查你的账户')
    return false
  }
}

async function testGemini() {
  console.log('\n\n🤖 测试Google Gemini配置...\n')

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY

  if (!apiKey) {
    console.error('❌ GOOGLE_GEMINI_API_KEY 未配置！')
    console.log('请在 .env.local 中添加：')
    console.log('GOOGLE_GEMINI_API_KEY=your_gemini_api_key')
    return false
  }

  console.log('✅ API密钥已配置')
  console.log(`   密钥前缀: ${apiKey.substring(0, 15)}...`)

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    console.log('\n🧪 测试生成内容...')
    const result = await model.generateContent('Say hello in Chinese')
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini响应成功！')
    console.log(`   回复: ${text}`)

    return true
  } catch (error) {
    console.error('\n❌ Gemini测试失败:', error.message)
    console.log('\n可能的原因:')
    console.log('1. API密钥无效')
    console.log('2. API配额已用完')
    console.log('3. 地区限制（中国大陆需要VPN）')
    console.log('\n请访问 https://makersuite.google.com/app/apikey 检查你的密钥')
    return false
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('  Jilo.ai API配置测试')
  console.log('='.repeat(60))

  const apifyOk = await testApify()
  const geminiOk = await testGemini()

  console.log('\n' + '='.repeat(60))
  console.log('📊 测试结果总结')
  console.log('='.repeat(60))
  console.log(`Apify:  ${apifyOk ? '✅ 正常' : '❌ 失败'}`)
  console.log(`Gemini: ${geminiOk ? '✅ 正常' : '❌ 失败'}`)
  console.log('='.repeat(60))

  if (apifyOk && geminiOk) {
    console.log('\n🎉 所有API都配置正确！可以开始爬取了！')
  } else {
    console.log('\n⚠️  请修复上述问题后再试')
  }
}

main().catch(console.error)
