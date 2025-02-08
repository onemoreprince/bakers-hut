document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Supabase client to be available
    while (!window.supabaseClient) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const loginForm = document.getElementById('login-form');
    const authSection = document.getElementById('auth-section');
    const contentSection = document.getElementById('content');
    const loginMessage = document.getElementById('login-message');
    
    // Check existing session
    const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();
    if (sessionError) {
        console.error('Error checking session:', sessionError);
    } else if (session) {
        onUserLoggedIn();
    }

    // Handle auth state changes
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            onUserLoggedIn();
        } else if (event === 'SIGNED_OUT') {
            authSection.classList.remove('hidden');
            contentSection.classList.add('hidden');
        }
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const submitButton = loginForm.querySelector('button[type="submit"]');
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="loading loading-spinner"></span> Sending...';
            loginMessage.classList.remove('hidden', 'alert-error', 'alert-success');
            
            try {
                const { error } = await window.supabaseClient.auth.signInWithOtp({ 
                    email,
                    options: {
                        emailRedirectTo: window.location.origin
                    }
                });
                
                loginMessage.classList.remove('hidden');
                if (error) {
                    loginMessage.classList.add('alert-error');
                    loginMessage.textContent = error.message;
                } else {
                    loginMessage.classList.add('alert-success');
                    loginMessage.textContent = 'Magic link sent! Please check your email.';
                    loginForm.reset();
                }
            } catch (err) {
                loginMessage.classList.add('alert-error');
                loginMessage.textContent = 'An error occurred. Please try again.';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Magic Link';
            }
        });
    }
});

function onUserLoggedIn() {
    const authSection = document.getElementById('auth-section');
    const contentSection = document.getElementById('content');
    
    authSection.classList.add('hidden');
    contentSection.classList.remove('hidden');
    
    // Load default view
    htmx.ajax('GET', '/views/sales.html', '#content');
} 