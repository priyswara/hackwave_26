/**
 * Save to Serve - Master Application Controller & Router
 * Tagline: Save Food. Serve People. Reduce Waste.
 * Complete Portal Routing, Dedicated Auth Flow, and Toast Notifications
 */

class SaveToServeAppController {
  constructor() {
    this.currentRoute = 'home';
    this.activeAuthRole = 'donor'; // default portal context: 'donor' | 'ngo' | 'volunteer' | 'admin'
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRouting());
    
    window.addEventListener('savetoserve:authchange', () => {
      this.updateNavbarUserBadge();
      this.handleRouting();
    });

    setInterval(() => {
      this.refreshCountdowns();
    }, 30000);

    document.addEventListener('DOMContentLoaded', () => {
      this.updateNavbarUserBadge();
      this.handleRouting();
    });
  }

  handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'home';
    this.navigateTo(hash, false);
  }

  openPortalAuth(role) {
    this.activeAuthRole = role || 'donor';
    const user = window.SaveToServeAuth.getCurrentUser();
    if (user && user.role === this.activeAuthRole) {
      this.navigateTo(`${this.activeAuthRole}-portal`);
    } else {
      this.navigateTo('login');
    }
  }

  openPortalRegister(role) {
    this.activeAuthRole = role || 'donor';
    this.navigateTo('register');
  }

  navigateTo(route, updateHash = true) {
    // Route guard checks for private portal dashboards
    const user = window.SaveToServeAuth.getCurrentUser();
    
    if (route === 'donor-portal' && (!user || user.role !== 'donor')) {
      this.activeAuthRole = 'donor';
      if (updateHash) window.location.hash = 'login';
      this.renderAuthView('login', 'donor', 'Please sign in to access the Donor Portal.');
      return;
    }

    if (route === 'ngo-portal' && (!user || user.role !== 'ngo')) {
      this.activeAuthRole = 'ngo';
      if (updateHash) window.location.hash = 'login';
      this.renderAuthView('login', 'ngo', 'Please sign in to access the NGO Portal.');
      return;
    }

    if (route === 'volunteer-portal' && (!user || user.role !== 'volunteer')) {
      this.activeAuthRole = 'volunteer';
      if (updateHash) window.location.hash = 'login';
      this.renderAuthView('login', 'volunteer', 'Please sign in to access the Volunteer Portal.');
      return;
    }

    if (route === 'admin-portal' && (!user || user.role !== 'admin')) {
      this.activeAuthRole = 'admin';
      if (updateHash) window.location.hash = 'login';
      this.renderAuthView('login', 'admin', 'Super Admin authentication required.');
      return;
    }

    this.currentRoute = route;
    if (updateHash) {
      window.location.hash = route;
    }

    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.add('d-none'));

    document.querySelectorAll('.nav-link-custom, .mobile-nav-item').forEach(el => {
      if (el.getAttribute('data-route') === route) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    const targetEl = document.getElementById(`${route}-view`);
    if (targetEl) {
      targetEl.classList.remove('d-none');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      switch (route) {
        case 'donor-portal':
          window.SaveToServeDonor?.render();
          break;
        case 'ngo-portal':
          window.SaveToServeNGO?.render();
          break;
        case 'volunteer-portal':
          window.SaveToServeVolunteer?.render();
          break;
        case 'admin-portal':
          window.SaveToServeAdmin?.render();
          break;
        case 'weather-rescue':
          window.SaveToServeWeather?.renderWeatherDashboard();
          break;
        case 'impact-dashboard':
          window.SaveToServeImpact?.render();
          break;
        case 'holding-hubs':
          window.SaveToServeHubs?.render();
          break;
        case 'browse-food':
          this.renderPublicBrowseFood();
          break;
        case 'notifications':
          const notifEl = document.getElementById('notifications-view');
          if (notifEl) notifEl.innerHTML = window.SaveToServeNotifications.renderView();
          break;
        case 'login':
          this.renderAuthView('login', this.activeAuthRole);
          break;
        case 'register':
          this.renderAuthView('register', this.activeAuthRole);
          break;
        case 'home':
        default:
          this.renderHomeStats();
          break;
      }
    }
  }

  updateNavbarUserBadge() {
    const user = window.SaveToServeAuth.getCurrentUser();
    const navUserContainer = document.getElementById('navbarUserArea');
    if (!navUserContainer) return;

    if (user) {
      navUserContainer.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <div class="text-end d-none d-md-block" style="line-height:1.2;">
            <div class="fw-bold small" style="color:var(--dark-olive);">${user.name}</div>
            <span class="badge badge-${user.role}" style="font-size:0.68rem;">${user.role.toUpperCase()}</span>
          </div>
          <button class="btn btn-sm btn-outline-secondary" onclick="window.SaveToServeApp.logout()">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      `;
    } else {
      navUserContainer.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-soft-olive" onclick="window.SaveToServeApp.navigateTo('login')">
            <i class="bi bi-person"></i> Sign In
          </button>
          <button class="btn btn-sm btn-olive" onclick="window.SaveToServeApp.navigateTo('register')">
            Register
          </button>
        </div>
      `;
    }
  }

  logout() {
    window.SaveToServeAuth.logout();
    this.showToast('Logged out successfully.', 'info');
    this.navigateTo('home');
  }

  showToast(message, type = 'olive', durationMs = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    
    let icon = 'bi-info-circle-fill text-success';
    if (type === 'success') icon = 'bi-check-circle-fill text-success';
    if (type === 'warning') icon = 'bi-exclamation-triangle-fill text-warning';
    if (type === 'danger') icon = 'bi-x-octagon-fill text-danger';

    toast.innerHTML = `
      <i class="bi ${icon} fs-5 mt-1"></i>
      <div class="flex-grow-1 small font-weight-500">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, durationMs);
  }

  refreshCountdowns() {
    if (this.currentRoute === 'donor-portal') window.SaveToServeDonor?.render();
    if (this.currentRoute === 'ngo-portal') window.SaveToServeNGO?.render();
    if (this.currentRoute === 'weather-rescue') window.SaveToServeWeather?.renderWeatherDashboard();
  }

  renderHomeStats() {
    const impact = window.SaveToServeDB.calculateImpact();
    const pRescued = document.getElementById('homePortionsRescued');
    const wPrevented = document.getElementById('homeWastePrevented');
    const bReached = document.getElementById('homeBeneficiaries');

    if (pRescued) pRescued.innerText = impact.totalPortionsRescued;
    if (wPrevented) wPrevented.innerText = `${impact.totalWastePreventedKg} kg`;
    if (bReached) bReached.innerText = impact.estimatedBeneficiaries;
  }

  renderPublicBrowseFood() {
    const container = document.getElementById('browse-food-view');
    if (!container) return;

    const donations = window.SaveToServeDB.getDonations().filter(d => d.status === 'available');

    container.innerHTML = `
      <div class="container py-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h2 class="mb-1 fw-bold" style="color:var(--dark-olive);">🍲 Available Surplus Food Listings</h2>
            <p class="text-muted mb-0">Verified surplus cooked meals and produce awaiting rescue before safe deadlines.</p>
          </div>
          <button class="btn btn-olive" onclick="window.SaveToServeApp.openPortalAuth('donor')">
            <i class="bi bi-plus-circle"></i> Donor? List Surplus Food
          </button>
        </div>

        ${donations.length === 0 ? `
          <div class="custom-card text-center py-5">
            <i class="bi bi-inbox fs-1 text-muted mb-2 d-block"></i>
            <h5 class="fw-bold">All Surplus Food Currently Rescued!</h5>
            <p class="text-muted small">There are no unreserved surplus food donations right now.</p>
          </div>
        ` : `
          <div class="row g-4">
            ${donations.map(d => `
              <div class="col-md-6 col-lg-4">
                <div class="donation-card">
                  <div class="donation-card-img-wrap">
                    <img src="${d.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500'}" class="donation-card-img" alt="${d.foodName}">
                    <div class="donation-card-badge-top">
                      <span class="badge ${d.foodType === 'veg' ? 'bg-success' : 'bg-danger'} text-uppercase">${d.foodType}</span>
                    </div>
                    <div class="donation-card-badge-urgency">
                      ${window.SaveToServeDonor ? window.SaveToServeDonor.getUrgencyBadge(d.safeUntil) : ''}
                    </div>
                  </div>
                  <div class="donation-card-body">
                    <h6 class="donation-title">${d.foodName}</h6>
                    <div class="donation-donor-info"><i class="bi bi-shop"></i> ${d.donorOrg} (${d.donorAddress})</div>
                    <div class="donation-meta-grid">
                      <div>
                        <span class="meta-item-label">Portions</span>
                        <span class="meta-item-value">${d.portions} meals (~${d.quantityKg} kg)</span>
                      </div>
                      <div>
                        <span class="meta-item-label">Category</span>
                        <span class="meta-item-value">${d.category}</span>
                      </div>
                    </div>
                    <p class="small text-muted mb-3"><i class="bi bi-info-circle"></i> ${d.storageInfo}</p>
                    <div class="mt-auto pt-2 border-top">
                      <button class="btn btn-olive w-100" onclick="window.SaveToServeApp.openPortalAuth('ngo')">
                        <i class="bi bi-hand-thumbs-up"></i> Claim as NGO Shelter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  renderAuthView(type = 'login', role = null, noticeMessage = null) {
    if (role) this.activeAuthRole = role;
    const currentRole = this.activeAuthRole || 'donor';

    const roleMeta = {
      donor: { title: 'Donor Portal', subtitle: 'For Restaurants, Banquets, Hostels & Caterers', icon: 'bi-shop', badge: 'Donor' },
      ngo: { title: 'NGO Shelter Portal', subtitle: 'For Registered Shelters, Orphanages & Food Banks', icon: 'bi-building', badge: 'NGO' },
      volunteer: { title: 'Volunteer Portal', subtitle: 'For Food Rescue Couriers & Delivery Drivers', icon: 'bi-bicycle', badge: 'Volunteer' },
      admin: { title: 'Super Admin Portal', subtitle: 'Authorized System Administrators Only', icon: 'bi-shield-lock', badge: 'Admin' }
    };

    const activeMeta = roleMeta[currentRole] || roleMeta.donor;
    const container = document.getElementById(`${type}-view`);
    if (!container) return;

    // Show container
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.add('d-none'));
    container.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (type === 'login') {
      container.innerHTML = `
        <div class="container py-4">
          <!-- Back to Home & Portal Switcher -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 max-w-600 mx-auto" style="max-width: 540px;">
            <button class="btn btn-sm btn-soft-olive" onclick="window.SaveToServeApp.navigateTo('home')">
              <i class="bi bi-arrow-left"></i> Back to Home
            </button>
            <div class="d-flex align-items-center gap-1">
              <span class="small text-muted me-1">Switch:</span>
              <button class="btn btn-sm ${currentRole === 'donor' ? 'btn-olive' : 'btn-outline-secondary'}" onclick="window.SaveToServeApp.openPortalAuth('donor')">Donor</button>
              <button class="btn btn-sm ${currentRole === 'ngo' ? 'btn-olive' : 'btn-outline-secondary'}" onclick="window.SaveToServeApp.openPortalAuth('ngo')">NGO</button>
              <button class="btn btn-sm ${currentRole === 'volunteer' ? 'btn-olive' : 'btn-outline-secondary'}" onclick="window.SaveToServeApp.openPortalAuth('volunteer')">Volunteer</button>
              <button class="btn btn-sm ${currentRole === 'admin' ? 'btn-olive' : 'btn-outline-secondary'}" onclick="window.SaveToServeApp.openPortalAuth('admin')">Admin</button>
            </div>
          </div>

          <div class="row justify-content-center">
            <div class="col-lg-5 col-md-7 col-sm-10">
              <div class="custom-card shadow-md p-4">
                <div class="text-center mb-4">
                  <div class="portal-card-icon mx-auto mb-2" style="width:50px;height:50px;font-size:1.5rem;">
                    <i class="bi ${activeMeta.icon}"></i>
                  </div>
                  <h4 class="fw-bold mb-1" style="color:var(--dark-olive);">${activeMeta.title} Login</h4>
                  <p class="text-muted small">${activeMeta.subtitle}</p>
                </div>

                ${noticeMessage ? `
                  <div class="alert alert-info py-2 small mb-3">
                    <i class="bi bi-info-circle-fill me-1"></i> ${noticeMessage}
                  </div>
                ` : ''}

                <div id="loginErrorAlert" class="alert alert-danger py-2 small mb-3 d-none">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> <span id="loginErrorText"></span>
                </div>

                <form onsubmit="window.SaveToServeApp.handleLoginForm(event)">
                  <input type="hidden" id="loginExpectedRole" value="${currentRole}">
                  
                  <div class="mb-3">
                    <label class="form-label-custom">Email Address</label>
                    <input type="email" id="loginEmail" class="form-control form-control-custom w-100" placeholder="e.g. name@savetoserve.org" required autocomplete="email">
                  </div>

                  <div class="mb-3">
                    <label class="form-label-custom">Password</label>
                    <input type="password" id="loginPassword" class="form-control form-control-custom w-100" placeholder="Enter password" required autocomplete="current-password">
                  </div>

                  <button type="submit" class="btn btn-olive w-100 mb-3">
                    <i class="bi bi-box-arrow-in-right"></i> Sign In to ${activeMeta.title}
                  </button>
                </form>

                <div class="p-2 bg-light rounded text-center small text-muted mb-3 border">
                  <span class="fw-bold text-dark">Default Access:</span> ${currentRole}@savetoserve.org / password123
                </div>

                ${currentRole !== 'admin' ? `
                  <div class="text-center small text-muted">
                    Don't have an account? <a href="#register" class="fw-bold text-success" onclick="window.SaveToServeApp.openPortalRegister('${currentRole}')">Register as ${activeMeta.badge}</a>
                  </div>
                ` : `
                  <div class="text-center small text-muted">
                    <i class="bi bi-shield-lock-fill text-muted"></i> Super Admin registration is restricted.
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // REGISTRATION VIEW
      container.innerHTML = `
        <div class="container py-4">
          <!-- Back to Home & Portal Switcher -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 max-w-600 mx-auto" style="max-width: 600px;">
            <button class="btn btn-sm btn-soft-olive" onclick="window.SaveToServeApp.navigateTo('home')">
              <i class="bi bi-arrow-left"></i> Back to Home
            </button>
            <div class="d-flex align-items-center gap-1">
              <span class="small text-muted me-1">Role:</span>
              <button class="btn btn-sm ${currentRole === 'donor' ? 'btn-olive' : 'btn-outline-secondary'}" onclick="window.SaveToServeApp.openPortalRegister('donor')">Donor</button>
              <button class="btn btn-sm ${currentRole === 'ngo' ? 'btn-olive' : 'btn-outline-secondary'}" onclick="window.SaveToServeApp.openPortalRegister('ngo')">NGO</button>
              <button class="btn btn-sm ${currentRole === 'volunteer' ? 'btn-olive' : 'btn-outline-secondary'}" onclick="window.SaveToServeApp.openPortalRegister('volunteer')">Volunteer</button>
            </div>
          </div>

          <div class="row justify-content-center">
            <div class="col-lg-6 col-md-8 col-sm-11">
              <div class="custom-card shadow-md p-4">
                <div class="text-center mb-3">
                  <div class="portal-card-icon mx-auto mb-2" style="width:50px;height:50px;font-size:1.5rem;">
                    <i class="bi ${activeMeta.icon}"></i>
                  </div>
                  <h4 class="fw-bold mb-1" style="color:var(--dark-olive);">Create ${activeMeta.badge} Account</h4>
                  <p class="text-muted small">Register to participate in the food rescue network</p>
                </div>

                <div id="regErrorAlert" class="alert alert-danger py-2 small mb-3 d-none">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> <span id="regErrorText"></span>
                </div>

                <form id="registerForm" onsubmit="window.SaveToServeApp.handleRegisterForm(event)">
                  <input type="hidden" id="regRole" value="${currentRole}">

                  <div class="row g-2 mb-3">
                    <div class="col-md-6">
                      <label class="form-label-custom">Contact Person / Full Name *</label>
                      <input type="text" id="regName" class="form-control form-control-custom w-100" placeholder="e.g. Ramesh Kumar" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label-custom">Role Selected</label>
                      <input type="text" class="form-control form-control-custom w-100" value="${activeMeta.badge}" disabled style="background:#f0f2eb; font-weight:600;">
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label-custom">
                      ${currentRole === 'volunteer' ? 'Vehicle Type / Mode (e.g. Two-wheeler / Car / On Foot)' : 'Organization / Restaurant / Shelter Name *'}
                    </label>
                    <input type="text" id="regOrgName" class="form-control form-control-custom w-100" placeholder="${currentRole === 'volunteer' ? 'e.g. Motorcycle / Scooter' : 'e.g. Annapurna Kitchen'}" ${currentRole !== 'volunteer' ? 'required' : ''}>
                  </div>

                  <div class="row g-2 mb-3">
                    <div class="col-md-6">
                      <label class="form-label-custom">Email Address *</label>
                      <input type="email" id="regEmail" class="form-control form-control-custom w-100" placeholder="e.g. user@example.com" required autocomplete="email">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label-custom">Phone Number *</label>
                      <input type="tel" id="regPhone" class="form-control form-control-custom w-100" placeholder="+91 98765 43210" required autocomplete="tel">
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label-custom">Neighborhood / City Address *</label>
                    <input type="text" id="regAddress" class="form-control form-control-custom w-100" placeholder="e.g. Koramangala 4th Block, Bengaluru" required>
                  </div>

                  <div class="mb-3">
                    <label class="form-label-custom">Create Password *</label>
                    <input type="password" id="regPassword" class="form-control form-control-custom w-100" placeholder="Minimum 6 characters" required autocomplete="new-password">
                  </div>

                  <button type="submit" class="btn btn-olive w-100 mb-3">
                    <i class="bi bi-check-circle"></i> Complete ${activeMeta.badge} Registration
                  </button>
                </form>

                <div class="text-center small text-muted">
                  Already registered? <a href="#login" class="fw-bold text-success" onclick="window.SaveToServeApp.openPortalAuth('${currentRole}')">Sign In</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  handleLoginForm(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const expectedRole = document.getElementById('loginExpectedRole')?.value || null;

    const errorAlert = document.getElementById('loginErrorAlert');
    const errorText = document.getElementById('loginErrorText');

    const res = window.SaveToServeAuth.login(email, password, expectedRole);
    if (res.success) {
      if (errorAlert) errorAlert.classList.add('d-none');
      this.showToast(`Welcome back, ${res.user.name}!`, 'success');
      this.navigateTo(`${res.user.role}-portal`);
    } else {
      if (errorAlert && errorText) {
        errorText.innerText = res.message;
        errorAlert.classList.remove('d-none');
      }
      this.showToast(res.message, 'danger');
    }
  }

  handleRegisterForm(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const role = document.getElementById('regRole').value || 'donor';
    const orgName = document.getElementById('regOrgName')?.value.trim() || '';
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    const password = document.getElementById('regPassword').value;

    const errorAlert = document.getElementById('regErrorAlert');
    const errorText = document.getElementById('regErrorText');

    const res = window.SaveToServeAuth.register({
      name,
      role,
      orgName: orgName || name,
      email,
      phone,
      address,
      password,
      vehicleType: role === 'volunteer' ? (orgName || 'Two-wheeler') : ''
    });

    if (res.success) {
      if (errorAlert) errorAlert.classList.add('d-none');
      this.showToast(`Registration complete! Welcome to Save to Serve, ${res.user.name}.`, 'success');
      this.navigateTo(`${res.user.role}-portal`);
    } else {
      if (errorAlert && errorText) {
        errorText.innerText = res.message;
        errorAlert.classList.remove('d-none');
      }
      this.showToast(res.message, 'danger');
    }
  }
}

window.SaveToServeApp = new SaveToServeAppController();
window.RainRouteApp = window.SaveToServeApp;
