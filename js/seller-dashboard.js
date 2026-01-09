/**
 * Seller Dashboard Functionality
 * Handles seller-specific dashboard features and data
 */

// Get Supabase client
const supabase = window.supabaseClient;

// Dashboard state
let currentUser = null;
let sellerStats = {
    totalSales: 0,
    booksSold: 0,
    activeListings: 0,
    sellerRating: 4.9
};

/**
 * Initialize seller dashboard
 */
async function initializeSellerDashboard() {
    try {
        console.log('[Seller Dashboard] Initializing dashboard...');
        
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            console.error('[Seller Dashboard] No authenticated user found');
            window.location.href = 'login-seller.html';
            return;
        }

        currentUser = user;
        console.log('[Seller Dashboard] User authenticated:', user.id);

        // Load seller profile
        await loadSellerProfile();
        
        // Load seller statistics
        await loadSellerStats();
        
        // Load recent orders
        await loadRecentOrders();
        
        // Setup logout functionality
        setupLogout();
        
        console.log('[Seller Dashboard] Dashboard initialized successfully');
        
    } catch (error) {
        console.error('[Seller Dashboard] Initialization error:', error);
        alert('Failed to load dashboard. Please try refreshing the page.');
    }
}

/**
 * Load seller profile information
 */
async function loadSellerProfile() {
    try {
        const { data: profile, error } = await supabase
            .from('users')
            .select('first_name, last_name, email')
            .eq('id', currentUser.id)
            .single();

        if (error) {
            console.error('[Seller Dashboard] Error loading profile:', error);
            return;
        }

        // Update UI with seller name
        const sellerInitial = profile.first_name ? profile.first_name.charAt(0).toUpperCase() : 'S';
        const sellerAvatar = document.querySelector('.dashboard-header div[style*="border-radius: 50%"]');
        if (sellerAvatar) {
            sellerAvatar.textContent = sellerInitial;
            sellerAvatar.title = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        }

        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage && profile.first_name) {
            welcomeMessage.textContent = `Welcome back, ${profile.first_name}! Manage your inventory and track your sales.`;
        }

        console.log('[Seller Dashboard] Profile loaded:', profile);
        
    } catch (error) {
        console.error('[Seller Dashboard] Profile loading error:', error);
    }
}

/**
 * Load seller statistics from Supabase
 */
async function loadSellerStats() {
    try {
        // Try to load real stats from Supabase
        const { data: books, error: booksError } = await supabase
            .from('books')
            .select('*')
            .eq('seller_id', currentUser.id);

        if (!booksError && books) {
            sellerStats.activeListings = books.length;
            sellerStats.totalSales = books.reduce((sum, book) => sum + (book.sales_count || 0) * book.price, 0);
            sellerStats.booksSold = books.reduce((sum, book) => sum + (book.sales_count || 0), 0);
        }

        // Update stats display
        updateStatsDisplay();
        
    } catch (error) {
        console.error('[Seller Dashboard] Stats loading error:', error);
        // Use default stats if loading fails
        updateStatsDisplay();
    }
}

/**
 * Update statistics display in the UI
 */
function updateStatsDisplay() {
    const statCards = document.querySelectorAll('.stat-card h3');
    if (statCards.length >= 4) {
        statCards[0].textContent = `$${sellerStats.totalSales.toLocaleString()}`;
        statCards[1].textContent = sellerStats.booksSold.toString();
        statCards[2].textContent = sellerStats.activeListings.toString();
        statCards[3].textContent = sellerStats.sellerRating.toString();
    }
}

/**
 * Load recent orders for the seller
 */
async function loadRecentOrders() {
    try {
        // Load orders from localStorage (as per current implementation)
        const orders = loadOrdersFromStorage();
        renderRecentOrdersTable(orders.slice(0, 6));
        
    } catch (error) {
        console.error('[Seller Dashboard] Orders loading error:', error);
    }
}

/**
 * Load orders from localStorage
 */
function loadOrdersFromStorage() {
    try {
        const ORDERS_KEY = 'shelfsync_orders_v1';
        const raw = localStorage.getItem(ORDERS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * Render recent orders table
 */
function renderRecentOrdersTable(orders) {
    const body = document.getElementById('recentOrdersBody');
    if (!body) return;

    body.innerHTML = '';

    if (orders.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.className = 'text-light';
        td.style.padding = '1rem';
        td.style.textAlign = 'center';
        td.innerHTML = `
            <div style="padding: 2rem;">
                <h4 style="margin-bottom: 1rem; color: var(--text-light);">No Recent Orders</h4>
                <p style="margin-bottom: 1rem;">Start selling books to see orders here!</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="seller-add-book.html" class="btn btn-primary">Add Your First Book</a>
                    <button class="btn btn-outline" onclick="seedDemoOrders()">View Demo Orders</button>
                </div>
            </div>
        `;
        tr.appendChild(td);
        body.appendChild(tr);
        return;
    }

    orders.forEach((order) => {
        const tr = document.createElement('tr');

        // Order ID
        const tdId = document.createElement('td');
        tdId.textContent = `#${order.id || ''}`;
        tdId.style.fontFamily = 'monospace';

        // Book title
        const tdBook = document.createElement('td');
        const firstItem = Array.isArray(order.items) && order.items[0];
        tdBook.textContent = firstItem ? firstItem.title : '—';

        // Customer name
        const tdCust = document.createElement('td');
        tdCust.textContent = order.delivery?.fullName || '—';

        // Date
        const tdDate = document.createElement('td');
        try {
            const date = new Date(order.createdAt);
            tdDate.textContent = date.toLocaleDateString();
        } catch {
            tdDate.textContent = '—';
        }

        // Status
        const tdStatus = document.createElement('td');
        const badge = document.createElement('span');
        const status = String(order.status || 'Pending');
        badge.className = getStatusBadgeClass(status);
        badge.textContent = status;
        tdStatus.appendChild(badge);

        // Action
        const tdAction = document.createElement('td');
        const actionBtn = document.createElement('a');
        actionBtn.className = 'btn btn-primary';
        actionBtn.href = `ship-track-details.html?orderId=${encodeURIComponent(order.id || '')}`;
        actionBtn.textContent = getActionLabel(status);
        actionBtn.style.padding = '0.25rem 0.5rem';
        actionBtn.style.fontSize = '0.75rem';
        tdAction.appendChild(actionBtn);

        tr.appendChild(tdId);
        tr.appendChild(tdBook);
        tr.appendChild(tdCust);
        tr.appendChild(tdDate);
        tr.appendChild(tdStatus);
        tr.appendChild(tdAction);
        body.appendChild(tr);
    });
}

/**
 * Get CSS class for status badge
 */
function getStatusBadgeClass(status) {
    const s = status.toLowerCase();
    if (s === 'pending') return 'badge badge-warning';
    if (s === 'processing') return 'badge badge-primary';
    if (s === 'shipped') return 'badge badge-success';
    if (s === 'delivered') return 'badge badge-success';
    if (s === 'cancelled') return 'badge badge-error';
    return 'badge badge-primary';
}

/**
 * Get action label based on status
 */
function getActionLabel(status) {
    const s = status.toLowerCase();
    if (s === 'pending' || s === 'processing') return 'Ship';
    if (s === 'shipped') return 'Track';
    if (s === 'delivered') return 'View';
    return 'View';
}

/**
 * Setup logout functionality
 */
function setupLogout() {
    const logoutLinks = document.querySelectorAll('a[href="../index.html"]');
    logoutLinks.forEach(link => {
        if (link.textContent.toLowerCase().includes('logout')) {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await supabase.auth.signOut();
                    console.log('[Seller Dashboard] User logged out successfully');
                    window.location.href = '../index.html';
                } catch (error) {
                    console.error('[Seller Dashboard] Logout error:', error);
                    // Force redirect even if logout fails
                    window.location.href = '../index.html';
                }
            });
        }
    });
}

/**
 * Seed demo orders for testing
 */
function seedDemoOrders() {
    try {
        const ORDERS_KEY = 'shelfsync_orders_v1';
        const demoOrders = [
            {
                id: `ORD-${Date.now() - 86400000}`,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                status: 'Pending',
                items: [{ title: 'Atomic Habits', price: 16.99, qty: 1 }],
                totals: { subtotal: 16.99, delivery: 2.0, tax: 0.85, total: 19.84 },
                payment: { method: 'gpay' },
                delivery: { fullName: 'Alice Johnson', phone: '+91 98765 43210', address: '123 Main St', city: 'Mumbai', pincode: '400001' },
                shipment: { carrier: '', trackingNumber: '', shippedAt: null, deliveredAt: null, notes: '' }
            },
            {
                id: `ORD-${Date.now() - 172800000}`,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                status: 'Shipped',
                items: [{ title: 'Deep Work', price: 14.50, qty: 2 }],
                totals: { subtotal: 29.00, delivery: 2.0, tax: 1.45, total: 32.45 },
                payment: { method: 'upi' },
                delivery: { fullName: 'Bob Smith', phone: '+91 87654 32109', address: '456 Oak Ave', city: 'Delhi', pincode: '110001' },
                shipment: { carrier: 'DTDC', trackingNumber: 'DT123456789', shippedAt: new Date(Date.now() - 86400000).toISOString(), deliveredAt: null, notes: '' }
            },
            {
                id: `ORD-${Date.now() - 259200000}`,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                status: 'Delivered',
                items: [{ title: 'The Alchemist', price: 12.99, qty: 1 }],
                totals: { subtotal: 12.99, delivery: 2.0, tax: 0.65, total: 15.64 },
                payment: { method: 'card' },
                delivery: { fullName: 'Charlie Brown', phone: '+91 76543 21098', address: '789 Pine Rd', city: 'Bangalore', pincode: '560001' },
                shipment: { carrier: 'BlueDart', trackingNumber: 'BD987654321', shippedAt: new Date(Date.now() - 172800000).toISOString(), deliveredAt: new Date(Date.now() - 86400000).toISOString(), notes: '' }
            }
        ];

        const existingOrders = loadOrdersFromStorage();
        const combinedOrders = [...demoOrders, ...existingOrders];
        localStorage.setItem(ORDERS_KEY, JSON.stringify(combinedOrders));
        
        // Reload orders display
        loadRecentOrders();
        
        // Update stats
        sellerStats.booksSold += 4;
        sellerStats.totalSales += 63.43;
        updateStatsDisplay();
        
        console.log('[Seller Dashboard] Demo orders seeded successfully');
        
    } catch (error) {
        console.error('[Seller Dashboard] Error seeding demo orders:', error);
        alert('Failed to seed demo orders. Please try again.');
    }
}

// Make functions available globally
window.seedDemoOrders = seedDemoOrders;
window.initializeSellerDashboard = initializeSellerDashboard;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Seller Dashboard] DOM loaded, initializing...');
    initializeSellerDashboard();
});