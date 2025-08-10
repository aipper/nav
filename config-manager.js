// 配置管理模块 - 处理配置的导入、导出和存储
class ConfigManager {
  constructor(authService) {
    this.authService = authService;
    this.currentConfig = [];
    this.pendingImportConfig = null;
  }

  // 初始化配置
  async init() {
    // 从本地存储加载配置
    const savedConfig = localStorage.getItem('navigationConfig');
    if (savedConfig) {
      try {
        this.currentConfig = JSON.parse(savedConfig);
        return this.currentConfig;
      } catch (error) {
        console.error('加载保存的配置失败', error);
        localStorage.removeItem('navigationConfig');
      }
    }
    return [];
  }

  // 从本地文件导入配置
  readFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith('.json')) {
        reject(new Error('请上传JSON格式的文件'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          this.validateConfig(config);
          resolve(config);
        } catch (error) {
          reject(new Error('JSON格式错误：' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  // 通过URL加载配置
  async loadFromUrl(url) {
    if (!url) {
      throw new Error('请输入配置文件URL');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP错误：${response.status}`);
    }
    const config = await response.json();
    this.validateConfig(config);
    return config;
  }

  // 验证配置格式
  validateConfig(config) {
    if (!Array.isArray(config) || config.some(item => !item.name || !item.sites || !Array.isArray(item.sites))) {
      throw new Error('配置格式不正确，请参考示例配置');
    }
  }

  // 保存配置
  async saveConfig(config) {
    this.currentConfig = config;
    // 保存到本地存储
    localStorage.setItem('navigationConfig', JSON.stringify(config));
    // 如果用户已登录，保存到云端
    if (this.authService && this.authService.user) {
      try {
        await this.authService.saveConfig('navigationConfig', config);
        console.log('配置已保存到云端');
      } catch (error) {
        console.error('保存配置到云端失败:', error);
      }
    }
    return config;
  }

  // 导出当前配置
  exportConfig() {
    if (this.currentConfig.length === 0) {
      throw new Error('没有可导出的配置数据');
    }
    return JSON.stringify(this.currentConfig, null, 2);
  }

  // 获取示例配置
  getExampleConfig() {
    return [
      {
        "id": "work",
        "name": "工作",
        "icon": "fa-briefcase",
        "color": "text-primary",
        "sites": [
          {
            "name": "Gmail",
            "url": "https://mail.google.com",
            "icon": "fa-envelope",
            "color": "text-primary"
          },
          {
            "name": "文档",
            "url": "https://docs.google.com",
            "icon": "fa-file-text",
            "color": "text-primary"
          },
          {
            "name": "会议",
            "url": "https://meet.google.com",
            "icon": "fa-video-camera",
            "color": "text-primary"
          }
        ]
      },
      {
        "id": "study",
        "name": "学习",
        "icon": "fa-book",
        "color": "text-secondary",
        "sites": [
          {
            "name": "GitHub",
            "url": "https://github.com",
            "icon": "fa-github",
            "color": "text-secondary"
          },
          {
            "name": "StackOverflow",
            "url": "https://stackoverflow.com",
            "icon": "fa-stack-overflow",
            "color": "text-secondary"
          },
          {
            "name": "掘金",
            "url": "https://juejin.cn",
            "icon": "fa-code",
            "color": "text-secondary"
          }
        ]
      }
    ];
  }

  // 清空数据
  async clearData() {
    this.currentConfig = [];
    localStorage.removeItem('navigationConfig');
    // 如果用户已登录，清空云端数据
    if (this.authService && this.authService.user) {
      try {
        await this.authService.deleteConfig('navigationConfig');
        console.log('已清空云端配置');
      } catch (error) {
        console.error('清空云端配置失败:', error);
      }
    }
    return [];
  }
}

export default ConfigManager;