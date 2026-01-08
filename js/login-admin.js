/**
 * Admin Login Authentication
 * Handles Supabase authentication for admin role
 */

// Get Supabase client
const supabase = window.supabaseClient;

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (!form) return;

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

            // Validate admin role
            const { data: userData, error: roleError } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

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

            console.log('[Admin Login] Role validated, redirecting...');
            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';

        } catch (err) {
            console.error('[Admin Login] Error:', err);
            alert(err.message);
        }
    });
});