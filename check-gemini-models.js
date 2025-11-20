#!/usr/bin/env node

/**
 * 测试Gemini 3.0模型是否可用
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ 错误: 未找到GOOGLE_GEMINI_API_KEY环境变量');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

console.log('🔍 测试你的API Key能否访问Gemini 3.0...\n');
console.log('='.repeat(80));

// 要测试的模型列表（按优先级）
const modelsToTest = [
  // Gemini 3.0 可能的名称
  'gemini-3.0-pro',
  'gemini-3.0-pro-preview',
  'gemini-3-pro',
  'gemini-3.0-flash',
  'models/gemini-3.0-pro',
  'models/gemini-3.0-pro-preview',
  
  // Gemini 2.5
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  
  // Gemini 2.0
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash',
  
  // Gemini 1.5 (肯定能用)
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

async function testModel(modelName) {
  try {
    console.log(`\n🧪 测试: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // 发送一个简单的测试请求
    const result = await model.generateContent('Say "Hello" in JSON format: {"message": "..."}');
    const response = await result.response;
    const text = response.text();
    
    console.log(`   ✅ 可用！`);
    console.log(`   响应: ${text.substring(0, 50)}...`);
    
    return { modelName, available: true, response: text };
  } catch (error) {
    console.log(`   ❌ 不可用`);
    console.log(`   错误: ${error.message.substring(0, 100)}`);
    
    return { modelName, available: false, error: error.message };
  }
}

async function testAllModels() {
  const results = [];
  
  for (const modelName of modelsToTest) {
    const result = await testModel(modelName);
    results.push(result);
    
    // 如果找到了Gemini 3.0，立即报告
    if (result.available && modelName.includes('3')) {
      console.log('\n\n' + '='.repeat(80));
      console.log('🎉🎉🎉 找到可用的Gemini 3.0模型！🎉🎉🎉');
      console.log('='.repeat(80));
      console.log(`\n✅ 模型名称: ${result.modelName}`);
      console.log('\n💡 我会立即更新代码使用这个模型！');
      break;
    }
    
    // 避免API限流
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(80));
  
  const available = results.filter(r => r.available);
  const unavailable = results.filter(r => !r.available);
  
  console.log(`\n✅ 可用模型 (${available.length}个):`);
  available.forEach(r => {
    console.log(`   • ${r.modelName}`);
  });
  
  console.log(`\n❌ 不可用模型 (${unavailable.length}个):`);
  unavailable.forEach(r => {
    console.log(`   • ${r.modelName}`);
  });
  
  if (available.length > 0) {
    const best = available[0];
    console.log('\n\n' + '='.repeat(80));
    console.log('🏆 推荐使用');
    console.log('='.repeat(80));
    console.log(`\n模型: ${best.modelName}`);
    
    if (best.modelName.includes('3')) {
      console.log('版本: Gemini 3.0 ⭐⭐⭐ (最新最强！)');
    } else if (best.modelName.includes('2.5')) {
      console.log('版本: Gemini 2.5 ⭐⭐ (很强，但不是最新)');
    } else if (best.modelName.includes('2')) {
      console.log('版本: Gemini 2.0 ⭐');
    } else {
      console.log('版本: Gemini 1.5 (稳定版本)');
    }
    
    console.log('\n');
  } else {
    console.log('\n\n❌ 未找到任何可用模型！');
    console.log('可能原因:');
    console.log('1. API Key无效');
    console.log('2. 网络代理配置问题');
    console.log('3. API配额用尽');
  }
}

testAllModels().catch(console.error);
