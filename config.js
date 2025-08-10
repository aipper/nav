// 配置文件 - 只包含非敏感配置
// 敏感配置应存储在后端环境变量中
const config = {
  // GitHub OAuth配置（仅包含非敏感信息）
  github: {
    clientId: 'YOUR_GITHUB_CLIENT_ID', // 公开的clientId是安全的
    redirectUri: 'http://localhost:8000/callback.html',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user'
  },
  // Cloudflare配置（仅包含非敏感信息）
  cloudflare: {
    accountId: 'YOUR_CLOUDFLARE_ACCOUNT_ID', // 账户ID通常是公开的
    namespaceId: 'YOUR_CLOUDFLARE_KV_NAMESPACE_ID', // 命名空间ID通常是公开的
    apiBaseUrl: 'https://api.cloudflare.com/client/v4',
    workerBaseUrl: 'http://localhost:8787' // 开发环境Worker URL
  },
  // 应用配置
  app: {
    name: '个人导航系统',
    version: '1.0.0',
    debug: true
  }
};

export default config;