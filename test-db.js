const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase connection...')
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
console.log('Key:', supabaseKey ? '✅ Found' : '❌ Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // 测试查询
    const { data, error } = await supabase
      .from('viral_videos')
      .select('*')
      .limit(3)
    
    if (error) {
      console.error('❌ 连接失败:', error.message)
      return
    }
    
    console.log('✅ 连接成功！')
    console.log(`📊 找到 ${data.length} 条测试数据`)
    
    if (data.length > 0) {
      console.log('\n示例数据:')
      console.log('- 标题:', data[0].title)
      console.log('- 平台:', data[0].platform)
      console.log('- 播放量:', data[0].views)
    }
  } catch (err) {
    console.error('❌ 错误:', err.message)
  }
}

testConnection()