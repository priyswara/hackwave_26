/**
 * Save to Serve - Master Application Controller & Router
 * Tagline: Save Food. Serve People. Reduce Waste.
 * Strict Role-Based Portal Isolation, Separate Role Navigation, Olive-Green Design
 * 
 * NOTE ON SECURITY ARCHITECTURE:
 * Client-side role checks and session isolation enforce clean operational boundaries
 * during user sessions. In a multi-user production deployment, all role authorization
 * and session tokens must also be validated server-side on every backend API route.
 */

const PORTAL_NAMES = {
  donor: 'Donor',
  ngo: 'NGO',
  volunteer: 'Volunteer',
  admin: 'Super Admin'
};

class SaveToServeAppController {
  constructor() {
    this.currentRoute = 'home';
    this.activeAuthRole = 'donor';
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRouting());
    
    window.addEventListener('savetoserve:authchange', () => {
      this.renderNavbar();
      this.handleRouting();
    });

    setInterval(() => {
      this.refreshCountdowns();
    }, 30000);

    this.initInteractiveMouseEffects();

    document.addEventListener('DOMContentLoaded', () => {
      this.renderNavbar();
      this.handleRouting();
    });
  }

  initInteractiveMouseEffects() {
    // Non-blocking, instant click feedback with micro-sparkles and ripple matching the current portal color
    document.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('button, a, .portal-card, .custom-card, .stat-card, .subnav-btn, .scenario-btn, .badge, .form-control-custom, .form-select-custom, .donation-card');
      if (!target) return;

      const clickX = e.clientX;
      const clickY = e.clientY;

      // Create lightweight ripple element
      const ripple = document.createElement('div');
      ripple.className = 'sts-click-ripple';
      ripple.style.left = `${clickX}px`;
      ripple.style.top = `${clickY}px`;
      document.body.appendChild(ripple);

      // Create 3 subtle whimsical micro-sparkles radiating outwards
      for (let i = 0; i < 3; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sts-sparkle';
        const angle = (i * 120 + Math.random() * 40) * (Math.PI / 180);
        const dist = 14 + Math.random() * 12;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        sparkle.style.left = `${clickX}px`;
        sparkle.style.top = `${clickY}px`;
        sparkle.style.setProperty('--tx', `${tx}px`);
        sparkle.style.setProperty('--ty', `${ty}px`);
        document.body.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 480);
      }

      setTimeout(() => ripple.remove(), 450);
    }, { passive: true });
  }

  handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'home';
    this.navigateTo(hash, false);
  }

  openPortalAuth(role) {
    const targetRole = role || 'donor';
    const user = window.SaveToServeAuth?.getCurrentUser();

    if (user) {
      if (user.role === targetRole) {
        this.navigateTo(`${targetRole}-portal`);
      } else {
        this.showToast('You do not have permission to access this portal. Please log in through your registered portal.', 'danger');
        this.showAccessDeniedModal(targetRole, user.role);
      }
    } else {
      this.activeAuthRole = targetRole;
      this.navigateTo('login');
    }
  }

  openPortalRegister(role) {
    const targetRole = role || 'donor';
    if (targetRole === 'admin') {
      this.showToast('Super Admin accounts cannot be registered publicly.', 'warning');
      return;
    }

    const user = window.SaveToServeAuth?.getCurrentUser();
    if (user) {
      if (user.role === targetRole) {
        this.navigateTo(`${targetRole}-portal`);
      } else {
        this.showToast('You do not have permission to access this portal. Please log in through your registered portal.', 'danger');
        this.showAccessDeniedModal(targetRole, user.role);
      }
    } else {
      this.activeAuthRole = targetRole;
      this.navigateTo('register');
    }
  }

  showAccessDeniedModal(attemptedRole, activeRole) {
    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    const activePortalName = PORTAL_NAMES[activeRole] || activeRole;

    modalTitle.innerHTML = `<i class="bi bi-shield-x text-danger me-2"></i> Access Denied`;
    modalBody.innerHTML = `
      <div class="text-center py-3">
        <div class="stat-icon mx-auto mb-3" style="width:64px;height:64px;border-radius:50%;background-color:#FCEBE8;color:#9C3826;font-size:1.85rem;">
          <i class="bi bi-shield-lock-fill"></i>
        </div>
        <h5 class="fw-bold mb-2" style="color:var(--dark-olive);">Unauthorized Portal Access</h5>
        <div class="alert alert-danger py-2 small mb-3 text-start">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> You do not have permission to access this portal. Please log in through your registered portal.
        </div>
        <p class="text-muted small mb-4">
          Your account is registered exclusively as <strong>${activePortalName}</strong>. Save to Serve strictly isolates portal permissions to maintain operational safety.
        </p>
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
          <button class="btn btn-olive" onclick="window.SaveToServeApp.closeAccessDeniedModalAndGoToDashboard()">
            <i class="bi bi-grid-fill"></i> Return to ${activePortalName} Dashboard
          </button>
          <button class="btn btn-outline-danger" onclick="window.SaveToServeApp.logout()">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  closeAccessDeniedModalAndGoToDashboard() {
    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    }
    const user = window.SaveToServeAuth?.getCurrentUser();
    if (user) {
      this.navigateTo(`${user.role}-portal`);
    } else {
      this.navigateTo('home');
    }
  }

  renderNavbar() {
    const user = window.SaveToServeAuth?.getCurrentUser();
    const navContainer = document.getElementById('navbarDynamicArea');
    const mobileBottomNav = document.getElementById('mobileBottomNav');
    if (!navContainer) return;

    if (!user || this.currentRoute === 'home') {
      // Clean homepage: No global links, no public clutter
      navContainer.innerHTML = '';
      if (mobileBottomNav) {
        mobileBottomNav.classList.add('d-none');
        mobileBottomNav.innerHTML = '';
      }
      return;
    }

    const portalName = PORTAL_NAMES[user.role] || user.role.toUpperCase();

    // Generate Role-Specific Navigation Links
    let roleNavLinks = '';
    let mobileNavLinks = '';

    if (user.role === 'donor') {
      roleNavLinks = `
        <nav class="d-none d-lg-flex align-items-center gap-1">
          <a href="#donor-portal" class="nav-link-custom" onclick="window.SaveToServeDonor?.switchTab('my-donations')">
            <i class="bi bi-grid"></i> Dashboard
          </a>
          <a href="#donor-portal" class="nav-link-custom" onclick="window.SaveToServeDonor?.switchTab('post-donation')">
            <i class="bi bi-plus-circle"></i> Add Food Donation
          </a>
          <a href="#donor-portal" class="nav-link-custom" onclick="window.SaveToServeDonor?.switchTab('my-donations')">
            <i class="bi bi-list-ul"></i> My Donations
          </a>
          <a href="#donor-portal" class="nav-link-custom" onclick="window.SaveToServeDonor?.switchTab('track-pickups')">
            <i class="bi bi-truck"></i> Track Donations
          </a>
          <a href="#donor-portal" class="nav-link-custom" onclick="window.SaveToServeDonor?.switchTab('kyc')">
            <i class="bi bi-shield-check"></i> Verification
          </a>
        </nav>
      `;
      mobileNavLinks = `
        <a href="#donor-portal" class="mobile-nav-item" onclick="window.SaveToServeDonor?.switchTab('my-donations')">
          <i class="bi bi-grid"></i><span>Dashboard</span>
        </a>
        <a href="#donor-portal" class="mobile-nav-item" onclick="window.SaveToServeDonor?.switchTab('post-donation')">
          <i class="bi bi-plus-circle"></i><span>Post Food</span>
        </a>
        <a href="#donor-portal" class="mobile-nav-item" onclick="window.SaveToServeDonor?.switchTab('track-pickups')">
          <i class="bi bi-truck"></i><span>Track</span>
        </a>
        <a href="#donor-portal" class="mobile-nav-item" onclick="window.SaveToServeDonor?.switchTab('kyc')">
          <i class="bi bi-shield-check"></i><span>KYC</span>
        </a>
      `;
    } else if (user.role === 'ngo') {
      roleNavLinks = `
        <nav class="d-none d-lg-flex align-items-center gap-1">
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('browse-food')">
            <i class="bi bi-grid"></i> Dashboard
          </a>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('browse-food')">
            <i class="bi bi-basket2"></i> Browse Food
          </a>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('my-claims')">
            <i class="bi bi-bag-check"></i> My Claims
          </a>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('my-claims')">
            <i class="bi bi-check2-circle"></i> Confirm Receipt
          </a>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('post-req')">
            <i class="bi bi-megaphone"></i> Urgent Requests
          </a>
        </nav>
      `;
      mobileNavLinks = `
        <a href="#ngo-portal" class="mobile-nav-item" onclick="window.SaveToServeNGO?.switchTab('browse-food')">
          <i class="bi bi-basket2"></i><span>Browse</span>
        </a>
        <a href="#ngo-portal" class="mobile-nav-item" onclick="window.SaveToServeNGO?.switchTab('my-claims')">
          <i class="bi bi-bag-check"></i><span>Claims</span>
        </a>
        <a href="#ngo-portal" class="mobile-nav-item" onclick="window.SaveToServeNGO?.switchTab('post-req')">
          <i class="bi bi-megaphone"></i><span>Requests</span>
        </a>
      `;
    } else if (user.role === 'volunteer') {
      roleNavLinks = `
        <nav class="d-none d-lg-flex align-items-center gap-1">
          <a href="#volunteer-portal" class="nav-link-custom" onclick="window.SaveToServeVolunteer?.switchTab('active-tasks')">
            <i class="bi bi-grid"></i> Dashboard
          </a>
          <a href="#volunteer-portal" class="nav-link-custom" onclick="window.SaveToServeVolunteer?.switchTab('available-tasks')">
            <i class="bi bi-bell"></i> Available Pickup Tasks
          </a>
          <a href="#volunteer-portal" class="nav-link-custom" onclick="window.SaveToServeVolunteer?.switchTab('active-tasks')">
            <i class="bi bi-box-seam"></i> My Active Tasks
          </a>
          <a href="#volunteer-portal" class="nav-link-custom" onclick="window.SaveToServeVolunteer?.switchTab('history')">
            <i class="bi bi-clock-history"></i> Task History
          </a>
          <a href="#volunteer-portal" class="nav-link-custom" onclick="window.SaveToServeVolunteer?.switchTab('kyc')">
            <i class="bi bi-shield-check"></i> Safety Dossier
          </a>
        </nav>
      `;
      mobileNavLinks = `
        <a href="#volunteer-portal" class="mobile-nav-item" onclick="window.SaveToServeVolunteer?.switchTab('active-tasks')">
          <i class="bi bi-box-seam"></i><span>Active</span>
        </a>
        <a href="#volunteer-portal" class="mobile-nav-item" onclick="window.SaveToServeVolunteer?.switchTab('available-tasks')">
          <i class="bi bi-bell"></i><span>Pickups</span>
        </a>
        <a href="#volunteer-portal" class="mobile-nav-item" onclick="window.SaveToServeVolunteer?.switchTab('history')">
          <i class="bi bi-clock-history"></i><span>History</span>
        </a>
      `;
    } else if (user.role === 'admin') {
      roleNavLinks = `
        <nav class="d-none d-lg-flex align-items-center gap-1">
          <a href="#admin-portal" class="nav-link-custom" onclick="window.SaveToServeAdmin?.switchTab('donor-verification')">
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>
          <a href="#admin-portal" class="nav-link-custom" onclick="window.SaveToServeAdmin?.switchTab('donor-verification')">
            <i class="bi bi-shop"></i> Donor Verification
          </a>
          <a href="#admin-portal" class="nav-link-custom" onclick="window.SaveToServeAdmin?.switchTab('ngo-verification')">
            <i class="bi bi-building"></i> NGO Verification
          </a>
          <a href="#admin-portal" class="nav-link-custom" onclick="window.SaveToServeAdmin?.switchTab('volunteer-verification')">
            <i class="bi bi-bicycle"></i> Volunteer Verification
          </a>
          <a href="#admin-portal" class="nav-link-custom" onclick="window.SaveToServeAdmin?.switchTab('reconsideration-queue')">
            <i class="bi bi-arrow-repeat text-warning"></i> Reconsiderations
          </a>
          <a href="#admin-portal" class="nav-link-custom" onclick="window.SaveToServeAdmin?.switchTab('manage-donations')">
            <i class="bi bi-box2-heart"></i> Manage Donations
          </a>
          <a href="#weather-rescue" class="nav-link-custom" onclick="window.SaveToServeApp.navigateTo('weather-rescue')">
            <i class="bi bi-cloud-rain-heavy"></i> Weather Rescue
          </a>
          <a href="#holding-hubs" class="nav-link-custom" onclick="window.SaveToServeApp.navigateTo('holding-hubs')">
            <i class="bi bi-snow"></i> Safe Hubs
          </a>
          <a href="#impact-dashboard" class="nav-link-custom" onclick="window.SaveToServeApp.navigateTo('impact-dashboard')">
            <i class="bi bi-graph-up-arrow"></i> Impact & Reports
          </a>
        </nav>
      `;
      mobileNavLinks = `
        <a href="#admin-portal" class="mobile-nav-item" onclick="window.SaveToServeAdmin?.switchTab('donor-verification')">
          <i class="bi bi-shield-check"></i><span>Verifications</span>
        </a>
        <a href="#admin-portal" class="mobile-nav-item" onclick="window.SaveToServeAdmin?.switchTab('reconsideration-queue')">
          <i class="bi bi-arrow-repeat"></i><span>Reconsider</span>
        </a>
        <a href="#weather-rescue" class="mobile-nav-item" onclick="window.SaveToServeApp.navigateTo('weather-rescue')">
          <i class="bi bi-cloud-rain"></i><span>Weather</span>
        </a>
      `;
    }

    navContainer.innerHTML = `
      ${roleNavLinks}
      <div class="d-flex align-items-center gap-2 border-start ps-3 ms-2">
        <div class="text-end d-none d-md-block" style="line-height:1.2;">
          <div class="fw-bold small" style="color:var(--dark-olive);">${user.name}</div>
          <span class="badge badge-${user.role}" style="font-size:0.68rem;">${portalName}</span>
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="window.SaveToServeApp.logout()" title="Logout">
          <i class="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    `;

    if (mobileBottomNav) {
      mobileBottomNav.classList.remove('d-none');
      mobileBottomNav.innerHTML = mobileNavLinks;
    }
  }

  navigateTo(route, updateHash = true) {
    const portalRoutes = {
      'donor-portal': 'donor',
      'ngo-portal': 'ngo',
      'volunteer-portal': 'volunteer',
      'admin-portal': 'admin'
    };

    const user = window.SaveToServeAuth?.getCurrentUser();

    // Check if route is a protected portal dashboard
    if (portalRoutes[route]) {
      const expectedRole = portalRoutes[route];

      if (!user) {
        this.activeAuthRole = expectedRole;
        if (updateHash) window.location.hash = 'login';
        this.renderAuthView('login', expectedRole, `Please sign in to access the ${PORTAL_NAMES[expectedRole]} Portal.`);
        this.renderNavbar();
        return;
      }

      if (user.role !== expectedRole) {
        this.showToast('You do not have permission to access this portal. Please log in through your registered portal.', 'danger');
        this.showAccessDeniedModal(expectedRole, user.role);
        if (updateHash) window.location.hash = `${user.role}-portal`;
        this.navigateTo(`${user.role}-portal`, false);
        return;
      }
    }

    // Protected feature routes
    if (['weather-rescue', 'holding-hubs', 'impact-dashboard'].includes(route)) {
      if (!user) {
        this.activeAuthRole = 'donor';
        this.navigateTo('login');
        return;
      }
    }

    // Check if visiting login/register while authenticated
    if (route === 'login' || route === 'register') {
      if (user) {
        this.navigateTo(`${user.role}-portal`, false);
        return;
      }
    }

    this.currentRoute = route;
    if (updateHash) {
      window.location.hash = route;
    }

    // Set dynamic portal theme attribute for Palette 2: Soft Pastel & Friendly
    let portalTheme = 'home';
    if (user) {
      portalTheme = user.role;
    } else if (route === 'login' || route === 'register') {
      portalTheme = this.activeAuthRole || 'donor';
    } else if (route === 'donor-portal') {
      portalTheme = 'donor';
    } else if (route === 'ngo-portal') {
      portalTheme = 'ngo';
    } else if (route === 'volunteer-portal') {
      portalTheme = 'volunteer';
    } else if (['admin-portal', 'weather-rescue', 'impact-dashboard', 'holding-hubs'].includes(route)) {
      portalTheme = 'admin';
    } else {
      portalTheme = 'home';
    }
    document.body.setAttribute('data-portal', portalTheme);
    document.documentElement.setAttribute('data-portal', portalTheme);

    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.add('d-none'));

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
        case 'login':
          this.renderAuthView('login', this.activeAuthRole);
          break;
        case 'register':
          this.renderAuthView('register', this.activeAuthRole);
          break;
        case 'home':
        default:
          break;
      }
    }

    this.renderNavbar();
  }

  logout() {
    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    }
    window.SaveToServeAuth?.logout();
    this.showToast('Logged out successfully.', 'info');
    this.navigateTo('home');
    this.renderNavbar();
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

  renderAuthView(type = 'login', role = null, noticeMessage = null) {
    if (role) this.activeAuthRole = role;
    const currentRole = this.activeAuthRole || 'donor';

    const roleMeta = {
      donor: { title: 'Donor Portal', subtitle: 'For Restaurants, Hotels, Caterers & Food Kitchens', icon: 'bi-shop', badge: 'Donor' },
      ngo: { title: 'NGO Shelter Portal', subtitle: 'For Registered Shelters, Orphanages & Food Banks', icon: 'bi-building', badge: 'NGO' },
      volunteer: { title: 'Volunteer Portal', subtitle: 'For Food Rescue Couriers & Delivery Drivers', icon: 'bi-bicycle', badge: 'Volunteer' },
      admin: { title: 'Super Admin Portal', subtitle: 'Authorized System Administrators Only', icon: 'bi-shield-lock', badge: 'Super Admin' }
    };

    const activeMeta = roleMeta[currentRole] || roleMeta.donor;
    const container = document.getElementById(`${type}-view`);
    if (!container) return;

    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.add('d-none'));
    container.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (type === 'login') {
      container.innerHTML = `
        <div class="container py-4">
          <div class="mb-4 max-w-600 mx-auto" style="max-width: 500px;">
            <button class="btn btn-sm btn-soft-olive" onclick="window.SaveToServeApp.navigateTo('home')">
              <i class="bi bi-arrow-left"></i> Back to Portal Selection
            </button>
          </div>

          <div class="row justify-content-center">
            <div class="col-lg-5 col-md-7 col-sm-10">
              <div class="custom-card shadow-md p-4">
                <div class="text-center mb-4">
                  <div class="portal-card-icon mx-auto mb-2" style="width:52px;height:52px;font-size:1.5rem;">
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

                ${currentRole !== 'admin' ? `
                  <div class="text-center small text-muted pt-2 border-top">
                    Don't have an account? <a href="#register" class="fw-bold text-success" onclick="window.SaveToServeApp.openPortalRegister('${currentRole}')">Register as ${activeMeta.badge}</a>
                  </div>
                ` : `
                  <div class="text-center small text-muted pt-2 border-top">
                    <i class="bi bi-shield-lock-fill text-muted"></i> Super Admin registration is restricted to authorized operators.
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
          <div class="mb-4 max-w-600 mx-auto" style="max-width: 580px;">
            <button class="btn btn-sm btn-soft-olive" onclick="window.SaveToServeApp.navigateTo('home')">
              <i class="bi bi-arrow-left"></i> Back to Portal Selection
            </button>
          </div>

          <div class="row justify-content-center">
            <div class="col-lg-6 col-md-8 col-sm-11">
              <div class="custom-card shadow-md p-4">
                <div class="text-center mb-3">
                  <div class="portal-card-icon mx-auto mb-2" style="width:52px;height:52px;font-size:1.5rem;">
                    <i class="bi ${activeMeta.icon}"></i>
                  </div>
                  <h4 class="fw-bold mb-1" style="color:var(--dark-olive);">Create ${activeMeta.badge} Account</h4>
                  <p class="text-muted small">Permanent account registration for ${activeMeta.title}</p>
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
                      <label class="form-label-custom">Permanent Role</label>
                      <input type="text" class="form-control form-control-custom w-100" value="${activeMeta.badge}" disabled style="background:#f0f2eb; font-weight:700; color:var(--dark-olive);">
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label-custom">
                      ${currentRole === 'volunteer' ? 'Vehicle Type / Mode (e.g. Two-wheeler / Van / On Foot)' : 'Organization / Restaurant / Facility Name *'}
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

                <div class="text-center small text-muted pt-2 border-top">
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
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const expectedRole = document.getElementById('loginExpectedRole')?.value || this.activeAuthRole || null;

    const errorAlert = document.getElementById('loginErrorAlert');
    const errorText = document.getElementById('loginErrorText');

    if (errorAlert) errorAlert.classList.add('d-none');

    const res = window.SaveToServeAuth?.login(email, password, expectedRole);
    if (res && res.success) {
      this.showToast(`Welcome back, ${res.user.name}!`, 'success');
      this.navigateTo(`${res.user.role}-portal`);
    } else {
      const msg = res ? res.message : 'Invalid credentials. Please check your email and password.';
      if (errorAlert && errorText) {
        errorText.innerText = msg;
        errorAlert.classList.remove('d-none');
      }
      this.showToast(msg, 'danger');
    }
  }

  handleRegisterForm(event) {
    event.preventDefault();
    const name = document.getElementById('regName')?.value.trim();
    const role = document.getElementById('regRole')?.value || 'donor';
    const orgName = document.getElementById('regOrgName')?.value.trim() || '';
    const email = document.getElementById('regEmail')?.value.trim();
    const phone = document.getElementById('regPhone')?.value.trim();
    const address = document.getElementById('regAddress')?.value.trim();
    const password = document.getElementById('regPassword')?.value;

    const errorAlert = document.getElementById('regErrorAlert');
    const errorText = document.getElementById('regErrorText');

    if (errorAlert) errorAlert.classList.add('d-none');

    const res = window.SaveToServeAuth?.register({
      name,
      role,
      orgName: orgName || name,
      email,
      phone,
      address,
      password,
      vehicleType: role === 'volunteer' ? (orgName || 'Two-wheeler') : ''
    });

    if (res && res.success) {
      this.showToast(`Registration complete! Welcome, ${res.user.name}.`, 'success');
      this.navigateTo(`${res.user.role}-portal`);
    } else {
      const msg = res ? res.message : 'Registration could not be completed.';
      if (errorAlert && errorText) {
        errorText.innerText = msg;
        errorAlert.classList.remove('d-none');
      }
      this.showToast(msg, 'danger');
    }
  }
}

window.SaveToServeApp = new SaveToServeAppController();
window.RainRouteApp = window.SaveToServeApp;
