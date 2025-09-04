// DOM元素
const mainCategoriesContainer = document.getElementById('main-categories');
const subCategoriesContainer = document.getElementById('sub-categories-container');
const subCategories = document.getElementById('sub-categories');
const promptCardsContainer = document.getElementById('prompt-cards-container');
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');
const promptModal = document.getElementById('prompt-modal');
const modalTitle = document.getElementById('modal-title');
const modalChinese = document.getElementById('modal-chinese');
const modalEnglish = document.getElementById('modal-english');
const closeModal = document.getElementById('close-modal');
const copyChinese = document.getElementById('copy-chinese');
const copyEnglish = document.getElementById('copy-english');

// 状态管理
let currentMainCategory = null;
let currentSubCategory = null;
let searchQuery = '';

// 处理数据，按分类组织
const categorizedData = {};
const allMainCategories = new Set();
const allSubCategories = new Set();

// 初始化数据结构
promptData.forEach(item => {
    const mainCat = item.mainCategory;
    const subCat = item.subCategory;
    
    allMainCategories.add(mainCat);
    allSubCategories.add(subCat);
    
    if (!categorizedData[mainCat]) {
        categorizedData[mainCat] = {};
    }
    
    if (!categorizedData[mainCat][subCat]) {
        categorizedData[mainCat][subCat] = [];
    }
    
    categorizedData[mainCat][subCat].push(item);
});

// 渲染大分类
function renderMainCategories() {
    mainCategoriesContainer.innerHTML = '';
    
    // 添加"全部"选项
    const allBtn = document.createElement('div');
    allBtn.className = `category-tag main-category ${currentMainCategory === null ? 'active' : ''}`;
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', () => {
        currentMainCategory = null;
        currentSubCategory = null;
        renderMainCategories();
        renderSubCategories();
        renderPromptCards();
    });
    mainCategoriesContainer.appendChild(allBtn);
    
    // 添加各个大分类
    Array.from(allMainCategories).forEach(category => {
        const categoryBtn = document.createElement('div');
        categoryBtn.className = `category-tag main-category ${currentMainCategory === category ? 'active' : ''}`;
        categoryBtn.textContent = category;
        categoryBtn.addEventListener('click', () => {
            currentMainCategory = category;
            currentSubCategory = null;
            renderMainCategories();
            renderSubCategories();
            renderPromptCards();
        });
        mainCategoriesContainer.appendChild(categoryBtn);
    });
}

// 渲染小分类
function renderSubCategories() {
    subCategories.innerHTML = '';
    subCategoriesContainer.classList.toggle('hidden', currentMainCategory === null && !searchQuery);
    
    // 确定当前需要显示的小分类
    let relevantSubCategories = new Set();
    
    if (currentMainCategory) {
        // 如果选择了大分类，只显示该大分类下的小分类
        Object.keys(categorizedData[currentMainCategory]).forEach(subCat => {
            relevantSubCategories.add(subCat);
        });
    } else if (searchQuery) {
        // 如果有搜索词，显示所有包含匹配结果的小分类
        promptData.forEach(item => {
            if (isMatch(item, searchQuery)) {
                relevantSubCategories.add(item.subCategory);
            }
        });
    } else {
        // 否则显示所有小分类
        relevantSubCategories = allSubCategories;
    }
    
    // 添加"全部"选项
    const allBtn = document.createElement('div');
    allBtn.className = `category-tag sub-category ${currentSubCategory === null ? 'active' : ''}`;
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', () => {
        currentSubCategory = null;
        renderSubCategories();
        renderPromptCards();
    });
    subCategories.appendChild(allBtn);
    
    // 添加各个小分类
    Array.from(relevantSubCategories).forEach(category => {
        const categoryBtn = document.createElement('div');
        categoryBtn.className = `category-tag sub-category ${currentSubCategory === category ? 'active' : ''}`;
        categoryBtn.textContent = category;
        categoryBtn.addEventListener('click', () => {
            currentSubCategory = category;
            renderSubCategories();
            renderPromptCards();
        });
        subCategories.appendChild(categoryBtn);
    });
}

// 渲染提示词卡片
function renderPromptCards() {
    promptCardsContainer.innerHTML = '';
    let filteredItems = [];
    
    // 根据当前分类筛选
    if (currentMainCategory && currentSubCategory) {
        filteredItems = categorizedData[currentMainCategory]?.[currentSubCategory] || [];
    } else if (currentMainCategory) {
        // 只筛选大分类
        Object.values(categorizedData[currentMainCategory] || {}).forEach(items => {
            filteredItems = filteredItems.concat(items);
        });
    } else if (currentSubCategory) {
        // 只筛选小分类
        Object.values(categorizedData).forEach(subCats => {
            if (subCats[currentSubCategory]) {
                filteredItems = filteredItems.concat(subCats[currentSubCategory]);
            }
        });
    } else {
        // 没有选择分类，显示全部
        filteredItems = [...promptData];
    }
    
    // 应用搜索筛选
    if (searchQuery) {
        filteredItems = filteredItems.filter(item => isMatch(item, searchQuery));
    }
    
    // 显示无结果提示或渲染卡片
    if (filteredItems.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        
        filteredItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'prompt-card fade-in';
            card.innerHTML = `
                <h3>${item.title}</h3>
                <div class="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>${item.subCategory}</span>
                    <i class="fa fa-angle-right"></i>
                </div>
            `;
            
            card.addEventListener('click', () => openPromptModal(item));
            promptCardsContainer.appendChild(card);
        });
    }
}

// 检查项目是否匹配搜索词
function isMatch(item, query) {
    const lowerQuery = query.toLowerCase();
    return (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.chinese.toLowerCase().includes(lowerQuery) ||
        item.english.toLowerCase().includes(lowerQuery)
    );
}

// 打开提示词详情弹窗
function openPromptModal(item) {
    modalTitle.textContent = item.title;
    modalChinese.textContent = item.chinese;
    modalEnglish.textContent = item.english;
    promptModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 关闭弹窗
function closePromptModal() {
    promptModal.classList.add('hidden');
    document.body.style.overflow = ''; // 恢复滚动
}

// 复制文本到剪贴板
function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        // 显示复制成功提示
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = `${label}已复制!`;
        document.body.appendChild(toast);
        
        // 显示提示
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 3秒后隐藏并移除提示
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    });
}

// 搜索功能
function handleSearch() {
    searchQuery = searchInput.value.trim();
    renderSubCategories();
    renderPromptCards();
}

// 事件监听
closeModal.addEventListener('click', closePromptModal);
promptModal.addEventListener('click', (e) => {
    if (e.target === promptModal) {
        closePromptModal();
    }
});

copyChinese.addEventListener('click', () => {
    copyToClipboard(modalChinese.textContent, '中文提示词');
});

copyEnglish.addEventListener('click', () => {
    copyToClipboard(modalEnglish.textContent, '英文提示词');
});

searchInput.addEventListener('input', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderMainCategories();
    renderSubCategories();
    renderPromptCards();
});
