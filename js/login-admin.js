/**
 * Admin Login Authentication
 * Handles Supabase authentication for admin role
 */

// Get Supabase client
const supabase = window.supabaseClient;

document.addEventListener("DOMContentLoaded", () => {
    console.log('[Admin Login] DOM loaded, Supabase client:', window.supabaseClient);
    
    const form = document.getElementById("loginForm");
    if (!form) {
        console.error('[Admin Login] Login form not found!');
        return;
    }

    console.log('[Admin Login] Login form found, setting up event listener');

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Get form inputs
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;

        try {
            // Supabase authentication
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            console.log(`[Admin Login] User authenticated: ${data.user.id}`);

            // Validate admin role - check users table
            const { data: userData, error: roleError } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            console.log('[Admin Login] Users table query result:', { userData, roleError });

            if (roleError || !userData) {
                console.error('[Admin Login] User profile not found:', roleError);
                await supabase.auth.signOut();
                throw new Error('User profile not found. Please contact support.');
            }

            // Check if user has admin role
            if (userData.role !== 'admin') {
                console.log(`[Admin Login] Unauthorized role: ${userData.role}`);
                await supabase.auth.signOut();
                alert('Unauthorized access. Admin account required.');
                return;
            }

            console.log('[Admin Login] Role validated, redirecting to admin-dashboard.html...');
            // Add a small delay to ensure session is properly set
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 100);

        } catch (err) {
            console.error('[Admin Login] Error:', err);
            alert(err.message);
        }
    });
});