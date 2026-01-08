/**
 * Universal Authentication & Role Guard
 * Usage:
 *   checkAuthAndRole("admin")
 *   checkAuthAndRole("seller")
 *   checkAuthAndRole("customer")
 */

const supabase = window.supabaseClient;

async function checkAuthAndRole(requiredRole) {
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
