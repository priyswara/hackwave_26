/**
 * RainRoute - NGO Portal Logic
 * Browse Available Food, Real-time Filters, Claiming, Distribution Confirmation & Urgent Requirements
 */

class NgoPortalManager {
  constructor() {
    this.filters = {
      search: '',
      foodType: 'all',
      maxSafeHours: 'all',
      minPortions: 0
    };
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('rainroute:statechange', () => {
      if (window.RainRouteApp?.currentRoute === 'ngo-portal') {
        this.render();
      }
    });
  }

  render(activeTab = 'browse-food') {
    const container = document.getElementById('ngo-portal-view');
    if (!container) return;

    const user = window.RainRouteAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      container.innerHTML = `
        <div class="container py-5 text-center">
          <div class="alert alert-danger d-inline-block px-4 py-3">
            <i class="bi bi-shield-lock fs-2 d-block mb-2"></i>
            <h5>NGO Staff Access Required</h5>
            <p class="mb-3">Please log in as an authorized NGO representative to access this portal.</p>
            <button class="btn btn-purple" onclick="window.RainRouteApp.navigateTo('login')">Go to Login</button>
          </div>
        </div>`;
      return;
    }

    const allDonations = window.RainRouteDB.getDonations();
    const availableDonations = allDonations.filter(d => d.status === 'available');
    const myClaims = allDonations.filter(d => d.claimedByNgoId === user.id);
    const completedCount = myClaims.filter(d => d.status === 'completed').length;
    const activeClaimsCount = myClaims.filter(d => ['claimed', 'in-transit', 'holding-hub'].includes(d.status)).length;

    container.innerHTML = `
      <div class="container py-4">
        <!-- NGO Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-icon icon-green" style="width:56px;height:56px;border-radius:16px;">
              <i class="bi bi-building fs-2"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h3 class="mb-0" style="color:var(--deep-purple);">${user.orgName || user.name}</h3>
                <span class="badge ${user.kycStatus === 'approved' ? 'badge-ngo' : 'badge-admin'}">
                  ${user.kycStatus === 'approved' ? '✓ Registered Shelter / NGO' : '⏳ Verification Pending'}
                </span>
              </div>
              <p class="text-muted small mb-0"><i class="bi bi-geo-alt"></i> ${user.address || 'Austin Town Shelter'} | Capacity: ${user.beneficiaryCapacity || 120} beneficiaries</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-green" onclick="window.RainRouteNGO.switchTab('post-req')">
              <i class="bi bi-megaphone"></i> Post Urgent Requirement
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-icon icon-purple"><i class="bi bi-search"></i></div>
              <div>
                <div class="stat-value">${availableDonations.length}</div>
                <div class="stat-label">Available Surplus Nearby</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card stat-green">
              <div class="stat-icon icon-green"><i class="bi bi-bag-check"></i></div>
              <div>
                <div class="stat-value">${activeClaimsCount}</div>
                <div class="stat-label">Active Claims & Transit</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
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
          <button class="subnav-btn ${activeTab === 'browse-food' ? 'active' : ''}" onclick="window.RainRouteNGO.switchTab('browse-food')">
            <i class="bi bi-grid-fill"></i> Browse Available Food (${availableDonations.length})
          </button>
          <button class="subnav-btn ${activeTab === 'my-claims' ? 'active' : ''}" onclick="window.RainRouteNGO.switchTab('my-claims')">
            <i class="bi bi-card-checklist"></i> My Claims & Deliveries (${myClaims.length})
          </button>
          <button class="subnav-btn ${activeTab === 'post-req' ? 'active' : ''}" onclick="window.RainRouteNGO.switchTab('post-req')">
            <i class="bi bi-bell"></i> Urgent Food Requirements
          </button>
          <button class="subnav-btn ${activeTab === 'qr-redemption' ? 'active' : ''}" onclick="window.RainRouteNGO.switchTab('qr-redemption')">
            <i class="bi bi-qr-code-scan"></i> QR Voucher Terminal
          </button>
        </div>

        <!-- Tab Content -->
        <div id="ngo-tab-content">
          ${this.renderTabContent(activeTab, allDonations, myClaims, user)}
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
                  <input type="text" class="form-control form-control-custom border-start-0" placeholder="Search food, location, donor..." value="${this.filters.search}" oninput="window.RainRouteNGO.handleSearchInput(this.value)">
                </div>
              </div>
              <div class="col-6 col-md-3">
                <select class="form-select form-select-custom" onchange="window.RainRouteNGO.handleTypeFilter(this.value)">
                  <option value="all" ${this.filters.foodType === 'all' ? 'selected' : ''}>All Dietary Types</option>
                  <option value="veg" ${this.filters.foodType === 'veg' ? 'selected' : ''}>Vegetarian Only</option>
                  <option value="non-veg" ${this.filters.foodType === 'non-veg' ? 'selected' : ''}>Non-Vegetarian</option>
                  <option value="vegan" ${this.filters.foodType === 'vegan' ? 'selected' : ''}>Vegan</option>
                </select>
              </div>
              <div class="col-6 col-md-3">
                <select class="form-select form-select-custom" onchange="window.RainRouteNGO.handleUrgencyFilter(this.value)">
                  <option value="all" ${this.filters.maxSafeHours === 'all' ? 'selected' : ''}>All Deadlines</option>
                  <option value="2" ${this.filters.maxSafeHours === '2' ? 'selected' : ''}>&lt; 2 Hours (Urgent)</option>
                  <option value="4" ${this.filters.maxSafeHours === '4' ? 'selected' : ''}>&lt; 4 Hours</option>
                  <option value="8" ${this.filters.maxSafeHours === '8' ? 'selected' : ''}>&lt; 8 Hours</option>
                </select>
              </div>
              <div class="col-md-2 text-end">
                <button class="btn btn-outline-secondary btn-sm w-100" onclick="window.RainRouteNGO.resetFilters()">
                  <i class="bi bi-arrow-counterclockwise"></i> Reset
                </button>
              </div>
            </div>
          </div>

          <!-- Listings Grid -->
          ${filtered.length === 0 ? `
            <div class="custom-card text-center py-5">
              <i class="bi bi-basket3 fs-1 text-muted mb-2 d-block"></i>
              <h5>No Available Surplus Matches</h5>
              <p class="text-muted">No surplus food currently matches your search filters. Try clearing filters or check back shortly.</p>
            </div>
          ` : `
            <div class="row g-3">
              ${filtered.map(d => `
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
                        ${window.RainRouteDonor ? window.RainRouteDonor.getUrgencyBadge(d.safeUntil) : ''}
                      </div>
                    </div>

                    <div class="donation-card-body">
                      <h6 class="donation-title">${d.foodName}</h6>
                      <div class="donation-donor-info">
                        <i class="bi bi-shop"></i> ${d.donorOrg} (${d.donorAddress})
                      </div>

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

                      <p class="small text-muted mb-3">
                        <i class="bi bi-info-circle me-1"></i> ${d.storageInfo}
                      </p>

                      <div class="mt-auto pt-2 border-top">
                        <button class="btn btn-green w-100" onclick="window.RainRouteNGO.claimDonation('${d.id}')">
                          <i class="bi bi-hand-thumbs-up"></i> Claim for Distribution
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
              ${myClaims.map(d => `
                <div class="col-lg-6">
                  <div class="p-3 border rounded h-100 d-flex flex-direction-column justify-content-between" style="background:#FAF9FC;">
                    <div>
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="fw-bold mb-0" style="color:var(--deep-purple);">${d.foodName}</h6>
                        <span class="badge ${d.status === 'completed' ? 'bg-success' : d.status === 'in-transit' ? 'bg-primary' : 'bg-warning text-dark'} text-uppercase">
                          ${d.status}
                        </span>
                      </div>

                      <p class="small text-muted mb-2">
                        <i class="bi bi-geo-alt me-1"></i> Donor: <strong>${d.donorOrg}</strong> (${d.donorPhone})
                      </p>

                      <div class="p-2 bg-white rounded border small mb-3">
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
                    </div>

                    <!-- Action Controls based on status -->
                    <div class="mt-2 pt-2 border-top">
                      ${d.status === 'claimed' ? `
                        <div class="d-flex gap-2">
                          <button class="btn btn-sm btn-soft-purple w-100" onclick="window.RainRouteQR.showVoucherModal('${d.id}')">
                            <i class="bi bi-qr-code"></i> View QR Voucher
                          </button>
                        </div>
                      ` : d.status === 'in-transit' ? `
                        <div class="d-flex gap-2">
                          <button class="btn btn-sm btn-green w-100" onclick="window.RainRouteNGO.promptConfirmDistribution('${d.id}', ${d.portions})">
                            <i class="bi bi-check2-circle"></i> Confirm Receipt & Distribution
                          </button>
                        </div>
                      ` : `
                        <div class="alert alert-success py-1 px-2 mb-0 small d-flex justify-content-between align-items-center">
                          <span><i class="bi bi-check-circle-fill"></i> Distributed to ${d.beneficiariesReached || d.portions} people</span>
                          <span class="text-muted">${new Date(d.distributionTimestamp || d.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                      `}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }

    if (tabName === 'post-req') {
      const reqs = window.RainRouteDB.getUrgentRequirements();
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

              <form onsubmit="window.RainRouteNGO.handleRequirementSubmit(event)">
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
                          <h6 class="fw-bold mb-1" style="color:var(--deep-purple);">${r.ngoName}</h6>
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

    if (tabName === 'qr-redemption') {
      return window.RainRouteQR ? window.RainRouteQR.renderRedemptionTerminal() : '<div class="p-4">QR Terminal Loaded</div>';
    }

    return '';
  }

  getFilteredDonations(allDonations) {
    const available = allDonations.filter(d => d.status === 'available');
    return available.filter(d => {
      // Search
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const matches = d.foodName.toLowerCase().includes(q) ||
                        d.donorOrg.toLowerCase().includes(q) ||
                        d.donorAddress.toLowerCase().includes(q) ||
                        d.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Food type
      if (this.filters.foodType !== 'all' && d.foodType !== this.filters.foodType) {
        return false;
      }
      // Urgency
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
    const user = window.RainRouteAuth.getCurrentUser();
    if (!user) return;

    const res = window.RainRouteDB.claimDonation(donationId, user);
    if (res.success) {
      window.RainRouteApp?.showToast(`Successfully claimed ${res.donation.portions} portions of ${res.donation.foodName}!`, 'success');
      this.switchTab('my-claims');
    } else {
      window.RainRouteApp?.showToast(res.message, 'danger');
    }
  }

  promptConfirmDistribution(donationId, portions) {
    const count = prompt(`Confirm number of beneficiaries reached with this meal rescue:`, portions);
    if (count !== null && count.trim() !== '') {
      const res = window.RainRouteDB.confirmDistribution(donationId, parseInt(count) || portions);
      if (res.success) {
        window.RainRouteApp?.showToast(`Confirmed distribution to ${res.donation.beneficiariesReached} beneficiaries! Impact metrics updated!`, 'success');
        this.render('my-claims');
      }
    }
  }

  handleRequirementSubmit(event) {
    event.preventDefault();
    const user = window.RainRouteAuth.getCurrentUser();
    if (!user) return;

    const targetLocation = document.getElementById('reqLocation').value.trim();
    const neededPortions = parseInt(document.getElementById('reqPortions').value);
    const foodType = document.getElementById('reqFoodType').value;
    const hours = parseFloat(document.getElementById('reqHours').value);
    const note = document.getElementById('reqNote').value.trim();

    window.RainRouteDB.addUrgentRequirement({
      ngoId: user.id,
      ngoName: user.orgName || user.name,
      targetLocation,
      neededPortions,
      foodType,
      neededBefore: new Date(Date.now() + hours * 3600000).toISOString(),
      note
    });

    window.RainRouteApp?.showToast('Urgent requirement published and broadcast to donors!', 'success');
    this.render('post-req');
  }
}

window.RainRouteNGO = new NgoPortalManager();
