// Supabase Authentication
document.addEventListener('DOMContentLoaded', () => {
    // Wait for supabase client to be available
    const waitForSupabase = () => {
        if (window.supabaseClient) {
            initializeSignup();
        } else {
            setTimeout(waitForSupabase, 100);
        }
    };
    waitForSupabase();
});

function initializeSignup() {
    const supabase = window.supabaseClient;
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
            console.log('Starting signup process...');
            
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

            if (error) {
                console.error('Signup error:', error);
                throw error;
            }

            console.log('Auth user created:', data.user?.id);

            // 2. Manual database profile creation (required for auth-guard.js role checking)
            if (data.user) {
                const profileData = {
                    id: data.user.id,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    role: role
                };

                console.log('Inserting profile data:', profileData);

                // Insert into users table for all roles
                const { error: profileError } = await supabase
                    .from('users')
                    .insert(profileData);
                
                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    throw profileError;
                }

                console.log('Profile created successfully');
            }

            alert("Account created successfully!");

            // 3. Redirect based on role
            if (role === 'admin') {
                window.location.href = 'login-admin.html';
            } else if (role === 'seller') {
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
}

