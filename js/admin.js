/**
 * Save to Serve - Admin Operations & User Verification Command Console
 * Sections: Donor Verification, NGO Verification, Volunteer Verification, Manage Donations, Manage Users, Weather Rescue, Impact Dashboard, Reports & Audit Logs
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class AdminPortalManager {
  constructor() {
    this.donorFilter = 'all'; // 'all' | 'pending' | 'approved' | 'rejected'
    this.ngoFilter = 'all';
    this.volFilter = 'all';
    this.userFilter = 'all';
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('savetoserve:statechange', () => {
      if (window.SaveToServeApp?.currentRoute === 'admin-portal') {
        this.render();
      }
    });
  }

  render(activeTab = 'donor-verification') {
    const container = document.getElementById('admin-portal-view');
    if (!container) return;

    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'admin') {
      container.innerHTML = `
        <div class="container py-5 text-center">
          <div class="alert alert-danger d-inline-block px-4 py-3 shadow-sm">
            <i class="bi bi-shield-x fs-2 d-block mb-2 text-danger"></i>
            <h5 class="fw-bold">Super Admin Access Restricted</h5>
            <p class="mb-3 text-muted">This management console requires authorized administrative credentials.</p>
            <button class="btn btn-olive" onclick="window.SaveToServeApp.openPortalAuth('admin')">Super Admin Sign In</button>
          </div>
        </div>`;
      return;
    }

    const users = window.SaveToServeDB.getUsers();
    const donors = users.filter(u => u.role === 'donor');
    const ngos = users.filter(u => u.role === 'ngo');
    const volunteers = users.filter(u => u.role === 'volunteer');
    
    const pendingDonors = donors.filter(u => u.kycStatus === 'pending');
    const pendingNgos = ngos.filter(u => u.kycStatus === 'pending');
    const pendingVols = volunteers.filter(u => u.kycStatus === 'pending');
    
    const donations = window.SaveToServeDB.getDonations();
    const hubs = window.SaveToServeDB.getHoldingHubs();
    const logs = window.SaveToServeDB.getActivityLogs();

    container.innerHTML = `
      <div class="container py-4">
        <!-- Admin Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-icon" style="width:54px;height:54px;border-radius:14px;background-color:var(--light-olive);color:var(--dark-olive);">
              <i class="bi bi-shield-lock-fill fs-2"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h3 class="mb-0 fw-bold" style="color:var(--dark-olive);">Super Admin Command Center</h3>
                <span class="badge badge-admin">Master Admin</span>
              </div>
              <p class="text-muted small mb-0">Review verification queues, moderate donations, and monitor rescue operations</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" onclick="window.SaveToServeApp.navigateTo('home')">
              <i class="bi bi-house"></i> Home
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="window.SaveToServeApp.promptResetDemoData()">
              <i class="bi bi-arrow-counterclockwise"></i> Reset Database
            </button>
          </div>
        </div>

        <!-- Metric Overview -->
        <div class="row g-3 mb-4">
          <div class="col-lg-3 col-6">
            <div class="stat-card">
              <div class="stat-icon"><i class="bi bi-shop"></i></div>
              <div>
                <div class="stat-value">${donors.length}</div>
                <div class="stat-label">Donors (${pendingDonors.length} Pending)</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <div class="stat-card">
              <div class="stat-icon"><i class="bi bi-building"></i></div>
              <div>
                <div class="stat-value">${ngos.length}</div>
                <div class="stat-label">NGOs (${pendingNgos.length} Pending)</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <div class="stat-card">
              <div class="stat-icon"><i class="bi bi-bicycle"></i></div>
              <div>
                <div class="stat-value">${volunteers.length}</div>
                <div class="stat-label">Volunteers (${pendingVols.length} Pending)</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <div class="stat-card">
              <div class="stat-icon"><i class="bi bi-box2-heart"></i></div>
              <div>
                <div class="stat-value">${donations.length}</div>
                <div class="stat-label">Surplus Listings</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dedicated Subnav with all 8 sections -->
        <div class="portal-subnav mb-4" style="overflow-x: auto; white-space: nowrap; display: flex; gap: 8px;">
          <button class="subnav-btn ${activeTab === 'donor-verification' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('donor-verification')">
            <i class="bi bi-shop"></i> Donor Verification ${pendingDonors.length > 0 ? `<span class="badge bg-warning text-dark">${pendingDonors.length}</span>` : ''}
          </button>
          <button class="subnav-btn ${activeTab === 'ngo-verification' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('ngo-verification')">
            <i class="bi bi-building"></i> NGO Verification ${pendingNgos.length > 0 ? `<span class="badge bg-warning text-dark">${pendingNgos.length}</span>` : ''}
          </button>
          <button class="subnav-btn ${activeTab === 'volunteer-verification' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('volunteer-verification')">
            <i class="bi bi-bicycle"></i> Volunteer Verification ${pendingVols.length > 0 ? `<span class="badge bg-warning text-dark">${pendingVols.length}</span>` : ''}
          </button>
          <button class="subnav-btn ${activeTab === 'manage-donations' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('manage-donations')">
            <i class="bi bi-grid-3x3-gap"></i> Manage Donations (${donations.length})
          </button>
          <button class="subnav-btn ${activeTab === 'manage-users' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('manage-users')">
            <i class="bi bi-people"></i> Manage Users (${users.length})
          </button>
          <button class="subnav-btn ${activeTab === 'weather-rescue' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('weather-rescue')">
            <i class="bi bi-cloud-rain-heavy"></i> Weather Rescue
          </button>
          <button class="subnav-btn ${activeTab === 'impact-dashboard' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('impact-dashboard')">
            <i class="bi bi-graph-up-arrow"></i> Impact Dashboard
          </button>
          <button class="subnav-btn ${activeTab === 'audit-logs' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('audit-logs')">
            <i class="bi bi-journal-text"></i> Reports & Audit Logs (${logs.length})
          </button>
        </div>

        <!-- Tab Body -->
        <div id="admin-tab-content">
          ${this.renderTabContent(activeTab, donors, ngos, volunteers, users, donations, hubs, logs)}
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    this.render(tabName);
  }

  renderTabContent(tabName, donors, ngos, volunteers, users, donations, hubs, logs) {
    // 1. DONOR VERIFICATION SECTION
    if (tabName === 'donor-verification') {
      const filteredDonors = donors.filter(d => {
        if (this.donorFilter === 'all') return true;
        return d.kycStatus === this.donorFilter;
      });

      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <div>
              <h5 class="card-title-custom"><i class="bi bi-shop text-success"></i> Donor Verification</h5>
              <div class="text-muted small">Verify restaurant & commercial kitchen food safety credentials (FSSAI)</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted fw-bold">Filter:</span>
              <select class="form-select form-select-sm form-select-custom" style="width: auto;" onchange="window.SaveToServeAdmin.setDonorFilter(this.value)">
                <option value="all" ${this.donorFilter === 'all' ? 'selected' : ''}>All Donors (${donors.length})</option>
                <option value="pending" ${this.donorFilter === 'pending' ? 'selected' : ''}>Pending (${donors.filter(d => d.kycStatus === 'pending').length})</option>
                <option value="approved" ${this.donorFilter === 'approved' ? 'selected' : ''}>Approved (${donors.filter(d => d.kycStatus === 'approved').length})</option>
                <option value="rejected" ${this.donorFilter === 'rejected' ? 'selected' : ''}>Rejected (${donors.filter(d => d.kycStatus === 'rejected').length})</option>
              </select>
            </div>
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Donor Organization</th>
                  <th>Contact Details</th>
                  <th>Document Type</th>
                  <th>Status</th>
                  <th>Verification Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredDonors.map(u => {
                  const statusBadgeClass = u.kycStatus === 'approved' ? 'bg-success' : u.kycStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark';
                  return `
                    <tr>
                      <td>
                        <strong style="color:var(--dark-olive);">${u.orgName || u.name}</strong>
                        <div class="small text-muted"><i class="bi bi-person"></i> ${u.name}</div>
                      </td>
                      <td>
                        <div class="small">${u.email}</div>
                        <div class="small text-muted">${u.phone}</div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          <i class="bi bi-file-earmark-check text-success"></i> ${u.verificationDetails?.docType || u.verifiedDoc || 'FSSAI License'}
                        </span>
                      </td>
                      <td>
                        <span class="badge ${statusBadgeClass} text-uppercase">${u.kycStatus}</span>
                        ${u.verificationDetails?.rejectionReason ? `<div class="small text-danger mt-1" style="font-size:0.75rem;">${u.verificationDetails.rejectionReason}</div>` : ''}
                      </td>
                      <td>
                        <div class="d-flex gap-1 flex-wrap">
                          <button class="btn btn-sm btn-outline-secondary" title="View Details" onclick="window.SaveToServeAdmin.viewUserDetails('${u.id}')">
                            <i class="bi bi-eye"></i> Details
                          </button>
                          ${u.kycStatus !== 'approved' ? `
                            <button class="btn btn-sm btn-olive" title="Approve Donor" onclick="window.SaveToServeAdmin.approveUser('${u.id}')">
                              <i class="bi bi-check2"></i> Approve
                            </button>
                          ` : ''}
                          ${u.kycStatus !== 'rejected' ? `
                            <button class="btn btn-sm btn-outline-danger" title="Reject Request" onclick="window.SaveToServeAdmin.promptRejectUser('${u.id}')">
                              <i class="bi bi-x"></i> Reject
                            </button>
                          ` : `
                            <button class="btn btn-sm btn-soft-olive" title="Reconsider Application" onclick="window.SaveToServeAdmin.reconsiderUser('${u.id}')">
                              <i class="bi bi-arrow-repeat"></i> Reconsider
                            </button>
                          `}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // 2. NGO VERIFICATION SECTION
    if (tabName === 'ngo-verification') {
      const filteredNgos = ngos.filter(n => {
        if (this.ngoFilter === 'all') return true;
        return n.kycStatus === this.ngoFilter;
      });

      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <div>
              <h5 class="card-title-custom"><i class="bi bi-building text-success"></i> NGO Shelter Verification</h5>
              <div class="text-muted small">Verify NGO trust registration, 12A/80G status, and food distribution capacity</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted fw-bold">Filter:</span>
              <select class="form-select form-select-sm form-select-custom" style="width: auto;" onchange="window.SaveToServeAdmin.setNgoFilter(this.value)">
                <option value="all" ${this.ngoFilter === 'all' ? 'selected' : ''}>All NGOs (${ngos.length})</option>
                <option value="pending" ${this.ngoFilter === 'pending' ? 'selected' : ''}>Pending (${ngos.filter(d => d.kycStatus === 'pending').length})</option>
                <option value="approved" ${this.ngoFilter === 'approved' ? 'selected' : ''}>Approved (${ngos.filter(d => d.kycStatus === 'approved').length})</option>
                <option value="rejected" ${this.ngoFilter === 'rejected' ? 'selected' : ''}>Rejected (${ngos.filter(d => d.kycStatus === 'rejected').length})</option>
              </select>
            </div>
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>NGO Organization</th>
                  <th>Representative</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Verification Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredNgos.map(u => {
                  const statusBadgeClass = u.kycStatus === 'approved' ? 'bg-success' : u.kycStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark';
                  return `
                    <tr>
                      <td>
                        <strong style="color:var(--dark-olive);">${u.orgName || u.name}</strong>
                        <div class="small text-muted">${u.address}</div>
                      </td>
                      <td>${u.name}</td>
                      <td>
                        <div class="small">${u.email}</div>
                        <div class="small text-muted">${u.phone}</div>
                      </td>
                      <td>
                        <span class="badge ${statusBadgeClass} text-uppercase">${u.kycStatus}</span>
                        ${u.verificationDetails?.rejectionReason ? `<div class="small text-danger mt-1" style="font-size:0.75rem;">${u.verificationDetails.rejectionReason}</div>` : ''}
                      </td>
                      <td>
                        <div class="d-flex gap-1 flex-wrap">
                          <button class="btn btn-sm btn-outline-secondary" title="View Details" onclick="window.SaveToServeAdmin.viewUserDetails('${u.id}')">
                            <i class="bi bi-eye"></i> Details
                          </button>
                          ${u.kycStatus !== 'approved' ? `
                            <button class="btn btn-sm btn-olive" title="Approve NGO" onclick="window.SaveToServeAdmin.approveUser('${u.id}')">
                              <i class="bi bi-check2"></i> Approve
                            </button>
                          ` : ''}
                          ${u.kycStatus !== 'rejected' ? `
                            <button class="btn btn-sm btn-outline-danger" title="Reject NGO" onclick="window.SaveToServeAdmin.promptRejectUser('${u.id}')">
                              <i class="bi bi-x"></i> Reject
                            </button>
                          ` : `
                            <button class="btn btn-sm btn-soft-olive" title="Reconsider Application" onclick="window.SaveToServeAdmin.reconsiderUser('${u.id}')">
                              <i class="bi bi-arrow-repeat"></i> Reconsider
                            </button>
                          `}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // 3. VOLUNTEER VERIFICATION SECTION
    if (tabName === 'volunteer-verification') {
      const filteredVols = volunteers.filter(v => {
        if (this.volFilter === 'all') return true;
        return v.kycStatus === this.volFilter;
      });

      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <div>
              <h5 class="card-title-custom"><i class="bi bi-bicycle text-success"></i> Volunteer Courier Verification</h5>
              <div class="text-muted small">Verify courier identity, transit vehicle, and background verification</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted fw-bold">Filter:</span>
              <select class="form-select form-select-sm form-select-custom" style="width: auto;" onchange="window.SaveToServeAdmin.setVolFilter(this.value)">
                <option value="all" ${this.volFilter === 'all' ? 'selected' : ''}>All Volunteers (${volunteers.length})</option>
                <option value="pending" ${this.volFilter === 'pending' ? 'selected' : ''}>Pending (${volunteers.filter(d => d.kycStatus === 'pending').length})</option>
                <option value="approved" ${this.volFilter === 'approved' ? 'selected' : ''}>Approved (${volunteers.filter(d => d.kycStatus === 'approved').length})</option>
                <option value="rejected" ${this.volFilter === 'rejected' ? 'selected' : ''}>Rejected (${volunteers.filter(d => d.kycStatus === 'rejected').length})</option>
              </select>
            </div>
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Volunteer Name</th>
                  <th>Transit Vehicle</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Verification Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredVols.map(u => {
                  const statusBadgeClass = u.kycStatus === 'approved' ? 'bg-success' : u.kycStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark';
                  return `
                    <tr>
                      <td>
                        <strong style="color:var(--dark-olive);">${u.name}</strong>
                        <div class="small text-muted">${u.address}</div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          <i class="bi bi-bicycle text-success"></i> ${u.vehicleType || 'Two-wheeler'}
                        </span>
                      </td>
                      <td>
                        <div class="small">${u.email}</div>
                        <div class="small text-muted">${u.phone}</div>
                      </td>
                      <td>
                        <span class="badge ${statusBadgeClass} text-uppercase">${u.kycStatus}</span>
                        ${u.verificationDetails?.rejectionReason ? `<div class="small text-danger mt-1" style="font-size:0.75rem;">${u.verificationDetails.rejectionReason}</div>` : ''}
                      </td>
                      <td>
                        <div class="d-flex gap-1 flex-wrap">
                          <button class="btn btn-sm btn-outline-secondary" title="View Details" onclick="window.SaveToServeAdmin.viewUserDetails('${u.id}')">
                            <i class="bi bi-eye"></i> Details
                          </button>
                          ${u.kycStatus !== 'approved' ? `
                            <button class="btn btn-sm btn-olive" title="Approve Volunteer" onclick="window.SaveToServeAdmin.approveUser('${u.id}')">
                              <i class="bi bi-check2"></i> Approve
                            </button>
                          ` : ''}
                          ${u.kycStatus !== 'rejected' ? `
                            <button class="btn btn-sm btn-outline-danger" title="Reject Volunteer" onclick="window.SaveToServeAdmin.promptRejectUser('${u.id}')">
                              <i class="bi bi-x"></i> Reject
                            </button>
                          ` : `
                            <button class="btn btn-sm btn-soft-olive" title="Reconsider Application" onclick="window.SaveToServeAdmin.reconsiderUser('${u.id}')">
                              <i class="bi bi-arrow-repeat"></i> Reconsider
                            </button>
                          `}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // 4. MANAGE DONATIONS SECTION
    if (tabName === 'manage-donations') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-shield-check text-success"></i> Manage Surplus Listings & Food Safety</h5>
            <span class="badge bg-secondary">${donations.length} Total Listings</span>
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Donor Organization</th>
                  <th>Portions</th>
                  <th>Safe Until</th>
                  <th>Status</th>
                  <th>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                ${donations.map(d => `
                  <tr>
                    <td>
                      <strong style="color:var(--dark-olive);">${d.foodName}</strong>
                      <div class="small text-muted">${d.category} • ${d.foodType.toUpperCase()}</div>
                    </td>
                    <td>${d.donorOrg}</td>
                    <td>${d.portions} meals (~${d.quantityKg} kg)</td>
                    <td>
                      <span class="small">${new Date(d.safeUntil).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td>
                      <span class="badge ${d.status === 'completed' ? 'bg-success' : d.status === 'flagged' ? 'bg-danger' : 'bg-primary'} text-uppercase">
                        ${d.status}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-1 flex-wrap">
                        ${d.status !== 'flagged' ? `
                          <button class="btn btn-sm btn-outline-warning" title="Flag listing" onclick="window.SaveToServeAdmin.flagDonation('${d.id}')">
                            <i class="bi bi-flag"></i> Flag
                          </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-danger" title="Remove listing" onclick="window.SaveToServeAdmin.removeDonation('${d.id}')">
                          <i class="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // 5. MANAGE USERS SECTION
    if (tabName === 'manage-users') {
      const filteredUsers = users.filter(u => {
        if (this.userFilter === 'all') return true;
        return u.role === this.userFilter;
      });

      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <div>
              <h5 class="card-title-custom"><i class="bi bi-people text-success"></i> Registered Platform Users</h5>
              <div class="text-muted small">Overview of all system accounts and roles</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted fw-bold">Role:</span>
              <select class="form-select form-select-sm form-select-custom" style="width: auto;" onchange="window.SaveToServeAdmin.setUserFilter(this.value)">
                <option value="all" ${this.userFilter === 'all' ? 'selected' : ''}>All Roles (${users.length})</option>
                <option value="donor" ${this.userFilter === 'donor' ? 'selected' : ''}>Donors (${donors.length})</option>
                <option value="ngo" ${this.userFilter === 'ngo' ? 'selected' : ''}>NGOs (${ngos.length})</option>
                <option value="volunteer" ${this.userFilter === 'volunteer' ? 'selected' : ''}>Volunteers (${volunteers.length})</option>
                <option value="admin" ${this.userFilter === 'admin' ? 'selected' : ''}>Admins (${users.filter(u=>u.role==='admin').length})</option>
              </select>
            </div>
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>User / Organization</th>
                  <th>Role</th>
                  <th>Email & Phone</th>
                  <th>Verification Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredUsers.map(u => `
                  <tr>
                    <td>
                      <strong style="color:var(--dark-olive);">${u.name}</strong>
                      ${u.orgName && u.orgName !== u.name ? `<div class="small text-muted">${u.orgName}</div>` : ''}
                    </td>
                    <td>
                      <span class="badge badge-${u.role}">${u.role.toUpperCase()}</span>
                    </td>
                    <td>
                      <div class="small">${u.email}</div>
                      <div class="small text-muted">${u.phone}</div>
                    </td>
                    <td>
                      <span class="badge ${u.kycStatus === 'approved' ? 'bg-success' : u.kycStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'} text-uppercase">
                        ${u.kycStatus}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-secondary" onclick="window.SaveToServeAdmin.viewUserDetails('${u.id}')">
                        <i class="bi bi-eye"></i> View
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // 6. WEATHER RESCUE EMBED
    if (tabName === 'weather-rescue') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-cloud-rain-heavy text-success"></i> Weather Rescue Operations</h5>
            <button class="btn btn-sm btn-olive" onclick="window.SaveToServeApp.navigateTo('weather-rescue')">
              <i class="bi bi-box-arrow-up-right"></i> Open Weather Rescue View
            </button>
          </div>
          <p class="text-muted small">Monitor real-time weather risk calculations, alternative dispatch corridors, and route safe holding hubs.</p>
        </div>
      `;
    }

    // 7. IMPACT DASHBOARD EMBED
    if (tabName === 'impact-dashboard') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-graph-up-arrow text-success"></i> Food Rescue Impact Dashboard</h5>
            <button class="btn btn-sm btn-olive" onclick="window.SaveToServeApp.navigateTo('impact-dashboard')">
              <i class="bi bi-box-arrow-up-right"></i> Open Full Impact Dashboard
            </button>
          </div>
          <p class="text-muted small">Track total meals rescued, kilograms of waste diverted, and carbon offset calculations.</p>
        </div>
      `;
    }

    // 8. AUDIT LOGS & REPORTS SECTION
    if (tabName === 'audit-logs') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-journal-text text-success"></i> Platform Activity & Verification Audit Trail</h5>
            <button class="btn btn-outline-secondary btn-sm" onclick="window.SaveToServeAdmin.exportAuditLogs()">
              <i class="bi bi-download"></i> Export Logs (JSON)
            </button>
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target ID</th>
                  <th>Status Event</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(log => `
                  <tr>
                    <td class="small text-muted font-monospace">${new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td><strong>${log.actor}</strong></td>
                    <td class="small">${log.action}</td>
                    <td><span class="badge bg-light text-dark border font-monospace">${log.targetId || '-'}</span></td>
                    <td><span class="badge bg-light text-dark border">${log.statusBadge}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return '';
  }

  setDonorFilter(val) {
    this.donorFilter = val;
    this.render('donor-verification');
  }

  setNgoFilter(val) {
    this.ngoFilter = val;
    this.render('ngo-verification');
  }

  setVolFilter(val) {
    this.volFilter = val;
    this.render('volunteer-verification');
  }

  setUserFilter(val) {
    this.userFilter = val;
    this.render('manage-users');
  }

  approveUser(userId) {
    const res = window.SaveToServeDB.updateKycStatus(userId, 'approved');
    if (res.success) {
      window.SaveToServeApp?.showToast(`Verification Approved for ${res.user.name}!`, 'success');
      this.render();
    } else {
      window.SaveToServeApp?.showToast(res.message, 'danger');
    }
  }

  promptRejectUser(userId) {
    const user = window.SaveToServeDB.getUserById(userId);
    if (!user) return;

    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="bi bi-x-circle text-danger me-2"></i> Reject Verification Application`;
    modalBody.innerHTML = `
      <div>
        <p class="small text-muted mb-3">
          Provide a clear, actionable reason for rejecting the verification request for <strong>${user.name}</strong> (${user.orgName || user.role}).
        </p>
        <div class="mb-3">
          <label class="form-label-custom">Rejection Reason</label>
          <select id="rejectReasonPreset" class="form-select form-select-custom mb-2">
            <option value="Incomplete or unclear documentation provided.">Incomplete or unclear documentation</option>
            <option value="Food safety license expired or invalid.">Food safety license expired / invalid</option>
            <option value="Vehicle registration details mismatch.">Vehicle registration details mismatch</option>
            <option value="Custom">Other (Type custom reason below)</option>
          </select>
          <textarea id="rejectCustomReason" class="form-control form-control-custom" rows="3" placeholder="Additional details or instructions for the user..."></textarea>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" onclick="window.SaveToServeAdmin.confirmRejectUser('${userId}')">
            Confirm Rejection
          </button>
        </div>
      </div>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  confirmRejectUser(userId) {
    const preset = document.getElementById('rejectReasonPreset')?.value;
    const custom = document.getElementById('rejectCustomReason')?.value.trim();
    const reason = (preset === 'Custom' || !preset) ? (custom || 'Document verification could not be completed.') : (custom ? `${preset} Note: ${custom}` : preset);

    const res = window.SaveToServeDB.updateKycStatus(userId, 'rejected', reason);
    
    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    }

    if (res.success) {
      window.SaveToServeApp?.showToast(`Application rejected for ${res.user.name}. Reason recorded.`, 'warning');
      this.render();
    } else {
      window.SaveToServeApp?.showToast(res.message, 'danger');
    }
  }

  reconsiderUser(userId) {
    const res = window.SaveToServeDB.updateKycStatus(userId, 'pending', '');
    if (res.success) {
      window.SaveToServeApp?.showToast(`Application reset to Pending for reconsideration.`, 'info');
      this.render();
    }
  }

  viewUserDetails(userId) {
    const user = window.SaveToServeDB.getUserById(userId);
    if (!user) return;

    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="bi bi-person-badge text-success me-2"></i> ${user.name} — Profile & Verification`;
    modalBody.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <label class="small text-muted font-weight-bold">Full Name</label>
          <div class="fw-bold text-dark">${user.name}</div>
        </div>
        <div class="col-md-6">
          <label class="small text-muted font-weight-bold">Role Type</label>
          <div><span class="badge badge-${user.role}">${user.role.toUpperCase()}</span></div>
        </div>
        <div class="col-md-6">
          <label class="small text-muted font-weight-bold">Organization</label>
          <div>${user.orgName || '-'}</div>
        </div>
        <div class="col-md-6">
          <label class="small text-muted font-weight-bold">Current KYC Status</label>
          <div><span class="badge ${user.kycStatus === 'approved' ? 'bg-success' : user.kycStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'} text-uppercase">${user.kycStatus}</span></div>
        </div>
        <div class="col-md-6">
          <label class="small text-muted font-weight-bold">Email</label>
          <div>${user.email}</div>
        </div>
        <div class="col-md-6">
          <label class="small text-muted font-weight-bold">Phone</label>
          <div>${user.phone}</div>
        </div>
        <div class="col-12">
          <label class="small text-muted font-weight-bold">Address</label>
          <div>${user.address}</div>
        </div>
      </div>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  flagDonation(donationId) {
    const d = window.SaveToServeDB.getDonationById(donationId);
    if (!d) return;
    d.status = 'flagged';
    window.SaveToServeDB.saveState();
    window.SaveToServeApp?.showToast(`Listing ${d.foodName} flagged for food safety review.`, 'warning');
    this.render('manage-donations');
  }

  removeDonation(donationId) {
    if (confirm('Are you sure you want to remove this food listing from the platform?')) {
      const idx = window.SaveToServeDB.state.donations.findIndex(x => x.id === donationId);
      if (idx !== -1) {
        window.SaveToServeDB.state.donations.splice(idx, 1);
        window.SaveToServeDB.saveState();
        window.SaveToServeApp?.showToast('Listing removed successfully.', 'info');
        this.render('manage-donations');
      }
    }
  }

  exportAuditLogs() {
    const logs = window.SaveToServeDB.getActivityLogs();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `savetoserve_audit_logs_${Date.now()}.json`);
    dlAnchor.click();
    dlAnchor.remove();
  }
}

window.SaveToServeAdmin = new AdminPortalManager();
window.RainRouteAdmin = window.SaveToServeAdmin;
