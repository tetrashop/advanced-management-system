// تنظیمات اصلی
const CONFIG = {
    BACKEND_URL: 'http://localhost:3002',
    TOKEN_KEY: 'admin_token',
    USER_KEY: 'admin_user'
};

// مدیریت وضعیت برنامه
class AppState {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.init();
    }

    init() {
        this.token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const userData = localStorage.getItem(CONFIG.USER_KEY);
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
        this.updateUI();
    }

    setUser(user, token) {
        this.currentUser = user;
        this.token = token;
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
        this.updateUI();
    }

    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        window.location.href = '/';
    }

    updateUI() {
        const welcomeElement = document.getElementById('userWelcome');
        if (welcomeElement && this.currentUser) {
            welcomeElement.textContent = `خوش آمدید، ${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
    }

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }
}

// مقداردهی اولیه برنامه
const appState = new AppState();

// مدیریت ناوبری
class Navigation {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPage('dashboard');
    }

    setupEventListeners() {
        // کلیک روی منو
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('href').substring(1);
                this.loadPage(page);
                
                // آپدیت منوی فعال
                document.querySelectorAll('.sidebar-menu a').forEach(item => {
                    item.classList.remove('active');
                });
                link.classList.add('active');
            });
        });

        // دکمه toggle سایدبار
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // دکمه خروج
        document.getElementById('logoutBtn').addEventListener('click', () => {
            appState.logout();
        });
    }

    loadPage(page) {
        // مخفی کردن همه صفحات
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // نمایش صفحه جاری
        const currentPage = document.getElementById(page);
        if (currentPage) {
            currentPage.classList.add('active');
            this.currentPage = page;
            
            // لود داده‌های مخصوص صفحه
            this.loadPageData(page);
        }
    }

    async loadPageData(page) {
        switch(page) {
            case 'dashboard':
                await Dashboard.loadDashboardData();
                break;
            case 'users':
                await Users.loadUsers();
                break;
        }
    }
}

// مدیریت داشبورد
class Dashboard {
    static async loadDashboardData() {
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/api/v1/users`, {
                headers: appState.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.updateStats(data.data.users);
                this.updateRecentUsers(data.data.users);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    static updateStats(users) {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status === 'active').length;
        const adminUsers = users.filter(u => u.role === 'admin').length;
        
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeUsers').textContent = activeUsers;
        document.getElementById('adminUsers').textContent = adminUsers;
        document.getElementById('todayLogins').textContent = Math.floor(Math.random() * 50) + 10; // داده نمونه
    }

    static updateRecentUsers(users) {
        const recentUsersContainer = document.getElementById('recentUsers');
        const recentUsers = users.slice(0, 5);
        
        recentUsersContainer.innerHTML = recentUsers.map(user => `
            <div class="recent-user-item">
                <div class="user-avatar">
                    ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                </div>
                <div class="user-info">
                    <h6>${user.firstName} ${user.lastName}</h6>
                    <span class="user-email">${user.email}</span>
                </div>
                <div class="user-status ${user.status === 'active' ? 'active' : 'inactive'}">
                    ${user.status === 'active' ? 'فعال' : 'غیرفعال'}
                </div>
            </div>
        `).join('');
    }
}

// مدیریت مودال‌ها
class Modal {
    static show(modalId) {
        const modal = document.getElementById(modalId + 'Modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    static close(modalId) {
        const modal = document.getElementById(modalId + 'Modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// توابع عمومی
function showModal(modalId) {
    Modal.show(modalId);
}

function closeModal(modalId) {
    Modal.close(modalId);
}

function exportData() {
    alert('امکان خروجی گزارش به زودی اضافه خواهد شد!');
}

// مقداردهی اولیه هنگام لود صفحه
document.addEventListener('DOMContentLoaded', function() {
    new Navigation();
    
    // چک کردن احراز هویت
    if (!appState.token) {
        // اگر توکن وجود ندارد، به صفحه لاگین هدایت شود
        window.location.href = '/login.html';
    }
});

// اضافه کردن استایل برای کاربران اخیر
const style = document.createElement('style');
style.textContent = `
    .recent-user-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-left: 15px;
    }
    
    .user-info h6 {
        margin: 0;
        font-weight: 600;
    }
    
    .user-email {
        font-size: 0.8rem;
        color: #666;
    }
    
    .user-status {
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 0.7rem;
        margin-right: auto;
    }
    
    .user-status.active {
        background: #d4edda;
        color: #155724;
    }
    
    .user-status.inactive {
        background: #f8d7da;
        color: #721c24;
    }
`;
document.head.appendChild(style);
