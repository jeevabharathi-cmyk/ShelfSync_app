/**
 * Customer Login Authentication
 * Handles Supabase authentication for customer role
 */

// Get Supabase client
const supabase = window.supabaseClient;

document.addEventListener("DOMContentLoaded", () => {
    console.log('[Customer Login] DOM loaded, Supabase client:', window.supabaseClient);
    
    const form = document.getElementById("loginForm");
    if (!form) {
        console.error('[Customer Login] Login form not found!');
        return;
    }

    console.log('[Customer Login] Login form found, setting up event listener');

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

            console.log(`[Customer Login] User authenticated: ${data.user.id}`);

            // Validate customer role
            const { data: userData, error: roleError } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            console.log('[Customer Login] Users table query result:', { userData, roleError });

            if (roleError || !userData) {
                console.error('[Customer Login] User profile not found:', roleError);
                await supabase.auth.signOut();
                throw new Error('User profile not found. Please contact support.');
            }

            // Check if user has customer role
            if (userData.role !== 'customer') {
                console.log(`[Customer Login] Unauthorized role: ${userData.role}`);
                await supabase.auth.signOut();
                alert('Unauthorized access. Customer account required.');
                return;
            }

            console.log('[Customer Login] Role validated, redirecting to all-books.html...');
            // Add a small delay to ensure session is properly set
            setTimeout(() => {
                window.location.href = 'all-books.html';
            }, 100);

        } catch (err) {
            console.error('[Customer Login] Error:', err);
            alert(err.message);
        }
    });
});