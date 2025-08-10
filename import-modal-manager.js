// 导入模态框管理模块
class ImportModalManager {
  constructor(configManager, uiManager) {
    this.configManager = configManager;
    this.uiManager = uiManager;
    this.pendingImportConfig = null;
    this.initEventListeners();
  }

  // 初始化事件监听器
  initEventListeners() {
    // 关闭模态框
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.hideModal();
      });
    }

    const cancelImportBtn = document.getElementById('cancel-import');
    if (cancelImportBtn) {
      cancelImportBtn.addEventListener('click', () => {
        this.hideModal();
      });
    }

    // 确认导入
    const confirmImportBtn = document.getElementById('confirm-import');
    if (confirmImportBtn) {
      confirmImportBtn.addEventListener('click', async () => {
        if (this.pendingImportConfig) {
          try {
            await this.configManager.saveConfig(this.pendingImportConfig);
            this.uiManager.renderCategories(this.pendingImportConfig);
            this.hideModal();
          } catch (error) {
            alert('导入失败: ' + error.message);
          }
        }
      });
    }

    // 拖放功能
    const dropArea = document.querySelector('label[for="file-upload"] .border-dashed');
    if (dropArea) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, this.preventDefaults.bind(this), false);
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, this.highlight.bind(this), false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, this.unhighlight.bind(this), false);
      });

      dropArea.addEventListener('drop', this.handleDrop.bind(this), false);
    }

    // 文件上传
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) {
      fileUpload.addEventListener('change', this.handleFileUpload.bind(this));
    }

    // URL加载配置
    const loadUrlBtn = document.getElementById('load-url');
    if (loadUrlBtn) {
      loadUrlBtn.addEventListener('click', this.handleUrlLoad.bind(this));
    }
  }

  // 阻止默认行为
  preventsDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 高亮拖放区域
  highlight() {
    const dropArea = document.querySelector('label[for="file-upload"] .border-dashed');
    if (dropArea) {
      dropArea.classList.add('border-primary');
      dropArea.classList.add(this.uiManager.isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100');
    }
  }

  // 取消高亮
  unhighlight() {
    const dropArea = document.querySelector('label[for="file-upload"] .border-dashed');
    if (dropArea) {
      dropArea.classList.remove('border-primary');
      dropArea.classList.remove(this.uiManager.isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100');
    }
  }

  // 处理拖放文件
  async handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      try {
        const config = await this.configManager.readFile(file);
        this.showImportPreview(config);
      } catch (error) {
        alert(error.message);
      }
    }
  }

  // 处理文件上传
  async handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
      try {
        const config = await this.configManager.readFile(file);
        this.showImportPreview(config);
      } catch (error) {
        alert(error.message);
      }
    }
  }

  // 处理URL加载
  async handleUrlLoad() {
    const urlInput = document.getElementById('config-url');
    if (!urlInput) return;

    const url = urlInput.value.trim();
    try {
      const config = await this.configManager.loadFromUrl(url);
      this.showImportPreview(config);
    } catch (error) {
      alert(error.message);
    }
  }

  // 显示导入预览
  showImportPreview(config) {
    this.pendingImportConfig = config;
    const previewContainer = document.getElementById('preview-content');
    if (!previewContainer) return;

    previewContainer.innerHTML = '';

    // 生成预览内容
    config.forEach(category => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'p-3 bg-slate-700/30 rounded-lg';
      categoryEl.innerHTML = `
        <h4 class="font-medium mb-2">${category.name} <span class="text-sm text-slate-400">(${category.sites.length}个网站)</span></h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          ${category.sites.map(site => `
            <div class="text-sm truncate">${site.name}</div>
          `).join('')}
        </div>
      `;
      previewContainer.appendChild(categoryEl);
    });

    // 显示模态框
    document.getElementById('import-modal').classList.remove('hidden');
  }

  // 隐藏模态框
  hideModal() {
    document.getElementById('import-modal').classList.add('hidden');
    this.pendingImportConfig = null;
  }
}

export default ImportModalManager;