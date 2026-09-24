/**
 * Save to Serve - Master Application Controller & Router
 * Role State Coordination, Toast Engine & Guided Hackathon Demo Runner
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class SaveToServeAppController {
  constructor() {
    this.currentRoute = 'home';
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

  navigateTo(route, updateHash = true) {
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
          this.renderAuthView('login');
          break;
        case 'register':
          this.renderAuthView('register');
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
            <div class="fw-bold small" style="color:var(--deep-purple);">${user.name}</div>
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
          <button class="btn btn-sm btn-soft-purple" onclick="window.SaveToServeApp.navigateTo('login')">
            <i class="bi bi-person"></i> Log In
          </button>
          <button class="btn btn-sm btn-purple" onclick="window.SaveToServeApp.navigateTo('register')">
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

  showToast(message, type = 'purple', durationMs = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    
    let icon = 'bi-info-circle-fill text-primary';
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
            <h2 class="mb-1 fw-bold" style="color:var(--deep-purple);">🍲 Available Surplus Food Live Listings</h2>
            <p class="text-muted mb-0">Verified surplus cooked meals and produce awaiting rescue before safe deadlines.</p>
          </div>
          <button class="btn btn-purple" onclick="window.SaveToServeApp.navigateTo('donor-portal')">
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
                      <button class="btn btn-green w-100" onclick="window.SaveToServeApp.quickClaimRedirect('${d.id}')">
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

  quickClaimRedirect(donationId) {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      this.showToast('Switching to NGO Shelter account to claim this surplus donation.', 'info');
      window.SaveToServeAuth.loginAsDemo('ngo');
    }
    this.navigateTo('ngo-portal');
    setTimeout(() => {
      window.SaveToServeNGO?.claimDonation(donationId);
    }, 200);
  }

  renderAuthView(type = 'login') {
    const container = document.getElementById(`${type}-view`);
    if (!container) return;

    if (type === 'login') {
      container.innerHTML = `
        <div class="container py-5">
          <div class="row justify-content-center">
            <div class="col-lg-5 col-md-8">
              <div class="custom-card shadow-lg p-4">
                <div class="text-center mb-4">
                  <img src="assets/logo.png" alt="Save to Serve" style="width:58px;height:58px;margin:0 auto 10px;border-radius:14px;">
                  <h4 class="fw-bold mb-1" style="color:var(--deep-purple);">Sign In to Save to Serve</h4>
                  <p class="text-muted small">Choose your role or enter demo credentials below</p>
                </div>

                <div class="p-3 rounded mb-4" style="background:var(--pastel-lavender); border: 1.5px solid var(--light-purple);">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small fw-bold text-dark"><i class="bi bi-stars text-primary"></i> 1-Click Demo Logins for Judges:</span>
                    <span class="badge bg-white text-dark border">Instant Access</span>
                  </div>
                  <div class="row g-2">
                    <div class="col-6">
                      <button class="btn btn-sm btn-soft-purple w-100" onclick="window.SaveToServeApp.quickLogin('donor')">
                        <i class="bi bi-shop"></i> Donor Kitchen
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-sm btn-soft-green w-100" onclick="window.SaveToServeApp.quickLogin('ngo')">
                        <i class="bi bi-building"></i> NGO Shelter
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-sm btn-outline-primary w-100" onclick="window.SaveToServeApp.quickLogin('volunteer')">
                        <i class="bi bi-bicycle"></i> Volunteer
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-sm btn-outline-dark w-100" onclick="window.SaveToServeApp.quickLogin('admin')">
                        <i class="bi bi-shield-lock"></i> Super Admin
                      </button>
                    </div>
                  </div>
                </div>

                <form onsubmit="window.SaveToServeApp.handleLoginForm(event)">
                  <div class="mb-3">
                    <label class="form-label-custom">Email Address</label>
                    <input type="email" id="loginEmail" class="form-control form-control-custom w-100" value="donor@savetoserve.org" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label-custom">Password</label>
                    <input type="password" id="loginPassword" class="form-control form-control-custom w-100" value="password123" required>
                  </div>
                  <button type="submit" class="btn btn-purple w-100 mb-3">
                    <i class="bi bi-box-arrow-in-right"></i> Sign In
                  </button>
                </form>

                <div class="text-center small text-muted">
                  Don't have an account? <a href="#register" class="fw-bold text-primary">Register Free</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="container py-5">
          <div class="row justify-content-center">
            <div class="col-lg-6 col-md-9">
              <div class="custom-card shadow-lg p-4">
                <div class="text-center mb-3">
                  <h4 class="fw-bold mb-1" style="color:var(--deep-purple);">Create Save to Serve Account</h4>
                  <p class="text-muted small">Join the food rescue network in your neighborhood</p>
                </div>

                <div class="alert alert-info py-2 small mb-3">
                  <i class="bi bi-info-circle-fill me-1"></i> <strong>SIMULATED OTP DEMO:</strong> Mobile verification code is simulated for fast demonstration without paid SMS gateways.
                </div>

                <form id="registerForm" onsubmit="window.SaveToServeApp.handleRegisterForm(event)">
                  <div class="row g-2 mb-3">
                    <div class="col-md-6">
                      <label class="form-label-custom">Full Name / Contact Person *</label>
                      <input type="text" id="regName" class="form-control form-control-custom w-100" placeholder="e.g. Ramesh Kumar" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label-custom">Role Type *</label>
                      <select id="regRole" class="form-select form-select-custom w-100" required>
                        <option value="donor">Food Donor (Restaurant / Banquet / Kitchen)</option>
                        <option value="ngo">NGO / Shelter / Community Kitchen</option>
                        <option value="volunteer">Volunteer Rescue Courier</option>
                      </select>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label-custom">Organization Name (Optional for individual volunteers)</label>
                    <input type="text" id="regOrgName" class="form-control form-control-custom w-100" placeholder="e.g. Grand Spice Restaurant">
                  </div>

                  <div class="row g-2 mb-3">
                    <div class="col-md-6">
                      <label class="form-label-custom">Email Address *</label>
                      <input type="email" id="regEmail" class="form-control form-control-custom w-100" placeholder="ramesh@example.com" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label-custom">Mobile Number *</label>
                      <input type="tel" id="regPhone" class="form-control form-control-custom w-100" placeholder="+91 98765 43210" required>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label-custom">Physical Address / Neighborhood *</label>
                    <input type="text" id="regAddress" class="form-control form-control-custom w-100" placeholder="e.g. Indiranagar 100ft Road, Bengaluru" required>
                  </div>

                  <div class="mb-3">
                    <label class="form-label-custom">Create Password *</label>
                    <input type="password" id="regPassword" class="form-control form-control-custom w-100" value="password123" required>
                  </div>

                  <button type="submit" class="btn btn-purple w-100 mb-2">
                    <i class="bi bi-shield-check"></i> Send Simulated Verification OTP
                  </button>
                </form>

                <div id="otpVerifyBox" class="d-none mt-3 p-3 rounded" style="background:var(--pastel-lavender); border:1.5px dashed var(--primary-purple);">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="fw-bold mb-0 text-dark">Enter 6-Digit OTP</h6>
                    <span class="badge bg-warning text-dark">SIMULATED OTP DEMO</span>
                  </div>
                  <p class="small text-muted mb-2">A simulated code was generated. Enter it below to confirm your phone number.</p>
                  <div class="input-group mb-2">
                    <input type="text" id="enteredOtpCode" class="form-control form-control-custom font-monospace text-center fs-5" placeholder="• • • • • •" maxlength="6">
                    <button class="btn btn-green" onclick="window.SaveToServeApp.handleVerifyOtp()">Verify & Complete</button>
                  </div>
                  <div class="text-end">
                    <button class="btn btn-link btn-sm text-primary p-0" onclick="window.SaveToServeApp.handleResendOtp()">Resend Simulated OTP</button>
                  </div>
                </div>

                <div class="text-center small text-muted mt-3">
                  Already registered? <a href="#login" class="fw-bold text-primary">Sign In</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  quickLogin(role) {
    const res = window.SaveToServeAuth.loginAsDemo(role);
    if (res.success) {
      this.showToast(`Logged in as ${res.user.name} (${role.toUpperCase()})`, 'success');
      this.navigateTo(`${role}-portal`);
    } else {
      this.showToast(res.message, 'danger');
    }
  }

  handleLoginForm(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const res = window.SaveToServeAuth.login(email, password);
    if (res.success) {
      this.showToast(`Welcome back, ${res.user.name}!`, 'success');
      this.navigateTo(`${res.user.role}-portal`);
    } else {
      this.showToast(res.message, 'danger');
    }
  }

  handleRegisterForm(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const role = document.getElementById('regRole').value;
    const orgName = document.getElementById('regOrgName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    const password = document.getElementById('regPassword').value;

    const res = window.SaveToServeAuth.register({
      name,
      role,
      orgName: orgName || name,
      email,
      phone,
      address,
      password
    });

    if (res.success) {
      document.getElementById('otpVerifyBox').classList.remove('d-none');
      document.getElementById('enteredOtpCode').value = res.otp;
      this.showToast(res.message, 'info', 6000);
    } else {
      this.showToast(res.message, 'danger');
    }
  }

  handleVerifyOtp() {
    const otp = document.getElementById('enteredOtpCode').value.trim();
    const res = window.SaveToServeAuth.verifyOtp(otp);
    if (res.success) {
      this.showToast(res.message, 'success');
      if (res.user) {
        this.navigateTo(`${res.user.role}-portal`);
      } else {
        this.navigateTo('home');
      }
    } else {
      this.showToast(res.message, 'danger');
    }
  }

  handleResendOtp() {
    const phone = document.getElementById('regPhone')?.value || '+91 98765 00000';
    const res = window.SaveToServeAuth.sendOtp(phone);
    if (res.success) {
      document.getElementById('enteredOtpCode').value = res.otp;
      this.showToast(`Resent simulated OTP: ${res.otp}`, 'info');
    }
  }

  promptResetDemoData() {
    if (confirm('Are you sure you want to reset all data back to the clean demonstration seed?')) {
      window.SaveToServeDB.resetDemoData();
      this.showToast('Demo database reset successfully!', 'success');
      this.handleRouting();
    }
  }

  showDemoWalkthroughModal() {
    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="bi bi-play-circle-fill text-success me-2"></i> Save to Serve Live Judge Demo Guide`;
    modalBody.innerHTML = `
      <div>
        <p class="text-muted small mb-3">
          Follow these 7 interactive steps to witness the entire end-to-end surplus food rescue workflow with weather-adaptive intelligence.
        </p>

        <div class="demo-stepper-box">
          <div class="stepper-num">1</div>
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1" style="color:var(--deep-purple);">Step 1: Donor Lists Surplus Food</h6>
            <p class="small text-muted mb-2">Log in as Chef Rajesh (Donor) and post 50 portions of Veg Biryani with a 3.5-hour safe deadline.</p>
            <button class="btn btn-sm btn-purple" onclick="window.SaveToServeApp.runDemoStep(1)">
              Run Step 1 (Switch to Donor & Post Surplus)
            </button>
          </div>
        </div>

        <div class="demo-stepper-box">
          <div class="stepper-num">2</div>
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1" style="color:var(--deep-purple);">Step 2: Trigger Weather Rescue Scenario</h6>
            <p class="small text-muted mb-2">Simulate heavy monsoon downpour (45 mm/hr) and observe the explainable 68/100 risk score and alternative rescue plan.</p>
            <button class="btn btn-sm btn-soft-purple" onclick="window.SaveToServeApp.runDemoStep(2)">
              Run Step 2 (Open Weather Rescue & Apply Heavy Rain)
            </button>
          </div>
        </div>

        <div class="demo-stepper-box">
          <div class="stepper-num">3</div>
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1" style="color:var(--deep-purple);">Step 3: NGO Claims Surplus Food</h6>
            <p class="small text-muted mb-2">Log in as Asha Food Shelter (NGO), view available listings, and claim the surplus donation.</p>
            <button class="btn btn-sm btn-green" onclick="window.SaveToServeApp.runDemoStep(3)">
              Run Step 3 (Switch to NGO & Browse Food)
            </button>
          </div>
        </div>

        <div class="demo-stepper-box">
          <div class="stepper-num">4</div>
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1" style="color:var(--deep-purple);">Step 4: Volunteer Pickup & Code Verification</h6>
            <p class="small text-muted mb-2">Log in as Karan Verma (Volunteer), verify pickup using the donor's code, and start transit.</p>
            <button class="btn btn-sm btn-outline-primary" onclick="window.SaveToServeApp.runDemoStep(4)">
              Run Step 4 (Switch to Volunteer Portal)
            </button>
          </div>
        </div>

        <div class="demo-stepper-box">
          <div class="stepper-num">5</div>
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1" style="color:var(--deep-purple);">Step 5: NGO Confirms Receipt & Distribution</h6>
            <p class="small text-muted mb-2">NGO staff confirms safe delivery and records beneficiaries reached.</p>
            <button class="btn btn-sm btn-soft-green" onclick="window.SaveToServeApp.runDemoStep(5)">
              Run Step 5 (NGO Confirm Distribution)
            </button>
          </div>
        </div>

        <div class="demo-stepper-box">
          <div class="stepper-num">6</div>
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1" style="color:var(--deep-purple);">Step 6: Real-Time Impact Dashboard Updates</h6>
            <p class="small text-muted mb-2">Inspect dynamically updated rescued meals, waste prevented in kg, and CO2 avoided.</p>
            <button class="btn btn-sm btn-purple" onclick="window.SaveToServeApp.runDemoStep(6)">
              Run Step 6 (Open Impact Dashboard)
            </button>
          </div>
        </div>

        <div class="demo-stepper-box">
          <div class="stepper-num">7</div>
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1" style="color:var(--deep-purple);">Step 7: Admin Verification & Audit Logs</h6>
            <p class="small text-muted mb-2">Review Donor & Volunteer Verification queues, approve licenses, and inspect audit logs.</p>
            <button class="btn btn-sm btn-outline-dark" onclick="window.SaveToServeApp.runDemoStep(7)">
              Run Step 7 (Open Admin Verification Console)
            </button>
          </div>
        </div>
      </div>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  runDemoStep(stepNum) {
    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    }

    switch (stepNum) {
      case 1:
        this.quickLogin('donor');
        setTimeout(() => {
          window.SaveToServeDonor?.switchTab('post-donation');
          this.showToast('Step 1 Active: Donor kitchen portal opened. Complete post surplus form.', 'info');
        }, 300);
        break;
      case 2:
        this.navigateTo('weather-rescue');
        setTimeout(() => {
          window.SaveToServeWeather?.setScenario('heavy_rain');
          this.showToast('Step 2 Active: Heavy Rain scenario applied! Observe risk score & alternative plan.', 'warning');
        }, 300);
        break;
      case 3:
        this.quickLogin('ngo');
        this.showToast('Step 3 Active: NGO logged in. Claim available surplus food.', 'info');
        break;
      case 4:
        this.quickLogin('volunteer');
        this.showToast('Step 4 Active: Volunteer logged in. Complete pickup verification code.', 'info');
        break;
      case 5:
        this.quickLogin('ngo');
        setTimeout(() => {
          window.SaveToServeNGO?.switchTab('my-claims');
          this.showToast('Step 5 Active: NGO My Claims opened. Confirm receipt & distribution.', 'success');
        }, 300);
        break;
      case 6:
        this.navigateTo('impact-dashboard');
        this.showToast('Step 6 Active: Impact metrics dynamically calculated from live transactions.', 'success');
        break;
      case 7:
        this.quickLogin('admin');
        this.showToast('Step 7 Active: Super Admin Operations & User Verification Console.', 'info');
        break;
    }
  }
}

window.SaveToServeApp = new SaveToServeAppController();
window.RainRouteApp = window.SaveToServeApp;
