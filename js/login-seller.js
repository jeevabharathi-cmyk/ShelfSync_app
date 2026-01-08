/**
 * Seller Login Authentication
 * Handles Supabase authentication for seller role
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

            console.log(`[Seller Login] User authenticated: ${data.user.id}`);

            // Validate seller role - check sellers table
            const { data: userData, error: roleError } = await supabase
                .from('sellers')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (roleError || !userData) {
                console.error('[Seller Login] Seller profile not found:', roleError);
                await supabase.auth.signOut();
                throw new Error('Seller profile not found. Please contact support.');
            }

            // Check if user has seller role
            if (userData.role !== 'seller') {
                console.log(`[Seller Login] Unauthorized role: ${userData.role}`);
                await supabase.auth.signOut();
                alert('Unauthorized access. Seller account required.');
                return;
            }

            console.log('[Seller Login] Role validated, redirecting...');
            // Redirect to seller dashboard
            window.location.href = 'seller-dashboard.html';

        } catch (err) {
            console.error('[Seller Login] Error:', err);
            alert(err.message);
        }
    });
});