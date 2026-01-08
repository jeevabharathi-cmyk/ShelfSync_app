// Supabase Authentication
const supabase = window.supabaseClient;

async function redirectBasedOnRole(user) {
    const path = window.location.pathname;

    console.log(`[Login] Checking role for UID: ${user.id} in users table`);

    // Universal pattern - always check users table
    const { data: profile, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (roleError || !profile) {
        console.error(`[Login] User profile not found:`, roleError);
        await supabase.auth.signOut();
        throw new Error('User profile not found');
    }

    const role = profile.role;
    console.log(`[Login] User role found: ${role}`);

    // Portal validation
    if (path.includes("login-seller") && role !== "seller") {
        await supabase.auth.signOut();
        throw new Error("Unauthorized");
    }

    if (path.includes("login-admin") && role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Unauthorized");
    }

    if (path.includes("login-customer") && role !== "customer") {
        await supabase.auth.signOut();
        throw new Error("Unauthorized");
    }

    // Redirect
    if (role === "admin") window.location.href = "admin-dashboard.html";
    if (role === "seller") window.location.href = "seller-dashboard.html";
    if (role === "customer") window.location.href = "all-books.html";
}

document.addEventListener("DOMContentLoaded", () => {

    // Supabase auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user && window.location.pathname.includes("login-")) {
            redirectBasedOnRole(session.user).catch(console.error);
        }
    });

    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;

        try {
            // Universal login logic
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                alert(error.message);
                return;
            }

            await redirectBasedOnRole(data.user);
        } catch (err) {
            alert(err.message);
        }
    });
});
