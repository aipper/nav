// 主应用入口文件
import AuthService from './auth.js';
import ConfigManager from './config-manager.js';
import UIManager from './ui-manager.js';
import ImportModalManager from './import-modal-manager.js';
import config from './config.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', async () => {
  // 初始化认证服务
  const authService = new AuthService();
  try {
    await authService.init();
    // 触发初始化完成事件
    const event = new Event('authServiceReady');
    window.dispatchEvent(event);
  } catch (error) {
    console.error('认证服务初始化失败:', error);
  }

  // 初始化配置管理器
  const configManager = new ConfigManager(authService);
  const initialConfig = await configManager.init();

  // 初始化UI管理器
  const uiManager = new UIManager();
  uiManager.init();
  uiManager.renderCategories(initialConfig);

  // 初始化导入模态框管理器
  const importModalManager = new ImportModalManager(configManager, uiManager);

  // 认证服务就绪后执行
  window.addEventListener('authServiceReady', () => {
    updateAuthUI(authService);

    // 如果用户已登录，从云端加载配置
    if (authService.user) {
      try {
        authService.loadConfig('navigationConfig').then(cloudConfig => {
          if (cloudConfig) {
            configManager.saveConfig(cloudConfig);
            uiManager.renderCategories(cloudConfig);
          }
        });
      } catch (error) {
        console.error('从云端加载配置失败:', error);
      }
    }
  });

  // 登录按钮事件
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      try {
        await authService.login();
      } catch (error) {
        alert('登录失败: ' + error.message);
      }
    });
  }

  // 登出按钮事件
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await authService.logout();
        updateAuthUI(authService);
        // 登出后清除本地配置
        localStorage.removeItem('navigationConfig');
        uiManager.renderCategories([]);
      } catch (error) {
        alert('登出失败: ' + error.message);
      }
    });
  }

  // 导出当前配置
  const exportConfigBtn = document.getElementById('export-config');
  if (exportConfigBtn) {
    exportConfigBtn.addEventListener('click', () => {
      try {
        const configStr = configManager.exportConfig();
        const blob = new Blob([configStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'navigation-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        alert(error.message);
      }
    });
  }

  // 下载示例配置
  const downloadExampleBtn = document.getElementById('download-example');
  if (downloadExampleBtn) {
    downloadExampleBtn.addEventListener('click', () => {
      const exampleConfig = configManager.getExampleConfig();
      const jsonStr = JSON.stringify(exampleConfig, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'example-config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // 清空数据
  const clearDataBtn = document.getElementById('clear-data');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', async () => {
      if (confirm('确定要清空所有数据吗？')) {
        try {
          const emptyConfig = await configManager.clearData();
          uiManager.renderCategories(emptyConfig);
        } catch (error) {
          alert(error.message);
        }
      }
    });
  }

  // 更新认证相关UI
  function updateAuthUI(authService) {
    const userInfo = document.getElementById('user-info');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (authService.user) {
      userInfo.innerHTML = `
        <img src="${authService.user.avatar}" alt="用户头像" class="w-6 h-6 rounded-full mr-2">
        <span>${authService.user.name}</span>
      `;