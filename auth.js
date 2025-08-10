// 用户认证和数据存储服务
// 引入配置文件
import config from './config.js';

class AuthService {
  constructor() {
    // 从配置文件加载非敏感配置
    this.githubConfig = {
      clientId: config.github.clientId,
      clientSecret: '', // 敏感信息 - 应从环境变量获取
      redirectUri: config.github.redirectUri,
      authUrl: config.github.authUrl,
      tokenUrl: config.github.tokenUrl,
      userInfoUrl: config.github.userInfoUrl
    };
    // Cloudflare KV配置
    this.cloudflareConfig = {
      accountId: config.cloudflare.accountId,
      namespaceId: config.cloudflare.namespaceId,
      apiToken: '', // 敏感信息 - 应从环境变量获取
      apiBaseUrl: config.cloudflare.apiBaseUrl
    };
    
    // 从环境变量加载敏感配置 (浏览器环境下可通过后端API获取)
    // 在生产环境中，这些值不应硬编码在前端代码中
    this.loadSensitiveConfig();
    
    // 数据存储客户端
    this.kvClient = null;
    // 用户信息
    this.user = null;
    // 初始化标志
    this.initialized = false;
  }

  // 加载敏感配置
  loadSensitiveConfig() {
    // 在开发环境中，可以从localStorage临时获取
    // 生产环境中应通过安全的后端API获取
    if (config.app.debug) {
      this.githubConfig.clientSecret = localStorage.getItem('githubClientSecret') || '';
      this.cloudflareConfig.apiToken = localStorage.getItem('cloudflareApiToken') || '';
    } else {
      // 生产环境逻辑 - 通过后端API获取
      // 这里只是示例，实际实现需要后端支持
      // this.fetchSensitiveConfigFromBackend();
    }
  }

  async init() {
    try {
      // 初始化KV存储客户端
      await this.initKVClient();
      // 检查用户登录状态
      await this.checkAuthStatus();
      this.initialized = true;
      console.log('认证服务初始化成功');
    } catch (error) {
      console.error('认证服务初始化失败:', error);
      throw error;
    }
  }

  // 从URL获取查询参数
  getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  async initKVClient() {
    // Cloudflare Worker KV客户端实现
    const workerBaseUrl = config.app.debug ? 'http://localhost:8787' : 'https://your-worker-url.workers.dev';

    this.kvClient = {
      async get(key) {
        try {
          const response = await fetch(
            `${workerBaseUrl}/kv/get?key=${encodeURIComponent(key)}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
              }
            }
          );

          if (response.status === 404) {
            return null;
          }

          if (!response.ok) {
            throw new Error(`KV get failed: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          return data.value;
        } catch (error) {
          console.error('KV get error:', error);
          // 降级到localStorage
          const value = localStorage.getItem(`kv_${key}`);
          return value ? JSON.parse(value) : null;
        }
      },
      async put(key, value) {
        try {
          const response = await fetch(
            `${workerBaseUrl}/kv/put`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                key,
                value
              })
            }
          );

          if (!response.ok) {
            throw new Error(`KV put failed: ${response.status} ${response.statusText}`);
          }

          // 同时保存到localStorage作为缓存
          localStorage.setItem(`kv_${key}`, JSON.stringify(value));
          return true;
        } catch (error) {
          console.error('KV put error:', error);
          // 降级到localStorage
          localStorage.setItem(`kv_${key}`, JSON.stringify(value));
          return true;
        }
      },
      async delete(key) {
        try {
          const response = await fetch(
            `${workerBaseUrl}/kv/delete?key=${encodeURIComponent(key)}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
              }
            }
          );

          if (!response.ok) {
            throw new Error(`KV delete failed: ${response.status} ${response.statusText}`);
          }

          // 同时从localStorage删除
          localStorage.removeItem(`kv_${key}`);
          return true;
        } catch (error) {
          console.error('KV delete error:', error);
          // 降级到localStorage
          localStorage.removeItem(`kv_${key}`);
          return true;
        }
      }
    };
  }

  async checkAuthStatus() {
    try {
      // 从localStorage获取用户信息
      const userInfo = localStorage.getItem('githubUserInfo');
      if (userInfo) {
        this.user = JSON.parse(userInfo);
        return true;
      }

      // 检查URL中是否有授权码
      const code = this.getQueryParam('code');
      if (code) {
        // 使用授权码换取访问令牌
        const token = await this.getAccessToken(code);
        if (token) {
          // 使用访问令牌获取用户信息
          const user = await this.getUserInfo(token);
          if (user) {
            this.user = user;
            localStorage.setItem('githubUserInfo', JSON.stringify(user));
            // 重定向到不带code参数的URL
            window.history.replaceState({}, document.title, '/');
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('检查认证状态失败:', error);
      return false;
    }
  }

  // 使用授权码换取访问令牌
  async getAccessToken(code) {
    try {
      const response = await fetch(this.githubConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          client_id: this.githubConfig.clientId,
          client_secret: this.githubConfig.clientSecret,
          code: code,
          redirect_uri: this.githubConfig.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub token request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('获取GitHub访问令牌失败:', error);
      return null;
    }
  }

  // 使用访问令牌获取用户信息
  async getUserInfo(accessToken) {
    try {
      const response = await fetch(this.githubConfig.userInfoUrl, {
        headers: {
          'Authorization': `token ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub user info request failed: ${response.status} ${response.statusText}`);
      }

      const user = await response.json();
      // 存储用户信息和访问令牌
      return {
        id: user.id.toString(),
        name: user.name || user.login,
        email: user.email,
        avatar: user.avatar_url,
        accessToken: accessToken
      };
    } catch (error) {
      console.error('获取GitHub用户信息失败:', error);
      return null;
    }
  }

  async login() {
    try {
      // 生成随机state参数以防止CSRF攻击
      const state = Math.random().toString(36).substr(2, 10);
      localStorage.setItem('githubOAuthState', state);

      // 构造GitHub授权URL
      const authUrl = `${this.githubConfig.authUrl}?client_id=${this.githubConfig.clientId}&redirect_uri=${encodeURIComponent(this.githubConfig.redirectUri)}&state=${state}&scope=user:email`;

      // 重定向到GitHub授权页面
      window.location.href = authUrl;

      return null; // 不会执行到这里，因为页面会重定向
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  async logout() {
    try {
      this.user = null;
      localStorage.removeItem('githubUserInfo');
      localStorage.removeItem('githubOAuthState');
      console.log('登出成功');
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }

  // 从云端加载配置
  async loadConfig(key) {
    try {
      if (!this.user) {
        throw new Error('用户未登录');
      }

      // 为不同用户的配置添加前缀，确保数据隔离
      const userKey = `user_${this.user.id}_${key}`;
      return await this.kvClient.get(userKey);
    } catch (error) {
      console.error('从云端加载配置失败:', error);
      throw error;
    }
  }

  // 保存配置到云端
  async saveConfig(key, config) {
    try {
      if (!this.user) {
        throw new Error('用户未登录');
      }

      // 为不同用户的配置添加前缀，确保数据隔离
      const userKey = `user_${this.user.id}_${key}`;
      return await this.kvClient.put(userKey, config);
    } catch (error) {
      console.error('保存配置到云端失败:', error);
      throw error;
    }
  }

  // 从云端删除配置
  async deleteConfig(key) {
    try {
      if (!this.user) {
        throw new Error('用户未登录');
      }

      // 为不同用户的配置添加前缀，确保数据隔离
      const userKey = `user_${this.user.id}_${key}`;
      return await this.kvClient.delete(userKey);
    } catch (error) {
      console.error('从云端删除配置失败:', error);
      throw error;
    }
  }

  // 兼容旧版本的方法调用
    async saveConfig(config) {
      console.warn('调用了已弃用的saveConfig方法，请使用saveConfig(key, config)');
      return this.saveConfig('navigationConfig', config);
    }

    async loadConfig() {
      console.warn('调用了已弃用的loadConfig方法，请使用loadConfig(key)');
      const config = await this.loadConfig('navigationConfig');
      return config || [];
    }

  // 检查用户是否已认证
    isAuthenticated() {
      return !!this.user;
    }

    // 获取用户信息
    getUserInfo() {
      return this.user;
    }
}

// 创建全局实例
const authService = new AuthService();

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await authService.init();
    // 触发初始化完成事件
    const event = new Event('authServiceReady');
    window.dispatchEvent(event);
  } catch (error) {
    console.error('认证服务初始化失败:', error);
  }
});