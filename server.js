const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

// پایگاه داده پیشرفته
let knowledgeBase = [
    {
        id: 1,
        category: "علوم و فناوری",
        subcategory: "برنامه‌نویسی",
        content: "Node.js یک محیط اجرایی جاوااسکریپت برای سمت سرور است که بر پایه موتور V8 کروم ساخته شده است.",
        source: "سیستم تست",
        tags: ["javascript", "backend", "programming"],
        createdAt: new Date().toISOString(),
        relevance: 0.95
    },
    {
        id: 2,
        category: "ادبیات فارسی",
        subcategory: "شعر کلاسیک",
        content: "بنی آدم اعضای یک پیکرند که در آفرینش ز یک گوهرند چو عضوی به درد آورد روزگار دگر عضوها را نماند قرار",
        source: "سعدی",
        tags: ["شعر", "ادبیات", "سعدی"],
        createdAt: new Date().toISOString(),
        relevance: 0.92
    },
    {
        id: 3,
        category: "SS",
        subcategory: "داده‌های ویژه",
        content: "این محتوای تست از پوشه SS است - سیستم نطق مصطلح آماده یادگیری و پردازش داده‌های پیچیده می‌باشد.",
        source: "پوشه-SS",
        tags: ["داده", "پردازش", "هوشمصنوعی"],
        createdAt: new Date().toISOString(),
        relevance: 0.88
    }
];

app.use(express.json());

// API Routes پیشرفته
app.get('/api/search/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    const category = req.query.category;
    const minRelevance = parseFloat(req.query.minRelevance) || 0.1;
    
    const results = knowledgeBase.filter(item => {
        const matchesQuery = item.content.toLowerCase().includes(query) || 
                           item.category.toLowerCase().includes(query) ||
                           item.subcategory.toLowerCase().includes(query) ||
                           item.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesCategory = !category || item.category === category;
        const matchesRelevance = item.relevance >= minRelevance;
        
        return matchesQuery && matchesCategory && matchesRelevance;
    }).sort((a, b) => b.relevance - a.relevance);

    res.json({
        success: true,
        query: query,
        results: results,
        total: knowledgeBase.length,
        metrics: {
            averageRelevance: results.length > 0 ? 
                results.reduce((sum, item) => sum + item.relevance, 0) / results.length : 0,
            categories: [...new Set(results.map(item => item.category))]
        }
    });
});

app.get('/api/stats', (req, res) => {
    const categories = [...new Set(knowledgeBase.map(item => item.category))];
    const tags = [...new Set(knowledgeBase.flatMap(item => item.tags))];
    
    res.json({
        totalContent: knowledgeBase.length,
        categories: categories,
        tags: tags,
        lastUpdate: new Date().toISOString(),
        analytics: {
            totalCategories: categories.length,
            totalTags: tags.length,
            avgContentLength: knowledgeBase.reduce((sum, item) => sum + item.content.length, 0) / knowledgeBase.length
        }
    });
});

app.post('/api/content', (req, res) => {
    const { category, subcategory, content, source, tags } = req.body;
    
    if (!category || !content) {
        return res.status(400).json({ success: false, error: 'دسته‌بندی و محتوا الزامی است' });
    }

    const newItem = {
        id: knowledgeBase.length + 1,
        category,
        subcategory: subcategory || 'متفرقه',
        content,
        source: source || 'مدیریت دستی',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : ['دسته‌بندی نشده'],
        createdAt: new Date().toISOString(),
        relevance: 0.85
    };

    knowledgeBase.push(newItem);
    
    res.json({ 
        success: true, 
        message: 'محتوا با موفقیت افزوده شد',
        data: newItem
    });
});

// صفحه اصلی با طراحی پیشرفته و ریسپانسیو
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>نطق مصطلح - پایگاه دانش هوشمند</title>
        <style>
            :root {
                --primary: #2563eb;
                --secondary: #7c3aed;
                --success: #10b981;
                --warning: #f59e0b;
                --danger: #ef4444;
                --dark: #1e293b;
                --darker: #0f172a;
                --light: #f8fafc;
                --gray: #64748b;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Vazirmatn', 'Tahoma', sans-serif;
                background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 100%);
                color: var(--light);
                line-height: 1.6;
                min-height: 100vh;
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 30px 0;
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                background: linear-gradient(45deg, #fff, #e0f2fe);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .header p {
                font-size: 1.2rem;
                opacity: 0.9;
            }
            
            .tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 30px;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .tab-button {
                padding: 12px 24px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid transparent;
                color: white;
                cursor: pointer;
                border-radius: 12px;
                font-size: 1rem;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .tab-button:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }
            
            .tab-button.active {
                background: var(--primary);
                border-color: var(--primary);
                box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
            }
            
            .tab-content {
                display: none;
                padding: 30px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .tab-content.active {
                display: block;
                animation: fadeIn 0.5s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .search-box {
                display: flex;
                gap: 15px;
                margin-bottom: 30px;
                flex-wrap: wrap;
            }
            
            .search-input {
                flex: 1;
                min-width: 300px;
                padding: 15px 20px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border-radius: 12px;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            
            .search-input:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
            }
            
            .filter-select {
                padding: 15px 20px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border-radius: 12px;
                font-size: 1rem;
                min-width: 200px;
            }
            
            .btn {
                padding: 15px 30px;
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                color: white;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: bold;
                transition: all 0.3s ease;
                box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 25px rgba(37, 99, 235, 0.4);
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .result-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 25px;
                margin: 20px 0;
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }
            
            .result-item:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-5px);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
            }
            
            .category-badge {
                background: linear-gradient(135deg, var(--success) 0%, #34d399 100%);
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                margin-left: 8px;
                display: inline-block;
            }
            
            .tag-badge {
                background: rgba(255, 255, 255, 0.1);
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.8rem;
                margin: 4px 4px 4px 0;
                display: inline-block;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 25px;
                margin: 30px 0;
            }
            
            .stat-card {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
            }
            
            .stat-card h3 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                background: linear-gradient(45deg, var(--primary), var(--secondary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .form-group {
                margin-bottom: 25px;
            }
            
            .form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: bold;
                color: var(--primary);
            }
            
            .form-control {
                width: 100%;
                padding: 15px 20px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border-radius: 12px;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            
            .form-control:focus {
                outline: none;
                border-color: var(--primary);
                box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
            }
            
            .relevance-bar {
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                margin: 10px 0;
                overflow: hidden;
            }
            
            .relevance-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--success), #34d399);
                border-radius: 3px;
                transition: width 0.5s ease;
            }
            
            .advanced-options {
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 12px;
                margin: 20px 0;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 15px;
                }
                
                .header h1 {
                    font-size: 2rem;
                }
                
                .search-box {
                    flex-direction: column;
                }
                
                .search-input, .filter-select {
                    min-width: 100%;
                }
                
                .tabs {
                    flex-direction: column;
                }
                
                .tab-button {
                    text-align: center;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧠 نطق مصطلح - پایگاه دانش هوشمند</h1>
                <p>سیستم پیشرفته جستجو و مدیریت دانش با رابط کاربری مدرن</p>
            </div>

            <div class="tabs">
                <button class="tab-button active" onclick="switchTab('search')">🔍 جستجوی پیشرفته</button>
                <button class="tab-button" onclick="switchTab('stats')">📊 آمار و تحلیل</button>
                <button class="tab-button" onclick="switchTab('add')">📝 مدیریت محتوا</button>
                <button class="tab-button" onclick="switchTab('advanced')">⚙️ تنظیمات پیشرفته</button>
            </div>

            <!-- تب جستجوی پیشرفته -->
            <div id="tab-search" class="tab-content active">
                <div class="search-box">
                    <input type="text" id="searchInput" class="search-input" placeholder="عبارت مورد نظر را جستجو کنید...">
                    <select id="categoryFilter" class="filter-select">
                        <option value="">همه دسته‌ها</option>
                        <option value="علوم و فناوری">علوم و فناوری</option>
                        <option value="ادبیات فارسی">ادبیات فارسی</option>
                        <option value="SS">SS</option>
                    </select>
                    <button class="btn" onclick="performSearch()">
                        <span>🔍 جستجو</span>
                    </button>
                </div>
                
                <div class="advanced-options">
                    <h4 style="margin-bottom: 15px;">🎯 تنظیمات پیشرفته جستجو</h4>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">حداقل ارتباط:</label>
                            <input type="range" id="relevanceRange" min="10" max="100" value="30" style="width: 150px;">
                            <span id="relevanceValue" style="margin-right: 10px;">30%</span>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">تعداد نتایج:</label>
                            <select id="resultsLimit" class="filter-select" style="min-width: 120px;">
                                <option value="10">10 نتیجه</option>
                                <option value="25" selected>25 نتیجه</option>
                                <option value="50">50 نتیجه</option>
                                <option value="100">100 نتیجه</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div id="searchResults"></div>
            </div>

            <!-- تب آمار و تحلیل -->
            <div id="tab-stats" class="tab-content">
                <h3 style="margin-bottom: 25px; text-align: center;">📊 آمار و تحلیل پیشرفته</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>${knowledgeBase.length}</h3>
                        <p>مورد محتوا</p>
                    </div>
                    <div class="stat-card">
                        <h3>3</h3>
                        <p>دسته‌بندی اصلی</p>
                    </div>
                    <div class="stat-card">
                        <h3>8</h3>
                        <p>تگ‌های فعال</p>
                    </div>
                    <div class="stat-card">
                        <h3>${Math.round(knowledgeBase.reduce((sum, item) => sum + item.content.length, 0) / knowledgeBase.length)}</h3>
                        <p>میانگین طول محتوا</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-top: 30px;">
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 25px; border-radius: 16px;">
                        <h4 style="margin-bottom: 15px; color: var(--primary);">🏷️ تگ‌های پرکاربرد</h4>
                        <div id="popularTags"></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 25px; border-radius: 16px;">
                        <h4 style="margin-bottom: 15px; color: var(--primary);">📈 وضعیت سیستم</h4>
                        <div style="line-height: 2;">
                            <div>✅ سیستم جستجو: فعال</div>
                            <div>✅ پایگاه داده: آنلاین</div>
                            <div>✅ رابط کاربری: بهینه‌شده</div>
                            <div>🕒 آخرین بروزرسانی: همین حالا</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- تب مدیریت محتوا -->
            <div id="tab-add" class="tab-content">
                <h3 style="margin-bottom: 25px; text-align: center;">📝 مدیریت پیشرفته محتوا</h3>
                <div style="max-width: 600px; margin: 0 auto;">
                    <div class="form-group">
                        <label class="form-label">دسته‌بندی اصلی</label>
                        <select id="addCategorySelect" class="form-control">
                            <option value="علوم و فناوری">علوم و فناوری</option>
                            <option value="ادبیات فارسی">ادبیات فارسی</option>
                            <option value="SS">SS</option>
                            <option value="تاریخ و تمدن">تاریخ و تمدن</option>
                            <option value="فلسفه و عرفان">فلسفه و عرفان</option>
                            <option value="دین و مذهب">دین و مذهب</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">زیردسته (اختیاری)</label>
                        <input type="text" id="addSubcategory" class="form-control" placeholder="مثلاً: هوش مصنوعی، شعر کلاسیک، داده‌کاوی...">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">تگ‌ها (با کاما جدا کنید)</label>
                        <input type="text" id="addTags" class="form-control" placeholder="مثلاً: javascript,داده,آموزش,تحقیق">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">متن محتوا</label>
                        <textarea id="addContent" rows="8" class="form-control" placeholder="متن کامل محتوای خود را اینجا وارد کنید..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">منبع (اختیاری)</label>
                        <input type="text" id="addSource" class="form-control" placeholder="منبع محتوا را مشخص کنید">
                    </div>
                    
                    <button class="btn" onclick="addNewContent()" style="width: 100%; padding: 18px;">
                        <span>➕ افزودن محتوای جدید</span>
                    </button>
                </div>
            </div>

            <!-- تب تنظیمات پیشرفته -->
            <div id="tab-advanced" class="tab-content">
                <h3 style="margin-bottom: 25px; text-align: center;">⚙️ تنظیمات پیشرفته سیستم</h3>
                <div style="max-width: 600px; margin: 0 auto;">
                    <div class="form-group">
                        <label class="form-label">حداقل ارتباط برای جستجو (%)</label>
                        <input type="number" id="minRelevance" class="form-control" value="30" min="1" max="100">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">تعداد نتایج پیش‌فرض</label>
                        <select id="defaultResultsLimit" class="form-control">
                            <option value="10">10 نتیجه</option>
                            <option value="25" selected>25 نتیجه</option>
                            <option value="50">50 نتیجه</option>
                            <option value="100">100 نتیجه</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">قالب نمایش نتایج</label>
                        <select id="resultsTemplate" class="form-control">
                            <option value="card" selected>کارتی (پیشرفته)</option>
                            <option value="list">لیستی (ساده)</option>
                            <option value="compact">فشرده</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button class="btn" style="flex: 1;">💾 ذخیره تنظیمات</button>
                        <button class="btn btn-secondary" style="flex: 1;">🔄 بازنشانی</button>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // توابع پیشرفته JavaScript
            let searchCache = {};
            
            function switchTab(tabName) {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                event.target.classList.add('active');
                document.getElementById('tab-' + tabName).classList.add('active');
                
                // بارگذاری داده‌های خاص هر تب
                if (tabName === 'stats') {
                    loadAdvancedStats();
                }
            }
            
            function loadAdvancedStats() {
                fetch('/api/stats')
                    .then(response => response.json())
                    .then(data => {
                        const tagsContainer = document.getElementById('popularTags');
                        if (data.tags && data.tags.length > 0) {
                            tagsContainer.innerHTML = data.tags.map(tag => 
                                `<span class="tag-badge">${tag}</span>`
                            ).join('');
                        }
                    });
            }
            
            async function performSearch() {
                const query = document.getElementById('searchInput').value;
                const category = document.getElementById('categoryFilter').value;
                const minRelevance = parseInt(document.getElementById('relevanceRange').value) / 100;
                const limit = document.getElementById('resultsLimit').value;
                
                if (!query) {
                    showNotification('لطفاً عبارت جستجو را وارد کنید', 'warning');
                    return;
                }
                
                // بررسی کش
                const cacheKey = \`\${query}-\${category}-\${minRelevance}-\${limit}\`;
                if (searchCache[cacheKey]) {
                    displaySearchResults(searchCache[cacheKey]);
                    return;
                }
                
                showLoading('در حال جستجو...');
                
                try {
                    let url = \`/api/search/\${encodeURIComponent(query)}?minRelevance=\${minRelevance}&limit=\${limit}\`;
                    if (category) {
                        url += \`&category=\${encodeURIComponent(category)}\`;
                    }
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    // ذخیره در کش
                    searchCache[cacheKey] = data;
                    
                    displaySearchResults(data);
                } catch (error) {
                    showNotification('خطا در اتصال به سرور', 'error');
                    console.error('خطا در جستجو:', error);
                } finally {
                    hideLoading();
                }
            }
            
            function displaySearchResults(data) {
                const container = document.getElementById('searchResults');
                
                if (!data.success || data.results.length === 0) {
                    container.innerHTML = \`
                        <div style="text-align: center; padding: 60px 20px; opacity: 0.7;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                            <h3 style="margin-bottom: 15px;">نتیجه‌ای یافت نشد</h3>
                            <p>عبارت جستجو را تغییر دهید یا تنظیمات جستجو را بازبینی کنید</p>
                        </div>
                    \`;
                    return;
                }
                
                let resultsHTML = \`
                    <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <h3>\${data.results.length} نتیجه برای "\${data.query}"</h3>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <small style="opacity: 0.7;">\${data.total} مورد در کل پایگاه</small>
                            <span class="tag-badge">میانگین ارتباط: \${Math.round(data.metrics.averageRelevance * 100)}%</span>
                        </div>
                    </div>
                \`;
                
                data.results.forEach(result => {
                    const relevancePercent = Math.round(result.relevance * 100);
                    resultsHTML += \`
                        <div class="result-item">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                                <div>
                                    <span class="category-badge">\${result.category}</span>
                                    <span class="category-badge" style="background: linear-gradient(135deg, var(--secondary) 0%, #a855f7 100%);">\${result.subcategory}</span>
                                    <span class="category-badge" style="background: rgba(255, 255, 255, 0.2);">\${result.source}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <small style="opacity: 0.7;">ارتباط:</small>
                                    <div style="font-weight: bold; color: var(--success);">\${relevancePercent}%</div>
                                </div>
                            </div>
                            
                            <div class="relevance-bar">
                                <div class="relevance-fill" style="width: \${relevancePercent}%"></div>
                            </div>
                            
                            <div style="font-size: 1.1em; line-height: 1.7; margin: 20px 0;">
                                \${result.content}
                            </div>
                            
                            <div style="margin-top: 15px;">
                                \${result.tags.map(tag => \`<span class="tag-badge">\${tag}</span>\`).join('')}
                            </div>
                            
                            <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.7; display: flex; justify-content: space-between;">
                                <span>شناسه: #\${result.id}</span>
                                <span>\${new Date(result.createdAt).toLocaleDateString('fa-IR')}</span>
                            </div>
                        </div>
                    \`;
                });
                
                container.innerHTML = resultsHTML;
            }
            
            async function addNewContent() {
                const category = document.getElementById('addCategorySelect').value;
                const subcategory = document.getElementById('addSubcategory').value;
                const content = document.getElementById('addContent').value;
                const source = document.getElementById('addSource').value;
                const tags = document.getElementById('addTags').value;
                
                if (!category || !content) {
                    showNotification('لطفاً دسته‌بندی و محتوا را وارد کنید', 'warning');
                    return;
                }
                
                try {
                    const response = await fetch('/api/content', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            category, 
                            subcategory, 
                            content, 
                            source,
                            tags 
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showNotification('محتوا با موفقیت افزوده شد!', 'success');
                        // پاک کردن فرم
                        document.getElementById('addSubcategory').value = '';
                        document.getElementById('addContent').value = '';
                        document.getElementById('addSource').value = '';
                        document.getElementById('addTags').value = '';
                        
                        // به روز رسانی کش
                        searchCache = {};
                    } else {
                        showNotification(data.error || 'خطا در افزودن محتوا', 'error');
                    }
                } catch (error) {
                    showNotification('خطا در اتصال به سرور', 'error');
                    console.error('خطا در افزودن محتوا:', error);
                }
            }
            
            function showNotification(message, type = 'info') {
                // پیاده‌سازی نوتیفیکیشن
                const notification = document.createElement('div');
                notification.style.cssText = \`
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    background: \${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--primary)'};
                    color: white;
                    border-radius: 10px;
                    z-index: 1000;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    animation: slideIn 0.3s ease;
                \`;
                notification.textContent = message;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 4000);
            }
            
            function showLoading(message = 'در حال بارگذاری...') {
                // پیاده‌سازی لودینگ
                const loading = document.createElement('div');
                loading.id = 'loading-overlay';
                loading.style.cssText = \`
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    backdrop-filter: blur(5px);
                \`;
                loading.innerHTML = \`
                    <div style="background: var(--dark); padding: 30px; border-radius: 15px; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 15px;">⏳</div>
                        <div>\${message}</div>
                    </div>
                \`;
                document.body.appendChild(loading);
            }
            
            function hideLoading() {
                const loading = document.getElementById('loading-overlay');
                if (loading) {
                    loading.remove();
                }
            }
            
            // مدیریت رویدادها
            document.getElementById('searchInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') performSearch();
            });
            
            document.getElementById('relevanceRange').addEventListener('input', function() {
                document.getElementById('relevanceValue').textContent = this.value + '%';
            });
            
            // بارگذاری اولیه
            document.addEventListener('DOMContentLoaded', function() {
                loadAdvancedStats();
                console.log('🚀 سیستم نطق مصطلح با موفقیت بارگذاری شد');
            });
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

app.listen(PORT, () => {
    console.log('🚀 نطق مصطلح - پایگاه دانش پیشرفته راه‌اندازی شد!');
    console.log('📍 آدرس: http://localhost:' + PORT);
    console.log('📚 ' + knowledgeBase.length + ' محتوای پیشرفته بارگذاری شد');
    console.log('🎨 رابط کاربری حرفه‌ای فعال شد');
    console.log('⚡ سیستم آماده استفاده است');
});
