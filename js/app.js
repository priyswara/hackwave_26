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
    }, 10000);

    // Close dropdowns cleanly when dropdown items are clicked
    document.addEventListener('click', (e) => {
      const dropdownItem = e.target.closest('.dropdown-item');
      if (dropdownItem) {
        const dropdownMenu = dropdownItem.closest('.dropdown-menu');
        if (dropdownMenu && typeof bootstrap !== 'undefined') {
          const dropdownToggle = dropdownMenu.parentElement.querySelector('[data-bs-toggle="dropdown"]');
          if (dropdownToggle) {
            const bsDropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
            if (bsDropdown) bsDropdown.hide();
          }
        }
      }
    });

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

    // Whimsical 3D card tilt & cursor glow tracking on portal cards
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.portal-card');
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.015)`;
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.portal-card');
      if (card && !card.contains(e.relatedTarget)) {
        card.style.transform = '';
      }
    }, { passive: true });
  }

  triggerSuccessBurst(originElOrEvent = null, customEmoji = '💖') {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (originElOrEvent instanceof Event && originElOrEvent.clientX) {
      x = originElOrEvent.clientX;
      y = originElOrEvent.clientY;
    } else if (originElOrEvent && originElOrEvent.getBoundingClientRect) {
      const rect = originElOrEvent.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const emojis = [customEmoji, '✨', '🌱', '🍲', '💚'];
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.className = 'sts-floating-emoji-burst';
      particle.textContent = emojis[i % emojis.length];
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      const angle = (i * 60 + Math.random() * 20 - 10) * (Math.PI / 180);
      const dist = 35 + Math.random() * 35;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 30; // Float upwards
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 750);
    }
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

  closeMobileDrawer() {
    const offcanvasEl = document.getElementById('mobileNavOffcanvas');
    if (offcanvasEl && typeof bootstrap !== 'undefined') {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
      bsOffcanvas.hide();
    }
  }

  renderNavbar() {
    const user = window.SaveToServeAuth?.getCurrentUser();
    const navContainer = document.getElementById('navbarDynamicArea');
    const drawerBody = document.getElementById('mobileNavDrawerBody');
    const mobileBottomNav = document.getElementById('mobileBottomNav');
    if (!navContainer) return;

    if (!user || this.currentRoute === 'home') {
      // Clean homepage: No global links, no public clutter
      navContainer.innerHTML = '';
      if (drawerBody) drawerBody.innerHTML = '';
      if (mobileBottomNav) {
        mobileBottomNav.classList.add('d-none');
        mobileBottomNav.innerHTML = '';
      }
      return;
    }

    const portalName = PORTAL_NAMES[user.role] || user.role.toUpperCase();

    // Generate Role-Specific Navigation Links & Mobile Drawer Items
    let roleNavLinks = '';
    let drawerContent = '';
    let mobileNavLinks = '';

    const isVerified = user.kycStatus === 'approved';
    const kycBadgeText = isVerified ? 'Verified' : user.kycStatus === 'rejected' ? 'Rejected' : 'Pending Review';
    const kycBadgeClass = isVerified ? 'bg-success' : user.kycStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark';

    const userDrawerCard = `
      <div class="mobile-nav-user-card">
        <div class="d-flex align-items-center gap-2 mb-1">
          <div class="stat-icon icon-olive" style="width:34px;height:34px;font-size:1.1rem;border-radius:8px;">
            <i class="bi ${user.role === 'donor' ? 'bi-shop' : user.role === 'ngo' ? 'bi-building' : user.role === 'volunteer' ? 'bi-bicycle' : 'bi-shield-lock'}"></i>
          </div>
          <div style="line-height:1.2; overflow:hidden;">
            <div class="fw-bold text-truncate" style="color:var(--portal-dark);font-size:0.92rem;">${user.orgName || user.name}</div>
            <div class="small text-muted text-truncate" style="font-size:0.75rem;">${user.email || user.phone || portalName}</div>
          </div>
        </div>
        <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
          <span class="badge badge-${user.role}" style="font-size:0.72rem;">${portalName}</span>
          <span class="badge ${kycBadgeClass}" style="font-size:0.70rem;">${kycBadgeText}</span>
        </div>
      </div>
    `;

    if (user.role === 'donor') {
      roleNavLinks = `
        <nav class="d-none d-lg-flex align-items-center gap-1">
          <div class="dropdown">
            <button class="nav-link-custom dropdown-toggle border-0 bg-transparent" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-grid-fill"></i> Dashboard
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#donor-portal" onclick="window.SaveToServeDonor?.switchTab('my-donations')"><i class="bi bi-list-stars text-primary"></i> My Food Listings</a></li>
              <li><a class="dropdown-item" href="#donor-portal" onclick="window.SaveToServeDonor?.switchTab('track-pickups')"><i class="bi bi-truck text-success"></i> Track Pickups & Codes</a></li>
              <li><a class="dropdown-item" href="#donor-portal" onclick="window.SaveToServeDonor?.switchTab('kyc')"><i class="bi bi-shield-check text-info"></i> Kitchen Verification</a></li>
            </ul>
          </div>
          <a href="#donor-portal" class="nav-link-custom" onclick="window.SaveToServeDonor?.switchTab('my-donations')">
            <i class="bi bi-shop"></i> My Listings
          </a>
          <a href="#donor-portal" class="nav-link-custom" onclick="window.SaveToServeDonor?.switchTab('track-pickups')">
            <i class="bi bi-truck"></i> Track Pickups
          </a>
          <a href="#donor-portal" class="nav-link-custom" onclick="window.SaveToServeDonor?.switchTab('weather-map')">
            <i class="bi bi-cloud-rain-heavy"></i> Weather Map
          </a>
          <button class="btn btn-sm btn-olive ms-1" onclick="window.SaveToServeDonor?.switchTab('post-donation')">
            <i class="bi bi-plus-circle"></i> Post Food
          </button>
        </nav>
      `;

      drawerContent = `
        ${userDrawerCard}
        <div class="d-flex flex-column gap-1 flex-grow-1">
          <a href="#donor-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeDonor?.switchTab('my-donations');">
            <i class="bi bi-grid-fill"></i> <span>Dashboard & Listings</span>
          </a>
          <a href="#donor-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeDonor?.switchTab('post-donation');">
            <i class="bi bi-plus-circle-fill"></i> <span>Post Surplus Food</span>
          </a>
          <a href="#donor-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeDonor?.switchTab('track-pickups');">
            <i class="bi bi-truck"></i> <span>Track Pickups & Codes</span>
          </a>
          <a href="#donor-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeDonor?.switchTab('weather-map');">
            <i class="bi bi-cloud-rain-heavy"></i> <span>Weather Routing Map</span>
          </a>
          <a href="#donor-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeDonor?.switchTab('kyc');">
            <i class="bi bi-shield-check"></i> <span>Kitchen Verification Dossier</span>
          </a>
        </div>
        <div class="pt-3 border-top mt-auto">
          <button class="btn btn-outline-danger w-100" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeApp.logout();">
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
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
        <a href="#donor-portal" class="mobile-nav-item" onclick="window.SaveToServeDonor?.switchTab('weather-map')">
          <i class="bi bi-cloud-rain-heavy"></i><span>Weather</span>
        </a>
      `;
    } else if (user.role === 'ngo') {
      roleNavLinks = `
        <nav class="d-none d-lg-flex align-items-center gap-1">
          <div class="dropdown">
            <button class="nav-link-custom dropdown-toggle border-0 bg-transparent" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-grid-fill"></i> NGO Dashboard
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#ngo-portal" onclick="window.SaveToServeNGO?.switchTab('dashboard')"><i class="bi bi-speedometer2 text-success"></i> 1. Dashboard</a></li>
              <li><a class="dropdown-item" href="#ngo-portal" onclick="window.SaveToServeNGO?.switchTab('browse-food')"><i class="bi bi-basket2 text-success"></i> 2. Browse Available Food</a></li>
              <li><a class="dropdown-item" href="#ngo-portal" onclick="window.SaveToServeNGO?.switchTab('nearby-donors')"><i class="bi bi-radar text-primary"></i> 3. Nearby Donors (10 KM)</a></li>
              <li><a class="dropdown-item" href="#ngo-portal" onclick="window.SaveToServeNGO?.switchTab('my-claims')"><i class="bi bi-bag-check text-warning"></i> 4. My Claims & Deliveries</a></li>
              <li><a class="dropdown-item" href="#ngo-portal" onclick="window.SaveToServeNGO?.switchTab('donor-reviews')"><i class="bi bi-star-fill text-warning"></i> 5. Donor Reviews</a></li>
              <li><a class="dropdown-item" href="#ngo-portal" onclick="window.SaveToServeNGO?.switchTab('profile')"><i class="bi bi-person-lines-fill text-info"></i> 6. NGO Profile</a></li>
            </ul>
          </div>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('dashboard')">
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('browse-food')">
            <i class="bi bi-basket2"></i> Browse Food
          </a>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('nearby-donors')">
            <i class="bi bi-radar"></i> Nearby Donors
          </a>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('my-claims')">
            <i class="bi bi-bag-check"></i> My Claims
          </a>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('donor-reviews')">
            <i class="bi bi-star-fill text-warning"></i> Donor Reviews
          </a>
          <a href="#ngo-portal" class="nav-link-custom" onclick="window.SaveToServeNGO?.switchTab('profile')">
            <i class="bi bi-person-lines-fill"></i> NGO Profile
          </a>
        </nav>
      `;

      drawerContent = `
        ${userDrawerCard}
        <div class="d-flex flex-column gap-1 flex-grow-1">
          <a href="#ngo-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeNGO?.switchTab('dashboard');">
            <i class="bi bi-speedometer2"></i> <span>1. Dashboard</span>
          </a>
          <a href="#ngo-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeNGO?.switchTab('browse-food');">
            <i class="bi bi-basket2-fill"></i> <span>2. Browse Available Food</span>
          </a>
          <a href="#ngo-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeNGO?.switchTab('nearby-donors');">
            <i class="bi bi-radar"></i> <span>3. Nearby Donors (10 KM)</span>
          </a>
          <a href="#ngo-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeNGO?.switchTab('my-claims');">
            <i class="bi bi-bag-check-fill"></i> <span>4. My Claims & Deliveries</span>
          </a>
          <a href="#ngo-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeNGO?.switchTab('donor-reviews');">
            <i class="bi bi-star-fill text-warning"></i> <span>5. Donor Reviews</span>
          </a>
          <a href="#ngo-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeNGO?.switchTab('profile');">
            <i class="bi bi-person-lines-fill"></i> <span>6. NGO Profile</span>
          </a>
        </div>
        <div class="pt-3 border-top mt-auto">
          <button class="btn btn-outline-danger w-100" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeApp.logout();">
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      `;

      mobileNavLinks = `
        <a href="#ngo-portal" class="mobile-nav-item" onclick="window.SaveToServeNGO?.switchTab('dashboard')">
          <i class="bi bi-speedometer2"></i><span>Dashboard</span>
        </a>
        <a href="#ngo-portal" class="mobile-nav-item" onclick="window.SaveToServeNGO?.switchTab('browse-food')">
          <i class="bi bi-basket2"></i><span>Browse</span>
        </a>
        <a href="#ngo-portal" class="mobile-nav-item" onclick="window.SaveToServeNGO?.switchTab('nearby-donors')">
          <i class="bi bi-radar"></i><span>Nearby</span>
        </a>
        <a href="#ngo-portal" class="mobile-nav-item" onclick="window.SaveToServeNGO?.switchTab('my-claims')">
          <i class="bi bi-bag-check"></i><span>Claims</span>
        </a>
        <a href="#ngo-portal" class="mobile-nav-item" onclick="window.SaveToServeNGO?.switchTab('donor-reviews')">
          <i class="bi bi-star"></i><span>Reviews</span>
        </a>
        <a href="#ngo-portal" class="mobile-nav-item" onclick="window.SaveToServeNGO?.switchTab('profile')">
          <i class="bi bi-person"></i><span>Profile</span>
        </a>
      `;
    } else if (user.role === 'volunteer') {
      roleNavLinks = `
        <nav class="d-none d-lg-flex align-items-center gap-1">
          <div class="dropdown">
            <button class="nav-link-custom dropdown-toggle border-0 bg-transparent" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-grid-fill"></i> Dashboard
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#volunteer-portal" onclick="window.SaveToServeVolunteer?.switchTab('active-tasks')"><i class="bi bi-box-seam text-warning"></i> Active Pickups & Routes</a></li>
              <li><a class="dropdown-item" href="#volunteer-portal" onclick="window.SaveToServeVolunteer?.switchTab('available-tasks')"><i class="bi bi-bell text-success"></i> Available Pickup Tasks</a></li>
              <li><a class="dropdown-item" href="#volunteer-portal" onclick="window.SaveToServeVolunteer?.switchTab('history')"><i class="bi bi-clock-history text-secondary"></i> Task History Log</a></li>
              <li><a class="dropdown-item" href="#volunteer-portal" onclick="window.SaveToServeVolunteer?.switchTab('kyc')"><i class="bi bi-shield-check text-info"></i> Safety Dossier</a></li>
            </ul>
          </div>
          <a href="#volunteer-portal" class="nav-link-custom" onclick="window.SaveToServeVolunteer?.switchTab('active-tasks')">
            <i class="bi bi-box-seam"></i> Active Pickups
          </a>
          <a href="#volunteer-portal" class="nav-link-custom" onclick="window.SaveToServeVolunteer?.switchTab('available-tasks')">
            <i class="bi bi-bell"></i> Available Tasks
          </a>
          <a href="#volunteer-portal" class="nav-link-custom" onclick="window.SaveToServeVolunteer?.switchTab('weather-map')">
            <i class="bi bi-cloud-rain-heavy"></i> Weather Map
          </a>
          <a href="#volunteer-portal" class="nav-link-custom" onclick="window.SaveToServeVolunteer?.switchTab('history')">
            <i class="bi bi-clock-history"></i> History
          </a>
        </nav>
      `;

      drawerContent = `
        ${userDrawerCard}
        <div class="d-flex flex-column gap-1 flex-grow-1">
          <a href="#volunteer-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeVolunteer?.switchTab('active-tasks');">
            <i class="bi bi-box-seam-fill"></i> <span>Active Pickups & Routes</span>
          </a>
          <a href="#volunteer-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeVolunteer?.switchTab('available-tasks');">
            <i class="bi bi-bell-fill"></i> <span>Available Pickup Tasks</span>
          </a>
          <a href="#volunteer-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeVolunteer?.switchTab('weather-map');">
            <i class="bi bi-cloud-rain-heavy"></i> <span>Weather Safety Map</span>
          </a>
          <a href="#volunteer-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeVolunteer?.switchTab('history');">
            <i class="bi bi-clock-history"></i> <span>Task History Log</span>
          </a>
          <a href="#volunteer-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeVolunteer?.switchTab('kyc');">
            <i class="bi bi-shield-check"></i> <span>Volunteer Safety Dossier</span>
          </a>
        </div>
        <div class="pt-3 border-top mt-auto">
          <button class="btn btn-outline-danger w-100" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeApp.logout();">
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      `;

      mobileNavLinks = `
        <a href="#volunteer-portal" class="mobile-nav-item" onclick="window.SaveToServeVolunteer?.switchTab('active-tasks')">
          <i class="bi bi-box-seam"></i><span>Active</span>
        </a>
        <a href="#volunteer-portal" class="mobile-nav-item" onclick="window.SaveToServeVolunteer?.switchTab('available-tasks')">
          <i class="bi bi-bell"></i><span>Pickups</span>
        </a>
        <a href="#volunteer-portal" class="mobile-nav-item" onclick="window.SaveToServeVolunteer?.switchTab('weather-map')">
          <i class="bi bi-cloud-rain-heavy"></i><span>Weather</span>
        </a>
        <a href="#volunteer-portal" class="mobile-nav-item" onclick="window.SaveToServeVolunteer?.switchTab('history')">
          <i class="bi bi-clock-history"></i><span>History</span>
        </a>
      `;
    } else if (user.role === 'admin') {
      roleNavLinks = `
        <nav class="d-none d-lg-flex align-items-center gap-1">
          <div class="dropdown">
            <button class="nav-link-custom dropdown-toggle border-0 bg-transparent" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-speedometer2"></i> Dashboard
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#admin-portal" onclick="window.SaveToServeAdmin?.switchTab('donor-verification')"><i class="bi bi-shop text-primary"></i> Donor Verifications</a></li>
              <li><a class="dropdown-item" href="#admin-portal" onclick="window.SaveToServeAdmin?.switchTab('ngo-verification')"><i class="bi bi-building text-success"></i> NGO Verifications</a></li>
              <li><a class="dropdown-item" href="#admin-portal" onclick="window.SaveToServeAdmin?.switchTab('volunteer-verification')"><i class="bi bi-bicycle text-info"></i> Volunteer Verifications</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#admin-portal" onclick="window.SaveToServeAdmin?.switchTab('reconsideration-queue')"><i class="bi bi-arrow-repeat text-warning"></i> Reconsideration Queue</a></li>
            </ul>
          </div>
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
            <i class="bi bi-graph-up-arrow"></i> Impact
          </a>
        </nav>
      `;

      drawerContent = `
        ${userDrawerCard}
        <div class="d-flex flex-column gap-1 flex-grow-1">
          <a href="#admin-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeAdmin?.switchTab('donor-verification');">
            <i class="bi bi-shop"></i> <span>Donor Verifications</span>
          </a>
          <a href="#admin-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeAdmin?.switchTab('ngo-verification');">
            <i class="bi bi-building"></i> <span>NGO Verifications</span>
          </a>
          <a href="#admin-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeAdmin?.switchTab('volunteer-verification');">
            <i class="bi bi-bicycle"></i> <span>Volunteer Verifications</span>
          </a>
          <a href="#admin-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeAdmin?.switchTab('reconsideration-queue');">
            <i class="bi bi-arrow-repeat"></i> <span>Reconsiderations Queue</span>
          </a>
          <a href="#admin-portal" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeAdmin?.switchTab('manage-donations');">
            <i class="bi bi-box2-heart-fill"></i> <span>Manage All Donations</span>
          </a>
          <a href="#weather-rescue" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeApp.navigateTo('weather-rescue');">
            <i class="bi bi-cloud-rain-heavy-fill"></i> <span>Weather Rescue Map</span>
          </a>
          <a href="#holding-hubs" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeApp.navigateTo('holding-hubs');">
            <i class="bi bi-snow"></i> <span>Safe Holding Hubs</span>
          </a>
          <a href="#impact-dashboard" class="nav-drawer-link" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeApp.navigateTo('impact-dashboard');">
            <i class="bi bi-graph-up-arrow"></i> <span>Impact & Analytics</span>
          </a>
        </div>
        <div class="pt-3 border-top mt-auto">
          <button class="btn btn-outline-danger w-100" onclick="window.SaveToServeApp.closeMobileDrawer(); window.SaveToServeApp.logout();">
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      `;

      mobileNavLinks = `
        <a href="#admin-portal" class="mobile-nav-item" onclick="window.SaveToServeAdmin?.switchTab('donor-verification')">
          <i class="bi bi-shield-check"></i><span>Verifications</span>
        </a>
        <a href="#admin-portal" class="mobile-nav-item" onclick="window.SaveToServeAdmin?.switchTab('manage-donations')">
          <i class="bi bi-box2-heart"></i><span>Donations</span>
        </a>
        <a href="#weather-rescue" class="mobile-nav-item" onclick="window.SaveToServeApp.navigateTo('weather-rescue')">
          <i class="bi bi-cloud-rain"></i><span>Weather</span>
        </a>
        <a href="#impact-dashboard" class="mobile-nav-item" onclick="window.SaveToServeApp.navigateTo('impact-dashboard')">
          <i class="bi bi-graph-up"></i><span>Impact</span>
        </a>
      `;
    }

    navContainer.innerHTML = `
      ${roleNavLinks}
      <div class="d-none d-lg-flex align-items-center gap-2 border-start ps-3 ms-2">
        <div class="text-end" style="line-height:1.2;">
          <div class="fw-bold small text-truncate" style="color:var(--portal-dark); max-width:140px;">${user.orgName || user.name}</div>
          <span class="badge badge-${user.role}" style="font-size:0.68rem;">${portalName}</span>
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="window.SaveToServeApp.logout()" title="Logout">
          <i class="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
      <!-- Responsive Mobile Hamburger Toggle Button -->
      <button class="btn-nav-toggle d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNavOffcanvas" aria-controls="mobileNavOffcanvas" aria-label="Toggle navigation" title="Menu">
        <i class="bi bi-list fs-5"></i>
      </button>
    `;

    if (drawerBody) {
      drawerBody.innerHTML = drawerContent;
    }

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
    let warmSubtitle = '';
    if (type === 'success') {
      icon = 'bi-check-circle-fill text-success';
      const microcopies = [
        'A little kindness goes a long way 🌱',
        'Yay! A meal is on its way! 🍲',
        'Every rescued meal makes a difference 💚',
        "You're making someone's day brighter! ✨"
      ];
      warmSubtitle = `<div class="text-muted mt-1" style="font-size:0.75rem; font-style:italic;">${microcopies[Math.floor(Math.random() * microcopies.length)]}</div>`;
      this.triggerSuccessBurst(null, '💖');
    }
    if (type === 'warning') icon = 'bi-exclamation-triangle-fill text-warning';
    if (type === 'danger') icon = 'bi-x-octagon-fill text-danger';

    toast.innerHTML = `
      <i class="bi ${icon} fs-5 mt-1"></i>
      <div class="flex-grow-1 small font-weight-500">
        <div>${message}</div>
        ${warmSubtitle}
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, durationMs);
  }

  showDonationDetailsModal(donationId) {
    const d = window.SaveToServeDB?.getDonationById(donationId);
    if (!d) return;

    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    const user = window.SaveToServeAuth?.getCurrentUser();
    const expiryInfo = SaveToServeStore.getExpiryCountdown(d.safeUntil);
    const postedTimeFormatted = SaveToServeStore.formatDateTime(d.createdAt || d.prepTime);
    const expiryTimeFormatted = SaveToServeStore.formatDateTime(d.safeUntil);

    modalTitle.innerHTML = `<i class="bi bi-box2-heart text-success me-2"></i> ${d.foodName || 'Donation Details'}`;
    modalBody.innerHTML = `
      <div>
        ${expiryInfo.isExpired ? `
          <div class="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 shadow-sm">
            <i class="bi bi-x-octagon-fill fs-5 text-danger flex-shrink-0"></i>
            <div>
              <strong>Food Expired:</strong> Safe consumption window for this surplus food has elapsed. It is marked as Expired and cannot be claimed.
            </div>
          </div>
        ` : expiryInfo.isApproachingExpiry ? `
          <div class="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-3 shadow-sm">
            <i class="bi bi-exclamation-triangle-fill fs-5 text-warning flex-shrink-0"></i>
            <div>
              <strong>Approaching Expiry:</strong> This surplus food is nearing its safe-use deadline (${expiryInfo.countdownText}). Priority collection is advised!
            </div>
          </div>
        ` : ''}

        <div class="row g-3">
          <div class="col-md-5">
            <div class="rounded overflow-hidden border mb-2 position-relative" style="background:var(--portal-light); height:210px;">
              <img src="${d.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600'}" alt="${d.foodName || 'Food Image'}" style="width:100%;height:100%;object-fit:cover;">
              <div style="position:absolute; top:10px; left:10px;">
                <span class="badge ${d.foodType === 'veg' ? 'bg-success' : 'bg-danger'} text-uppercase">
                  ${d.foodType || 'veg'}
                </span>
              </div>
              <div style="position:absolute; top:10px; right:10px;">
                ${expiryInfo.badgeHtml}
              </div>
            </div>
            
            <div class="p-3 bg-light rounded small border">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Category:</span>
                <strong>${d.category || 'Cooked Meal'}</strong>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Quantity:</span>
                <strong>${d.portions ? `${d.portions} portions (~${d.quantityKg || (d.portions * 0.35).toFixed(1)} kg)` : 'Not provided'}</strong>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Status:</span>
                <span class="badge ${d.status === 'completed' ? 'bg-success' : d.status === 'claimed' || d.status === 'in-transit' ? 'bg-primary' : d.status === 'expired' ? 'badge-expired' : d.status === 'flagged' ? 'bg-danger' : 'bg-warning text-dark'} text-uppercase">${d.status || 'AVAILABLE'}</span>
              </div>
              ${d.pickupCode ? `
                <div class="d-flex justify-content-between pt-1 border-top mt-1">
                  <span class="text-muted">Pickup Code:</span>
                  <strong class="font-monospace text-primary">${d.pickupCode}</strong>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="col-md-7">
            <h5 class="fw-bold mb-1" style="color:var(--dark-olive);">${d.foodName || 'Food Listing'}</h5>
            <p class="text-muted small mb-3"><i class="bi bi-info-circle me-1"></i>${d.storageInfo || 'Freshly prepared surplus cooked meal packaged safely for community rescue.'}</p>

            <!-- Prominent Timestamps Section -->
            <div class="p-3 rounded border mb-3" style="background:#FAFBFD;">
              <div class="row g-2">
                <div class="col-sm-6">
                  <div class="p-2 border rounded bg-white h-100">
                    <span class="text-muted d-block" style="font-size:0.72rem;font-weight:700;letter-spacing:0.3px;">
                      <i class="bi bi-calendar-check text-primary me-1"></i>POSTED TIME
                    </span>
                    <strong class="d-block mt-1" style="color:var(--dark-olive); font-size:0.9rem;">${postedTimeFormatted}</strong>
                    <div class="small text-muted" style="font-size:0.75rem;">(User's Local Time)</div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="p-2 border rounded bg-white h-100" style="${expiryInfo.isApproachingExpiry ? 'border-color:#F5BDB5!important; background:#FFFBFB!important;' : ''}">
                    <span class="text-muted d-block" style="font-size:0.72rem;font-weight:700;letter-spacing:0.3px;">
                      <i class="bi bi-alarm ${expiryInfo.isExpired ? 'text-danger' : expiryInfo.isApproachingExpiry ? 'text-warning' : 'text-danger'} me-1"></i>EXPIRY DATE & TIME
                    </span>
                    <strong class="d-block mt-1 ${expiryInfo.isExpired ? 'text-danger' : expiryInfo.isApproachingExpiry ? 'text-danger' : 'text-dark'}" style="font-size:0.9rem;">${expiryTimeFormatted}</strong>
                    <div class="mt-1">${expiryInfo.badgeHtml}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Donor & Pickup Address -->
            <div class="p-3 rounded small border mb-3" style="background:var(--portal-soft-bg);">
              <div class="row g-2">
                <div class="col-sm-6">
                  <span class="text-muted d-block" style="font-size:0.72rem;font-weight:700;">DONOR / KITCHEN</span>
                  <strong>${d.donorOrg || d.donorName || 'Not provided'}</strong>
                  ${d.donorName && d.donorName !== d.donorOrg ? `<div class="text-muted">${d.donorName}</div>` : ''}
                  ${d.donorPhone ? `<div class="font-monospace text-muted mt-1"><i class="bi bi-telephone me-1"></i>${d.donorPhone}</div>` : ''}
                </div>
                <div class="col-sm-6">
                  <span class="text-muted d-block" style="font-size:0.72rem;font-weight:700;">PICKUP ADDRESS</span>
                  <div><i class="bi bi-geo-alt text-danger me-1"></i>${d.donorAddress || 'Not provided'}</div>
                </div>
                ${d.claimedByNgoName ? `
                  <div class="col-12 pt-2 border-top mt-1">
                    <span class="text-muted d-block" style="font-size:0.72rem;font-weight:700;">CLAIMED BY NGO</span>
                    <div><i class="bi bi-building text-success me-1"></i><strong>${d.claimedByNgoName}</strong></div>
                  </div>
                ` : ''}
                ${d.assignedVolunteerName ? `
                  <div class="col-12 pt-1">
                    <span class="text-muted d-block" style="font-size:0.72rem;font-weight:700;">ASSIGNED COURIER</span>
                    <div><i class="bi bi-bicycle text-info me-1"></i><strong>${d.assignedVolunteerName}</strong></div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Donor Rating & NGO Reviews Summary -->
            ${(() => {
              const donorId = d.donorId || 'usr-donor-1';
              const ratingStats = window.SaveToServeDB?.getDonorRatingStats(donorId);
              const donorReviews = window.SaveToServeDB?.getReviewsForDonor(donorId) || [];
              if (ratingStats && ratingStats.totalReviews > 0) {
                return `
                  <div class="p-2 rounded border small mb-3" style="background:#FAFDFB; border-color:#8CB8A5 !important;">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="text-dark fw-bold"><i class="bi bi-star-fill text-warning me-1"></i>Donor Rating: <strong>${ratingStats.averageFormatted} / 5.0</strong></span>
                      <span class="badge" style="background:#E2F1EA; color:#265944; border:1px solid #8CB8A5;">${ratingStats.totalReviews} Verified NGO Review(s)</span>
                    </div>
                    ${donorReviews.length > 0 ? `
                      <p class="text-muted mb-0 small fst-italic">"${donorReviews[0].comment}" — <strong class="text-dark">${donorReviews[0].reviewerNgoName}</strong></p>
                    ` : ''}
                  </div>
                `;
              }
              return '';
            })()}

            <!-- Contextual Actions depending on user role and listing status -->
            <div class="d-flex justify-content-end gap-2 pt-2 border-top">
              ${user && user.role === 'ngo' && d.status === 'available' && !expiryInfo.isExpired ? `
                <button class="btn btn-green" onclick="bootstrap.Modal.getInstance(document.getElementById('globalModal')).hide(); window.SaveToServeNGO.claimDonation('${d.id}')">
                  <i class="bi bi-hand-thumbs-up"></i> Claim for Distribution
                </button>
              ` : ''}
              ${user && user.role === 'volunteer' && d.status === 'claimed' && !d.assignedVolunteerId && !expiryInfo.isExpired ? `
                <button class="btn btn-olive" onclick="bootstrap.Modal.getInstance(document.getElementById('globalModal')).hide(); window.SaveToServeVolunteer.acceptTask('${d.id}')">
                  <i class="bi bi-check2"></i> Accept Pickup Task
                </button>
              ` : ''}
              ${user && user.role === 'donor' && (d.donorId === user.id || d.donorName === user.name) && d.status === 'available' ? `
                <button class="btn btn-outline-danger" onclick="bootstrap.Modal.getInstance(document.getElementById('globalModal')).hide(); window.SaveToServeDonor.cancelDonation('${d.id}')">
                  <i class="bi bi-x-circle"></i> Cancel Listing
                </button>
              ` : ''}
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  refreshCountdowns() {
    window.SaveToServeDB?.checkAndExpireDonations();
    if (this.currentRoute === 'donor-portal') window.SaveToServeDonor?.render(window.SaveToServeDonor.activeTab);
    if (this.currentRoute === 'ngo-portal') window.SaveToServeNGO?.render(window.SaveToServeNGO.activeTab);
    if (this.currentRoute === 'volunteer-portal') window.SaveToServeVolunteer?.render(window.SaveToServeVolunteer.activeTab);
    if (this.currentRoute === 'admin-portal') window.SaveToServeAdmin?.render(window.SaveToServeAdmin.activeTab);
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
