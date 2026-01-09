/**
 * Seller Login Authentication (FIXED)
 */

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

  const form = document.getElementById("loginForm");
  if (!form) {
    console.error("Login form not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    const submitBtn = e.target.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Logging in...";
    submitBtn.disabled = true;

    try {
      // 1️⃣ Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        alert(error.message);
        return;
      }

      const userId = data.user.id;
      console.log("Logged in UID:", userId);

      // 2️⃣ Fetch role from public.users
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
        throw new Error("Profile lookup failed");
      }

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("User profile not found. Please sign up again.");
      }

      console.log("User role:", profile.role);

      // 3️⃣ Enforce seller-only access
      if (profile.role !== "seller") {
        await supabase.auth.signOut();
        throw new Error("This account is not a Seller account.");
      }

      // 4️⃣ Redirect
      submitBtn.textContent = "Success!";
      setTimeout(() => {
        window.location.href = "seller-dashboard.html";
      }, 400);

    } catch (err) {
      alert(err.message);
    } finally {
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 800);
    }
  });
}
