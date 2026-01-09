/**
 * Admin Dashboard Functionality
 * Handles admin-specific dashboard features and data
 */

// Admin dashboard initialization
document.addEventListener('DOMContentLoaded', () => {
    const waitForSupabase = () => {
        if (window.supabaseClient) {
            initializeAdminDashboard();
        } else {
            setTimeout(waitForSupabase, 100);
        }
    };
    waitForSupabase();
});

// Dashboard state
let currentUser = null;
let adminStats = {
    totalUsers: 0,
    totalBooks: 0,
    totalOrders: 0,
    totalRevenue: 0
};

function initializeAdminDashboard() {
    const supabase = window.supabaseClient;
    
    // Call the dashboard initialization
    initializeDashboard();
}

/**
 * Initialize admin dashboard
 */
async function initializeDashboard() {
    const supabase = window.supabaseClient;
    
    try {
        console.log('[Admin Dashboard] Initializing dashboard...');
        
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            console.error('[Admin Dashboard] No authenticated user found');
            window.location.href = 'login-admin.html';
            return;
        }

        currentUser = user;
        console.log('[Admin Dashboard] User authenticated:', user.id);

        // Load admin profile
        await loadAdminProfile();
        
        // Load admin statistics
        await loadAdminStats();
        
        // Setup logout functionality
        setupLogout();
        
        console.log('[Admin Dashboard] Dashboard initialized successfully');
        
    } catch (error) {
        console.error('[Admin Dashboard] Initialization error:', error);
        alert('Failed to load dashboard. Please try refreshing the page.');
    }
}

/**
 * Load admin profile information
 */
async function loadAdminProfile() {
    const supabase = window.supabaseClient;
    
    try {
        const { data: profile, error } = await supabase
            .from('users')
            .select('first_name, last_name, email, department, employee_id')
            .eq('id', currentUser.id)
            .single();

        if (error) {
            console.error('[Admin Dashboard] Error loading profile:', error);
            return;
        }

        // Update UI with admin name
        const adminInitial = profile.first_name ? profile.first_name.charAt(0).toUpperCase() : 'A';
        const adminAvatar = document.querySelector('.dashboard-header div[style*="border-radius: 50%"]');
        if (adminAvatar) {
            adminAvatar.textContent = adminInitial;
            adminAvatar.title = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        }

        // Update welcome message if exists
        const welcomeMessage = document.querySelector('.dashboard-header h2');
        if (welcomeMessage && profile.first_name) {
            welcomeMessage.textContent = `Welcome, ${profile.first_name}`;
        }

        console.log('[Admin Dashboard] Profile loaded:', profile);
        
    } catch (error) {
        console.error('[Admin Dashboard] Profile loading error:', error);
    }
}

/**
 * Load admin statistics from Supabase
 */
async function loadAdminStats() {
    const supabase = window.supabaseClient;
    
    try {
        // Load user count
        const { count: userCount, error: userError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (!userError) {
            adminStats.totalUsers = userCount || 0;
        }

        // Load book count
        const { count: bookCount, error: bookError } = await supabase
            .from('books')
            .select('*', { count: 'exact', head: true });

        if (!bookError) {
            adminStats.totalBooks = bookCount || 0;
        }

        // Load orders from localStorage (as per current implementation)
        const orders = loadOrdersFromStorage();
        adminStats.totalOrders = orders.length;
        adminStats.totalRevenue = orders.reduce((sum, order) => sum + (order.totals?.total || 0), 0);

        // Update stats display
        updateStatsDisplay();
        
    } catch (error) {
        console.error('[Admin Dashboard] Stats loading error:', error);
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
        statCards[0].textContent = adminStats.totalUsers.toString();
        statCards[1].textContent = adminStats.totalBooks.toString();
        statCards[2].textContent = adminStats.totalOrders.toString();
        statCards[3].textContent = `$${adminStats.totalRevenue.toLocaleString()}`;
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
 * Setup logout functionality
 */
function setupLogout() {
    const supabase = window.supabaseClient;
    const logoutLinks = document.querySelectorAll('a[href="../index.html"]');
    logoutLinks.forEach(link => {
        if (link.textContent.toLowerCase().includes('logout')) {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await supabase.auth.signOut();
                    console.log('[Admin Dashboard] User logged out successfully');
                    window.location.href = '../index.html';
                } catch (error) {
                    console.error('[Admin Dashboard] Logout error:', error);
                    // Force redirect even if logout fails
                    window.location.href = '../index.html';
                }
            });
        }
    });
}

// Make functions available globally
window.initializeAdminDashboard = initializeDashboard;