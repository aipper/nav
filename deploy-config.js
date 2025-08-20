// 部署配置工具
// 用于根据不同环境自动更新配置

const fs = require('fs');
const path = require('path');

// 环境映射
const environments = {
  development: {
    workerBaseUrl: 'http://localhost:8787',
    githubRedirectUri: 'http://localhost:8000/callback.html'
  },
  production: {
    workerBaseUrl: 'https://personal-navigation-worker.your-subdomain.workers.dev',
    githubRedirectUri: 'https://personal-navigation-worker.your-subdomain.workers.dev/callback.html'
  }
};

function updateConfig(env = 'development') {
  const config = environments[env] || environments.development;
  
  // 更新config.js
  const configPath = path.join(__dirname, 'config.js');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  configContent = configContent.replace(
    /workerBaseUrl: ['"`].*?['"`]/,
    `workerBaseUrl: '${config.workerBaseUrl}'`
  );
  
  configContent = configContent.replace(
    /redirectUri: ['"`].*?['"`]/,
    `redirectUri: '${config.githubRedirectUri}'`
  );
  
  fs.writeFileSync(configPath, configContent);
  console.log(`✅ 已更新配置为 ${env} 环境`);
  console.log(`   Worker URL: ${config.workerBaseUrl}`);
  console.log(`   GitHub重定向: ${config.githubRedirectUri}`);
}

// 从命令行获取环境参数
const env = process.argv[2] || 'development';
updateConfig(env);