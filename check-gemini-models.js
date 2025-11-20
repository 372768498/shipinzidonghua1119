#!/usr/bin/env node

/**
 * 检查Google Gemini可用模型
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ 错误: 未找到GOOGLE_GEMINI_API_KEY环境变量');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function checkModels() {
  console.log('🔍 检查你的账户可用的所有Gemini模型...\n');
  console.log('='.repeat(60));
  
  try {
    // 方法1: 尝试列出所有模型（可能不支持）
    try {
      const models = await genAI.listModels();
      console.log('\n✅ 找到以下模型：\n');
      
      models.forEach(model => {
        console.log(`📦 ${model.name}`);
        console.log(`   显示名: ${model.displayName}`);
        if (model.description) {
          console.log(`   描述: ${model.description}`);
        }
        console.log(`   支持方法: ${model.supportedGenerationMethods?.join(', ') || '未知'}`);
        console.log('');
      });
    } catch (e) {
      console.log('ℹ️  listModels API不可用，使用手动测试方法\n');
    }
    
    // 方法2: 手动测试常见模型
    console.log('\n' + '='.repeat(60));
    console.log('🧪 手动测试常见模型...\n');
    
    const testModels = [
      'gemini-3.0-pro',
      'gemini-3.0-pro-preview',
      'gemini-3-pro',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
    ];
    
    const availableModels = [];
    
    for (const modelName of testModels) {
      process.stdout.write(`测试 ${modelName}... `);
      
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('测试');
        const response = await result.response;
        
        if (response.text()) {
          console.log('✅ 可用');
          availableModels.push(modelName);
        }
      } catch (error) {
        if (error.status === 404) {
          console.log('❌ 不存在');
        } else if (error.status === 403) {
          console.log('⚠️  需要权限');
        } else {
          console.log(`❌ 错误: ${error.message}`);
        }
      }
      
      // 避免触发限流
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 测试结果汇总:\n');
    
    if (availableModels.length > 0) {
      console.log('✅ 可用的模型:');
      availableModels.forEach(model => {
        console.log(`   - ${model}`);
      });
      
      console.log('\n💡 推荐使用: ' + availableModels[0]);
    } else {
      console.log('❌ 未找到任何可用的模型');
      console.log('\n可能的原因:');
      console.log('1. API密钥无效');
      console.log('2. 账户没有访问权限');
      console.log('3. 需要等待Google开放新模型');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📝 关于Gemini 3.0:');
    console.log('- 如果Gemini 3.0显示"不存在"，说明Google还未公开发布API');
    console.log('- 新模型通常先对部分用户开放，然后逐步推广');
    console.log('- 建议使用测试中显示"可用"的最新模型');
    console.log('- 访问 https://ai.google.dev 查看最新文档\n');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkModels().catch(console.error);
