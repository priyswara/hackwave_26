/**
 * Save to Serve - Donor Portal Logic
 * Surplus Listing Creation, Countdown Badges, Listing Management & Pickup Tracking
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class DonorPortalManager {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('savetoserve:statechange', () => {
      if (window.SaveToServeApp?.currentRoute === 'donor-portal') {
        this.render();
      }
    });
  }

  getUrgencyBadge(safeUntilISO) {
    const safeUntil = new Date(safeUntilISO).getTime();
    const now = Date.now();
    const diffHours = (safeUntil - now) / 3600000;

    if (diffHours <= 0) {
      return `<span class="badge badge-expired"><i class="bi bi-x-circle me-1"></i> Expired</span>`;
    }
    if (diffHours < 2) {
      return `<span class="badge badge-expiry-urgent"><i class="bi bi-alarm-fill me-1"></i> ${diffHours.toFixed(1)}h Left (Urgent)</span>`;
    }
    if (diffHours < 4) {
      return `<span class="badge badge-expiry-warning"><i class="bi bi-clock-history me-1"></i> ${diffHours.toFixed(1)}h Left</span>`;
    }
    return `<span class="badge badge-expiry-safe"><i class="bi bi-check-circle me-1"></i> ${diffHours.toFixed(1)}h Safe</span>`;
  }

  render(activeTab = 'my-donations') {
    const container = document.getElementById('donor-portal-view');
    if (!container) return;

    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'donor') {
      container.innerHTML = `
        <div class="container py-5 text-center">
          <div class="alert alert-danger d-inline-block px-4 py-3 shadow-sm" style="max-width:500px;">
            <i class="bi bi-lock-fill fs-2 d-block mb-2 text-danger"></i>
            <h5 class="fw-bold">Donor Access Required</h5>
            <p class="mb-3 text-muted">${user ? `You are currently logged in to the ${user.role.toUpperCase()} portal. Please log out before accessing another portal.` : 'Please log in as a registered food donor to view this portal.'}</p>
            ${user ? `
              <button class="btn btn-outline-danger me-2" onclick="window.SaveToServeApp.logout()"><i class="bi bi-box-arrow-right"></i> Logout</button>
              <button class="btn btn-olive" onclick="window.SaveToServeApp.navigateTo('${user.role}-portal')">Go to My Dashboard</button>
            ` : `
              <button class="btn btn-olive" onclick="window.SaveToServeApp.openPortalAuth('donor')">Go to Donor Login</button>
            `}
          </div>
        </div>`;
      return;
    }

    const allDonations = window.SaveToServeDB.getDonations();
    const myDonations = allDonations.filter(d => d.donorId === user.id || d.donorName === user.name);
    const activeCount = myDonations.filter(d => ['available', 'claimed', 'in-transit'].includes(d.status)).length;
    const completedCount = myDonations.filter(d => d.status === 'completed').length;
    const totalPortions = myDonations.reduce((acc, d) => acc + (d.status === 'completed' ? d.portions : 0), 0);
    const isApproved = user.kycStatus === 'approved';

    container.innerHTML = `
      <div class="container py-4">
        <!-- Verification Banner if not approved -->
        ${!isApproved ? `
          <div class="alert ${user.kycStatus === 'rejected' ? 'alert-danger' : 'alert-warning'} d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 shadow-sm">
            <div class="d-flex align-items-center gap-2">
              <i class="bi ${user.kycStatus === 'rejected' ? 'bi-x-octagon-fill' : 'bi-hourglass-split'} fs-4"></i>
              <div>
                <strong>Account Verification Status: <span class="text-uppercase">${user.kycStatus}</span></strong>
                <div class="small">${user.kycStatus === 'rejected' ? `Rejection reason: "${user.verificationDetails?.rejectionReason || 'Please resubmit valid documentation'}"` : 'Your account is under admin review. Once approved, you can post surplus listings.'}</div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-dark" onclick="window.SaveToServeDonor.switchTab('kyc')">
              View Verification Dossier
            </button>
          </div>
        ` : ''}

        <!-- Donor Profile Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-icon icon-green" style="width:54px;height:54px;border-radius:14px;">
              <i class="bi bi-shop-window fs-2"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <h3 class="mb-0 fw-bold" style="color:var(--dark-olive);">${user.orgName || user.name}</h3>
                <span class="badge ${isApproved ? 'badge-ngo' : user.kycStatus === 'rejected' ? 'bg-danger text-white' : 'badge-admin'}">
                  ${isApproved ? '✓ Verified Kitchen' : user.kycStatus === 'rejected' ? '✕ Verification Rejected' : '⏳ Verification Pending'}
                </span>
              </div>
              <p class="text-muted small mb-0"><i class="bi bi-geo-alt"></i> ${user.address || 'Bengaluru Kitchen'}</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-olive" onclick="window.SaveToServeDonor.switchTab('post-donation')" ${!isApproved ? 'disabled title="Verification required to post surplus"' : ''}>
              <i class="bi bi-plus-circle"></i> Post Surplus Food
            </button>
            <button class="btn btn-outline-danger" onclick="window.SaveToServeApp.logout()" title="Logout from Donor Portal">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-4 col-6">
            <div class="stat-card">
              <div class="stat-icon icon-green"><i class="bi bi-box2-heart"></i></div>
              <div>
                <div class="stat-value">${activeCount}</div>
                <div class="stat-label">Active Listings</div>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-6">
            <div class="stat-card stat-green">
              <div class="stat-icon icon-green"><i class="bi bi-check2-circle"></i></div>
              <div>
                <div class="stat-value">${completedCount}</div>
                <div class="stat-label">Completed Rescues</div>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-12">
            <div class="stat-card">
              <div class="stat-icon icon-blue"><i class="bi bi-people"></i></div>
              <div>
                <div class="stat-value">${totalPortions}</div>
                <div class="stat-label">Portions Nourished</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subnav Navigation Tabs -->
        <div class="portal-subnav">
          <button class="subnav-btn ${activeTab === 'my-donations' ? 'active' : ''}" onclick="window.SaveToServeDonor.switchTab('my-donations')">
            <i class="bi bi-list-ul"></i> My Food Listings (${myDonations.length})
          </button>
          <button class="subnav-btn ${activeTab === 'post-donation' ? 'active' : ''}" onclick="window.SaveToServeDonor.switchTab('post-donation')">
            <i class="bi bi-plus-square"></i> Post New Surplus Food
          </button>
          <button class="subnav-btn ${activeTab === 'track-pickups' ? 'active' : ''}" onclick="window.SaveToServeDonor.switchTab('track-pickups')">
            <i class="bi bi-truck"></i> Track Pickups & Codes
          </button>
          <button class="subnav-btn ${activeTab === 'weather-map' ? 'active' : ''}" onclick="window.SaveToServeDonor.switchTab('weather-map')">
            <i class="bi bi-cloud-rain-heavy"></i> Weather & Route Safety
          </button>
          <button class="subnav-btn ${activeTab === 'kyc' ? 'active' : ''}" onclick="window.SaveToServeDonor.switchTab('kyc')">
            <i class="bi bi-shield-check"></i> Verification Status
          </button>
        </div>

        <!-- Tab Content -->
        <div id="donor-tab-content">
          ${this.renderTabContent(activeTab, myDonations, user, isApproved)}
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    this.render(tabName);
  }

  renderTabContent(tabName, myDonations, user, isApproved) {
    if (tabName === 'post-donation') {
      if (!isApproved) {
        return `
          <div class="custom-card text-center py-4">
            <i class="bi bi-shield-exclamation fs-1 text-warning mb-2 d-block"></i>
            <h5 class="fw-bold">Verification Required to Post Surplus Food</h5>
            <p class="text-muted small max-w-500 mx-auto mb-3">
              To ensure food safety compliance, your kitchen license must be verified by an administrator before publishing surplus listings.
            </p>
            <button class="btn btn-purple btn-sm" onclick="window.SaveToServeDonor.switchTab('kyc')">
              Submit / Review Verification Documents
            </button>
          </div>
        `;
      }

      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-plus-circle text-primary"></i> Post Existing Surplus Food</h5>
            <span class="badge bg-light text-muted border">Zero-Waste Direct Listing</span>
          </div>

          <div class="alert alert-info py-2 small mb-4">
            <i class="bi bi-info-circle-fill me-1"></i> <strong>Save to Serve Principle:</strong> Only list <em>already-prepared, safe existing surplus food</em>. Do not prepare fresh food for donation.
          </div>

          <form id="postDonationForm" onsubmit="window.SaveToServeDonor.handlePostSubmit(event)">
            <div class="row g-3 mb-3">
              <div class="col-md-8">
                <label class="form-label-custom">Food Item Name & Details *</label>
                <input type="text" id="foodName" class="form-control-custom w-100" placeholder="e.g. 50 Portions Veg Dum Biryani & Raitha" required>
              </div>
              <div class="col-md-4">
                <label class="form-label-custom">Food Category *</label>
                <select id="foodCategory" class="form-select-custom w-100" required>
                  <option value="Cooked Meal">Cooked Meal (Rice / Curries)</option>
                  <option value="Bakery">Bakery & Breads</option>
                  <option value="Produce">Fresh Produce / Fruits</option>
                  <option value="Dairy & Sweets">Dairy & Sweets</option>
                  <option value="Packaged">Packaged Edibles</option>
                </select>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-4">
                <label class="form-label-custom">Portions Count *</label>
                <input type="number" id="portions" class="form-control-custom w-100" min="1" max="1000" placeholder="50" required>
              </div>
              <div class="col-md-4">
                <label class="form-label-custom">Dietary Type *</label>
                <select id="foodType" class="form-select-custom w-100" required>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label-custom">Safe-Use Deadline (Hours from now) *</label>
                <select id="safeHours" class="form-select-custom w-100" required>
                  <option value="2">2 Hours (Urgent Consumption)</option>
                  <option value="3.5" selected>3.5 Hours (Standard Cooked Food)</option>
                  <option value="6">6 Hours</option>
                  <option value="12">12 Hours (Bakery / Dry)</option>
                  <option value="24">24 Hours (Produce / Sealed)</option>
                </select>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label-custom">Pickup Location / Kitchen Address *</label>
                <input type="text" id="donorAddress" class="form-control-custom w-100" value="${user.address || '24 MG Road, Indiranagar, Bengaluru'}" required>
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Storage & Packaging Instructions *</label>
                <input type="text" id="storageInfo" class="form-control-custom w-100" placeholder="e.g. Packed hot in food-grade thermal containers" value="Packed hot in thermal containers. Ready for immediate pickup." required>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label-custom">Sample Photo (Demo Image URL or Select Preset)</label>
              <div class="d-flex gap-2 mb-2">
                <select id="presetImage" class="form-select-custom flex-grow-1" onchange="document.getElementById('imageUrl').value = this.value">
                  <option value="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60">Delicious Veg Biryani Meals</option>
                  <option value="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60">Paneer Butter Masala & Roti</option>
                  <option value="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60">Artisan Bakery Breads</option>
                  <option value="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60">Fresh Garden Salad & Veggies</option>
                </select>
              </div>
              <input type="url" id="imageUrl" class="form-control-custom w-100" value="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60">
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-outline-secondary" onclick="window.SaveToServeDonor.switchTab('my-donations')">Cancel</button>
              <button type="submit" class="btn btn-olive">
                <i class="bi bi-cloud-arrow-up"></i> Publish Surplus Listing
              </button>
            </div>
          </form>
        </div>
      `;
    }

    if (tabName === 'track-pickups') {
      const claimedItems = myDonations.filter(d => ['claimed', 'in-transit', 'completed'].includes(d.status));
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-truck text-primary"></i> Track Active Handoffs & Verification Codes</h5>
            <span class="badge bg-light text-dark border">Safe Handoff Protocol</span>
          </div>

          <div class="alert alert-secondary py-2 small mb-3">
            <i class="bi bi-shield-lock-fill text-primary me-1"></i> <strong>Safe Handoff Rule:</strong> Only release surplus food when the arriving NGO courier recites the unique <strong>Pickup Verification Code</strong> shown below.
          </div>

          ${claimedItems.length === 0 ? `
            <div class="p-4 text-center text-muted">
              <i class="bi bi-inbox fs-2 mb-2 d-block"></i>
              <p>No active pickups in progress currently.</p>
            </div>
          ` : `
            <div class="row g-3">
              ${claimedItems.map(d => `
                <div class="col-lg-6">
                  <div class="p-3 border rounded h-100" style="background:#FAF9FC;">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h6 class="fw-bold mb-0" style="color:var(--dark-olive);">${d.foodName}</h6>
                      <span class="badge ${d.status === 'completed' ? 'bg-success' : 'bg-warning text-dark'} text-uppercase">${d.status}</span>
                    </div>

                    <p class="small text-muted mb-2">Claimed by: <strong>${d.claimedByNgoName || 'Authorized NGO Partner'}</strong></p>

                    <div class="p-2 rounded mb-2 text-center" style="background:var(--light-olive); border: 1.5px dashed var(--primary-olive);">
                      <div class="small text-muted">Handoff Verification Code:</div>
                      <div class="fs-4 fw-bold font-monospace" style="color:var(--dark-olive); letter-spacing: 2px;">${d.pickupCode}</div>
                    </div>

                    <div class="small text-muted">
                      <div><i class="bi bi-person-badge"></i> Assigned Courier: <strong>${d.assignedVolunteerName || 'NGO Staff Courier'}</strong></div>
                      <div><i class="bi bi-clock"></i> Claimed: ${new Date(d.claimTimestamp || d.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }

    if (tabName === 'weather-map') {
      setTimeout(() => {
        window.SaveToServeWeather?.renderWeatherMapWidget('donor-weather-map-container', 'donor');
      }, 50);
      return `
        <div class="custom-card">
          <div id="donor-weather-map-container"></div>
        </div>
      `;
    }

    if (tabName === 'kyc') {
      return window.SaveToServeKYC ? window.SaveToServeKYC.renderView(user) : '<div class="p-4">KYC Module Loaded</div>';
    }

    // Default: my-donations
    return `
      <div>
        ${myDonations.length === 0 ? `
          <div class="custom-card text-center py-5">
            <i class="bi bi-basket2 fs-1 text-muted mb-3 d-block"></i>
            <h4>No Active Surplus Listings</h4>
            <p class="text-muted mb-4">You have not listed any surplus food yet. Help prevent food waste by posting your existing surplus.</p>
            <button class="btn btn-olive" onclick="window.SaveToServeDonor.switchTab('post-donation')">
              <i class="bi bi-plus-circle"></i> Post Your First Surplus Listing
            </button>
          </div>
        ` : `
          <div class="row g-3">
            ${myDonations.map(d => `
              <div class="col-md-6 col-lg-4">
                <div class="donation-card">
                  <div class="donation-card-img-wrap">
                    <img src="${d.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500'}" class="donation-card-img" alt="${d.foodName}">
                    <div class="donation-card-badge-top">
                      <span class="badge ${d.foodType === 'veg' ? 'bg-success' : 'bg-danger'} text-uppercase">
                        ${d.foodType}
                      </span>
                    </div>
                    <div class="donation-card-badge-urgency">
                      ${this.getUrgencyBadge(d.safeUntil)}
                    </div>
                  </div>

                  <div class="donation-card-body">
                    <h6 class="donation-title">${d.foodName}</h6>
                    <div class="donation-donor-info">
                      <i class="bi bi-geo-alt"></i> ${d.donorAddress}
                    </div>

                    <div class="donation-meta-grid">
                      <div>
                        <span class="meta-item-label">Portions</span>
                        <span class="meta-item-value">${d.portions} meals (~${d.quantityKg} kg)</span>
                      </div>
                      <div>
                        <span class="meta-item-label">Status</span>
                        <span class="meta-item-value text-uppercase" style="color:var(--primary-olive);">${d.status}</span>
                      </div>
                    </div>

                    ${d.status === 'claimed' ? `
                      <div class="alert alert-warning py-1 px-2 small mb-3">
                        <i class="bi bi-person-check-fill me-1"></i> Claimed by <strong>${d.claimedByNgoName}</strong>
                      </div>
                    ` : ''}

                    <div class="mt-auto d-flex gap-2 pt-2 border-top">
                      ${d.status === 'available' ? `
                        <button class="btn btn-sm btn-outline-danger w-100" onclick="window.SaveToServeDonor.cancelDonation('${d.id}')">
                          <i class="bi bi-x-circle"></i> Cancel
                        </button>
                      ` : `
                        <button class="btn btn-sm btn-soft-olive w-100" onclick="window.SaveToServeDonor.switchTab('track-pickups')">
                          <i class="bi bi-eye"></i> View Code & Status
                        </button>
                      `}
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

  handlePostSubmit(event) {
    event.preventDefault();
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'donor') {
      window.SaveToServeApp?.showToast('Donor authentication required.', 'danger');
      return;
    }

    if (user.kycStatus !== 'approved') {
      window.SaveToServeApp?.showToast('Your account is pending admin verification.', 'warning');
      return;
    }

    const foodName = document.getElementById('foodName').value.trim();
    const category = document.getElementById('foodCategory').value;
    const portions = parseInt(document.getElementById('portions').value);
    const foodType = document.getElementById('foodType').value;
    const safeHours = parseFloat(document.getElementById('safeHours').value);
    const donorAddress = document.getElementById('donorAddress').value.trim();
    const storageInfo = document.getElementById('storageInfo').value.trim();
    const imageUrl = document.getElementById('imageUrl').value.trim();

    if (!foodName || !portions || portions <= 0) {
      window.SaveToServeApp?.showToast('Please enter valid food details and portions.', 'warning');
      return;
    }

    const safeUntil = new Date(Date.now() + safeHours * 3600000).toISOString();

    window.SaveToServeDB.addDonation({
      foodName,
      category,
      portions,
      foodType,
      prepTime: new Date().toISOString(),
      safeUntil,
      donorId: user.id,
      donorName: user.name,
      donorOrg: user.orgName || user.name,
      donorPhone: user.phone,
      donorAddress,
      donorCoords: user.coords || [12.9784, 77.6408],
      storageInfo,
      imageUrl
    });

    window.SaveToServeApp?.showToast(`Successfully listed ${portions} portions of ${foodName}!`, 'success');
    this.switchTab('my-donations');
  }

  cancelDonation(donationId) {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || (user.role !== 'donor' && user.role !== 'admin')) {
      window.SaveToServeApp?.showToast('Unauthorized action.', 'danger');
      return;
    }

    if (confirm('Are you sure you want to cancel this surplus food listing?')) {
      const res = window.SaveToServeDB.cancelDonation(donationId, 'Cancelled by donor');
      if (res) {
        window.SaveToServeApp?.showToast('Surplus food listing cancelled.', 'info');
        this.render('my-donations');
      }
    }
  }
}

window.SaveToServeDonor = new DonorPortalManager();
window.RainRouteDonor = window.SaveToServeDonor;
