const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

// 🔧 اضافه کردن هندلر خطاهای全局
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

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

// 🔧 اضافه کردن CORS برای Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// API Routes پیشرفته
app.get('/api/search/:query', (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const category = req.query.category;
    const minRelevance = parseFloat(req.query.minRelevance) || 0.1;
    const limit = parseInt(req.query.limit) || 25;
    
    const results = knowledgeBase.filter(item => {
        const matchesQuery = item.content.toLowerCase().includes(query) || 
                           item.category.toLowerCase().includes(query) ||
                           item.subcategory.toLowerCase().includes(query) ||
                           item.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesCategory = !category || item.category === category;
        const matchesRelevance = item.relevance >= minRelevance;
        
        return matchesQuery && matchesCategory && matchesRelevance;
    }).sort((a, b) => b.relevance - a.relevance).slice(0, limit);

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
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: 'خطا در جستجو' });
  }
});

app.get('/api/stats', (req, res) => {
  try {
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
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'خطا در دریافت آمار' });
  }
});

app.post('/api/content', (req, res) => {
  try {
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
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : ['دسته‌بندی نشده'],
        createdAt: new Date().toISOString(),
        relevance: 0.85
    };

    knowledgeBase.push(newItem);
    
    res.json({ 
        success: true, 
        message: 'محتوا با موفقیت افزوده شد',
        data: newItem
    });
  } catch (error) {
    console.error('Add content error:', error);
    res.status(500).json({ success: false, error: 'خطا در افزودن محتوا' });
  }
});

// 🔧 هندلر خطای 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'مسیر یافت نشد' });
});

// 🔧 هندلر خطای سرور
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'خطای داخلی سرور' });
});

// صفحه اصلی با طراحی پیشرفته و ریسپانسیو
app.get('/', (req, res) => {
  try {
    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>نطق مصطلح - پایگاه دانش هوشمند</title>
        <style>
            /* استایل‌ها بدون تغییر باقی می‌مانند */
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
            
            /* بقیه استایل‌ها دقیقاً مانند کد شما */
            /* ... */
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
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">متن محتوا</label>
                        <textarea id="addContent" rows="8" class="form-control" placeholder="متن کامل محتوای خود را اینجا وارد کنید..."></textarea>
                    </div>
                    
                    <button class="btn" onclick="addNewContent()" style="width: 100%; padding: 18px;">
                        <span>➕ افزودن محتوای جدید</span>
                    </button>
                </div>
            </div>
        </div>

        <script>
            // توابع JavaScript ساده‌شده
            function switchTab(tabName) {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                event.target.classList.add('active');
                document.getElementById('tab-' + tabName).classList.add('active');
            }
            
            async function performSearch() {
                const query = document.getElementById('searchInput').value;
                const category = document.getElementById('categoryFilter').value;
                
                if (!query) {
                    alert('لطفاً عبارت جستجو را وارد کنید');
                    return;
                }
                
                try {
                    let url = \`/api/search/\${encodeURIComponent(query)}\`;
                    if (category) {
                        url += \`?category=\${encodeURIComponent(category)}\`;
                    }
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    displaySearchResults(data);
                } catch (error) {
                    console.error('خطا در جستجو:', error);
                    alert('خطا در اتصال به سرور');
                }
            }
            
            function displaySearchResults(data) {
                const container = document.getElementById('searchResults');
                
                if (!data.success || data.results.length === 0) {
                    container.innerHTML = '<div style="text-align: center; padding: 40px;">نتیجه‌ای یافت نشد</div>';
                    return;
                }
                
                let resultsHTML = \`<h3>\${data.results.length} نتیجه برای "\${data.query}"</h3>\`;
                
                data.results.forEach(result => {
                    resultsHTML += \`
                        <div class="result-item">
                            <div><strong>\${result.category}</strong> - \${result.subcategory}</div>
                            <div>\${result.content}</div>
                            <div>\${result.tags.map(tag => \`<span class="tag-badge">\${tag}</span>\`).join('')}</div>
                        </div>
                    \`;
                });
                
                container.innerHTML = resultsHTML;
            }
            
            async function addNewContent() {
                const category = document.getElementById('addCategorySelect').value;
                const content = document.getElementById('addContent').value;
                
                if (!category || !content) {
                    alert('لطفاً دسته‌بندی و محتوا را وارد کنید');
                    return;
                }
                
                try {
                    const response = await fetch('/api/content', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            category, 
                            content
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('محتوا با موفقیت افزوده شد!');
                        document.getElementById('addContent').value = '';
                    } else {
                        alert(data.error || 'خطا در افزودن محتوا');
                    }
                } catch (error) {
                    console.error('خطا در افزودن محتوا:', error);
                    alert('خطا در اتصال به سرور');
                }
            }
            
            document.getElementById('searchInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') performSearch();
            });
        </script>
    </body>
    </html>
    `;
    res.send(html);
  } catch (error) {
    console.error('Error serving HTML:', error);
    res.status(500).send('خطا در بارگذاری صفحه');
  }
});

// 🔧 برای Vercel: فقط app را export کنید
module.exports = app;

// 🔧 برای توسعه محلی: سرور را اجرا کنید
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('🚀 نطق مصطلح - پایگاه دانش پیشرفته راه‌اندازی شد!');
    console.log('📍 آدرس: http://localhost:' + PORT);
  });
}
