/**
 * Seller Login Authentication
 * Handles Supabase authentication for seller role
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

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            // Universal login logic
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('[Seller Login] Auth error:', error);
                alert(error.message);
                return;
            }

            console.log('[Seller Login] Auth successful, user ID:', data.user.id);

            const userId = data.user.id;

            // Query user profile with detailed logging
            console.log('[Seller Login] Querying user profile for ID:', userId);
            
            const { data: profile, error: roleError } = await supabase
                .from('users')
                .select('role, first_name, last_name')
                .eq('id', userId)
                .single();

            console.log('[Seller Login] Profile query result:', { profile, roleError });

            if (roleError) {
                console.error('[Seller Login] Profile query error:', roleError);
                
                // Check if it's a "no rows" error (user profile doesn't exist)
                if (roleError.code === 'PGRST116') {
                    alert('User profile not found. Please contact support or try signing up again.');
                } else {
                    alert(`Database error: ${roleError.message}`);
                }
                await supabase.auth.signOut();
                return;
            }

            if (!profile) {
                console.error('[Seller Login] No profile returned from query');
                alert('User profile not found. Please contact support or try signing up again.');
                await supabase.auth.signOut();
                return;
            }

            console.log('[Seller Login] Profile found:', profile);

            // Seller login role-based redirect
            if (profile.role !== 'seller') {
                console.warn('[Seller Login] User role mismatch. Expected: seller, Got:', profile.role);
                alert(`Unauthorized - Seller account required. Your account type: ${profile.role}`);
                await supabase.auth.signOut();
                return;
            }

            console.log('[Seller Login] Login successful for:', profile.first_name, profile.last_name);
            
            // Show success message briefly before redirect
            submitBtn.textContent = 'Success! Redirecting...';
            submitBtn.style.backgroundColor = '#10b981';
            
            // Redirect to seller dashboard
            setTimeout(() => {
                window.location.href = 'seller-dashboard.html';
            }, 500);

        } catch (error) {
            console.error('[Seller Login] Unexpected error:', error);
            alert('Login failed. Please try again.');
        } finally {
            // Reset button state if still on page
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                }
            }, 1000);
        }
    });
}