#!/usr/bin/env node

/**
 * 检查Google Gemini API可用的所有模型
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ 错误: 未找到GOOGLE_GEMINI_API_KEY环境变量');
  console.log('\n请在.env文件中设置:');
  console.log('GOOGLE_GEMINI_API_KEY=your_api_key_here\n');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

console.log('🔍 正在检查你的API Key可访问的所有Gemini模型...\n');
console.log('='.repeat(80));

async function listAllModels() {
  try {
    // 获取所有可用模型
    const models = await genAI.listModels();
    
    if (models.length === 0) {
      console.log('⚠️  未找到任何可用模型');
      console.log('可能原因：');
      console.log('1. API Key无效');
      console.log('2. API Key没有访问权限');
      console.log('3. 需要在Google AI Studio中申请模型访问权限');
      return;
    }

    console.log(`\n✅ 找到 ${models.length} 个可用模型:\n`);

    // 按版本分组
    const gemini3Models = [];
    const gemini25Models = [];
    const gemini2Models = [];
    const gemini15Models = [];
    const otherModels = [];

    models.forEach(model => {
      const name = model.name.replace('models/', '');
      
      if (name.includes('gemini-3') || name.includes('gemini3')) {
        gemini3Models.push(model);
      } else if (name.includes('gemini-2.5') || name.includes('gemini2.5')) {
        gemini25Models.push(model);
      } else if (name.includes('gemini-2.0') || name.includes('gemini2.0') || name.includes('gemini-2')) {
        gemini2Models.push(model);
      } else if (name.includes('gemini-1.5') || name.includes('gemini1.5')) {
        gemini15Models.push(model);
      } else {
        otherModels.push(model);
      }
    });

    // 显示Gemini 3.0模型（最重要）
    if (gemini3Models.length > 0) {
      console.log('🔥 Gemini 3.0 系列模型:');
      console.log('-'.repeat(80));
      gemini3Models.forEach(model => {
        const name = model.name.replace('models/', '');
        console.log(`\n  ✅ ${name}`);
        console.log(`     显示名: ${model.displayName}`);
        console.log(`     描述: ${model.description || '无描述'}`);
        console.log(`     支持方法: ${model.supportedGenerationMethods.join(', ')}`);
      });
      console.log('\n');
    } else {
      console.log('❌ 未找到Gemini 3.0模型');
      console.log('   你的API Key可能没有访问权限\n');
    }

    // 显示Gemini 2.5模型
    if (gemini25Models.length > 0) {
      console.log('⭐ Gemini 2.5 系列模型:');
      console.log('-'.repeat(80));
      gemini25Models.forEach(model => {
        const name = model.name.replace('models/', '');
        console.log(`\n  ✅ ${name}`);
        console.log(`     显示名: ${model.displayName}`);
        console.log(`     支持方法: ${model.supportedGenerationMethods.join(', ')}`);
      });
      console.log('\n');
    }

    // 显示Gemini 2.0模型
    if (gemini2Models.length > 0) {
      console.log('💫 Gemini 2.0 系列模型:');
      console.log('-'.repeat(80));
      gemini2Models.forEach(model => {
        const name = model.name.replace('models/', '');
        console.log(`\n  ✅ ${name}`);
        console.log(`     显示名: ${model.displayName}`);
        console.log(`     支持方法: ${model.supportedGenerationMethods.join(', ')}`);
      });
      console.log('\n');
    }

    // 显示Gemini 1.5模型
    if (gemini15Models.length > 0) {
      console.log('📦 Gemini 1.5 系列模型:');
      console.log('-'.repeat(80));
      gemini15Models.forEach(model => {
        const name = model.name.replace('models/', '');
        console.log(`\n  ✅ ${name}`);
        console.log(`     显示名: ${model.displayName}`);
        console.log(`     支持方法: ${model.supportedGenerationMethods.join(', ')}`);
      });
      console.log('\n');
    }

    // 显示其他模型
    if (otherModels.length > 0) {
      console.log('🔧 其他模型:');
      console.log('-'.repeat(80));
      otherModels.forEach(model => {
        const name = model.name.replace('models/', '');
        console.log(`\n  ✅ ${name}`);
        console.log(`     显示名: ${model.displayName}`);
      });
      console.log('\n');
    }

    console.log('='.repeat(80));
    console.log('\n📝 建议:');
    
    if (gemini3Models.length > 0) {
      const bestModel = gemini3Models[0].name.replace('models/', '');
      console.log(`\n✅ 推荐使用: ${bestModel}`);
      console.log('   这是你可用的最新最强Gemini 3.0模型！');
    } else if (gemini25Models.length > 0) {
      const bestModel = gemini25Models[0].name.replace('models/', '');
      console.log(`\n✅ 推荐使用: ${bestModel}`);
      console.log('   你的API Key暂时无法访问Gemini 3.0');
      console.log('   可能需要:');
      console.log('   1. 申请Gemini 3.0早期访问权限');
      console.log('   2. 升级API计划');
      console.log('   3. 等待公开发布');
    } else if (gemini2Models.length > 0) {
      const bestModel = gemini2Models[0].name.replace('models/', '');
      console.log(`\n✅ 推荐使用: ${bestModel}`);
    } else if (gemini15Models.length > 0) {
      const bestModel = gemini15Models[0].name.replace('models/', '');
      console.log(`\n✅ 推荐使用: ${bestModel}`);
    }

    console.log('\n💡 访问 https://ai.google.dev/gemini-api/docs/models/gemini 查看最新文档\n');

  } catch (error) {
    console.error('\n❌ 获取模型列表失败:', error.message);
    console.error('\n可能原因:');
    console.error('1. API Key无效或过期');
    console.error('2. 网络连接问题');
    console.error('3. API服务暂时不可用');
    console.error('\n完整错误:', error);
  }
}

listAllModels();
