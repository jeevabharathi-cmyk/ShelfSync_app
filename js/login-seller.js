/**
 * Seller Login Authentication
 * Handles Supabase authentication for seller role
 */

// Get Supabase client
const supabase = window.supabaseClient;

document.addEventListener("DOMContentLoaded", () => {
    console.log('[Seller Login] DOM loaded, Supabase client:', window.supabaseClient);
    
    const form = document.getElementById("loginForm");
    if (!form) {
        console.error('[Seller Login] Login form not found!');
        return;
    }

    console.log('[Seller Login] Login form found, setting up event listener');

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

            // Validate seller role - check sellers table first, then users table as fallback
            let userData = null;
            let roleError = null;

            // Try sellers table first
            const { data: sellerData, error: sellerError } = await supabase
                .from('sellers')
                .select('role')
                .eq('id', data.user.id)
                .single();

            console.log('[Seller Login] Sellers table query result:', { sellerData, sellerError });

            if (sellerData && sellerData.role === 'seller') {
                userData = sellerData;
                console.log('[Seller Login] Found seller in sellers table');
            } else {
                // Fallback to users table
                const { data: userDataFallback, error: userError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                console.log('[Seller Login] Users table query result:', { userDataFallback, userError });

                if (userDataFallback && userDataFallback.role === 'seller') {
                    userData = userDataFallback;
                    console.log('[Seller Login] Found seller in users table');
                } else {
                    roleError = userError || sellerError;
                }
            }

            if (!userData) {
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

            console.log('[Seller Login] Role validated, redirecting to seller-dashboard.html...');
            // Add a small delay to ensure session is properly set
            setTimeout(() => {
                window.location.href = 'seller-dashboard.html';
            }, 100);

        } catch (err) {
            console.error('[Seller Login] Error:', err);
            alert(err.message);
        }
    });
});