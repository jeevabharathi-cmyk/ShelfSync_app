/**
 * Admin Signup Authentication
 * Handles admin registration with Supabase Auth
 */

// Admin signup initialization
document.addEventListener('DOMContentLoaded', () => {
    const waitForSupabase = () => {
        if (window.supabaseClient) {
            initializeAdminSignup();
        } else {
            setTimeout(waitForSupabase, 100);
        }
    };
    waitForSupabase();
});

function initializeAdminSignup() {
    const supabase = window.supabaseClient;
    const signupForm = document.getElementById('adminSignupForm');
    if (!signupForm) return;

    console.log('[Admin Signup] Form initialized');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const department = document.getElementById('department').value;
        const employeeId = document.getElementById('employeeId').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsChecked = document.getElementById('termsCheckbox').checked;
        const authorizationChecked = document.getElementById('authorizationCheckbox').checked;

        // Validation
        if (!validateAdminSignup(firstName, lastName, email, department, password, confirmPassword, termsChecked, authorizationChecked)) {
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Admin Account...';
        submitBtn.disabled = true;

        try {
            console.log('[Admin Signup] Starting admin registration process...');
            
            // 1. Create user in Supabase Authentication
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        role: 'admin',
                        department: department,
                        employee_id: employeeId || null
                    }
                }
            });

            if (error) {
                console.error('[Admin Signup] Auth error:', error);
                throw error;
            }

            console.log('[Admin Signup] Auth user created:', data.user?.id);

            // 2. Create admin profile in database
            if (data.user) {
                const profileData = {
                    id: data.user.id,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    role: 'admin',
                    department: department,
                    employee_id: employeeId || null,
                    created_at: new Date().toISOString(),
                    is_active: true
                };

                console.log('[Admin Signup] Inserting admin profile:', profileData);

                // Insert into users table
                const { error: profileError } = await supabase
                    .from('users')
                    .insert(profileData);
                
                if (profileError) {
                    console.error('[Admin Signup] Profile creation error:', profileError);
                    throw profileError;
                }

                console.log('[Admin Signup] Admin profile created successfully');
            }

            // Success message
            showSuccessMessage();

            // Redirect to admin login after delay
            setTimeout(() => {
                window.location.href = 'login-admin.html';
            }, 2000);

        } catch (error) {
            console.error('[Admin Signup] Registration error:', error);
            handleSignupError(error);
        } finally {
            // Reset button state
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }, 2000);
        }
    });
}

/**
 * Validate admin signup form
 */
function validateAdminSignup(firstName, lastName, email, department, password, confirmPassword, termsChecked, authorizationChecked) {
    // Basic field validation
    if (!firstName || !lastName || !email || !department || !password || !confirmPassword) {
        alert('Please fill in all required fields.');
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Password validation
    if (password.length < 8) {
        alert('Password must be at least 8 characters long for admin accounts.');
        return false;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return false;
    }

    // Password strength validation for admin
    if (!isStrongPassword(password)) {
        alert('Admin password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return false;
    }

    // Checkbox validation
    if (!termsChecked) {
        alert('Please agree to the Terms of Service and Privacy Policy.');
        return false;
    }

    if (!authorizationChecked) {
        alert('Please confirm that you are authorized to create an admin account.');
        return false;
    }

    return true;
}

/**
 * Check password strength for admin accounts
 */
function isStrongPassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const form = document.getElementById('adminSignupForm');
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        background-color: #d1fae5;
        border: 1px solid #10b981;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        text-align: center;
    `;
    successDiv.innerHTML = `
        <h4 style="color: #065f46; margin: 0 0 0.5rem 0;">✅ Admin Account Created Successfully!</h4>
        <p style="color: #065f46; margin: 0; font-size: 0.9rem;">
            Your administrator account has been created. You will be redirected to the login page shortly.
        </p>
    `;
    
    form.parentNode.insertBefore(successDiv, form);
}

/**
 * Handle signup errors
 */
function handleSignupError(error) {
    let message = "An error occurred during admin registration.";
    
    if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        message = "This email is already registered. Please use a different email or login to your existing account.";
    } else if (error.message?.includes('invalid email')) {
        message = "Please enter a valid email address.";
    } else if (error.message?.includes('weak password')) {
        message = "The password is too weak. Please use a stronger password.";
    } else if (error.message?.includes('rate limit')) {
        message = "Too many signup attempts. Please wait a moment and try again.";
    } else if (error.message) {
        message = `Registration failed: ${error.message}`;
    }
    
    alert(message);
}

// Make functions available globally if needed
window.initializeAdminSignup = initializeAdminSignup;