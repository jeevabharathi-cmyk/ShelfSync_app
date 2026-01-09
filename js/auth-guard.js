/**
 * Universal Authentication & Role Guard
 * Usage:
 *   checkAuthAndRole("admin")
 *   checkAuthAndRole("seller")
 *   checkAuthAndRole("customer")
 */

document.addEventListener('DOMContentLoaded', () => {
    const waitForSupabase = () => {
        if (window.supabaseClient) {
            initializeAuthGuard();
        } else {
            setTimeout(waitForSupabase, 100);
        }
    };
    waitForSupabase();
});

function initializeAuthGuard() {
    const supabase = window.supabaseClient;
    setupLogout(supabase);
}

async function checkAuthAndRole(requiredRole) {
  const supabase = window.supabaseClient;
  if (!supabase) {
    console.error('[Auth Guard] Supabase client not available');
    redirectToLogin(requiredRole);
    return;
  }

  try {
    // 1️⃣ Check authentication
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      redirectToLogin(requiredRole);
      return;
    }

    const userId = authData.user.id;

    // 2️⃣ Fetch role from users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    // 3️⃣ Validate role
    if (profileError || !profile || profile.role !== requiredRole) {
      await supabase.auth.signOut();
      redirectToLogin(requiredRole);
      return;
    }

    // ✅ Access granted
    console.log(`[Auth Guard] Access granted as ${requiredRole}`);
    return authData.user;
  } catch (err) {
    console.error("[Auth Guard] Unexpected error:", err);
    redirectToLogin(requiredRole);
  }
}

// 🔁 Centralized redirect logic
function redirectToLogin(role) {
  if (role === "admin") {
    window.location.href = "login-admin.html";
  } else if (role === "seller") {
    window.location.href = "login-seller.html";
  } else {
    window.location.href = "login-customer.html";
  }
}

// Setup logout functionality
function setupLogout(supabase) {
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
