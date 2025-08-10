# Personal Navigation Cloudflare Worker

这个Cloudflare Worker用于处理Personal Navigation应用的后端功能，包括认证和KV存储操作。

## 配置说明

1. 安装wrangler CLI（如果尚未安装）：
   ```bash
   npm install -g wrangler
   ```

2. 登录Cloudflare账号：
   ```bash
   wrangler login
   ```

3. 在wrangler.toml中配置你的Cloudflare区域ID和路由：
   ```toml
   [env.production]
   route = "your-domain.com/*"
   zone_id = "your-zone-id"
   ```

4. 创建KV命名空间并添加到配置：
   ```bash
   wrangler kv:namespace create "PERSONAL_NAVIGATION"
   ```
   然后将输出的ID添加到wrangler.toml：
   ```toml
   [[kv_namespaces]]
   binding = "PERSONAL_NAVIGATION"
   id = "your-kv-namespace-id"
   ```

## 本地开发

```bash
wrangler dev
```

## 部署到生产环境

```bash
wrangler publish --env production
```