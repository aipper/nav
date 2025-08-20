# 个人导航页 - Personal Navigation

一个现代化的个人导航页面，支持书签导入、GitHub OAuth认证和响应式设计。部署在Cloudflare Workers上，支持GitHub Actions自动部署。

## ✨ 功能特性

- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🔐 **GitHub OAuth认证** - 安全的用户认证系统
- 📂 **书签导入** - 支持从浏览器书签文件批量导入
- 🔍 **智能搜索** - 实时搜索和分类筛选
- 🎨 **现代化UI** - 采用玻璃拟态设计风格
- ⚡ **高性能** - 基于Cloudflare Workers的边缘计算
- 🚀 **自动部署** - GitHub Actions实现一键部署

## 🚀 快速开始

### 一键部署（推荐）

1. **Fork此仓库**到你的GitHub账户
2. **配置Cloudflare**：
   - 获取[Cloudflare API Token](https://dash.cloudflare.com/profile/api-tokens)
   - 获取[Cloudflare Account ID](https://dash.cloudflare.com/)
3. **配置GitHub Secrets**：在仓库设置中添加以下Secrets：
   - `CLOUDFLARE_API_TOKEN`: 你的Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID`: 你的Cloudflare账户ID
   - `CF_GITHUB_CLIENT_ID`: GitHub OAuth应用的Client ID
   - `CF_GITHUB_CLIENT_SECRET`: GitHub OAuth应用的Client Secret
   - `CF_GITHUB_REDIRECT_URI`: 重定向URI（如：https://your-worker.your-subdomain.workers.dev/auth/callback）

4. **创建KV命名空间**：
```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 创建KV命名空间
wrangler kv:namespace create "PERSONAL_NAV_KV"
wrangler kv:namespace create "PERSONAL_NAV_KV" --preview

# 获取命名空间ID并更新wrangler.toml
```

5. **推送代码**：推送任意更改到`main`分支将自动触发部署

### 手动部署

1. **本地开发**：
```bash
# 克隆项目
git clone <your-repo-url>
cd personal-navigation-with-import

# 进入worker目录
cd worker

# 安装依赖
npm install

# 本地开发
npm run dev
```

2. **配置环境变量**：
```bash
# 复制环境变量模板
cp wrangler.toml.example wrangler.toml

# 编辑wrangler.toml，填入你的配置
```

3. **部署到生产环境**：
```bash
# 部署
npm run deploy
```

## 📋 配置指南

### GitHub OAuth应用设置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的OAuth应用
3. 设置Authorization callback URL为：
   - 开发环境：`http://localhost:8787/auth/callback`
   - 生产环境：`https://your-worker.your-subdomain.workers.dev/auth/callback`

### 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | 从Cloudflare控制台获取 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare账户ID | 从Cloudflare控制台获取 |
| `CF_GITHUB_CLIENT_ID` | GitHub OAuth应用ID | 从GitHub OAuth应用获取 |
| `CF_GITHUB_CLIENT_SECRET` | GitHub OAuth应用密钥 | 从GitHub OAuth应用获取 |
| `CF_GITHUB_REDIRECT_URI` | OAuth重定向URI | `https://xxx.workers.dev/auth/callback` |

### KV命名空间配置

项目使用Cloudflare KV存储用户数据。需要创建两个命名空间：

1. **生产环境**：`PERSONAL_NAV_KV`
2. **预览环境**：`PERSONAL_NAV_KV_PREVIEW`

创建命令：
```bash
wrangler kv:namespace create "PERSONAL_NAV_KV"
wrangler kv:namespace create "PERSONAL_NAV_KV" --preview
```

## 🛠️ 开发指南

### 项目结构
```
personal-navigation-with-import/
├── .github/workflows/     # GitHub Actions工作流
├── worker/               # Cloudflare Workers代码
│   ├── worker.js        # 主Worker文件
│   ├── wrangler.toml    # Wrangler配置
│   └── package.json     # Worker依赖
├── index.html           # 主页
├── main.js             # 前端主逻辑
├── auth.js             # 认证相关
├── config.js           # 配置文件
└── ...
```

### 本地开发

1. **启动Worker开发服务器**：
```bash
cd worker
npm run dev
```

2. **启动前端开发服务器**（可选）：
```bash
# 使用任何静态服务器
npx serve .
```

3. **访问应用**：
   - Worker API: http://localhost:8787
   - 前端页面: http://localhost:3000

### 部署验证

部署完成后，可以通过以下方式验证：

1. **检查GitHub Actions**：查看Actions选项卡确认部署成功
2. **验证Worker**：访问`https://your-worker.your-subdomain.workers.dev`
3. **测试功能**：
   - 尝试GitHub登录
   - 导入书签文件
   - 添加新导航项

## 🔧 故障排除

### 常见问题

**Q: GitHub Actions部署失败**
A: 检查以下几点：
- 确认所有必需的Secrets已配置
- 验证Cloudflare API Token权限
- 检查KV命名空间ID是否正确配置在wrangler.toml中

**Q: GitHub OAuth登录失败**
A: 检查以下几点：
- 确认OAuth应用的Authorization callback URL设置正确
- 验证Client ID和Client Secret是否正确
- 检查重定向URI是否与配置一致

**Q: KV存储访问失败**
A: 检查以下几点：
- 确认KV命名空间已正确创建
- 验证wrangler.toml中的命名空间ID是否正确
- 检查Worker是否有权限访问KV

### 调试工具

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **GitHub Actions日志**: 仓库的Actions选项卡
- **Wrangler CLI**: `wrangler tail` 查看实时日志

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如有问题，请在GitHub上创建Issue或联系维护者。