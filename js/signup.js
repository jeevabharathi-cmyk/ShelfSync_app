// Supabase Authentication
const supabase = window.supabaseClient;

/**
 * Signup logic for ShelfSync
 * Handles user registration with Supabase Auth
 * User profile creation handled by database trigger
 */

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;

        // Basic validation
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            alert("Password should be at least 6 characters long.");
            return;
        }

        try {
            // 1. Create user in Supabase Authentication
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        role: role
                    }
                }
            });

            if (error) throw error;

            // 2. User profile creation handled by Supabase trigger
            // No manual database insertion needed - trigger creates user/seller record

            alert("Account created successfully!");

            // 3. Redirect based on role
            if (role === 'seller') {
                window.location.href = 'login-seller.html';
            } else {
                window.location.href = 'login-customer.html';
            }

        } catch (error) {
            console.error("Signup Error:", error);
            let message = "An error occurred during signup.";
            if (error.message?.includes('already registered')) {
                message = "This email is already registered.";
            } else if (error.message?.includes('invalid email')) {
                message = "Please enter a valid email address.";
            } else if (error.message?.includes('weak password')) {
                message = "The password is too weak.";
            }
            alert(message);
        }
    });
});

