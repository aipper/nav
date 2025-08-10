// UI管理模块 - 处理主题切换、时钟显示和搜索功能
class UIManager {
  constructor() {
    this.isDarkMode = true;
  }

  // 初始化UI
  init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    this.initThemeToggle();
    this.initSearchFunctionality();
  }

  // 更新时钟显示
  updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // 初始化主题切换
  initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.isDarkMode = !this.isDarkMode;
        this.updateTheme();
      });
    }
  }

  // 更新主题
  updateTheme() {
    const body = document.body;
    const icon = document.querySelector('#theme-toggle i');
    
    if (this.isDarkMode) {
      body.classList.remove('bg-gradient-light', 'text-slate-800');
      body.classList.add('bg-gradient-dark', 'text-white');
      icon.classList.remove('fa-sun-o');
      icon.classList.add('fa-moon-o');
    } else {
      body.classList.remove('bg-gradient-dark', 'text-white');
      body.classList.add('bg-gradient-light', 'text-slate-800');
      icon.classList.remove('fa-moon-o');
      icon.classList.add('fa-sun-o');
    }
    
    // 更新卡片样式
    this.updateCardStyles();
  }

  // 更新卡片样式
  updateCardStyles() {
    const cards = document.querySelectorAll('.category-card');
    const cardClass = this.isDarkMode ? 'bg-slate-800/40' : 'bg-white/70';
    const hoverClass = this.isDarkMode ? 'hover:bg-slate-700/60' : 'hover:bg-white';
    
    cards.forEach(card => {
      card.className = `card-hover ${cardClass} ${hoverClass} rounded-lg p-4 flex flex-col items-center text-center`;
    });
  }

  // 初始化搜索功能
  initSearchFunctionality() {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.search-engine').forEach(btn => {
        btn.addEventListener('click', () => {
          const engine = btn.dataset.engine;
          const query = document.getElementById('search-input').value.trim();
          if (!query) return;
          
          let url = '';
          switch(engine) {
            case 'baidu':
              url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
              break;
            case 'google':
              url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
              break;
            case 'bing':
              url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
              break;
          }
          window.open(url, '_blank');
        });
      });

      // 按回车默认百度搜索
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            const baiduBtn = document.querySelector('[data-engine="baidu"]');
            if (baiduBtn) {
              baiduBtn.click();
            }
          }
        });
      }
    });
  }

  // 渲染分类和网站
  renderCategories(categories) {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';
    
    // 显示空状态
    if (!categories || categories.length === 0) {
      container.innerHTML = `
        <div id="empty-state" class="text-center py-16">
          <i class="fa fa-folder-open-o text-5xl ${this.isDarkMode ? 'text-slate-500' : 'text-slate-400'} mb-4"></i>
          <p class="${this.isDarkMode ? 'text-slate-400' : 'text-slate-500'}">还没有数据，请导入配置文件或添加网站</p>
        </div>
      `;
      return;
    }
    
    // 渲染每个分类
    categories.forEach(category => {
      const section = document.createElement('section');
      section.className = 'mb-6';
      
      // 分类标题
      section.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <i class="${category.icon || 'fa-folder'} mr-2 ${category.color || 'text-primary'}"></i>${category.name}
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" id="category-${category.id}">
          <!-- 网站卡片将在这里生成 -->
        </div>
      `;
      
      container.appendChild(section);
      
      // 渲染网站卡片
      const sitesContainer = document.getElementById(`category-${category.id}`);
      category.sites.forEach(site => {
        const card = document.createElement('a');
        card.href = site.url;
        card.target = '_blank';
        card.className = `category-card card-hover ${this.isDarkMode ? 'bg-slate-800/40 hover:bg-slate-700/60' : 'bg-white/70 hover:bg-white'} rounded-lg p-4 flex flex-col items-center text-center`;
        card.innerHTML = `
          <i class="${site.icon || 'fa-globe'} text-2xl mb-2 ${site.color || 'text-primary'}"></i>
          <span class="truncate max-w-full">${site.name}</span>
        `;
        sitesContainer.appendChild(card);
      });
    });
  }
}

export default UIManager;