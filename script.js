// ============================================
// ECOREVIVE — Frontend Scripts (MySQL version)
// Calls the Node.js/Express backend API
// ============================================

const API = 'http://localhost:3000/api';   // backend base URL

// ── Session stored in sessionStorage (browser tab only) ──
const Auth = {
  getUser()        { const u = sessionStorage.getItem('eco_user'); return u ? JSON.parse(u) : null; },
  setUser(user)    { sessionStorage.setItem('eco_user', JSON.stringify(user)); },
  logout()         { sessionStorage.removeItem('eco_user'); window.location.href = 'login.html'; },
  isLoggedIn()     { return !!this.getUser(); }
};

// ── Toast notification ────────────────────────────────────
function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Navbar: show user name or sign-in links ───────────────
function updateNavbar() {
  const user = Auth.getUser();
  const signInDiv = document.querySelector('.sign_in');
  if (!signInDiv) return;
  if (user) {
    signInDiv.innerHTML = `
      <span style="font-weight:700;color:#2fbf71;">👋 Hi, ${user.firstName}!</span>
      <span style="font-size:13px;color:#888;background:#e6f4ec;padding:5px 12px;border-radius:20px;font-weight:700;">🌿 ${user.ecoPoints} pts</span>
      <button onclick="Auth.logout()" style="padding:9px 18px;background:#e74c3c;color:white;border:none;border-radius:30px;font-weight:700;cursor:pointer;font-family:Nunito,sans-serif;">Log Out</button>
    `;
  } else {
    signInDiv.innerHTML = `
      <a href="login.html">Sign In</a>
      <a href="signup.html" class="btn">Get Started</a>
    `;
  }
}

// LOGIN — calls POST /api/login
function initLogin() {
  const form = document.querySelector('#loginForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn      = form.querySelector('.auth-btn');
    const email    = document.querySelector('#loginEmail').value.trim();
    const password = document.querySelector('#loginPassword').value;
    btn.textContent = 'Signing in…';
    btn.disabled = true;
    try {
      const res  = await fetch(`${API}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        Auth.setUser(data.user);
        showToast(`Welcome back, ${data.user.firstName}! 🌿`, 'success');
        setTimeout(() => window.location.href = 'marketplace.html', 1200);
      } else {
        showToast(data.message || 'Login failed.', '');
        btn.textContent = 'Sign In →'; btn.disabled = false;
      }
    } catch {
      showToast('Cannot reach server. Is it running?', '');
      btn.textContent = 'Sign In →'; btn.disabled = false;
    }
  });
}

// SIGNUP — calls POST /api/signup
function initSignup() {
  const form = document.querySelector('#signupForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn       = form.querySelector('.auth-btn');
    const firstName = document.querySelector('#firstName').value.trim();
    const lastName  = document.querySelector('#lastName').value.trim();
    const email     = document.querySelector('#signupEmail').value.trim();
    const password  = document.querySelector('#signupPassword').value;
    const confirm   = document.querySelector('#confirmPassword').value;
    if (password !== confirm) { showToast('Passwords do not match!', ''); return; }
    if (password.length < 6)  { showToast('Password must be at least 6 characters.', ''); return; }
    btn.textContent = 'Creating account…'; btn.disabled = true;
    try {
      const res  = await fetch(`${API}/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });
      const data = await res.json();
      if (data.success) {
        Auth.setUser(data.user);
        showToast('Account created! Welcome to EcoRevive 🌿', 'success');
        setTimeout(() => window.location.href = 'marketplace.html', 1400);
      } else {
        showToast(data.message || 'Signup failed.', '');
        btn.textContent = 'Create My Account 🌿'; btn.disabled = false;
      }
    } catch {
      showToast('Cannot reach server. Is it running?', '');
      btn.textContent = 'Create My Account 🌿'; btn.disabled = false;
    }
  });
}

// Marketplace helpers
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  if (!buttons.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active-filter'));
      btn.classList.add('active-filter');
      showToast(`Showing: ${btn.textContent}`, 'success');
    });
  });
}

function initProductButtons() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!Auth.isLoggedIn()) { showToast('Please sign in to view details!', ''); setTimeout(() => window.location.href = 'login.html', 1200); }
      else showToast('Product details coming soon!', 'success');
    });
  });
  const sellBtn = document.querySelector('.sell-btn');
  if (sellBtn) sellBtn.addEventListener('click', () => {
    if (!Auth.isLoggedIn()) { showToast('Please sign in to start selling!', ''); setTimeout(() => window.location.href = 'login.html', 1200); }
    else showToast('Seller dashboard coming soon!', 'success');
  });
}

function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.querySelector('.subscribe-btn')?.addEventListener('click', () => {
    const input = form.querySelector('input');
    if (input?.value.trim()) { showToast('Thanks for subscribing! 🌿', 'success'); input.value = ''; }
    else showToast('Please enter a valid email.', '');
  });
}

function initReadMore() {
  document.querySelectorAll('.read-btn, .primary-btn').forEach(btn =>
    btn.addEventListener('click', () => showToast('Full articles coming soon! 📖', 'success'))
  );
}

function initCTA() {
  document.querySelectorAll('.cta-primary').forEach(link => {
    if (link.getAttribute('href') === '#') {
      link.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'signup.html'; });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar(); initFilters(); initProductButtons();
  initNewsletter(); initReadMore(); initCTA();
  initLogin(); initSignup();
});

// ── Marketplace Filter ─────────────────────────────
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('.product-card');

  buttons.forEach(button => {
    button.addEventListener('click', () => {

      // remove active class
      buttons.forEach(btn => btn.classList.remove('active-filter'));
      button.classList.add('active-filter');

      const category = button.textContent.toLowerCase();

      products.forEach(product => {
        const productCategory = product.getAttribute('data-category');

        if (category === 'all' || productCategory === category) {
          product.style.display = 'block';
        } else {
          product.style.display = 'none';
        }
      });

    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  updateNavbar();
});
