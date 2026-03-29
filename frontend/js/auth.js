const API_URL = 'http://localhost:5000/api';

// --- UI Utilities ---
function showToast(message, isError = false) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-check-circle'}"></i> ${message}`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Auth Handling ---
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

// Toggle Password Visibility
if (togglePassword && passwordInput) {
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });
}

// Password Strength Meter
if (signupForm && passwordInput) {
  const strengthBar = document.getElementById('strengthBar');
  passwordInput.addEventListener('input', (e) => {
    const val = e.target.value;
    let strength = 0;
    if (val.length >= 6) strength += 25;
    if (val.match(/[A-Z]/)) strength += 25;
    if (val.match(/[0-9]/)) strength += 25;
    if (val.match(/[^A-Za-z0-9]/)) strength += 25;

    strengthBar.style.width = strength + '%';
    if (strength <= 25) strengthBar.style.backgroundColor = '#FF3B30';
    else if (strength <= 50) strengthBar.style.backgroundColor = '#FF9500';
    else if (strength <= 75) strengthBar.style.backgroundColor = '#FFCC00';
    else strengthBar.style.backgroundColor = '#34C759';
  });
}

// Login API Call
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;

    try {
      const email = document.getElementById('email').value;
      const password = passwordInput.value;

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      btn.innerHTML = originalText;
      btn.disabled = false;

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Slide left transition effect before redirect
        document.body.style.transform = 'translateX(-100%)';
        document.body.style.transition = 'transform 0.5s ease';
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 500);
      } else {
        showToast(data.message || 'Login failed', true);
      }
    } catch (err) {
      btn.innerHTML = originalText;
      btn.disabled = false;
      showToast('Server connection error', true);
    }
  });
}

// Signup API Call
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (passwordInput.value !== confirmPassword) {
      return showToast('Passwords do not match', true);
    }

    const btn = document.getElementById('signupBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;

    try {
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = passwordInput.value;

      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      btn.innerHTML = originalText;
      btn.disabled = false;

      if (data.success) {
        if (window.confetti) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6B00', '#FF8C00', '#ffffff']
          });
        }
        showToast('Account created successfully! Redirecting...');
        setTimeout(() => {
          document.body.style.transform = 'translateX(-100%)';
          document.body.style.transition = 'transform 0.5s ease';
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 500);
        }, 2000);
      } else {
        showToast(data.message || 'Signup failed', true);
      }
    } catch (err) {
      btn.innerHTML = originalText;
      btn.disabled = false;
      showToast('Server connection error', true);
    }
  });
}

// Forgot Password
const forgotBtn = document.getElementById('forgotPasswordLink');
if (forgotBtn) {
  forgotBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    if (!email) return showToast('Please enter your email address first', true);
    
    try {
      const res = await fetch(`${API_URL}/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if(data.success) {
        showToast('Password reset email sent (simulation)');
      } else {
        showToast(data.message, true);
      }
    } catch(err) {
      showToast('Server error', true);
    }
  });
}
