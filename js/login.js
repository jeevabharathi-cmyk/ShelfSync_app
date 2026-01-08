// Supabase Authentication
const supabase = window.supabaseClient;

async function redirectBasedOnRole(user) {
    const path = window.location.pathname;

    // STRICT: Seller portal -> 'sellers' table, Others -> 'users' table
    const tableName = path.includes("login-seller") ? "sellers" : "users";

    console.log(`[Login] Checking role for UID: ${user.id} in table: ${tableName}`);

    // Supabase query
    const { data, error } = await supabase
        .from(tableName)
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || !data) {
        console.error(`[Login] Document not found in ${tableName}:`, error);
        throw new Error(`User profile not found in ${tableName}. Please contact support.`);
    }

    const role = data.role;
    console.log(`[Login] User role found: ${role}`);

    // Portal validation
    if (path.includes("login-seller") && role !== "seller")
        throw new Error("Access denied. Seller account required.");

    if (path.includes("login-admin") && role !== "admin")
        throw new Error("Access denied. Admin account required.");

    if (path.includes("login-customer") && role !== "customer")
        throw new Error("Access denied. Customer account required.");

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
            // Supabase login
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            await redirectBasedOnRole(data.user);
        } catch (err) {
            alert(err.message);
        }
    });
});
