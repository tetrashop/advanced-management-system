const express = require('express');
const app = express();

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

// 🔧 اضافه کردن middleware برای لاگ کردن درخواست‌ها
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes پیشرفته
app.get('/api/search/:query', (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const category = req.query.category;
    const minRelevance = parseFloat(req.query.minRelevance) || 0.1;
    const limit = parseInt(req.query.limit) || 25;
    
    console.log(`Search request: query=${query}, category=${category}, minRelevance=${minRelevance}`);
    
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

// 🔧 اضافه کردن route جستجوی ساده‌تر
app.get('/api/search', (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json({
        success: true,
        results: [],
        message: "لطفاً پارامتر جستجو (q) را ارسال کنید"
      });
    }
    
    const results = knowledgeBase.filter(item => 
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    res.json({
      success: true,
      query: query,
      results: results,
      total: results.length
    });
  } catch (error) {
    console.error('Simple search error:', error);
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
                font-family: system-ui, -apple-system, sans-serif;
                background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 100%);
                color: var(--light);
                line-height: 1.6;
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 30px 0;
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                border-radius: 20px;
            }
            
            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
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
                border: none;
                color: white;
                cursor: pointer;
                border-radius: 12px;
                font-size: 1rem;
            }
            
            .tab-button.active {
                background: var(--primary);
            }
            
            .tab-content {
                display: none;
                padding: 30px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
            }
            
            .tab-content.active {
                display: block;
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
            }
            
            .btn {
                padding: 15px 30px;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-size: 1rem;
            }
            
            .result-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 25px;
                margin: 20px 0;
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .category-badge {
                background: var(--success);
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                margin-left: 8px;
                display: inline-block;
            }
            
            .api-test {
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 12px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧠 نطق مصطلح - پایگاه دانش هوشمند</h1>
                <p>سیستم پیشرفته جستجو و مدیریت دانش - نسخه Vercel</p>
            </div>

            <div class="tabs">
                <button class="tab-button active" onclick="switchTab('search')">🔍 جستجو</button>
                <button class="tab-button" onclick="switchTab('stats')">📊 آمار</button>
                <button class="tab-button" onclick="switchTab('test')">🧪 تست API</button>
            </div>

            <div id="tab-search" class="tab-content active">
                <div class="search-box">
                    <input type="text" id="searchInput" class="search-input" placeholder="عبارت مورد نظر را جستجو کنید...">
                    <button class="btn" onclick="performSearch()">جستجو</button>
                </div>
                <div id="searchResults"></div>
            </div>

            <div id="tab-stats" class="tab-content">
                <h3>📊 آمار سیستم</h3>
                <div class="result-item">
                    <div>تعداد محتوا: <strong>${knowledgeBase.length}</strong></div>
                    <div>دسته‌بندی‌ها: <strong>${[...new Set(knowledgeBase.map(item => item.category))].join(', ')}</strong></div>
                </div>
            </div>

            <div id="tab-test" class="tab-content">
                <h3>🧪 تست API endpoints</h3>
                <div class="api-test">
                    <button class="btn" onclick="testAPI('/api/stats')">تست /api/stats</button>
                    <button class="btn" onclick="testAPI('/api/search?q=node')">تست /api/search?q=node</button>
                    <button class="btn" onclick="testAPI('/api/search/node')">تست /api/search/node</button>
                    <div id="apiResult" style="margin-top: 20px;"></div>
                </div>
            </div>
        </div>

        <script>
            function switchTab(tabName) {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                event.target.classList.add('active');
                document.getElementById('tab-' + tabName).classList.add('active');
            }
            
            async function performSearch() {
                const query = document.getElementById('searchInput').value;
                
                if (!query) {
                    alert('لطفاً عبارت جستجو را وارد کنید');
                    return;
                }
                
                try {
                    // تست هر دو endpoint
                    const response = await fetch(\`/api/search/\${encodeURIComponent(query)}\`);
                    const data = await response.json();
                    
                    displaySearchResults(data);
                } catch (error) {
                    console.error('خطا در جستجو:', error);
                    // اگر endpoint اول کار نکرد، endpoint دوم را تست کن
                    try {
                        const response = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
                        const data = await response.json();
                        displaySearchResults(data);
                    } catch (error2) {
                        alert('خطا در اتصال به سرور');
                    }
                }
            }
            
            function displaySearchResults(data) {
                const container = document.getElementById('searchResults');
                
                if (!data.success || data.results.length === 0) {
                    container.innerHTML = '<div class="result-item">نتیجه‌ای یافت نشد</div>';
                    return;
                }
                
                let resultsHTML = \`<h3>\${data.results.length} نتیجه برای "\${data.query}"</h3>\`;
                
                data.results.forEach(result => {
                    resultsHTML += \`
                        <div class="result-item">
                            <div><span class="category-badge">\${result.category}</span></div>
                            <div>\${result.content}</div>
                            <div>\${result.tags.map(tag => \`<span class="category-badge" style="background: #7c3aed;">\${tag}</span>\`).join('')}</div>
                        </div>
                    \`;
                });
                
                container.innerHTML = resultsHTML;
            }
            
            async function testAPI(endpoint) {
                try {
                    const response = await fetch(endpoint);
                    const data = await response.json();
                    document.getElementById('apiResult').innerHTML = \`
                        <div class="result-item">
                            <strong>Endpoint:</strong> \${endpoint}<br>
                            <strong>Status:</strong> \${response.status}<br>
                            <strong>Response:</strong> <pre>\${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    \`;
                } catch (error) {
                    document.getElementById('apiResult').innerHTML = \`
                        <div class="result-item" style="background: #ef4444;">
                            <strong>Endpoint:</strong> \${endpoint}<br>
                            <strong>Error:</strong> \${error.message}
                        </div>
                    \`;
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

// 🔧 هندلر خطای 404
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false, 
    error: 'مسیر یافت نشد',
    path: req.url,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /api/stats',
      'GET /api/search/:query',
      'GET /api/search?q=term',
      'POST /api/content'
    ]
  });
});

// 🔧 هندلر خطای سرور
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'خطای داخلی سرور',
    message: err.message
  });
});

// 🔧 برای Vercel: فقط app را export کنید - بدون app.listen
module.exports = app;
