/**
 * Save to Serve - NGO Shelter Portal Logic
 * Browse Available Food, Real-time Filters, Claiming, Distribution Confirmation & Urgent Requirements
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class NgoPortalManager {
  constructor() {
    this.activeTab = 'browse-food';
    this.filters = {
      search: '',
      foodType: 'all',
      maxSafeHours: 'all',
      minPortions: 0
    };
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('savetoserve:statechange', () => {
      if (window.SaveToServeApp?.currentRoute === 'ngo-portal') {
        this.render(this.activeTab);
      }
    });
  }

  render(activeTab = null) {
    if (activeTab) {
      this.activeTab = activeTab;
    }
    const currentTab = this.activeTab || 'browse-food';
    const container = document.getElementById('ngo-portal-view');
    if (!container) return;

    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      container.innerHTML = `
        <div class="container py-5 text-center">
          <div class="alert alert-danger d-inline-block px-4 py-3 shadow-sm" style="max-width:500px;">
            <i class="bi bi-shield-lock fs-2 d-block mb-2 text-danger"></i>
            <h5 class="fw-bold">NGO Staff Access Required</h5>
            <p class="mb-3 text-muted">${user ? `You are currently logged in to the ${user.role.toUpperCase()} portal. Please log out before accessing another portal.` : 'Please log in as an authorized NGO representative to access this portal.'}</p>
            ${user ? `
              <button class="btn btn-outline-danger me-2" onclick="window.SaveToServeApp.logout()"><i class="bi bi-box-arrow-right"></i> Logout</button>
              <button class="btn btn-olive" onclick="window.SaveToServeApp.navigateTo('${user.role}-portal')">Go to My Dashboard</button>
            ` : `
              <button class="btn btn-olive" onclick="window.SaveToServeApp.openPortalAuth('ngo')">Go to NGO Login</button>
            `}
          </div>
        </div>`;
      return;
    }

    const allDonations = window.SaveToServeDB.getDonations();
    const availableDonations = allDonations.filter(d => d.status === 'available');
    const myClaims = allDonations.filter(d => d.claimedByNgoId === user.id);
    const completedCount = myClaims.filter(d => d.status === 'completed').length;
    const activeClaimsCount = myClaims.filter(d => ['claimed', 'in-transit', 'holding-hub'].includes(d.status)).length;

    container.innerHTML = `
      <div class="container py-4">
        <!-- NGO Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-icon icon-green" style="width:54px;height:54px;border-radius:14px;">
              <i class="bi bi-building fs-2"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <h3 class="mb-0 fw-bold" style="color:var(--dark-olive);">${user.orgName || user.name}</h3>
                <span class="badge badge-ngo">
                  ✓ Registered Shelter
                </span>
              </div>
              <p class="text-muted small mb-0"><i class="bi bi-geo-alt"></i> ${user.address || 'Austin Town Shelter'} | Capacity: ${user.beneficiaryCapacity || 120} beneficiaries</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-olive" onclick="window.SaveToServeNGO.switchTab('post-req')">
              <i class="bi bi-megaphone"></i> Post Urgent Requirement
            </button>
            <button class="btn btn-outline-danger" onclick="window.SaveToServeApp.logout()" title="Logout from NGO Portal">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-4 col-6">
            <div class="stat-card">
              <div class="stat-icon icon-blue"><i class="bi bi-search"></i></div>
              <div>
                <div class="stat-value">${availableDonations.length}</div>
                <div class="stat-label">Available Surplus Nearby</div>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-6">
            <div class="stat-card stat-green">
              <div class="stat-icon icon-green"><i class="bi bi-bag-check"></i></div>
              <div>
                <div class="stat-value">${activeClaimsCount}</div>
                <div class="stat-label">Active Claims & Transit</div>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-12">
            <div class="stat-card">
              <div class="stat-icon icon-blue"><i class="bi bi-heart-fill text-danger"></i></div>
              <div>
                <div class="stat-value">${completedCount}</div>
                <div class="stat-label">Successful Distributions</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="portal-subnav">
          <button class="subnav-btn ${currentTab === 'browse-food' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('browse-food')">
            <i class="bi bi-grid-fill"></i> Browse Available Food (${availableDonations.length})
          </button>
          <button class="subnav-btn ${currentTab === 'my-claims' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('my-claims')">
            <i class="bi bi-card-checklist"></i> My Claims & Deliveries (${myClaims.length})
          </button>
          <button class="subnav-btn ${currentTab === 'post-req' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('post-req')">
            <i class="bi bi-bell"></i> Urgent Food Requirements
          </button>
          <button class="subnav-btn ${currentTab === 'weather-map' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('weather-map')">
            <i class="bi bi-cloud-rain-heavy"></i> Weather & Rescue Routes
          </button>
          <button class="subnav-btn ${currentTab === 'qr-redemption' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('qr-redemption')">
            <i class="bi bi-qr-code-scan"></i> QR Voucher Terminal
          </button>
        </div>

        <!-- Tab Content -->
        <div id="ngo-tab-content">
          ${this.renderTabContent(currentTab, allDonations, myClaims, user)}
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    this.render(tabName);
  }

  renderTabContent(tabName, allDonations, myClaims, user) {
    if (tabName === 'browse-food') {
      const filtered = this.getFilteredDonations(allDonations);
      return `
        <div>
          <!-- Search & Filter Toolbar -->
          <div class="custom-card p-3 mb-4">
            <div class="row g-2 align-items-center">
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" class="form-control form-control-custom border-start-0" placeholder="Search food, location, donor..." value="${this.filters.search}" oninput="window.SaveToServeNGO.handleSearchInput(this.value)">
                </div>
              </div>
              <div class="col-6 col-md-3">
                <select class="form-select form-select-custom" onchange="window.SaveToServeNGO.handleTypeFilter(this.value)">
                  <option value="all" ${this.filters.foodType === 'all' ? 'selected' : ''}>All Dietary Types</option>
                  <option value="veg" ${this.filters.foodType === 'veg' ? 'selected' : ''}>Vegetarian Only</option>
                  <option value="non-veg" ${this.filters.foodType === 'non-veg' ? 'selected' : ''}>Non-Vegetarian</option>
                  <option value="vegan" ${this.filters.foodType === 'vegan' ? 'selected' : ''}>Vegan</option>
                </select>
              </div>
              <div class="col-6 col-md-3">
                <select class="form-select form-select-custom" onchange="window.SaveToServeNGO.handleUrgencyFilter(this.value)">
                  <option value="all" ${this.filters.maxSafeHours === 'all' ? 'selected' : ''}>All Deadlines</option>
                  <option value="2" ${this.filters.maxSafeHours === '2' ? 'selected' : ''}>&lt; 2 Hours (Urgent)</option>
                  <option value="4" ${this.filters.maxSafeHours === '4' ? 'selected' : ''}>&lt; 4 Hours</option>
                  <option value="8" ${this.filters.maxSafeHours === '8' ? 'selected' : ''}>&lt; 8 Hours</option>
                </select>
              </div>
              <div class="col-md-2 text-end">
                <button class="btn btn-outline-secondary btn-sm w-100" onclick="window.SaveToServeNGO.resetFilters()">
                  <i class="bi bi-arrow-counterclockwise"></i> Reset
                </button>
              </div>
            </div>
          </div>

          <!-- Listings Grid -->
          ${filtered.length === 0 ? `
            <div class="custom-card text-center py-5">
              <i class="bi bi-basket3 fs-1 text-muted mb-2 d-block"></i>
              <h5 class="fw-bold">No Available Surplus Matches</h5>
              <p class="text-muted small">No surplus food currently matches your search filters. Try clearing filters or check back shortly.</p>
            </div>
          ` : `
            <div class="row g-3">
              ${filtered.map(d => {
                const expiryInfo = SaveToServeStore.getExpiryCountdown(d.safeUntil);
                const postedTimeFormatted = SaveToServeStore.formatDateTime(d.createdAt || d.prepTime);
                const expiryTimeFormatted = SaveToServeStore.formatDateTime(d.safeUntil);

                return `
                  <div class="col-md-6 col-lg-4">
                    <div class="donation-card ${expiryInfo.isExpired ? 'opacity-75' : ''}">
                      <div class="donation-card-img-wrap">
                        <img src="${d.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500'}" class="donation-card-img" alt="${d.foodName}">
                        <div class="donation-card-badge-top">
                          <span class="badge ${d.foodType === 'veg' ? 'bg-success' : 'bg-danger'} text-uppercase">
                            ${d.foodType}
                          </span>
                        </div>
                        <div class="donation-card-badge-urgency">
                          ${expiryInfo.badgeHtml}
                        </div>
                      </div>

                      <div class="donation-card-body">
                        <h6 class="donation-title">${d.foodName}</h6>
                        <div class="donation-donor-info">
                          <i class="bi bi-shop"></i> ${d.donorOrg} (${d.donorAddress})
                        </div>

                        <!-- Approaching Expiry / Expired Warning Alert -->
                        ${expiryInfo.warningHtml}

                        <div class="donation-meta-grid mb-2">
                          <div>
                            <span class="meta-item-label">Portions</span>
                            <span class="meta-item-value">${d.portions} meals (~${d.quantityKg} kg)</span>
                          </div>
                          <div>
                            <span class="meta-item-label">Category</span>
                            <span class="meta-item-value">${d.category}</span>
                          </div>
                        </div>

                        <!-- Exact Stored Timestamps (Posted & Expiry) -->
                        <div class="p-2 rounded border small mb-3" style="background:#FAFBFD; font-size:0.78rem;">
                          <div class="d-flex justify-content-between mb-1 pb-1 border-bottom">
                            <span class="text-muted"><i class="bi bi-calendar-check text-primary me-1"></i><strong>Posted:</strong></span>
                            <span class="text-dark fw-500">${postedTimeFormatted}</span>
                          </div>
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="bi bi-alarm text-danger me-1"></i><strong>Expiry:</strong></span>
                            <span class="fw-bold ${expiryInfo.isExpired ? 'text-muted text-decoration-line-through' : 'text-danger'}">${expiryTimeFormatted}</span>
                          </div>
                        </div>

                        <p class="small text-muted mb-3">
                          <i class="bi bi-info-circle me-1"></i> ${d.storageInfo}
                        </p>

                        <div class="mt-auto d-flex flex-column gap-2 pt-2 border-top">
                          ${expiryInfo.isExpired || d.status === 'expired' ? `
                            <button class="btn btn-secondary w-100" disabled>
                              <i class="bi bi-x-circle"></i> Expired — Cannot Claim
                            </button>
                          ` : `
                            <button class="btn btn-green w-100" onclick="window.SaveToServeNGO.claimDonation('${d.id}')">
                              <i class="bi bi-hand-thumbs-up"></i> Claim for Distribution
                            </button>
                          `}
                          <button class="btn btn-sm btn-soft-olive w-100" onclick="window.SaveToServeApp.showDonationDetailsModal('${d.id}')">
                            <i class="bi bi-eye"></i> View Full Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    if (tabName === 'my-claims') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-card-checklist text-primary"></i> NGO Claimed Food & Distribution Workflow</h5>
            <span class="badge bg-light text-dark border">Safe Chain of Custody</span>
          </div>

          ${myClaims.length === 0 ? `
            <div class="p-4 text-center text-muted">
              <i class="bi bi-clipboard-x fs-2 mb-2 d-block"></i>
              <p>Your NGO has not claimed any surplus food donations yet.</p>
            </div>
          ` : `
            <div class="row g-3">
              ${myClaims.map(d => {
                const expiryInfo = SaveToServeStore.getExpiryCountdown(d.safeUntil);
                const postedTimeFormatted = SaveToServeStore.formatDateTime(d.createdAt || d.prepTime);
                const expiryTimeFormatted = SaveToServeStore.formatDateTime(d.safeUntil);

                return `
                  <div class="col-lg-6">
                    <div class="p-3 border rounded h-100 d-flex flex-column justify-content-between" style="background:#FAF9FC;">
                      <div>
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <h6 class="fw-bold mb-0" style="color:var(--dark-olive);">${d.foodName}</h6>
                          <span class="badge ${d.status === 'completed' ? 'bg-success' : d.status === 'in-transit' ? 'bg-primary' : 'bg-warning text-dark'} text-uppercase">
                            ${d.status}
                          </span>
                        </div>

                        <p class="small text-muted mb-2">
                          <i class="bi bi-geo-alt me-1"></i> Donor: <strong>${d.donorOrg}</strong> (${d.donorPhone})
                        </p>

                        <div class="p-2 bg-white rounded border small mb-2">
                          <div class="d-flex justify-content-between mb-1">
                            <span>Portions:</span>
                            <strong>${d.portions} portions</strong>
                          </div>
                          <div class="d-flex justify-content-between mb-1">
                            <span>Pickup Verification Code:</span>
                            <strong class="font-monospace text-primary">${d.pickupCode}</strong>
                          </div>
                          <div class="d-flex justify-content-between">
                            <span>Assigned Courier:</span>
                            <strong>${d.assignedVolunteerName || 'Authorized Volunteer'}</strong>
                          </div>
                        </div>

                        <!-- Date & Time Information -->
                        <div class="p-2 bg-white rounded border small mb-3">
                          <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted"><i class="bi bi-calendar-check me-1 text-primary"></i><strong>Posted:</strong></span>
                            <span>${postedTimeFormatted}</span>
                          </div>
                          <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted"><i class="bi bi-alarm me-1 text-danger"></i><strong>Expiry:</strong></span>
                            <span class="fw-bold text-danger">${expiryTimeFormatted}</span>
                          </div>
                          <div class="d-flex justify-content-between align-items-center pt-1 border-top mt-1">
                            <span class="text-muted">Safe-Use Status:</span>
                            <span>${expiryInfo.badgeHtml}</span>
                          </div>
                        </div>
                      </div>

                      <div class="mt-2 pt-2 border-top">
                        ${d.status === 'claimed' ? `
                          <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-soft-olive w-50" onclick="window.SaveToServeQR.showVoucherModal('${d.id}')">
                              <i class="bi bi-qr-code"></i> QR Voucher
                            </button>
                            <button class="btn btn-sm btn-soft-olive w-50" onclick="window.SaveToServeApp.showDonationDetailsModal('${d.id}')">
                              <i class="bi bi-eye"></i> Details
                            </button>
                          </div>
                        ` : d.status === 'in-transit' ? `
                          <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-green w-100" onclick="window.SaveToServeNGO.promptConfirmDistribution('${d.id}', ${d.portions})">
                              <i class="bi bi-check2-circle"></i> Confirm Receipt & Distribution
                            </button>
                          </div>
                        ` : `
                          <div class="alert alert-success py-1 px-2 mb-2 small d-flex justify-content-between align-items-center">
                            <span><i class="bi bi-check-circle-fill"></i> Distributed to ${d.beneficiariesReached || d.portions} people</span>
                            <span class="text-muted">${SaveToServeStore.formatTime(d.distributionTimestamp || d.createdAt)}</span>
                          </div>
                          <button class="btn btn-sm btn-soft-olive w-100" onclick="window.SaveToServeApp.showDonationDetailsModal('${d.id}')">
                            <i class="bi bi-eye"></i> View Full Details
                          </button>
                        `}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    if (tabName === 'post-req') {
      const reqs = window.SaveToServeDB.getUrgentRequirements();
      return `
        <div class="row g-4">
          <div class="col-lg-5">
            <div class="custom-card">
              <div class="custom-card-header">
                <h5 class="card-title-custom"><i class="bi bi-megaphone text-primary"></i> Post Urgent Requirement</h5>
              </div>
              <p class="small text-muted mb-3">
                Broadcast an immediate requirement for already-existing surplus food. The system matches active donor listings automatically.
              </p>

              <form onsubmit="window.SaveToServeNGO.handleRequirementSubmit(event)">
                <div class="mb-3">
                  <label class="form-label-custom">Target Facility / Drop-off Location *</label>
                  <input type="text" id="reqLocation" class="form-control-custom w-100" value="${user.address || 'Austin Town Shelter Wing B'}" required>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label-custom">Needed Portions *</label>
                    <input type="number" id="reqPortions" class="form-control-custom w-100" min="5" max="500" placeholder="50" required>
                  </div>
                  <div class="col-6">
                    <label class="form-label-custom">Dietary Type *</label>
                    <select id="reqFoodType" class="form-select-custom w-100">
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="any">Any Safe Food</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label-custom">Needed Within (Hours) *</label>
                  <select id="reqHours" class="form-select-custom w-100">
                    <option value="2">Next 2 Hours (Urgent)</option>
                    <option value="4" selected>Next 4 Hours (Dinner Service)</option>
                    <option value="8">Next 8 Hours</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label-custom">Notes / Beneficiary Group</label>
                  <input type="text" id="reqNote" class="form-control-custom w-100" placeholder="e.g. Evening distribution for 45 children & elderly residents">
                </div>
                <button type="submit" class="btn btn-green w-100">
                  <i class="bi bi-broadcast"></i> Publish Urgent Requirement
                </button>
              </form>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="custom-card">
              <div class="custom-card-header">
                <h5 class="card-title-custom"><i class="bi bi-bell text-primary"></i> Active Urgent Requirements</h5>
              </div>
              ${reqs.length === 0 ? `
                <p class="text-muted p-3 text-center">No active requirements posted.</p>
              ` : `
                <div class="d-flex flex-column gap-3">
                  ${reqs.map(r => `
                    <div class="p-3 border rounded" style="background:#FAF9FC;">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <span class="badge bg-danger mb-1">Urgent ${r.neededPortions} Portions</span>
                          <h6 class="fw-bold mb-1" style="color:var(--dark-olive);">${r.ngoName}</h6>
                          <p class="small text-muted mb-1"><i class="bi bi-geo-alt"></i> ${r.targetLocation}</p>
                          <p class="small mb-0 text-dark">${r.note || 'Community shelter distribution.'}</p>
                        </div>
                        <span class="badge bg-light text-dark border">Needed: ${new Date(r.neededBefore).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    }

    if (tabName === 'weather-map') {
      setTimeout(() => {
        window.SaveToServeWeather?.renderWeatherMapWidget('ngo-weather-map-container', 'ngo');
      }, 50);
      return `
        <div class="custom-card">
          <div id="ngo-weather-map-container"></div>
        </div>
      `;
    }

    if (tabName === 'qr-redemption') {
      return window.SaveToServeQR ? window.SaveToServeQR.renderRedemptionTerminal() : '<div class="p-4">QR Terminal Loaded</div>';
    }

    return '';
  }

  getFilteredDonations(allDonations) {
    const available = allDonations.filter(d => d.status === 'available');
    return available.filter(d => {
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const matches = d.foodName.toLowerCase().includes(q) ||
                        d.donorOrg.toLowerCase().includes(q) ||
                        d.donorAddress.toLowerCase().includes(q) ||
                        d.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (this.filters.foodType !== 'all' && d.foodType !== this.filters.foodType) {
        return false;
      }
      if (this.filters.maxSafeHours !== 'all') {
        const hours = (new Date(d.safeUntil).getTime() - Date.now()) / 3600000;
        if (hours > parseFloat(this.filters.maxSafeHours)) return false;
      }
      return true;
    });
  }

  handleSearchInput(val) {
    this.filters.search = val;
    this.render('browse-food');
  }

  handleTypeFilter(val) {
    this.filters.foodType = val;
    this.render('browse-food');
  }

  handleUrgencyFilter(val) {
    this.filters.maxSafeHours = val;
    this.render('browse-food');
  }

  resetFilters() {
    this.filters = { search: '', foodType: 'all', maxSafeHours: 'all', minPortions: 0 };
    this.render('browse-food');
  }

  claimDonation(donationId) {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      window.SaveToServeApp?.showToast('NGO Shelter authentication required.', 'danger');
      return;
    }

    const res = window.SaveToServeDB.claimDonation(donationId, user);
    if (res.success) {
      window.SaveToServeApp?.showToast(`Successfully claimed ${res.donation.portions} portions of ${res.donation.foodName}!`, 'success');
      this.switchTab('my-claims');
    } else {
      window.SaveToServeApp?.showToast(res.message, 'danger');
    }
  }

  promptConfirmDistribution(donationId, portions) {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      window.SaveToServeApp?.showToast('NGO Shelter authentication required.', 'danger');
      return;
    }

    const count = prompt(`Confirm number of beneficiaries reached with this meal rescue:`, portions);
    if (count !== null && count.trim() !== '') {
      const res = window.SaveToServeDB.confirmDistribution(donationId, parseInt(count) || portions);
      if (res.success) {
        window.SaveToServeApp?.showToast(`Confirmed distribution to ${res.donation.beneficiariesReached} beneficiaries! Impact updated!`, 'success');
        this.render('my-claims');
      }
    }
  }

  handleRequirementSubmit(event) {
    event.preventDefault();
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      window.SaveToServeApp?.showToast('NGO Shelter authentication required.', 'danger');
      return;
    }

    const targetLocation = document.getElementById('reqLocation').value.trim();
    const neededPortions = parseInt(document.getElementById('reqPortions').value);
    const foodType = document.getElementById('reqFoodType').value;
    const hours = parseFloat(document.getElementById('reqHours').value);
    const note = document.getElementById('reqNote').value.trim();

    window.SaveToServeDB.addUrgentRequirement({
      ngoId: user.id,
      ngoName: user.orgName || user.name,
      targetLocation,
      neededPortions,
      foodType,
      neededBefore: new Date(Date.now() + hours * 3600000).toISOString(),
      note
    });

    window.SaveToServeApp?.showToast('Urgent requirement published and broadcast to donors!', 'success');
    this.render('post-req');
  }
}

window.SaveToServeNGO = new NgoPortalManager();
window.RainRouteNGO = window.SaveToServeNGO;
