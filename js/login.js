// Supabase Authentication
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
  let handled = false; // prevents double redirects

  async function redirectBasedOnRole(user) {
    const path = window.location.pathname;

    console.log(`[Login] Checking role for UID: ${user.id}`);

    const { data: profile, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      throw new Error("Database error");
    }

    if (!profile) {
      throw new Error("User profile not created yet. Please try again.");
    }

    const role = profile.role;
    console.log(`[Login] Role = ${role}`);

    // Portal enforcement
    if (path.includes("login-seller") && role !== "seller") {
      await supabase.auth.signOut();
      throw new Error("Not a Seller account");
    }

    if (path.includes("login-admin") && role !== "admin") {
      await supabase.auth.signOut();
      throw new Error("Not an Admin account");
    }

    if (path.includes("login-customer") && role !== "customer") {
      await supabase.auth.signOut();
      throw new Error("Not a Customer account");
    }

    // Redirect
    if (role === "admin") window.location.href = "admin-dashboard.html";
    if (role === "seller") window.location.href = "seller-dashboard.html";
    if (role === "customer") window.location.href = "all-books.html";
  }

  // Handle login once only
  supabase.auth.onAuthStateChange((event, session) => {
    if (handled) return;

    if (event === "SIGNED_IN" && session?.user) {
      handled = true;
      redirectBasedOnRole(session.user).catch(err => alert(err.message));
    }
  });

  // Login form
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
    }
  });
}