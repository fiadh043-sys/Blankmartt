/**
 * BlankMarket - Shared JavaScript
 * Handles authentication, state, toasts, and common UI behavior
 */

const BlankMarket = {
    // === CONFIG ===
    STORAGE_KEYS: {
        USER: 'bm_user',
        BALANCE: 'bm_balance',
        ORDERS: 'bm_orders',
        CART: 'bm_cart'
    },

    // === AUTH ===
    login(userData) {
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(userData));
        // Set default balance if first time
        if (!localStorage.getItem(this.STORAGE_KEYS.BALANCE)) {
            localStorage.setItem(this.STORAGE_KEYS.BALANCE, '124850');
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify([]));
        }
    },

    logout() {
        localStorage.removeItem(this.STORAGE_KEYS.USER);
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        const user = localStorage.getItem(this.STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    // === WALLET ===
    getBalance() {
        return parseInt(localStorage.getItem(this.STORAGE_KEYS.BALANCE) || '0');
    },

    setBalance(newBalance) {
        localStorage.setItem(this.STORAGE_KEYS.BALANCE, newBalance.toString());
    },

    // Track total deposits separately
    addDeposit(amount) {
        const current = this.getTotalDeposits();
        localStorage.setItem('bm_total_deposits', (current + amount).toString());
    },

    getTotalDeposits() {
        return parseInt(localStorage.getItem('bm_total_deposits') || '0');
    },

    // === MULTI-CURRENCY SUPPORT ===
    CURRENCIES: {
        NGN: { symbol: '₦', rate: 1, flag: '🇳🇬', name: 'Nigerian Naira' },
        USD: { symbol: '$', rate: 0.000625, flag: '🇺🇸', name: 'US Dollar' }
    },

    getSelectedCurrency() {
        return localStorage.getItem('bm_currency') || 'NGN';
    },

    setSelectedCurrency(currency) {
        if (this.CURRENCIES[currency]) {
            localStorage.setItem('bm_currency', currency);
        }
    },

    getBalanceInCurrency(currency = null) {
        const baseBalance = this.getBalance(); // stored in NGN
        const curr = currency || this.getSelectedCurrency();
        const rate = this.CURRENCIES[curr].rate;
        return (baseBalance * rate).toFixed(2);
    },

    // === ORDERS ===
    getOrders() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORDERS) || '[]');
    },

    addOrder(order) {
        const orders = this.getOrders();
        orders.unshift(order); // newest first
        localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    },

    // === TOAST NOTIFICATIONS (better than alert) ===
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
            background: ${type === 'success' ? '#166534' : '#7f1d1d'};
            color: white; padding: 14px 24px; border-radius: 9999px;
            font-size: 15px; font-weight: 500; box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            z-index: 9999; display: flex; align-items: center; gap: 10px;
            max-width: 90%; text-align: center;
        `;
        toast.innerHTML = `
            <span>${type === 'success' ? '✅' : '⚠️'}</span> 
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2800);
    },

    // === UPDATE HEADER BASED ON LOGIN STATE ===
    updateHeader() {
        const user = this.getCurrentUser();
        const loginIcon = document.querySelector('.login-icon');
        
        if (loginIcon && user) {
            loginIcon.innerHTML = '👤';
            loginIcon.href = 'dashboard.html';
            loginIcon.title = `Logged in as ${user.name || 'User'}`;
        }
    },

    // === INITIALIZE COMMON BEHAVIOR ===
    init() {
        // Update header on every page
        this.updateHeader();

        // === Drawer + Overlay handling ===
        const menuBtn = document.getElementById('menu-btn');
        const drawer = document.getElementById('nav-drawer');
        const overlay = document.getElementById('overlay');

        if (menuBtn && drawer && overlay) {
            // Clone to remove any old listeners
            const newMenuBtn = menuBtn.cloneNode(true);
            menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);

            newMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = drawer.classList.contains('open');
                if (isOpen) {
                    drawer.classList.remove('open');
                    overlay.style.display = 'none';
                } else {
                    drawer.classList.add('open');
                    overlay.style.display = 'block';
                }
            });

            // Overlay click to close
            overlay.onclick = () => {
                drawer.classList.remove('open');
                overlay.style.display = 'none';
            };

            // Click outside to close
            document.addEventListener('click', function handler(e) {
                if (drawer.classList.contains('open') &&
                    !drawer.contains(e.target) &&
                    e.target !== newMenuBtn) {
                    drawer.classList.remove('open');
                    overlay.style.display = 'none';
                    document.removeEventListener('click', handler);
                }
            });
        }

        // === Accordion handling ===
        document.querySelectorAll('.accordion').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                const submenu = newBtn.nextElementSibling;
                if (submenu) {
                    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                }
            });
        });
    }
};

// Auto-initialize on every page
document.addEventListener('DOMContentLoaded', () => {
    BlankMarket.init();
});