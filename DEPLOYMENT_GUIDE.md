# Cloudflare Worker 部署指南

## 部署前必须完成的配置

### 1. 创建KV命名空间
```bash
cd worker
wrangler kv:namespace create "PERSONAL_NAVIGATION"
```

执行后会得到类似输出：
```
🌀 Creating namespace with title "personal-navigation-worker-PERSONAL_NAVIGATION"
✨ Success!
Add the following to your wrangler.toml:
kv_namespaces = [
  { binding = "PERSONAL_NAVIGATION", id = "实际生成的ID" }
]
```

### 2. 配置生产环境域名

#### 选项A：使用自定义域名
1. 在Cloudflare控制台添加你的域名
2. 获取Zone ID：在域名概览页面右侧
3. 更新wrangler.toml：
```toml
[env.production]
route = "your-domain.com/*"
zone_id = "your-actual-zone-id"
```

#### 选项B：使用workers.dev子域名（更简单）
```toml
[env.production]
name = "personal-navigation-worker"
# 移除route和zone_id，会自动使用your-worker.your-subdomain.workers.dev
```

### 3. 配置GitHub OAuth应用

1. 访问 https://github.com/settings/developers
2. 创建新的OAuth App
3. 设置回调URL：
   - 开发环境：`http://localhost:8000/callback.html`
   - 生产环境：`https://your-domain.com/callback.html`
4. 获取Client ID和Client Secret
5. 更新wrangler.toml：
```toml
[env.production.vars]
CF_GITHUB_CLIENT_ID = "你的实际client-id"
CF_GITHUB_CLIENT_SECRET = "你的实际client-secret"
CF_GITHUB_REDIRECT_URI = "https://your-domain.com/callback.html"
```

### 两种部署方式

### 方式1：GitHub自动部署（推荐）

项目已配置GitHub Actions，支持自动部署：

#### 1. 准备GitHub仓库
```bash
# 初始化git仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 创建GitHub仓库并推送
git remote add origin https://github.com/yourusername/personal-navigation-worker.git
git push -u origin main
```

#### 2. 配置GitHub Secrets
在GitHub仓库设置中添加以下Secrets：
- `CLOUDFLARE_API_TOKEN`: 你的Cloudflare API令牌
- `CLOUDFLARE_ACCOUNT_ID`: 你的Cloudflare账户ID
- `CF_GITHUB_CLIENT_ID`: GitHub OAuth应用的Client ID
- `CF_GITHUB_CLIENT_SECRET`: GitHub OAuth应用的Client Secret
- `CF_GITHUB_REDIRECT_URI`: 生产环境的重定向URL

#### 3. 创建KV命名空间
```bash
cd worker
wrangler kv:namespace create "PERSONAL_NAVIGATION"
# 将返回的ID更新到wrangler.toml
```

#### 4. 自动部署
每次推送到main分支都会自动触发部署。

### 方式2：手动部署

#### 1. 创建KV命名空间
```bash
cd worker
wrangler kv:namespace create "PERSONAL_NAVIGATION"
# 复制返回的ID并更新wrangler.toml
```

#### 2. 配置环境变量
```bash
# 设置生产环境变量
wrangler secret put CF_GITHUB_CLIENT_ID --env production
wrangler secret put CF_GITHUB_CLIENT_SECRET --env production
wrangler secret put CF_GITHUB_REDIRECT_URI --env production
```

#### 3. 部署
```bash
wrangler deploy --env production
```

## 快速部署检查清单

### GitHub自动部署
- [ ] 项目已推送到GitHub
- [ ] 已创建KV命名空间
- [ ] 已配置GitHub Secrets
- [ ] 已创建GitHub OAuth应用
- [ ] wrangler.toml中的占位符已更新

### 手动部署
- [ ] 已创建KV命名空间并获取ID
- [ ] 已配置生产域名或workers.dev子域名
- [ ] 已创建GitHub OAuth应用并获取凭据
- [ ] 已更新wrangler.toml中的所有占位符
- [ ] 已测试本地wrangler dev运行正常

## 部署验证

部署成功后：
1. 访问自动生成的URL：
   - GitHub Actions: `https://personal-navigation-worker.your-subdomain.workers.dev`
   - 手动部署: 根据配置的域名
2. 测试GitHub登录流程
3. 验证KV存储功能

## 获取Cloudflare配置

1. **API Token**: Cloudflare控制台 → My Profile → API Tokens → Create Token
2. **Account ID**: Cloudflare控制台 → 右侧边栏
3. **KV命名空间**: `wrangler kv:namespace create "PERSONAL_NAVIGATION"