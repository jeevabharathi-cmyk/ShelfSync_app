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

            // 2. Manual database profile creation (required for auth-guard.js role checking)
            if (data.user) {
                const profileData = {
                    id: data.user.id,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    role: role
                };

                if (role === 'seller') {
                    // Insert into users table for universal login logic
                    const { error: sellerError } = await supabase
                        .from('users')
                        .insert(profileData);
                    
                    if (sellerError) {
                        console.error('Seller profile creation error:', sellerError);
                    }
                } else if (role === 'admin') {
                    // Insert into users table for admin
                    const { error: adminError } = await supabase
                        .from('users')
                        .insert(profileData);
                    
                    if (adminError) {
                        console.error('Admin profile creation error:', adminError);
                    }
                } else {
                    // Insert into users table for customer
                    const { error: customerError } = await supabase
                        .from('users')
                        .insert(profileData);
                    
                    if (customerError) {
                        console.error('Customer profile creation error:', customerError);
                    }
                }
            }

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

