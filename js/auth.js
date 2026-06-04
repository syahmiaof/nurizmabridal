// ==========================================
// SESSION GUARD & AUTHENTICATION (Phase 3)
// ==========================================

// 1. Session Guard Logic
// This runs immediately upon file load to protect routes.
const executeSessionGuard = async () => {
    try {
        // Fetch current session from Supabase
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error("Session fetch error:", error);
            return;
        }

        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.endsWith('login.html');
        const isAdminPage = currentPath.endsWith('admin.html');

        // Logic A: Unauthenticated user trying to access admin
        if (isAdminPage && !session) {
            window.location.replace('login.html');
        } 
        // Logic B: Authenticated user trying to access login
        else if (isLoginPage && session) {
            window.location.replace('admin.html');
        }
    } catch (err) {
        console.error("Critical Session Guard failure:", err);
    }
};

// Immediately execute the guard
executeSessionGuard();

// 2. Global Auth State Listener
// This ensures that if session expires or logs out, the UI reacts immediately.
supabaseClient.auth.onAuthStateChange((event, session) => {
    const currentPath = window.location.pathname;
    
    if (event === 'SIGNED_IN' && currentPath.endsWith('login.html')) {
        window.location.replace('admin.html');
    } else if (event === 'SIGNED_OUT' && currentPath.endsWith('admin.html')) {
        window.location.replace('login.html');
    }
});

// 3. UI Event Listeners (Login & Logout Actions)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // --- LOGIN LOGIC ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent page refresh
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            const submitBtn = document.getElementById('login-btn');

            // Reset Error UI
            errorDiv.classList.add('hidden');
            errorDiv.textContent = '';
            submitBtn.innerHTML = '<span class="opacity-80">Mengakses...</span>';
            submitBtn.disabled = true;
            submitBtn.classList.add('cursor-not-allowed', 'opacity-80');

            // Authenticate with Supabase
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                // Show error message
                errorDiv.textContent = 'E-mel atau Kata Laluan tidak sah.';
                errorDiv.classList.remove('hidden');
                
                // Re-enable button
                submitBtn.innerHTML = 'Akses Sistem';
                submitBtn.disabled = false;
                submitBtn.classList.remove('cursor-not-allowed', 'opacity-80');
            }
            // If success, the onAuthStateChange listener will automatically trigger redirect.
        });
    }

    // --- LOGOUT LOGIC ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            // Optional: Confirm logout to prevent accidental clicks
            if(confirm("Adakah anda pasti mahu log keluar?")) {
                const { error } = await supabaseClient.auth.signOut();
                if (error) {
                    console.error("Logout failed:", error);
                    alert("Ralat sistem: Gagal log keluar.");
                }
                // If success, the onAuthStateChange listener will handle redirect.
            }
        });
    }
});
