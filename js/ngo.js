/**
 * Save to Serve - Simplified & Enhanced NGO Portal
 * 
 * Main Sections:
 * 1. Dashboard
 * 2. Browse Available Food
 * 3. Nearby Donors (10 KM Radius)
 * 4. My Claims & Deliveries
 * 5. Donor Reviews
 * 6. NGO Profile
 * 
 * Color Palette: Mint Green (#8CB8A5 / #539378 / #265944)
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class NgoPortalManager {
  constructor() {
    this.activeTab = 'dashboard';
    this.filters = {
      search: '',
      foodType: 'all',
      maxSafeHours: 'all'
    };
    this.nearbyFilters = {
      search: '',
      maxDistance: '10',
      category: 'all',
      urgency: 'all'
    };
    this.nearbyMapInstance = null;
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
    const currentTab = this.activeTab || 'dashboard';
    const container = document.getElementById('ngo-portal-view');
    if (!container) return;

    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      container.innerHTML = `
        <div class="container py-5 text-center">
          <div class="alert alert-danger d-inline-block px-4 py-3 shadow-sm" style="max-width:500px; border-radius:var(--radius-md);">
            <i class="bi bi-shield-lock fs-2 d-block mb-2 text-danger"></i>
            <h5 class="fw-bold">NGO Shelter Access Required</h5>
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
    const availableDonations = allDonations.filter(d => (d.status === 'available' || ((d.availableQuantity || 0) > 0 && d.status !== 'cancelled' && d.status !== 'expired')) && (d.availableQuantity === undefined || d.availableQuantity > 0));
    const myClaims = window.SaveToServeDB.getClaimsForNgo(user.id);
    const nearbySummary = window.SaveToServeDB.getNearbyDonorsWithListings(user.coords, 10);
    const donorReviews = window.SaveToServeDB.getAllDonorReviews();

    container.innerHTML = `
      <div class="container py-4">
        <!-- NGO Header / Organization Banner Card -->
        <div class="ngo-banner-card mb-4">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-3">
              <img src="${user.logoUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200&auto=format&fit=crop&q=60'}" 
                   alt="${user.orgName || user.name}" 
                   class="ngo-avatar-frame">
              <div>
                <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h3 class="mb-0 fw-bold" style="color:var(--portal-dark);">${user.orgName || user.name}</h3>
                  <span class="badge" style="background:#E2F1EA; color:#265944; border:1px solid #8CB8A5; font-size:0.75rem;">
                    <i class="bi bi-patch-check-fill text-success"></i> Verified NGO Shelter
                  </span>
                </div>
                <p class="text-muted small mb-0">
                  <i class="bi bi-geo-alt-fill text-danger me-1"></i> ${user.address || 'Bengaluru'}
                  <span class="mx-2">•</span>
                  <i class="bi bi-people-fill text-primary me-1"></i> Serving: <strong>${user.peopleServed || 120}</strong> people daily
                </p>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-sm btn-olive" onclick="window.SaveToServeNGO.switchTab('browse-food')">
                <i class="bi bi-basket2"></i> Browse Food
              </button>
              <button class="btn btn-sm btn-soft-olive" onclick="window.SaveToServeNGO.switchTab('donor-reviews')">
                <i class="bi bi-star"></i> Donor Reviews (${donorReviews.length})
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="window.SaveToServeApp.logout()" title="Logout">
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
        </div>

        <!-- 6 Main Sections Navigation Bar -->
        <div class="portal-subnav mb-4">
          <button class="subnav-btn ${currentTab === 'dashboard' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('dashboard')">
            <i class="bi bi-speedometer2"></i> 1. Dashboard
          </button>
          <button class="subnav-btn ${currentTab === 'browse-food' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('browse-food')">
            <i class="bi bi-grid-fill"></i> 2. Browse Available Food (${availableDonations.length})
          </button>
          <button class="subnav-btn ${currentTab === 'nearby-donors' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('nearby-donors')">
            <i class="bi bi-radar"></i> 3. Nearby Donors (10 KM) (${nearbySummary.totalDistinctDonors})
          </button>
          <button class="subnav-btn ${currentTab === 'my-claims' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('my-claims')">
            <i class="bi bi-card-checklist"></i> 4. My Claims & Deliveries (${myClaims.length})
          </button>
          <button class="subnav-btn ${currentTab === 'donor-reviews' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('donor-reviews')">
            <i class="bi bi-star-fill text-warning"></i> 5. Donor Reviews (${donorReviews.length})
          </button>
          <button class="subnav-btn ${currentTab === 'profile' ? 'active' : ''}" onclick="window.SaveToServeNGO.switchTab('profile')">
            <i class="bi bi-person-lines-fill"></i> 6. NGO Profile
          </button>
        </div>

        <!-- Active View Content -->
        <div id="ngo-tab-content">
          ${this.renderTabContent(currentTab, allDonations, myClaims, user, nearbySummary, donorReviews)}
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    this.render(tabName);
  }

  renderTabContent(tabName, allDonations, myClaims, user, nearbySummary, donorReviews) {
    switch (tabName) {
      case 'dashboard':
        return this.renderDashboardTab(user, nearbySummary, myClaims, allDonations);
      case 'browse-food':
        return this.renderBrowseFoodTab(allDonations, user);
      case 'nearby-donors':
        return this.renderNearbyDonorsTab(user, nearbySummary);
      case 'my-claims':
        return this.renderMyClaimsTab(myClaims, user);
      case 'donor-reviews':
        return this.renderDonorReviewsTab(user, donorReviews);
      case 'profile':
        return this.renderProfileTab(user);
      default:
        return this.renderDashboardTab(user, nearbySummary, myClaims, allDonations);
    }
  }

  // =========================================================================
  // 1. DASHBOARD SECTION (Streamlined & Useful)
  // =========================================================================
  renderDashboardTab(user, nearbySummary, myClaims, allDonations) {
    const activeClaimsCount = myClaims.filter(d => ['claimed', 'in-transit', 'holding-hub'].includes(d.status)).length;
    const completedClaims = myClaims.filter(d => d.status === 'completed');
    const totalBeneficiaries = completedClaims.reduce((sum, d) => sum + (d.beneficiariesReached || d.portions || 0), 0);

    return `
      <div>
        <!-- Essential Metric Cards -->
        <div class="row g-3 mb-4">
          <div class="col-lg-3 col-6">
            <div class="ngo-summary-metric">
              <div class="stat-icon" style="background:#E2F1EA; color:#265944;"><i class="bi bi-radar fs-3"></i></div>
              <div>
                <div class="stat-value" style="color:var(--portal-dark);">${nearbySummary.totalDistinctDonors} Donors</div>
                <div class="stat-label">${nearbySummary.totalPortions} meals within 10 km</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <div class="ngo-summary-metric">
              <div class="stat-icon" style="background:#E2F1EA; color:#265944;"><i class="bi bi-basket2-fill fs-3"></i></div>
              <div>
                <div class="stat-value" style="color:var(--portal-dark);">${allDonations.filter(d => d.status === 'available').length}</div>
                <div class="stat-label">Total Available Surplus</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <div class="ngo-summary-metric">
              <div class="stat-icon" style="background:#FEF3C7; color:#92400E;"><i class="bi bi-truck fs-3"></i></div>
              <div>
                <div class="stat-value" style="color:#92400E;">${activeClaimsCount}</div>
                <div class="stat-label">Active Claims in Transit</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <div class="ngo-summary-metric">
              <div class="stat-icon" style="background:#DCFCE7; color:#166534;"><i class="bi bi-heart-fill fs-3"></i></div>
              <div>
                <div class="stat-value" style="color:#166534;">${totalBeneficiaries}</div>
                <div class="stat-label">People Nourished</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 mb-4">
          <!-- Donors Within 10 KM Radar Quick View -->
          <div class="col-lg-7">
            <div class="custom-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 class="fw-bold mb-0" style="color:var(--portal-dark);">
                  <i class="bi bi-radar text-success me-2"></i> Nearby Donors (10 KM Radius)
                </h5>
                <button class="btn btn-sm btn-outline-success" onclick="window.SaveToServeNGO.switchTab('nearby-donors')">
                  Open Map & Radar <i class="bi bi-arrow-right"></i>
                </button>
              </div>

              <p class="small text-muted mb-3">
                Calculated using your registered GPS coordinates at <strong>${user.address || 'Bengaluru'}</strong>.
              </p>

              ${nearbySummary.donors.length === 0 ? `
                <div class="p-4 bg-light rounded text-center text-muted small">
                  No active surplus food listed within 10 km right now.
                </div>
              ` : `
                <div class="d-flex flex-column gap-2 mb-3">
                  ${nearbySummary.donors.map(donor => {
                    const ratingStats = window.SaveToServeDB.getDonorRatingStats(donor.donorId);
                    return `
                      <div class="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                        <div>
                          <div class="fw-bold text-dark mb-1">
                            ${donor.donorOrg}
                            ${ratingStats.totalReviews > 0 ? `
                              <span class="badge bg-warning text-dark ms-1" style="font-size:0.7rem;">
                                <i class="bi bi-star-fill text-warning"></i> ${ratingStats.averageFormatted} (${ratingStats.totalReviews})
                              </span>
                            ` : ''}
                          </div>
                          <div class="text-muted small"><i class="bi bi-geo-alt"></i> ${donor.donorAddress}</div>
                          <div class="small text-success mt-1"><strong>${donor.listings.length} Available Listing(s)</strong></div>
                        </div>
                        <div class="text-end">
                          <span class="ngo-dist-badge"><i class="bi bi-geo-alt-fill text-danger"></i> ${donor.distanceKm} km</span>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}

              <button class="btn btn-green w-100 mt-auto" onclick="window.SaveToServeNGO.switchTab('nearby-donors')">
                <i class="bi bi-compass"></i> Explore All Donors Within 10 KM
              </button>
            </div>
          </div>

          <!-- Quick Actions & Organization Summary -->
          <div class="col-lg-5">
            <div class="custom-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 class="fw-bold mb-3 pb-2 border-bottom" style="color:var(--portal-dark);">
                  <i class="bi bi-building text-primary me-2"></i> Shelter Snapshot
                </h5>
                <div class="mb-3">
                  <span class="text-muted small d-block">Organization:</span>
                  <strong class="text-dark">${user.orgName || user.name}</strong>
                </div>
                <div class="mb-3">
                  <span class="text-muted small d-block">Address & Contact:</span>
                  <div class="small text-dark">${user.address || 'Bengaluru'}</div>
                  <div class="small text-dark">📞 ${user.phone || '+91 98765 11223'}</div>
                </div>
                <div class="mb-3">
                  <span class="text-muted small d-block">Daily Beneficiaries:</span>
                  <strong class="text-success">${user.peopleServed || 120} people nourished daily</strong>
                </div>
                <div class="mb-3">
                  <span class="text-muted small d-block">Description:</span>
                  <p class="small text-muted mb-0">${user.description || 'Providing daily hot meals and emergency food relief for community members in need.'}</p>
                </div>
              </div>

              <div class="d-flex flex-column gap-2 pt-3 border-top">
                <button class="btn btn-soft-olive w-100" onclick="window.SaveToServeNGO.switchTab('donor-reviews')">
                  <i class="bi bi-star"></i> Read & Write Donor Reviews
                </button>
                <button class="btn btn-outline-secondary w-100" onclick="window.SaveToServeNGO.switchTab('profile')">
                  <i class="bi bi-pencil-square"></i> Edit Shelter Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 2. BROWSE AVAILABLE FOOD SECTION
  // =========================================================================
  renderBrowseFoodTab(allDonations, user) {
    const filtered = this.getFilteredDonations(allDonations);
    return `
      <div>
        <!-- Search & Filter Toolbar -->
        <div class="custom-card p-3 mb-4">
          <div class="row g-2 align-items-center">
            <div class="col-md-5">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control form-control-custom border-start-0" placeholder="Search food, donor, location..." value="${this.filters.search}" oninput="window.SaveToServeNGO.handleSearchInput(this.value)">
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
            <div class="col-md-1 text-end">
              <button class="btn btn-outline-secondary btn-sm w-100" onclick="window.SaveToServeNGO.resetFilters()" title="Reset Filters">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Listings Grid -->
        ${filtered.length === 0 ? `
          <div class="custom-card text-center py-5">
            <i class="bi bi-basket3 fs-1 text-muted mb-2 d-block"></i>
            <h5 class="fw-bold">No Surplus Food Matches Your Filter</h5>
            <p class="text-muted small">Try clearing filters or check back shortly for new donor kitchen listings.</p>
          </div>
        ` : `
          <div class="row g-3">
            ${filtered.map(d => {
              const expiryInfo = SaveToServeStore.getExpiryCountdown(d.safeUntil);
              const postedTimeFormatted = SaveToServeStore.formatDateTime(d.createdAt || d.prepTime);
              const expiryTimeFormatted = SaveToServeStore.formatDateTime(d.safeUntil);
              const donorRating = window.SaveToServeDB.getDonorRatingStats(d.donorId || 'usr-donor-1');

              let distTag = '';
              if (user.coords && d.donorCoords) {
                const distKm = SaveToServeStore.calculateDistanceKm(user.coords[0], user.coords[1], d.donorCoords[0], d.donorCoords[1]);
                if (distKm !== null) {
                  distTag = `<span class="ngo-dist-badge"><i class="bi bi-geo-alt-fill text-danger"></i> ${distKm} km</span>`;
                }
              }

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
                      <div class="d-flex justify-content-between align-items-start mb-1">
                        <h6 class="donation-title mb-0">${d.foodName}</h6>
                        ${distTag}
                      </div>
                      <div class="donation-donor-info mb-1">
                        <i class="bi bi-shop"></i> <strong>${d.donorOrg}</strong> (${d.donorAddress})
                      </div>

                      ${donorRating.totalReviews > 0 ? `
                        <div class="mb-2">
                          <span class="badge bg-warning text-dark" style="font-size:0.72rem;">
                            <i class="bi bi-star-fill text-warning"></i> Donor Rating: <strong>${donorRating.averageFormatted}</strong> (${donorRating.totalReviews} NGO reviews)
                          </span>
                        </div>
                      ` : ''}

                      ${expiryInfo.warningHtml}

                      <div class="donation-meta-grid mb-2">
                        <div>
                          <span class="meta-item-label">Available Inventory</span>
                          <span class="meta-item-value text-success fw-bold">${d.availableQuantity !== undefined ? d.availableQuantity : d.portions} ${d.quantityUnit || 'servings'}</span>
                        </div>
                        <div>
                          <span class="meta-item-label">Category</span>
                          <span class="meta-item-value">${d.category}</span>
                        </div>
                      </div>

                      <div class="p-2 bg-light rounded border small mb-2" style="font-size:0.75rem;">
                        <div class="d-flex justify-content-between mb-1">
                          <span class="text-muted">Total Listed:</span>
                          <span>${d.originalQuantity || d.portions} ${d.quantityUnit || 'servings'}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                          <span class="text-muted">Already Claimed:</span>
                          <span class="text-primary fw-500">${d.claimedQuantity || 0} ${d.quantityUnit || 'servings'}</span>
                        </div>
                      </div>

                      <!-- Stored Timestamps -->
                      <div class="p-2 rounded border small mb-3" style="background:#FAFDFB; font-size:0.78rem;">
                        <div class="d-flex justify-content-between mb-1 pb-1 border-bottom">
                          <span class="text-muted"><i class="bi bi-calendar-check text-primary me-1"></i><strong>Posted:</strong></span>
                          <span class="text-dark">${postedTimeFormatted}</span>
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
                        ` : (d.availableQuantity !== undefined && d.availableQuantity <= 0) || d.status === 'claimed' ? `
                          <button class="btn btn-secondary w-100" disabled>
                            <i class="bi bi-check-circle"></i> Fully Claimed
                          </button>
                        ` : `
                          <button class="btn btn-green w-100" onclick="window.SaveToServeNGO.openClaimModal('${d.id}')">
                            <i class="bi bi-hand-thumbs-up"></i> Select Quantity & Claim
                          </button>
                        `}
                        <button class="btn btn-sm btn-soft-olive w-100" onclick="window.SaveToServeApp.showDonationDetailsModal('${d.id}')">
                          <i class="bi bi-eye"></i> View Full Details & Donor Reviews
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

  // =========================================================================
  // 3. NEARBY DONORS — 10 KM RADIUS SECTION
  // =========================================================================
  renderNearbyDonorsTab(user, nearbySummary) {
    const hasValidCoords = user.coords && Array.isArray(user.coords) && user.coords.length === 2 && !isNaN(user.coords[0]);
    
    // Apply filters to nearby listings
    let filteredListings = [...nearbySummary.availableListings];
    if (this.nearbyFilters.search) {
      const q = this.nearbyFilters.search.toLowerCase();
      filteredListings = filteredListings.filter(l => 
        l.foodName.toLowerCase().includes(q) ||
        l.donorOrg.toLowerCase().includes(q) ||
        l.donorAddress.toLowerCase().includes(q)
      );
    }
    if (this.nearbyFilters.maxDistance !== 'all') {
      const maxDist = parseFloat(this.nearbyFilters.maxDistance);
      filteredListings = filteredListings.filter(l => l.distanceKm <= maxDist);
    }
    if (this.nearbyFilters.category !== 'all') {
      filteredListings = filteredListings.filter(l => l.category.toLowerCase() === this.nearbyFilters.category.toLowerCase());
    }
    if (this.nearbyFilters.urgency !== 'all') {
      const maxHours = parseFloat(this.nearbyFilters.urgency);
      filteredListings = filteredListings.filter(l => {
        const diffHours = (new Date(l.safeUntil).getTime() - Date.now()) / 3600000;
        return diffHours <= maxHours;
      });
    }

    const filteredDonorSet = new Set(filteredListings.map(l => l.donorId || l.donorOrg));
    const filteredPortions = filteredListings.reduce((sum, l) => sum + (l.portions || 0), 0);
    const filteredKg = parseFloat(filteredListings.reduce((sum, l) => sum + (l.quantityKg || (l.portions * 0.35)), 0).toFixed(1));
    const filteredUrgent = filteredListings.filter(l => {
      const diffHours = (new Date(l.safeUntil).getTime() - Date.now()) / 3600000;
      return diffHours <= 2 && diffHours > 0;
    }).length;

    if (hasValidCoords) {
      setTimeout(() => {
        this.renderNearbyRadarMap(nearbySummary.donors, user.coords, user.orgName || user.name);
      }, 80);
    }

    return `
      <div>
        <!-- Location Status Bar -->
        <div class="custom-card p-3 mb-4" style="background:#F1F8F5; border:1.5px solid #8CB8A5;">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div class="d-flex align-items-center gap-2">
              <div class="stat-icon" style="background:#E2F1EA; color:#265944; width:40px; height:40px;">
                <i class="bi bi-geo-alt-fill text-danger fs-5"></i>
              </div>
              <div>
                <span class="small text-muted fw-bold text-uppercase d-block">NGO Registered GPS Origin Point</span>
                <div class="fw-bold text-dark">
                  ${user.address || 'Address Not Configured'} 
                  ${hasValidCoords ? `<span class="badge bg-success ms-1"><i class="bi bi-check-circle"></i> Lat: ${user.coords[0].toFixed(4)}, Lng: ${user.coords[1].toFixed(4)}</span>` : '<span class="badge bg-danger ms-1">Missing Coordinates</span>'}
                </div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-success" onclick="window.SaveToServeNGO.getCurrentGpsLocation()">
                <i class="bi bi-crosshair"></i> Auto-Detect Browser GPS
              </button>
              <button class="btn btn-sm btn-olive" onclick="window.SaveToServeNGO.openLocationModal()">
                <i class="bi bi-pencil"></i> Edit Coordinates
              </button>
            </div>
          </div>
        </div>

        ${!hasValidCoords ? `
          <div class="alert alert-warning p-4 mb-4 text-center rounded-3 shadow-sm">
            <i class="bi bi-exclamation-triangle-fill fs-2 text-warning d-block mb-2"></i>
            <h5 class="fw-bold text-dark">Registered Coordinates Required for 10 KM Distance Calculation</h5>
            <p class="text-muted mb-3" style="max-width:600px; margin:0 auto;">
              Save to Serve requires your registered shelter GPS coordinates to calculate authentic distances to food donors.
            </p>
            <button class="btn btn-green" onclick="window.SaveToServeNGO.openLocationModal()">
              <i class="bi bi-geo-alt"></i> Set Registered GPS Location
            </button>
          </div>
        ` : `
          <!-- Summary Bar -->
          <div class="row g-3 mb-4">
            <div class="col-lg-3 col-6">
              <div class="ngo-summary-metric">
                <div class="stat-icon" style="background:#E2F1EA; color:#265944;"><i class="bi bi-shop fs-3"></i></div>
                <div>
                  <div class="stat-value" style="color:var(--portal-dark);">${filteredDonorSet.size}</div>
                  <div class="stat-label">Distinct Donors (< 10 KM)</div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-6">
              <div class="ngo-summary-metric">
                <div class="stat-icon" style="background:#E2F1EA; color:#265944;"><i class="bi bi-basket3-fill fs-3"></i></div>
                <div>
                  <div class="stat-value" style="color:var(--portal-dark);">${filteredListings.length}</div>
                  <div class="stat-label">Available Food Listings</div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-6">
              <div class="ngo-summary-metric">
                <div class="stat-icon" style="background:#DCFCE7; color:#166534;"><i class="bi bi-pie-chart-fill fs-3"></i></div>
                <div>
                  <div class="stat-value" style="color:#166534;">${filteredPortions} portions</div>
                  <div class="stat-label">Total Quantity (~${filteredKg} kg)</div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-6">
              <div class="ngo-summary-metric">
                <div class="stat-icon" style="background:#FEE2E2; color:#991B1B;"><i class="bi bi-alarm-fill fs-3 text-danger"></i></div>
                <div>
                  <div class="stat-value text-danger">${filteredUrgent}</div>
                  <div class="stat-label">Approaching Expiry (&lt; 2h)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Radar Map -->
          <div class="custom-card p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold mb-0" style="color:var(--portal-dark);">
                <i class="bi bi-map-fill text-success me-2"></i> 10 KM Radius Map
              </h6>
              <span class="small text-muted">
                <span class="badge" style="background:#265944; color:#fff;">■ NGO Shelter</span>
                <span class="badge ms-1" style="background:#539378; color:#fff;">● Donor Kitchen</span>
              </span>
            </div>
            <div id="ngo-nearby-map" class="ngo-radar-map-wrap"></div>
          </div>

          <!-- Filter Toolbar -->
          <div class="custom-card p-3 mb-4">
            <div class="row g-2 align-items-center">
              <div class="col-lg-4 col-md-6">
                <div class="input-group">
                  <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" class="form-control form-control-custom border-start-0" placeholder="Search donor or food..." value="${this.nearbyFilters.search}" oninput="window.SaveToServeNGO.handleNearbySearch(this.value)">
                </div>
              </div>
              <div class="col-6 col-md-3 col-lg-3">
                <select class="form-select form-select-custom" onchange="window.SaveToServeNGO.handleNearbyDistance(this.value)">
                  <option value="10" ${this.nearbyFilters.maxDistance === '10' ? 'selected' : ''}>Within 10 KM</option>
                  <option value="5" ${this.nearbyFilters.maxDistance === '5' ? 'selected' : ''}>Within 5 KM</option>
                  <option value="3" ${this.nearbyFilters.maxDistance === '3' ? 'selected' : ''}>Within 3 KM</option>
                </select>
              </div>
              <div class="col-6 col-md-3 col-lg-3">
                <select class="form-select form-select-custom" onchange="window.SaveToServeNGO.handleNearbyUrgency(this.value)">
                  <option value="all" ${this.nearbyFilters.urgency === 'all' ? 'selected' : ''}>All Expiries</option>
                  <option value="2" ${this.nearbyFilters.urgency === '2' ? 'selected' : ''}>&lt; 2h (Urgent)</option>
                  <option value="4" ${this.nearbyFilters.urgency === '4' ? 'selected' : ''}>&lt; 4 Hours</option>
                  <option value="8" ${this.nearbyFilters.urgency === '8' ? 'selected' : ''}>&lt; 8 Hours</option>
                </select>
              </div>
              <div class="col-lg-2 text-end">
                <button class="btn btn-outline-secondary btn-sm w-100" onclick="window.SaveToServeNGO.resetNearbyFilters()">
                  <i class="bi bi-arrow-counterclockwise"></i> Reset Filters
                </button>
              </div>
            </div>
          </div>

          <!-- Nearby Listings Grid with Donor Ratings -->
          ${filteredListings.length === 0 ? `
            <div class="custom-card text-center py-5">
              <i class="bi bi-radar fs-1 text-muted mb-2 d-block"></i>
              <h5 class="fw-bold">No Nearby Donors Match Selected Filters</h5>
              <p class="text-muted small">No food donations match your distance and urgency filters. Try expanding filters.</p>
            </div>
          ` : `
            <div class="row g-3">
              ${filteredListings.map(d => {
                const expiryInfo = SaveToServeStore.getExpiryCountdown(d.safeUntil);
                const expiryTimeFormatted = SaveToServeStore.formatDateTime(d.safeUntil);
                const donorRating = window.SaveToServeDB.getDonorRatingStats(d.donorId || 'usr-donor-1');

                return `
                  <div class="col-md-6 col-lg-4">
                    <div class="ngo-donor-card">
                      <div class="ngo-donor-header">
                        <div class="d-flex align-items-center gap-1 text-truncate">
                          <i class="bi bi-shop text-success"></i>
                          <strong class="text-truncate small text-dark">${d.donorOrg}</strong>
                        </div>
                        <span class="ngo-dist-badge">
                          <i class="bi bi-geo-alt-fill text-danger"></i> ${d.distanceKm} km
                        </span>
                      </div>

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

                      <div class="p-3 d-flex flex-column flex-grow-1">
                        <h6 class="fw-bold mb-1" style="color:var(--portal-dark);">${d.foodName}</h6>
                        <p class="small text-muted mb-1"><i class="bi bi-geo-alt"></i> ${d.donorAddress}</p>

                        <!-- Average Donor Rating Badge -->
                        <div class="mb-2">
                          <span class="badge bg-warning text-dark" style="font-size:0.75rem;">
                            <i class="bi bi-star-fill text-warning"></i> Donor Rating: <strong>${donorRating.averageFormatted} / 5.0</strong> (${donorRating.totalReviews} NGO reviews)
                          </span>
                        </div>

                        ${expiryInfo.warningHtml}

                        <div class="p-2 bg-light rounded border small mb-2">
                          <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted">Available Quantity:</span>
                            <strong class="text-success">${d.availableQuantity !== undefined ? d.availableQuantity : d.portions} ${d.quantityUnit || 'servings'}</strong>
                          </div>
                          <div class="d-flex justify-content-between">
                            <span class="text-muted">Expiry Deadline:</span>
                            <span class="fw-bold text-danger">${expiryTimeFormatted}</span>
                          </div>
                        </div>

                        <div class="mt-auto d-flex flex-column gap-2 pt-2 border-top">
                          ${(d.availableQuantity !== undefined && d.availableQuantity <= 0) || d.status === 'claimed' ? `
                            <button class="btn btn-secondary w-100" disabled>
                              <i class="bi bi-check-circle"></i> Fully Claimed
                            </button>
                          ` : `
                            <button class="btn btn-green w-100" onclick="window.SaveToServeNGO.openClaimModal('${d.id}')">
                              <i class="bi bi-hand-thumbs-up"></i> Select Quantity & Claim
                            </button>
                          `}
                          <button class="btn btn-sm btn-soft-olive w-100" onclick="window.SaveToServeApp.showDonationDetailsModal('${d.id}')">
                            <i class="bi bi-eye"></i> View Full Details & Reviews
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        `}
      </div>
    `;
  }

  renderNearbyRadarMap(donors, ngoCoords, ngoName) {
    const mapEl = document.getElementById('ngo-nearby-map');
    if (!mapEl || typeof L === 'undefined') return;

    if (this.nearbyMapInstance) {
      try {
        this.nearbyMapInstance.remove();
      } catch (e) {
        console.warn('Map cleanup notice', e);
      }
      this.nearbyMapInstance = null;
    }

    const [lat, lon] = ngoCoords;
    const map = L.map('ngo-nearby-map').setView([lat, lon], 13);
    this.nearbyMapInstance = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    L.circle([lat, lon], {
      radius: 10000,
      color: '#539378',
      fillColor: '#8CB8A5',
      fillOpacity: 0.12,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(map);

    const ngoIcon = L.divIcon({
      className: 'ngo-custom-marker',
      html: `<div style="background:#265944; color:#fff; border:2.5px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,0.35); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px;"><i class="bi bi-building"></i></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    L.marker([lat, lon], { icon: ngoIcon }).addTo(map)
      .bindPopup(`<strong>📍 ${ngoName} (Your Shelter)</strong><br>Origin for 10 KM distance calculation`)
      .openPopup();

    const donorIcon = L.divIcon({
      className: 'donor-custom-marker',
      html: `<div style="background:#539378; color:#fff; border:2px solid #fff; box-shadow:0 3px 8px rgba(0,0,0,0.3); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px;"><i class="bi bi-shop"></i></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    donors.forEach(d => {
      if (d.donorCoords && Array.isArray(d.donorCoords) && d.donorCoords.length === 2) {
        const totalMeals = d.listings.reduce((sum, l) => sum + (l.portions || 0), 0);
        const ratingStats = window.SaveToServeDB.getDonorRatingStats(d.donorId);
        L.marker(d.donorCoords, { icon: donorIcon }).addTo(map)
          .bindPopup(`
            <div style="min-width:180px;">
              <strong style="color:#265944;">${d.donorOrg}</strong>
              <div class="small text-warning">⭐ ${ratingStats.averageFormatted} (${ratingStats.totalReviews} reviews)</div>
              <div class="small text-muted"><i class="bi bi-geo-alt"></i> ${d.distanceKm} km away</div>
              <div class="small text-dark mt-1"><strong>${d.listings.length} Active Listing(s)</strong> (${totalMeals} portions)</div>
            </div>
          `);
      }
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }

  // =========================================================================
  // 4. MY CLAIMS & DELIVERIES SECTION
  // =========================================================================
  renderMyClaimsTab(myClaims, user) {
    return `
      <div class="custom-card">
        <div class="custom-card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title-custom mb-0"><i class="bi bi-card-checklist text-primary me-2"></i> My Claims & Food Collections</h5>
          <span class="badge bg-light text-dark border">Total Claims: ${myClaims.length}</span>
        </div>

        ${myClaims.length === 0 ? `
          <div class="p-4 text-center text-muted">
            <i class="bi bi-clipboard-x fs-2 mb-2 d-block"></i>
            <p>Your NGO has not claimed any surplus food donations yet.</p>
            <button class="btn btn-sm btn-olive" onclick="window.SaveToServeNGO.switchTab('browse-food')">
              Browse Available Food
            </button>
          </div>
        ` : `
          <div class="row g-3 p-3">
            ${myClaims.map(c => {
              const expiryInfo = SaveToServeStore.getExpiryCountdown(c.safeUntil);
              const postedTimeFormatted = SaveToServeStore.formatDateTime(c.createdAt || c.prepTime);
              const expiryTimeFormatted = SaveToServeStore.formatDateTime(c.safeUntil);
              const claimTimeFormatted = SaveToServeStore.formatDateTime(c.claimTimestamp);
              const donorRating = window.SaveToServeDB.getDonorRatingStats(c.donorId || 'usr-donor-1');
              const hasReviewed = (window.SaveToServeDB.getReviewsForDonor(c.donorId) || []).some(r => (r.transactionId === c.donationId || r.transactionId === c.claimId) && (r.reviewerNgoId === user.id || r.reviewerId === user.id));

              return `
                <div class="col-lg-6">
                  <div class="p-3 border rounded h-100 d-flex flex-column justify-content-between" style="background:#FAFDFB; border-color:rgba(140,184,165,0.4) !important;">
                    <div>
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="fw-bold mb-0" style="color:var(--portal-dark);">${c.foodName}</h6>
                        <span class="badge ${c.status === 'completed' ? 'bg-success' : c.status === 'in-transit' ? 'bg-primary' : c.status === 'cancelled' ? 'bg-secondary' : 'bg-warning text-dark'} text-uppercase">
                          ${c.status}
                        </span>
                      </div>

                      <p class="small text-muted mb-1">
                        <i class="bi bi-shop me-1 text-success"></i> Donor: <strong>${c.donorOrg}</strong>
                        ${donorRating.totalReviews > 0 ? `<span class="badge bg-warning text-dark ms-1">⭐ ${donorRating.averageFormatted}</span>` : ''}
                      </p>

                      <!-- Claimed Quantity Highlight Pill -->
                      <div class="p-2 rounded border mb-2 d-flex justify-content-between align-items-center" style="background:#E2F1EA; border-color:#8CB8A5 !important;">
                        <span class="small" style="color:#265944;"><i class="bi bi-bag-check-fill me-1"></i><strong>Claimed Quantity:</strong></span>
                        <span class="badge bg-white font-monospace fs-6" style="color:#265944; border:1px solid #8CB8A5;">${c.claimedQuantity} ${c.unit}</span>
                      </div>

                      <div class="p-2 bg-white rounded border small mb-2">
                        <div class="d-flex justify-content-between mb-1">
                          <span>Pickup Verification Code:</span>
                          <strong class="font-monospace text-primary fs-6">${c.pickupCode}</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                          <span>Pickup Address:</span>
                          <span class="text-truncate" style="max-width:200px;">${c.donorAddress || 'Bengaluru'}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                          <span>Assigned Courier:</span>
                          <strong>${c.assignedVolunteerName || 'NGO Staff Courier'}</strong>
                        </div>
                      </div>

                      <div class="p-2 bg-white rounded border small mb-3">
                        <div class="d-flex justify-content-between mb-1">
                          <span class="text-muted"><i class="bi bi-clock-history me-1 text-primary"></i>Claimed At:</span>
                          <span>${claimTimeFormatted}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                          <span class="text-muted"><i class="bi bi-calendar-check me-1 text-primary"></i>Posted:</span>
                          <span>${postedTimeFormatted}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                          <span class="text-muted"><i class="bi bi-alarm me-1 text-danger"></i>Expiry:</span>
                          <span class="fw-bold text-danger">${expiryTimeFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div class="mt-2 pt-2 border-top">
                      ${c.status === 'claimed' ? `
                        <div class="d-flex flex-wrap gap-2">
                          <button class="btn btn-sm btn-soft-olive flex-grow-1" onclick="window.SaveToServeQR.showVoucherModal('${c.donationId}')">
                            <i class="bi bi-qr-code"></i> QR Voucher
                          </button>
                          <button class="btn btn-sm btn-soft-olive flex-grow-1" onclick="window.SaveToServeApp.showDonationDetailsModal('${c.donationId}')">
                            <i class="bi bi-eye"></i> Details
                          </button>
                          <button class="btn btn-sm btn-outline-danger" onclick="window.SaveToServeNGO.cancelClaim('${c.claimId}')" title="Cancel this claim & restore quantity to donor">
                            <i class="bi bi-x-circle"></i> Cancel Claim
                          </button>
                        </div>
                      ` : c.status === 'in-transit' ? `
                        <div class="d-flex gap-2">
                          <button class="btn btn-sm btn-green w-100" onclick="window.SaveToServeNGO.promptConfirmDistribution('${c.donationId}', ${c.claimedQuantity})">
                            <i class="bi bi-check2-circle"></i> Confirm Receipt & Distribution (${c.claimedQuantity} ${c.unit})
                          </button>
                          <button class="btn btn-sm btn-soft-olive" onclick="window.SaveToServeApp.showDonationDetailsModal('${c.donationId}')">
                            <i class="bi bi-eye"></i>
                          </button>
                        </div>
                      ` : c.status === 'cancelled' ? `
                        <div class="alert alert-secondary py-1 px-2 mb-2 small">
                          <i class="bi bi-info-circle"></i> Claim cancelled. Quantity was restored to donor listing.
                        </div>
                        <button class="btn btn-sm btn-soft-olive w-100" onclick="window.SaveToServeApp.showDonationDetailsModal('${c.donationId}')">
                          <i class="bi bi-eye"></i> View Listing Details
                        </button>
                      ` : `
                        <div class="alert alert-success py-1 px-2 mb-2 small d-flex justify-content-between align-items-center">
                          <span><i class="bi bi-check-circle-fill"></i> Nourished ${c.beneficiariesReached || c.claimedQuantity} people</span>
                          <span class="text-muted">${SaveToServeStore.formatTime(c.distributionTimestamp || c.createdAt)}</span>
                        </div>
                        <div class="d-flex gap-2">
                          ${!hasReviewed ? `
                            <button class="btn btn-sm btn-olive w-50" onclick="window.SaveToServeNGO.openDonorReviewModal('${c.donationId}')">
                              <i class="bi bi-star"></i> Rate Donor
                            </button>
                          ` : `
                            <span class="badge bg-success-subtle text-success p-2 w-50 text-center"><i class="bi bi-check-circle"></i> Reviewed</span>
                          `}
                          <button class="btn btn-sm btn-soft-olive w-50" onclick="window.SaveToServeApp.showDonationDetailsModal('${c.donationId}')">
                            <i class="bi bi-eye"></i> Details
                          </button>
                        </div>
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

  // =========================================================================
  // 5. DONOR REVIEWS SECTION (NGOs Reviewing Donors)
  // =========================================================================
  renderDonorReviewsTab(user, donorReviews) {
    const allUsers = window.SaveToServeDB.getUsers().filter(u => u.role === 'donor');
    const completedClaims = window.SaveToServeDB.getDonations().filter(d => d.claimedByNgoId === user.id && d.status === 'completed');

    return `
      <div>
        <div class="custom-card p-4 mb-4">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-2 border-bottom">
            <div>
              <h5 class="fw-bold mb-1" style="color:var(--portal-dark);">
                <i class="bi bi-star-fill text-warning me-2"></i> Food Donor Reviews & Ratings
              </h5>
              <p class="text-muted small mb-0">
                Verified reviews submitted by NGOs after completing surplus food collections.
              </p>
            </div>
            <div>
              <button class="btn btn-olive" onclick="window.SaveToServeNGO.openDonorReviewModal()">
                <i class="bi bi-plus-circle"></i> Write Donor Review
              </button>
            </div>
          </div>

          <!-- List of Donors with Ratings -->
          <div class="row g-3 mb-4">
            ${allUsers.map(donor => {
              const stats = window.SaveToServeDB.getDonorRatingStats(donor.id);
              const reviews = window.SaveToServeDB.getReviewsForDonor(donor.id);

              return `
                <div class="col-lg-6">
                  <div class="p-3 border rounded h-100" style="background:#FAFDFB; border-color:rgba(140,184,165,0.4) !important;">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 class="fw-bold mb-0 text-dark">${donor.orgName || donor.name}</h6>
                        <div class="small text-muted"><i class="bi bi-geo-alt"></i> ${donor.address || 'Bengaluru'}</div>
                      </div>
                      <div class="text-end">
                        <div class="ngo-stars-gold" style="font-size:0.95rem;">
                          ${this.renderStarsHtml(stats.averageRating)}
                        </div>
                        <div class="fw-bold text-dark small">${stats.averageFormatted} / 5.0 (${stats.totalReviews} reviews)</div>
                      </div>
                    </div>

                    <!-- Reviews Written for this Donor -->
                    <div class="mt-3 pt-2 border-top">
                      <span class="text-muted small fw-bold d-block mb-2 text-uppercase" style="font-size:0.7rem;">Reviews from Recipient NGOs</span>
                      ${reviews.length === 0 ? `
                        <div class="text-muted small fst-italic p-2 bg-light rounded text-center">
                          No reviews written for this donor yet.
                        </div>
                      ` : `
                        <div class="d-flex flex-column gap-2">
                          ${reviews.map(r => `
                            <div class="p-2 bg-white rounded border small">
                              <div class="d-flex justify-content-between align-items-center mb-1">
                                <div>
                                  <strong class="text-dark">${r.reviewerNgoName}</strong>
                                  <span class="badge" style="background:#E2F1EA; color:#265944; font-size:0.65rem;">Verified Collection</span>
                                </div>
                                <div class="text-warning small">${this.renderStarsHtml(r.rating)}</div>
                              </div>
                              <p class="mb-1 text-dark" style="font-size:0.82rem;">"${r.comment}"</p>
                              <div class="d-flex justify-content-between align-items-center text-muted" style="font-size:0.7rem;">
                                <span>Rescued: ${r.transactionFoodName || 'Surplus Meal'}</span>
                                <span>${SaveToServeStore.formatDate(r.createdAt)}</span>
                              </div>
                            </div>
                          `).join('')}
                        </div>
                      `}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 6. NGO PROFILE SECTION (Essential Fields Only)
  // =========================================================================
  renderProfileTab(user) {
    const hasValidCoords = user.coords && Array.isArray(user.coords) && user.coords.length === 2;

    return `
      <div>
        <div class="row g-4">
          <div class="col-lg-8">
            <div class="custom-card p-4">
              <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 class="fw-bold mb-0" style="color:var(--portal-dark);">
                  <i class="bi bi-building-check text-success me-2"></i> Organization Profile
                </h5>
                <button class="btn btn-sm btn-olive" onclick="window.SaveToServeNGO.openEditProfileModal()">
                  <i class="bi bi-pencil-square"></i> Edit Profile
                </button>
              </div>

              <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <img src="${user.logoUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200&auto=format&fit=crop&q=60'}" 
                     alt="${user.orgName}" 
                     class="ngo-avatar-frame" style="width:80px; height:80px;">
                <div>
                  <h4 class="fw-bold mb-1" style="color:var(--portal-dark);">${user.orgName || user.name}</h4>
                  <span class="badge bg-success"><i class="bi bi-patch-check-fill"></i> Verified NGO Partner</span>
                </div>
              </div>

              <!-- Address & Contact Details -->
              <div class="mb-4">
                <h6 class="fw-bold mb-2" style="color:var(--portal-dark);"><i class="bi bi-geo-alt text-danger"></i> Organization Address & Contact</h6>
                <div class="p-3 bg-light rounded border">
                  <div class="mb-2">
                    <span class="text-muted small d-block">Physical Address:</span>
                    <strong class="text-dark">${user.address || 'Bengaluru'}</strong>
                  </div>
                  <div class="mb-2">
                    <span class="text-muted small d-block">GPS Coordinates:</span>
                    <strong class="text-success">${hasValidCoords ? `[${user.coords[0].toFixed(5)}, ${user.coords[1].toFixed(5)}]` : 'Not Configured'}</strong>
                  </div>
                  <div class="row g-2">
                    <div class="col-md-4">
                      <span class="text-muted small d-block">Contact Person:</span>
                      <strong class="text-dark">${user.contactPerson || user.name}</strong>
                    </div>
                    <div class="col-md-4">
                      <span class="text-muted small d-block">Phone:</span>
                      <strong class="text-dark">${user.phone || '+91 98765 11223'}</strong>
                    </div>
                    <div class="col-md-4">
                      <span class="text-muted small d-block">Email:</span>
                      <strong class="text-dark">${user.email || 'ngo@savetoserve.org'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Number of People Served -->
              <div class="mb-4">
                <h6 class="fw-bold mb-2" style="color:var(--portal-dark);"><i class="bi bi-people text-info"></i> Number of People Served</h6>
                <div class="p-3 bg-light rounded border d-flex align-items-center gap-3">
                  <div class="stat-icon" style="background:#DCFCE7; color:#166534;"><i class="bi bi-heart-fill fs-3"></i></div>
                  <div>
                    <h4 class="fw-bold mb-0 text-success">${user.peopleServed || 120}</h4>
                    <span class="text-muted small">Beneficiaries supported with daily meals & relief</span>
                  </div>
                </div>
              </div>

              <!-- Organization Description -->
              <div>
                <h6 class="fw-bold mb-2" style="color:var(--portal-dark);"><i class="bi bi-info-circle text-primary"></i> Organization Description</h6>
                <div class="p-3 bg-light rounded border text-dark" style="font-size:0.95rem; line-height:1.5;">
                  ${user.description || 'Dedicated to serving nutritious surplus food to individuals and families in need across Bengaluru.'}
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="custom-card p-4">
              <h6 class="fw-bold mb-3 pb-2 border-bottom" style="color:var(--portal-dark);">
                <i class="bi bi-shield-check text-success me-1"></i> Quick Profile Settings
              </h6>
              <p class="small text-muted mb-3">
                Ensure your shelter location coordinates and people-served counts are up to date to receive accurate nearby surplus notifications.
              </p>
              <button class="btn btn-olive w-100" onclick="window.SaveToServeNGO.openEditProfileModal()">
                <i class="bi bi-pencil"></i> Edit Organization Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // MODALS & EVENT HANDLERS
  // =========================================================================
  renderStarsHtml(rating) {
    const num = Math.round(rating || 0);
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= num) {
        html += '<i class="bi bi-star-fill text-warning"></i> ';
      } else {
        html += '<i class="bi bi-star text-muted"></i> ';
      }
    }
    return html;
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
    this.filters = { search: '', foodType: 'all', maxSafeHours: 'all' };
    this.render('browse-food');
  }

  handleNearbySearch(val) {
    this.nearbyFilters.search = val;
    this.render('nearby-donors');
  }

  handleNearbyDistance(val) {
    this.nearbyFilters.maxDistance = val;
    this.render('nearby-donors');
  }

  handleNearbyUrgency(val) {
    this.nearbyFilters.urgency = val;
    this.render('nearby-donors');
  }

  resetNearbyFilters() {
    this.nearbyFilters = { search: '', maxDistance: '10', category: 'all', urgency: 'all' };
    this.render('nearby-donors');
  }

  openClaimModal(donationId, initialQuantity = null) {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      window.SaveToServeApp?.showToast('NGO Shelter authentication required.', 'danger');
      return;
    }

    const donation = window.SaveToServeDB.getDonationById(donationId);
    if (!donation) {
      window.SaveToServeApp?.showToast('Food listing not found.', 'danger');
      return;
    }

    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    const unit = donation.quantityUnit || 'servings';
    const availQty = donation.availableQuantity !== undefined ? donation.availableQuantity : (donation.status === 'available' ? donation.portions : 0);
    const expiryInfo = SaveToServeStore.getExpiryCountdown(donation.safeUntil);
    const defaultClaim = Math.min(availQty, initialQuantity !== null ? initialQuantity : (availQty || 1));

    modalTitle.innerHTML = `<i class="bi bi-cart-check text-success me-2"></i> Select Claim Quantity`;
    modalBody.innerHTML = `
      <form onsubmit="window.SaveToServeNGO.handleConfirmClaimModal(event, '${donation.id}')">
        <div class="p-3 bg-light rounded border mb-3">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="fw-bold mb-1" style="color:var(--portal-dark);">${donation.foodName}</h6>
              <div class="small text-muted"><i class="bi bi-shop me-1 text-success"></i><strong>${donation.donorOrg}</strong> • ${donation.donorAddress}</div>
            </div>
            <span class="badge ${donation.foodType === 'veg' ? 'bg-success' : 'bg-danger'} text-uppercase">${donation.foodType}</span>
          </div>

          <div class="row g-2 text-center small mt-2">
            <div class="col-6">
              <div class="p-2 bg-white rounded border border-success">
                <span class="text-muted d-block" style="font-size:0.72rem;">AVAILABLE TO CLAIM</span>
                <strong class="fs-5 text-success" id="claimModalAvailQty">${availQty}</strong> <span class="text-muted">${unit}</span>
              </div>
            </div>
            <div class="col-6">
              <div class="p-2 bg-white rounded border">
                <span class="text-muted d-block" style="font-size:0.72rem;">SAFE EXPIRY</span>
                <strong class="text-danger">${expiryInfo.countdownText}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label-custom fw-bold text-dark d-flex justify-content-between align-items-center mb-1">
            <span><i class="bi bi-plus-slash-minus text-primary me-1"></i> Claim Quantity (${unit}) *</span>
            <span class="small text-muted">Max: <strong>${availQty} ${unit}</strong></span>
          </label>
          
          <div class="d-flex align-items-center gap-2 mb-2">
            <button type="button" class="btn btn-outline-secondary px-3 py-2 fw-bold fs-5" onclick="window.SaveToServeNGO.adjustClaimQtyInput(-5, ${availQty})">-5</button>
            <button type="button" class="btn btn-outline-secondary px-3 py-2 fw-bold fs-5" onclick="window.SaveToServeNGO.adjustClaimQtyInput(-1, ${availQty})">-1</button>
            <input type="number" id="claimQtyInputField" class="form-control form-control-custom text-center fs-3 fw-bold text-success" min="1" max="${availQty}" value="${defaultClaim}" oninput="window.SaveToServeNGO.updateClaimModalPreview(${availQty}, '${unit}')" required>
            <button type="button" class="btn btn-outline-secondary px-3 py-2 fw-bold fs-5" onclick="window.SaveToServeNGO.adjustClaimQtyInput(1, ${availQty})">+1</button>
            <button type="button" class="btn btn-outline-secondary px-3 py-2 fw-bold fs-5" onclick="window.SaveToServeNGO.adjustClaimQtyInput(5, ${availQty})">+5</button>
          </div>

          <div class="d-flex justify-content-between align-items-center flex-wrap gap-1">
            <button type="button" class="btn btn-sm btn-outline-success py-1" onclick="document.getElementById('claimQtyInputField').value='${availQty}'; window.SaveToServeNGO.updateClaimModalPreview(${availQty}, '${unit}');">
              <i class="bi bi-check-all"></i> Claim All (${availQty} ${unit})
            </button>
            <span class="small text-muted" id="claimRemainingPreviewText">Remaining for other NGOs: <strong>${availQty - defaultClaim} ${unit}</strong></span>
          </div>
        </div>

        <div class="p-2 bg-white rounded border small mb-3">
          <div class="text-muted mb-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i><strong>Pickup & Safe Storage:</strong></div>
          <div class="text-muted mb-1">${donation.donorAddress}</div>
          <div class="fst-italic">${donation.storageInfo || 'Packed safely. An instant verification code & QR voucher will be issued immediately upon confirmation.'}</div>
        </div>

        <div class="d-flex justify-content-end gap-2 pt-2 border-top">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-green">
            <i class="bi bi-check2-circle"></i> Confirm & Claim Food
          </button>
        </div>
      </form>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  adjustClaimQtyInput(delta, maxQty) {
    const input = document.getElementById('claimQtyInputField');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(maxQty, val + delta));
    input.value = val;
    input.dispatchEvent(new Event('input'));
  }

  updateClaimModalPreview(availQty, unit) {
    const input = document.getElementById('claimQtyInputField');
    const preview = document.getElementById('claimRemainingPreviewText');
    if (!input || !preview) return;
    let val = parseInt(input.value) || 0;
    if (val > availQty) {
      val = availQty;
      input.value = val;
    }
    const rem = Math.max(0, availQty - val);
    preview.innerHTML = `Remaining for other NGOs: <strong>${rem} ${unit}</strong>`;
  }

  handleConfirmClaimModal(event, donationId) {
    event.preventDefault();
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      window.SaveToServeApp?.showToast('NGO Shelter authentication required.', 'danger');
      return;
    }

    const input = document.getElementById('claimQtyInputField');
    const qty = input ? parseInt(input.value) : null;

    const res = window.SaveToServeDB.claimDonation(donationId, user, qty);
    if (res.success) {
      window.SaveToServeApp?.showToast(`Successfully claimed ${res.claim.claimedQuantity} ${res.claim.unit} of ${res.donation.foodName}! Pickup Code: ${res.claim.pickupCode}`, 'success');
      
      const modalEl = document.getElementById('globalModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }

      this.switchTab('my-claims');
    } else {
      window.SaveToServeApp?.showToast(res.message, 'danger');
    }
  }

  claimDonation(donationId, quantity = null) {
    this.openClaimModal(donationId, quantity);
  }

  cancelClaim(claimId) {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'ngo') {
      window.SaveToServeApp?.showToast('NGO Shelter authentication required.', 'danger');
      return;
    }

    if (confirm('Are you sure you want to cancel this food claim? The claimed quantity will immediately be returned to the donor listing for other NGOs to rescue.')) {
      const res = window.SaveToServeDB.cancelClaim(claimId, 'Cancelled by NGO');
      if (res.success) {
        window.SaveToServeApp?.showToast(res.message, 'info');
        this.render('my-claims');
      } else {
        window.SaveToServeApp?.showToast(res.message, 'danger');
      }
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

  // --- Profile Edit Modal (Essential Fields) ---
  openEditProfileModal() {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user) return;

    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="bi bi-pencil-square text-success me-2"></i> Edit NGO Profile`;
    modalBody.innerHTML = `
      <form onsubmit="window.SaveToServeNGO.handleProfileSave(event)">
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label-custom">NGO / Organization Name *</label>
            <input type="text" id="editOrgName" class="form-control form-control-custom w-100" value="${user.orgName || user.name}" required>
          </div>
          <div class="col-md-6">
            <label class="form-label-custom">Logo / Photo URL</label>
            <input type="url" id="editLogoUrl" class="form-control form-control-custom w-100" value="${user.logoUrl || ''}" placeholder="https://...">
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label-custom">Organization Address *</label>
            <input type="text" id="editAddress" class="form-control form-control-custom w-100" value="${user.address || ''}" required>
          </div>
          <div class="col-md-6">
            <label class="form-label-custom">GPS Coordinates (Lat, Lng) *</label>
            <div class="input-group">
              <input type="text" id="editCoords" class="form-control form-control-custom" value="${user.coords ? user.coords.join(', ') : '12.9611, 77.6145'}" placeholder="12.9611, 77.6145" required>
              <button class="btn btn-outline-success" type="button" onclick="window.SaveToServeNGO.getCurrentGpsLocation('editCoords')" title="Auto-Detect GPS">
                <i class="bi bi-crosshair"></i> GPS
              </button>
            </div>
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label-custom">Contact Person *</label>
            <input type="text" id="editContactPerson" class="form-control form-control-custom w-100" value="${user.contactPerson || user.name}" required>
          </div>
          <div class="col-md-4">
            <label class="form-label-custom">Phone Number *</label>
            <input type="tel" id="editPhone" class="form-control form-control-custom w-100" value="${user.phone || ''}" required>
          </div>
          <div class="col-md-4">
            <label class="form-label-custom">Email Address *</label>
            <input type="email" id="editEmail" class="form-control form-control-custom w-100" value="${user.email || ''}" required>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label-custom">Number of People Served Daily *</label>
          <input type="number" id="editPeopleServed" class="form-control form-control-custom w-100" value="${user.peopleServed || 120}" min="1" required>
        </div>

        <div class="mb-3">
          <label class="form-label-custom">Organization Description *</label>
          <textarea id="editDescription" class="form-control form-control-custom w-100" rows="3" required>${user.description || ''}</textarea>
        </div>

        <div class="d-flex justify-content-end gap-2 pt-2 border-top">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-green">
            <i class="bi bi-check-circle"></i> Save Profile
          </button>
        </div>
      </form>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  handleProfileSave(event) {
    event.preventDefault();
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user) return;

    const orgName = document.getElementById('editOrgName').value.trim();
    const logoUrl = document.getElementById('editLogoUrl').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const coordsStr = document.getElementById('editCoords').value.trim();
    const contactPerson = document.getElementById('editContactPerson').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const peopleServed = parseInt(document.getElementById('editPeopleServed').value) || 120;
    const description = document.getElementById('editDescription').value.trim();

    let coords = user.coords || [12.9611, 77.6145];
    if (coordsStr) {
      const parts = coordsStr.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        coords = [parts[0], parts[1]];
      }
    }

    const updated = window.SaveToServeDB.updateUserProfile(user.id, {
      name: contactPerson || user.name,
      orgName: orgName || user.orgName,
      logoUrl,
      address,
      coords,
      contactPerson,
      phone,
      email,
      peopleServed,
      description
    });

    if (updated && updated.success) {
      const modalEl = document.getElementById('globalModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }
      window.SaveToServeApp?.showToast('Profile updated successfully!', 'success');
      this.render();
    }
  }

  openLocationModal() {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user) return;

    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="bi bi-geo-alt text-danger me-2"></i> Update Registered GPS Location`;
    modalBody.innerHTML = `
      <form onsubmit="window.SaveToServeNGO.handleLocationSave(event)">
        <div class="mb-3">
          <label class="form-label-custom">Registered Physical Address *</label>
          <input type="text" id="locAddress" class="form-control form-control-custom w-100" value="${user.address || ''}" required>
        </div>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label-custom">Latitude *</label>
            <input type="number" step="any" id="locLat" class="form-control form-control-custom w-100" value="${user.coords ? user.coords[0] : 12.9611}" required>
          </div>
          <div class="col-6">
            <label class="form-label-custom">Longitude *</label>
            <input type="number" step="any" id="locLon" class="form-control form-control-custom w-100" value="${user.coords ? user.coords[1] : 77.6145}" required>
          </div>
        </div>
        <div class="mb-3">
          <button type="button" class="btn btn-sm btn-soft-olive w-100" onclick="window.SaveToServeNGO.getCurrentGpsLocation('split')">
            <i class="bi bi-crosshair"></i> Auto-Detect Browser GPS Coordinates
          </button>
        </div>
        <div class="d-flex justify-content-end gap-2 pt-2 border-top">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-green">Save Location</button>
        </div>
      </form>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  handleLocationSave(event) {
    event.preventDefault();
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user) return;

    const address = document.getElementById('locAddress').value.trim();
    const lat = parseFloat(document.getElementById('locLat').value);
    const lon = parseFloat(document.getElementById('locLon').value);

    if (isNaN(lat) || isNaN(lon)) {
      window.SaveToServeApp?.showToast('Please enter valid numeric latitude and longitude.', 'danger');
      return;
    }

    const res = window.SaveToServeDB.updateNgoLocation(user.id, address, [lat, lon]);
    if (res && res.success) {
      const modalEl = document.getElementById('globalModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }
      window.SaveToServeApp?.showToast('GPS coordinates updated successfully!', 'success');
      this.render();
    }
  }

  getCurrentGpsLocation(targetMode = 'single') {
    if (!navigator.geolocation) {
      window.SaveToServeApp?.showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    window.SaveToServeApp?.showToast('Requesting GPS coordinates...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lon = parseFloat(pos.coords.longitude.toFixed(5));

        if (targetMode === 'editCoords') {
          const el = document.getElementById('editCoords');
          if (el) el.value = `${lat}, ${lon}`;
        } else if (targetMode === 'split') {
          const elLat = document.getElementById('locLat');
          const elLon = document.getElementById('locLon');
          if (elLat) elLat.value = lat;
          if (elLon) elLon.value = lon;
        } else {
          const user = window.SaveToServeAuth.getCurrentUser();
          if (user) {
            window.SaveToServeDB.updateNgoLocation(user.id, user.address, [lat, lon]);
            window.SaveToServeApp?.showToast(`GPS Updated: [${lat}, ${lon}]`, 'success');
            this.render();
          }
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        window.SaveToServeApp?.showToast('Could not retrieve browser GPS position.', 'warning');
      },
      { timeout: 8000 }
    );
  }

  // --- Donor Review Modal (NGO Reviewing Donor) ---
  openDonorReviewModal(presetDonationId = null) {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user) return;

    // Eligible completed donations for this NGO
    const eligibleDonations = window.SaveToServeDB.getEligibleCompletedDonationsForDonorReview(user.id);

    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="bi bi-star-fill text-warning me-2"></i> Write Food Donor Review`;

    if (eligibleDonations.length === 0) {
      modalBody.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-shield-lock fs-1 text-muted d-block mb-2"></i>
          <h5 class="fw-bold">No Completed Food Collections Awaiting Review</h5>
          <p class="text-muted small mb-3">
            In Save to Serve, reviews are verified and tied to actual completed food collections. Claim and complete a surplus collection first to write a verified review.
          </p>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      `;
    } else {
      modalBody.innerHTML = `
        <form onsubmit="window.SaveToServeNGO.handleDonorReviewSubmit(event)">
          <div class="mb-3">
            <label class="form-label-custom">Select Completed Food Collection *</label>
            <select id="revDonationId" class="form-select form-select-custom w-100" required>
              ${eligibleDonations.map(d => `
                <option value="${d.id}" ${presetDonationId === d.id ? 'selected' : ''}>
                  #${d.id} — ${d.foodName} from ${d.donorOrg} (${d.portions} portions)
                </option>
              `).join('')}
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label-custom">Star Rating (1 to 5 Stars) *</label>
            <select id="revRating" class="form-select form-select-custom w-100" required>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent Food Quality & Packaging)</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars (Very Good)</option>
              <option value="3">⭐⭐⭐ 3 Stars (Satisfactory)</option>
              <option value="2">⭐⭐ 2 Stars (Needs Improvement)</option>
              <option value="1">⭐ 1 Star (Unsatisfactory)</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label-custom">Written Feedback / Experience *</label>
            <textarea id="revComment" class="form-control form-control-custom w-100" rows="3" placeholder="Describe the food quality, packaging, and donor coordination..." required></textarea>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-green">
              <i class="bi bi-check-circle"></i> Submit Verified Review
            </button>
          </div>
        </form>
      `;
    }

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  handleDonorReviewSubmit(event) {
    event.preventDefault();
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user) return;

    const donationId = document.getElementById('revDonationId').value;
    const rating = parseInt(document.getElementById('revRating').value);
    const comment = document.getElementById('revComment').value.trim();

    const donation = window.SaveToServeDB.getDonationById(donationId);
    if (!donation) return;

    const res = window.SaveToServeDB.addDonorReview({
      donorId: donation.donorId || 'usr-donor-1',
      reviewerNgoId: user.id,
      transactionId: donation.id,
      rating,
      comment
    });

    if (res && res.success) {
      const modalEl = document.getElementById('globalModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }
      window.SaveToServeApp?.showToast('Donor review submitted successfully!', 'success');
      this.render('donor-reviews');
    } else {
      window.SaveToServeApp?.showToast(res ? res.message : 'Could not submit review.', 'danger');
    }
  }
}

window.SaveToServeNGO = new NgoPortalManager();
window.RainRouteNGO = window.SaveToServeNGO;
