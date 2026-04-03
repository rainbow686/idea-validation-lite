/**
 * 简单的测试脚本 - 验证创意生成器 API
 *
 * 使用方法：
 * 1. 确保开发服务器运行在 localhost:3000
 * 2. 运行：node src/app/api/generate-ideas/route.test.js
 */

const BASE_URL = 'http://localhost:3000'

async function testEndpoint() {
  console.log('=== 创意生成器 API 测试 ===\n')

  // 测试 1: GET 健康检查
  console.log('测试 1: GET 健康检查...')
  try {
    const getResponse = await fetch(`${BASE_URL}/api/generate-ideas`, {
      method: 'GET',
    })
    const getData = await getResponse.json()
    console.log('  状态:', getResponse.status)
    console.log('  响应:', getData)
    console.log('  ✓ GET 请求成功\n')
  } catch (error) {
    console.log('  ✗ GET 请求失败:', error.message)
    console.log('  提示：确保开发服务器正在运行 (npm run dev)\n')
    return false
  }

  // 测试 2: POST 生成创意（无过滤）
  console.log('测试 2: POST 生成创意（无过滤）...')
  try {
    const postResponse = await fetch(`${BASE_URL}/api/generate-ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const postData = await postResponse.json()
    console.log('  状态:', postResponse.status)

    if (postData.success) {
      console.log('  ✓ 生成成功')
      console.log('  创意数量:', postData.data.length)

      if (postData.data.length > 0) {
        const firstIdea = postData.data[0]
        console.log('\n  第一个创意示例:')
        console.log('    标题:', firstIdea.title)
        console.log('    描述:', firstIdea.description.substring(0, 50) + '...')
        console.log('    行业:', firstIdea.industry)
        console.log('    目标用户:', firstIdea.targetUser)
        console.log('    痛点:', firstIdea.painPoint)
        console.log('    盈利模式:', firstIdea.revenueModel)
        console.log('    难度:', firstIdea.difficultyScore)
      }

      // 验证数据结构
      const requiredFields = ['title', 'description', 'industry', 'targetUser', 'painPoint', 'revenueModel', 'difficultyScore']
      const hasAllFields = requiredFields.every(field =>
        postData.data.every(idea => idea[field] !== undefined)
      )
      console.log('\n  字段完整性:', hasAllFields ? '✓ 所有必需字段存在' : '✗ 缺少字段')

      // 验证难度分数范围
      const validScores = postData.data.every(idea =>
        idea.difficultyScore >= 1 && idea.difficultyScore <= 10
      )
      console.log('  难度分数范围:', validScores ? '✓ 1-10 范围内' : '✗ 超出范围')

    } else {
      console.log('  ✗ 生成失败:', postData.error)
    }
  } catch (error) {
    console.log('  ✗ POST 请求失败:', error.message)
    return false
  }

  // 测试 3: POST 生成创意（有行业过滤）
  console.log('\n测试 3: POST 生成创意（AI 行业过滤）...')
  try {
    const postResponse = await fetch(`${BASE_URL}/api/generate-ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry: 'AI/人工智能' }),
    })
    const postData = await postResponse.json()
    console.log('  状态:', postResponse.status)

    if (postData.success) {
      console.log('  ✓ 生成成功')
      console.log('  创意数量:', postData.data.length)

      // 检查是否所有创意都属于 AI 行业
      const allAiRelated = postData.data.every(idea =>
        idea.industry.includes('AI') || idea.industry.includes('人工')
      )
      console.log('  AI 相关:', allAiRelated ? '✓ 所有创意都是 AI 相关' : '~ 部分创意可能不相关')
    } else {
      console.log('  ✗ 生成失败:', postData.error)
    }
  } catch (error) {
    console.log('  ✗ POST 请求失败:', error.message)
  }

  console.log('\n=== 测试完成 ===')
  return true
}

// 运行测试
testEndpoint().then(success => {
  if (!success) {
    console.log('\n提示：请确保开发服务器正在运行 (npm run dev)')
    process.exit(1)
  }
  process.exit(0)
}).catch(error => {
  console.error('测试执行失败:', error)
  process.exit(1)
})
