# GitHub Actions 错误修复指南

## 🔍 问题分析

GitHub Actions 失败的原因：
1. KV命名空间ID未配置（仍然是`your-kv-namespace-id`占位符）
2. GitHub Secrets未设置或配置错误

## 🚀 快速修复步骤

### 步骤1：创建KV命名空间并获取真实ID

```bash
# 在worker目录下执行
cd worker

# 创建生产环境的KV命名空间
wrangler kv:namespace create "PERSONAL_NAVIGATION"

# 输出示例：
# 🌀 Creating namespace with title "personal-navigation-worker-PERSONAL_NAVIGATION"
# ✨ Success!
# Add the following to your wrangler.toml:
# [[kv_namespaces]]
# binding = "PERSONAL_NAVIGATION"
# id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 创建预览环境的KV命名空间（用于GitHub Actions）
wrangler kv:namespace create "PERSONAL_NAVIGATION" --preview

# 输出示例：
# 🌀 Creating namespace with title "personal-navigation-worker-PERSONAL_NAVIGATION_preview"
# ✨ Success!
# Add the following to your wrangler.toml:
# [[kv_namespaces]]
# binding = "PERSONAL_NAVIGATION"
# preview_id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
```

### 步骤2：更新wrangler.toml配置

将上一步获取的真实ID替换到wrangler.toml：

```toml
# wrangler.toml 更新后的配置
name = "personal-navigation-worker"
main = "./worker.js"
compatibility_date = "2025-08-10"

# 使用真实ID替换下面的占位符
[[kv_namespaces]]
binding = "PERSONAL_NAVIGATION"
id = "你的真实KV命名空间ID"
preview_id = "你的预览环境KV命名空间ID"

# 生产环境配置
[env.production]
name = "personal-navigation-worker"
[env.production.vars]
CF_GITHUB_CLIENT_ID = ""  # 将通过GitHub Secrets设置
CF_GITHUB_CLIENT_SECRET = ""  # 将通过GitHub Secrets设置
CF_GITHUB_REDIRECT_URI = "https://personal-navigation-worker.your-subdomain.workers.dev/callback.html"
```

### 步骤3：配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

1. 打开GitHub仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret" 添加：

```
# 必需的环境变量
CLOUDFLARE_API_TOKEN=你的Cloudflare API令牌
CLOUDFLARE_ACCOUNT_ID=你的Cloudflare账户ID
CF_GITHUB_CLIENT_ID=你的GitHub OAuth应用Client ID
CF_GITHUB_CLIENT_SECRET=你的GitHub OAuth应用Client Secret
CF_GITHUB_REDIRECT_URI=https://personal-navigation-worker.你的子域名.workers.dev/callback.html
```

### 步骤4：获取Cloudflare配置

#### 获取API Token：
1. 登录Cloudflare控制台
2. 右上角头像 → My Profile → API Tokens → Create Token
3. 选择 "Custom token"，配置：
   - Permissions: Cloudflare Workers → Edit
   - Account Resources: Include → Your Account
   - Zone Resources: Include → All zones (或特定域名)

#### 获取Account ID：
- 在Cloudflare控制台右侧边栏可以找到

### 步骤5：创建GitHub OAuth应用

1. GitHub Settings → Developer settings → OAuth Apps
2. 点击 "New OAuth App"
3. 填写：
   - Application name: Personal Navigation Worker
   - Homepage URL: https://personal-navigation-worker.你的子域名.workers.dev
   - Authorization callback URL: https://personal-navigation-worker.你的子域名.workers.dev/callback.html

## 🔄 验证修复

完成上述步骤后：

1. 提交配置更改：
```bash
git add worker/wrangler.toml
git commit -m "Fix GitHub Actions configuration"
git push origin main
```

2. 查看GitHub Actions日志确认成功

## 📋 常见问题排查

如果仍然失败，检查：
- [ ] KV命名空间ID是否正确替换
- [ ] 所有GitHub Secrets是否已设置
- [ ] Cloudflare API Token权限是否正确
- [ ] GitHub OAuth应用回调URL是否正确

## 🆘 获取帮助

如果问题持续：
1. 查看GitHub Actions的详细日志
2. 检查Cloudflare控制台中的Workers日志
3. 验证本地 `wrangler deploy --env production` 是否成功