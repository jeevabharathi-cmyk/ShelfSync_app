/**
 * Authentication Guard for Dashboard Pages
 * Provides Supabase authentication protection
 */

const supabase = window.supabaseClient;

async function checkAuthAndRole(requiredRole) {
    try {
        // Get current user session
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            // Not authenticated - redirect to appropriate login
            if (requiredRole === 'seller') {
                window.location.href = 'login-seller.html';
            } else if (requiredRole === 'admin') {
                window.location.href = 'login-admin.html';
            } else {
                window.location.href = 'login-customer.html';
            }
            return;
        }

        // Check user role in database
        let userData = null;
        let roleError = null;

        if (requiredRole === 'seller') {
            // For sellers, check sellers table first, then users table as fallback
            const { data: sellerData, error: sellerErr } = await supabase
                .from('sellers')
                .select('role')
                .eq('id', user.id)
                .single();

            if (sellerData && sellerData.role === 'seller') {
                userData = sellerData;
            } else {
                // Fallback to users table
                const { data: userDataFallback, error: userErr } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (userDataFallback && userDataFallback.role === 'seller') {
                    userData = userDataFallback;
                } else {
                    roleError = userErr || sellerErr;
                }
            }
        } else {
            // For customers and admins, check users table
            const { data: userDataDirect, error: userErrDirect } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            console.log(`[Auth Guard] Users table query for ${requiredRole}:`, { userDataDirect, userErrDirect });

            userData = userDataDirect;
            roleError = userErrDirect;
        }

        if (roleError || !userData || userData.role !== requiredRole) {
            // Wrong role or no profile - redirect to appropriate login
            alert('Access denied. Please login with the correct account type.');
            if (requiredRole === 'seller') {
                window.location.href = 'login-seller.html';
            } else if (requiredRole === 'admin') {
                window.location.href = 'login-admin.html';
            } else {
                window.location.href = 'login-customer.html';
            }
            return;
        }

        console.log(`[Auth Guard] User authenticated as ${requiredRole}`);
        return user;

    } catch (error) {
        console.error('[Auth Guard] Error:', error);
        window.location.href = 'login-customer.html';
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutLinks = document.querySelectorAll('a[href="../index.html"]:not(.logo)');
    logoutLinks.forEach(link => {
        if (link.textContent.toLowerCase().includes('logout')) {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await supabase.auth.signOut();
                    window.location.href = '../index.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '../index.html';
                }
            });
        }
    });
}

// Initialize auth guard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupLogout();
});