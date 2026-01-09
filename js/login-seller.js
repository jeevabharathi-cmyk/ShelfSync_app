document.addEventListener("DOMContentLoaded", () => {
  const waitForSupabase = () => {
    if (window.supabaseClient) {
      init();
    } else {
      setTimeout(waitForSupabase, 100);
    }
  };
  waitForSupabase();
});

function init() {
  const supabase = window.supabaseClient;

  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
      // 1️⃣ Authenticate
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        alert(error.message);
        return;
      }

      const userId = data.user.id;

      // 2️⃣ Fetch role from public.users
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        alert("User profile not found. Please sign up again.");
        return;
      }

      // 3️⃣ Enforce seller portal
      if (profile.role !== "seller") {
        await supabase.auth.signOut();
        alert("Only seller accounts can login here.");
        return;
      }

      // 4️⃣ Redirect to seller dashboard
      window.location.href = "seller-dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Login failed.");
    }
  });
}
