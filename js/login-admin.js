/**
 * Admin Login Authentication
 * Handles Supabase authentication for admin role
 */

// Get Supabase client
document.addEventListener("DOMContentLoaded", () => {
    const waitForSupabase = () => {
        if (window.supabaseClient) {
            initializeLogin();
        } else {
            setTimeout(waitForSupabase, 100);
        }
    };
    waitForSupabase();
});

function initializeLogin() {
    const supabase = window.supabaseClient;
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

        // Universal login logic
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert(error.message);
            return;
        }

        const userId = data.user.id;

        const { data: profile, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (roleError || !profile) {
            alert('User profile not found');
            await supabase.auth.signOut();
            return;
        }

        // Admin login role-based redirect
        if (profile.role !== 'admin') {
            alert('Unauthorized');
            await supabase.auth.signOut();
            return;
        }

        window.location.href = 'admin-dashboard.html';
    });
}