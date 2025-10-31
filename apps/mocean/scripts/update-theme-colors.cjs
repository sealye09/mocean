#!/usr/bin/env node

/**
 * 主题颜色自动替换脚本
 *
 * 该脚本会扫描指定目录下的所有 TypeScript/React 文件，
 * 并将硬编码的颜色类名替换为主题色变量
 *
 * 使用方法:
 *   node scripts/update-theme-colors.js [目标目录]
 *
 * 示例:
 *   node scripts/update-theme-colors.js apps/mocean/app
 */

const fs = require('fs');
const path = require('path');

// 颜色替换映射表
const COLOR_REPLACEMENTS = [
  // 渐变背景替换
  {
    pattern: /bg-gradient-to-br from-blue-500 to-purple-600/g,
    replacement: 'bg-gradient-brand',
    description: '品牌默认渐变'
  },
  {
    pattern: /bg-gradient-to-r from-blue-500 to-purple-600/g,
    replacement: 'bg-gradient-brand',
    description: '品牌默认渐变（水平）'
  },
  {
    pattern: /bg-gradient-to-br from-purple-500 to-purple-700/g,
    replacement: 'bg-gradient-brand-active',
    description: '品牌激活状态渐变'
  },
  {
    pattern: /bg-gradient-to-br from-green-500 to-teal-600/g,
    replacement: 'bg-gradient-success',
    description: '成功状态渐变'
  },

  // 悬停状态渐变
  {
    pattern: /hover:from-blue-600 hover:to-purple-700/g,
    replacement: 'hover:bg-gradient-brand-active',
    description: '悬停状态渐变'
  },

  // 文本颜色替换
  {
    pattern: /text-blue-500(?!\d)/g,
    replacement: 'text-info',
    description: '信息文本色'
  },
  {
    pattern: /text-blue-600(?!\d)/g,
    replacement: 'text-info',
    description: '信息文本色'
  },
  {
    pattern: /text-blue-700(?!\d)/g,
    replacement: 'text-info',
    description: '信息文本色（深）'
  },
  {
    pattern: /text-purple-600(?!\d)/g,
    replacement: 'text-brand-primary',
    description: '品牌文本色'
  },
  {
    pattern: /text-purple-700(?!\d)/g,
    replacement: 'text-brand-primary',
    description: '品牌文本色（深）'
  },
  {
    pattern: /text-green-600(?!\d)/g,
    replacement: 'text-success',
    description: '成功文本色'
  },

  // 背景色替换
  {
    pattern: /bg-blue-100 text-blue-700 dark:bg-blue-900\/30 dark:text-blue-300/g,
    replacement: 'bg-info/10 text-info dark:bg-info/20 dark:text-info-foreground',
    description: '信息背景色（带暗黑模式）'
  },
  {
    pattern: /bg-blue-100 text-blue-700/g,
    replacement: 'bg-info/10 text-info',
    description: '信息背景色'
  },
  {
    pattern: /border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900\/30 dark:text-blue-300/g,
    replacement: 'border-info/20 bg-info/10 text-info dark:border-info/30 dark:bg-info/20 dark:text-info-foreground',
    description: '信息边框和背景色（带暗黑模式）'
  },
  {
    pattern: /bg-purple-100 text-purple-600 dark:bg-purple-900\/30/g,
    replacement: 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20',
    description: '品牌背景色（带暗黑模式）'
  },
  {
    pattern: /bg-purple-100 text-purple-600/g,
    replacement: 'bg-brand-primary/10 text-brand-primary',
    description: '品牌背景色'
  },

  // 透明度背景
  {
    pattern: /bg-gradient-to-br from-blue-500\/10 to-purple-600\/10 text-blue-600/g,
    replacement: 'bg-brand-gradient-from/10 text-info',
    description: '品牌透明背景'
  },

  // Badge 特殊样式
  {
    pattern: /bg-white\/20 text-white/g,
    replacement: 'bg-white/20 text-white',
    description: 'Badge 白色半透明（保持不变）'
  },
];

// 统计信息
let stats = {
  filesScanned: 0,
  filesModified: 0,
  totalReplacements: 0,
  replacementsByType: {}
};

/**
 * 递归获取目录下所有文件
 * @param {string} dir - 目录路径
 * @param {string[]} fileList - 文件列表
 * @returns {string[]} 文件路径数组
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .next 等目录
      if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (/\.(tsx|jsx|ts|js)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 处理单个文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否修改了文件
 */
function processFile(filePath) {
  stats.filesScanned++;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileReplacements = 0;

  // 应用所有替换规则
  COLOR_REPLACEMENTS.forEach(rule => {
    const matches = content.match(rule.pattern);
    if (matches) {
      const count = matches.length;
      content = content.replace(rule.pattern, rule.replacement);
      fileReplacements += count;

      // 更新统计
      if (!stats.replacementsByType[rule.description]) {
        stats.replacementsByType[rule.description] = 0;
      }
      stats.replacementsByType[rule.description] += count;

      console.log(`  ✓ ${rule.description}: ${count} 处替换`);
    }
  });

  // 如果内容有变化，写入文件
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.filesModified++;
    stats.totalReplacements += fileReplacements;
    return true;
  }

  return false;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0] || 'apps/mocean/app';

  console.log('🎨 主题颜色自动替换工具\n');
  console.log(`📁 目标目录: ${targetDir}\n`);

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ 错误: 目录 "${targetDir}" 不存在`);
    process.exit(1);
  }

  // 获取所有文件
  console.log('📝 扫描文件...\n');
  const files = getAllFiles(targetDir);
  console.log(`找到 ${files.length} 个文件\n`);

  // 处理每个文件
  console.log('🔄 开始替换...\n');
  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    const modified = processFile(file);

    if (modified) {
      console.log(`\n✅ 已更新: ${relativePath}`);
    }
  });

  // 输出统计信息
  console.log('\n' + '='.repeat(60));
  console.log('📊 替换统计\n');
  console.log(`扫描文件数: ${stats.filesScanned}`);
  console.log(`修改文件数: ${stats.filesModified}`);
  console.log(`总替换次数: ${stats.totalReplacements}\n`);

  if (Object.keys(stats.replacementsByType).length > 0) {
    console.log('详细替换情况:');
    Object.entries(stats.replacementsByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  • ${type}: ${count} 次`);
      });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ 完成！\n');

  // 如果有修改，提醒用户
  if (stats.filesModified > 0) {
    console.log('⚠️  提醒:');
    console.log('  1. 请检查修改后的文件确保正确');
    console.log('  2. 建议使用 git diff 查看具体变化');
    console.log('  3. 测试应用以确保一切正常工作');
    console.log('  4. 确认无误后再提交代码\n');
  }
}

// 执行主函数
try {
  main();
} catch (error) {
  console.error('\n❌ 发生错误:', error.message);
  console.error(error.stack);
  process.exit(1);
}
