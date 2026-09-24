/**
 * Save to Serve - Admin Operations & User Verification Command Console
 * Full Verification Dashboard for Donors & Volunteers with Filter, Reasoned Rejection & Reconsideration
 */

class AdminPortalManager {
  constructor() {
    this.donorFilter = 'all'; // 'all' | 'pending' | 'approved' | 'rejected'
    this.volFilter = 'all';
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
            <h5 class="fw-bold">Admin Command Access Restricted</h5>
            <p class="mb-3 text-muted">This verification command console requires administrative credentials.</p>
            <button class="btn btn-purple" onclick="window.SaveToServeApp.navigateTo('login')">Admin Login</button>
          </div>
        </div>`;
      return;
    }

    const users = window.SaveToServeDB.getUsers();
    const donors = users.filter(u => u.role === 'donor');
    const volunteers = users.filter(u => u.role === 'volunteer');
    const pendingDonors = donors.filter(u => u.kycStatus === 'pending');
    const pendingVols = volunteers.filter(u => u.kycStatus === 'pending');
    const donations = window.SaveToServeDB.getDonations();
    const hubs = window.SaveToServeDB.getHoldingHubs();
    const logs = window.SaveToServeDB.getActivityLogs();

    container.innerHTML = `
      <div class="container py-4">
        <!-- Admin Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-icon icon-amber" style="width:54px;height:54px;border-radius:14px;">
              <i class="bi bi-shield-lock-fill fs-2"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h3 class="mb-0 fw-bold" style="color:var(--deep-purple);">Admin Verification Command</h3>
                <span class="badge badge-admin">Master Admin</span>
              </div>
              <p class="text-muted small mb-0">Manage and verify registered Donors & Volunteers with full audit tracking</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-danger btn-sm" onclick="window.SaveToServeApp.promptResetDemoData()">
              <i class="bi bi-arrow-counterclockwise"></i> Reset Demo Database
            </button>
          </div>
        </div>

        <!-- Metric Overview -->
        <div class="row g-3 mb-4">
          <div class="col-lg-3 col-6">
            <div class="stat-card">
              <div class="stat-icon icon-purple"><i class="bi bi-shop"></i></div>
              <div>
                <div class="stat-value">${donors.length}</div>
                <div class="stat-label">Total Donors (${pendingDonors.length} Pending)</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <div class="stat-card stat-green">
              <div class="stat-icon icon-green"><i class="bi bi-bicycle"></i></div>
              <div>
                <div class="stat-value">${volunteers.length}</div>
                <div class="stat-label">Volunteers (${pendingVols.length} Pending)</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <div class="stat-card">
              <div class="stat-icon icon-blue"><i class="bi bi-box2-heart"></i></div>
              <div>
                <div class="stat-value">${donations.length}</div>
                <div class="stat-label">Surplus Listings</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-6">
            <div class="stat-card">
              <div class="stat-icon icon-amber"><i class="bi bi-snow"></i></div>
              <div>
                <div class="stat-value">${hubs.length}</div>
                <div class="stat-label">Safe Holding Hubs</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dedicated Verification Subnav -->
        <div class="portal-subnav">
          <button class="subnav-btn ${activeTab === 'donor-verification' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('donor-verification')">
            <i class="bi bi-shop-window"></i> Donor Verification (${pendingDonors.length > 0 ? `<span class="badge bg-warning text-dark">${pendingDonors.length}</span>` : donors.length})
          </button>
          <button class="subnav-btn ${activeTab === 'volunteer-verification' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('volunteer-verification')">
            <i class="bi bi-person-check"></i> Volunteer Verification (${pendingVols.length > 0 ? `<span class="badge bg-warning text-dark">${pendingVols.length}</span>` : volunteers.length})
          </button>
          <button class="subnav-btn ${activeTab === 'manage-donations' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('manage-donations')">
            <i class="bi bi-grid-3x3-gap"></i> Moderate Listings (${donations.length})
          </button>
          <button class="subnav-btn ${activeTab === 'holding-hubs' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('holding-hubs')">
            <i class="bi bi-snow2"></i> Holding Hubs (${hubs.length})
          </button>
          <button class="subnav-btn ${activeTab === 'audit-logs' ? 'active' : ''}" onclick="window.SaveToServeAdmin.switchTab('audit-logs')">
            <i class="bi bi-journal-text"></i> Audit Logs (${logs.length})
          </button>
        </div>

        <!-- Tab Body -->
        <div id="admin-tab-content">
          ${this.renderTabContent(activeTab, donors, volunteers, donations, hubs, logs)}
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    this.render(tabName);
  }

  renderTabContent(tabName, donors, volunteers, donations, hubs, logs) {
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
              <h5 class="card-title-custom"><i class="bi bi-shop text-primary"></i> Donor Kitchen & Food Safety Verification</h5>
              <div class="text-muted small">Verify restaurant food safety licenses (FSSAI) to authorize surplus food listing rights</div>
            </div>
            <!-- Status Filter -->
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

          <div class="alert alert-secondary py-2 small mb-3">
            <i class="bi bi-shield-check text-success me-1"></i> <strong>SIMULATED DEMO VERIFICATION:</strong> Approving or rejecting a donor immediately grants or restricts their surplus donation publishing rights.
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Donor Organization</th>
                  <th>Contact Details</th>
                  <th>Submitted Document (Demo)</th>
                  <th>Registered</th>
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
                        <strong style="color:var(--deep-purple);">${u.orgName || u.name}</strong>
                        <div class="small text-muted"><i class="bi bi-person"></i> ${u.name}</div>
                      </td>
                      <td>
                        <div class="small">${u.email}</div>
                        <div class="small text-muted">${u.phone}</div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          <i class="bi bi-file-earmark-check text-primary"></i> ${u.verificationDetails?.docType || u.verifiedDoc || 'FSSAI License'}
                        </span>
                        <div class="small text-muted font-monospace">${u.verificationDetails?.docNumber || '#KA-2026-FSSAI'}</div>
                      </td>
                      <td class="small text-muted">${new Date(u.registeredAt).toLocaleDateString()}</td>
                      <td>
                        <span class="badge ${statusBadgeClass} text-uppercase">${u.kycStatus}</span>
                        ${u.verificationDetails?.rejectionReason ? `<div class="small text-danger" style="font-size:0.75rem;">${u.verificationDetails.rejectionReason}</div>` : ''}
                      </td>
                      <td>
                        <div class="d-flex gap-1">
                          <button class="btn btn-sm btn-outline-secondary" title="View Full Details" onclick="window.SaveToServeAdmin.viewUserDetails('${u.id}')">
                            <i class="bi bi-eye"></i> Details
                          </button>
                          ${u.kycStatus !== 'approved' ? `
                            <button class="btn btn-sm btn-green" title="Approve Verification" onclick="window.SaveToServeAdmin.approveUser('${u.id}')">
                              <i class="bi bi-check2"></i> Approve
                            </button>
                          ` : ''}
                          ${u.kycStatus !== 'rejected' ? `
                            <button class="btn btn-sm btn-outline-danger" title="Reject Request" onclick="window.SaveToServeAdmin.promptRejectUser('${u.id}')">
                              <i class="bi bi-x"></i> Reject
                            </button>
                          ` : `
                            <button class="btn btn-sm btn-outline-warning" title="Reconsider Application" onclick="window.SaveToServeAdmin.reconsiderUser('${u.id}')">
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

    // 2. VOLUNTEER VERIFICATION SECTION
    if (tabName === 'volunteer-verification') {
      const filteredVols = volunteers.filter(v => {
        if (this.volFilter === 'all') return true;
        return v.kycStatus === this.volFilter;
      });

      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <div>
              <h5 class="card-title-custom"><i class="bi bi-bicycle text-primary"></i> Volunteer Rescue Courier Verification</h5>
              <div class="text-muted small">Verify identity & safe food handling clearance for couriers before assigning pickup tasks</div>
            </div>
            <!-- Status Filter -->
            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted fw-bold">Filter:</span>
              <select class="form-select form-select-sm form-select-custom" style="width: auto;" onchange="window.SaveToServeAdmin.setVolFilter(this.value)">
                <option value="all" ${this.volFilter === 'all' ? 'selected' : ''}>All Volunteers (${volunteers.length})</option>
                <option value="pending" ${this.volFilter === 'pending' ? 'selected' : ''}>Pending (${volunteers.filter(v => v.kycStatus === 'pending').length})</option>
                <option value="approved" ${this.volFilter === 'approved' ? 'selected' : ''}>Approved (${volunteers.filter(v => v.kycStatus === 'approved').length})</option>
                <option value="rejected" ${this.volFilter === 'rejected' ? 'selected' : ''}>Rejected (${volunteers.filter(v => v.kycStatus === 'rejected').length})</option>
              </select>
            </div>
          </div>

          <div class="alert alert-secondary py-2 small mb-3">
            <i class="bi bi-shield-check text-success me-1"></i> <strong>COURIER SAFETY PROTOCOL:</strong> Approved volunteers receive pickup task alerts and can verify donor handoffs.
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Volunteer Name</th>
                  <th>Vehicle & Contact</th>
                  <th>Safety Document (Demo)</th>
                  <th>Registered</th>
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
                        <strong style="color:var(--deep-purple);">${u.name}</strong>
                        <div class="small text-muted">${u.address || 'Bengaluru'}</div>
                      </td>
                      <td>
                        <div><i class="bi bi-truck-front text-primary"></i> ${u.vehicleType || 'Two-Wheeler'}</div>
                        <div class="small text-muted">${u.phone}</div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          <i class="bi bi-card-checklist text-primary"></i> ${u.verificationDetails?.docType || u.verifiedDoc || 'Safety Training Card'}
                        </span>
                        <div class="small text-muted font-monospace">${u.verificationDetails?.docNumber || '#VOL-ID-2026'}</div>
                      </td>
                      <td class="small text-muted">${new Date(u.registeredAt).toLocaleDateString()}</td>
                      <td>
                        <span class="badge ${statusBadgeClass} text-uppercase">${u.kycStatus}</span>
                        ${u.verificationDetails?.rejectionReason ? `<div class="small text-danger" style="font-size:0.75rem;">${u.verificationDetails.rejectionReason}</div>` : ''}
                      </td>
                      <td>
                        <div class="d-flex gap-1">
                          <button class="btn btn-sm btn-outline-secondary" title="View Full Details" onclick="window.SaveToServeAdmin.viewUserDetails('${u.id}')">
                            <i class="bi bi-eye"></i> Details
                          </button>
                          ${u.kycStatus !== 'approved' ? `
                            <button class="btn btn-sm btn-green" title="Approve Verification" onclick="window.SaveToServeAdmin.approveUser('${u.id}')">
                              <i class="bi bi-check2"></i> Approve
                            </button>
                          ` : ''}
                          ${u.kycStatus !== 'rejected' ? `
                            <button class="btn btn-sm btn-outline-danger" title="Reject Request" onclick="window.SaveToServeAdmin.promptRejectUser('${u.id}')">
                              <i class="bi bi-x"></i> Reject
                            </button>
                          ` : `
                            <button class="btn btn-sm btn-outline-warning" title="Reconsider Application" onclick="window.SaveToServeAdmin.reconsiderUser('${u.id}')">
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

    // 3. LISTINGS MODERATION SECTION
    if (tabName === 'manage-donations') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-shield-check text-primary"></i> Moderate Surplus Listings & Food Safety</h5>
            <span class="badge bg-secondary">${donations.length} Listings</span>
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Donor</th>
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
                      <strong style="color:var(--deep-purple);">${d.foodName}</strong>
                      <div class="small text-muted">ID: ${d.id} | ${d.category}</div>
                    </td>
                    <td>${d.donorOrg}</td>
                    <td>${d.portions} meals</td>
                    <td>
                      <span class="small">${new Date(d.safeUntil).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td>
                      <span class="badge ${d.status === 'completed' ? 'bg-success' : d.status === 'flagged' ? 'bg-danger' : 'bg-primary'} text-uppercase">
                        ${d.status}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        ${d.status !== 'flagged' ? `
                          <button class="btn btn-sm btn-outline-warning" title="Flag as potentially unsafe" onclick="window.SaveToServeAdmin.flagDonation('${d.id}')">
                            <i class="bi bi-flag"></i> Flag
                          </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-danger" title="Remove listing" onclick="window.SaveToServeAdmin.removeDonation('${d.id}')">
                          <i class="bi bi-trash"></i> Remove
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

    // 4. HOLDING HUBS
    if (tabName === 'holding-hubs') {
      return window.SaveToServeHubs ? window.SaveToServeHubs.renderHubsManagementView() : '<div class="p-4">Hubs Loaded</div>';
    }

    // 5. AUDIT LOGS
    if (tabName === 'audit-logs') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-journal-text text-primary"></i> Platform Activity & Verification Audit Trail</h5>
            <button class="btn btn-outline-primary btn-sm" onclick="window.SaveToServeAdmin.exportAuditLogs()">
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
                    <td><span class="badge bg-soft-purple text-dark">${log.statusBadge}</span></td>
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

  setVolFilter(val) {
    this.volFilter = val;
    this.render('volunteer-verification');
  }

  approveUser(userId) {
    const user = window.SaveToServeDB.getUserById(userId);
    if (!user) return;

    const res = window.SaveToServeDB.updateUserVerification(userId, 'approved');
    if (res) {
      window.SaveToServeApp?.showToast(`Verification APPROVED for ${user.name} (${user.role.toUpperCase()})!`, 'success');
      this.render(user.role === 'donor' ? 'donor-verification' : 'volunteer-verification');
    }
  }

  promptRejectUser(userId) {
    const user = window.SaveToServeDB.getUserById(userId);
    if (!user) return;

    const reason = prompt(`Enter rejection reason for ${user.name}:`, 'Incomplete safety documentation or invalid license format.');
    if (reason !== null) {
      const res = window.SaveToServeDB.updateUserVerification(userId, 'rejected', reason.trim());
      if (res) {
        window.SaveToServeApp?.showToast(`Verification REJECTED for ${user.name}.`, 'warning');
        this.render(user.role === 'donor' ? 'donor-verification' : 'volunteer-verification');
      }
    }
  }

  reconsiderUser(userId) {
    const user = window.SaveToServeDB.getUserById(userId);
    if (!user) return;

    const res = window.SaveToServeDB.updateUserVerification(userId, 'pending', 'Re-evaluating submission credentials');
    if (res) {
      window.SaveToServeApp?.showToast(`Account for ${user.name} moved back to PENDING review.`, 'info');
      this.render(user.role === 'donor' ? 'donor-verification' : 'volunteer-verification');
    }
  }

  viewUserDetails(userId) {
    const user = window.SaveToServeDB.getUserById(userId);
    if (!user) return;

    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="bi bi-person-badge text-primary me-2"></i> User Verification Dossier`;
    modalBody.innerHTML = `
      <div>
        <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <div>
            <h5 class="fw-bold mb-0" style="color:var(--deep-purple);">${user.name}</h5>
            <div class="text-muted small">${user.orgName || user.role.toUpperCase()}</div>
          </div>
          <span class="badge ${user.kycStatus === 'approved' ? 'bg-success' : user.kycStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'} fs-6 text-uppercase">
            ${user.kycStatus}
          </span>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <div class="p-3 bg-light rounded border small">
              <div class="text-muted fw-bold mb-1">Account & Role:</div>
              <div><strong>Role:</strong> <span class="badge badge-${user.role}">${user.role.toUpperCase()}</span></div>
              <div><strong>Email:</strong> ${user.email}</div>
              <div><strong>Phone:</strong> ${user.phone}</div>
              <div><strong>Address:</strong> ${user.address || 'Bengaluru'}</div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 bg-light rounded border small">
              <div class="text-muted fw-bold mb-1">Submitted Credentials (Demo):</div>
              <div><strong>Document Type:</strong> ${user.verificationDetails?.docType || user.verifiedDoc || 'License'}</div>
              <div><strong>Doc Number:</strong> <span class="font-monospace">${user.verificationDetails?.docNumber || 'DOC-2026'}</span></div>
              <div><strong>Submitted:</strong> ${new Date(user.verificationDetails?.submittedAt || user.registeredAt).toLocaleString()}</div>
              ${user.verificationDetails?.rejectionReason ? `<div class="text-danger mt-1"><strong>Rejection Note:</strong> ${user.verificationDetails.rejectionReason}</div>` : ''}
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 pt-2 border-top">
          ${user.kycStatus !== 'approved' ? `
            <button class="btn btn-green btn-sm" onclick="window.SaveToServeAdmin.approveUser('${user.id}'); bootstrap.Modal.getInstance(document.getElementById('globalModal')).hide();">
              <i class="bi bi-check2"></i> Approve User
            </button>
          ` : ''}
          ${user.kycStatus !== 'rejected' ? `
            <button class="btn btn-outline-danger btn-sm" onclick="bootstrap.Modal.getInstance(document.getElementById('globalModal')).hide(); window.SaveToServeAdmin.promptRejectUser('${user.id}');">
              <i class="bi bi-x"></i> Reject User
            </button>
          ` : ''}
        </div>
      </div>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  flagDonation(id) {
    if (confirm('Flag this surplus food listing as potentially unsafe for review?')) {
      window.SaveToServeDB.updateDonation(id, { status: 'flagged' });
      window.SaveToServeDB.logActivity('Admin Moderation Desk', `Flagged donation ${id} as unsafe`, id, 'Listing Flagged');
      window.SaveToServeApp?.showToast('Donation flagged as unsafe and hidden from browse results.', 'warning');
      this.render('manage-donations');
    }
  }

  removeDonation(id) {
    if (confirm('Permanently remove this surplus listing from the platform?')) {
      const idx = window.SaveToServeDB.state.donations.findIndex(d => d.id === id);
      if (idx !== -1) {
        window.SaveToServeDB.state.donations.splice(idx, 1);
        window.SaveToServeDB.saveState();
        window.SaveToServeDB.logActivity('Admin Moderation Desk', `Removed donation listing ${id}`, id, 'Listing Removed');
        window.SaveToServeApp?.showToast('Listing removed successfully.', 'info');
        this.render('manage-donations');
      }
    }
  }

  exportAuditLogs() {
    const logs = window.SaveToServeDB.getActivityLogs();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `savetoserve_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

window.SaveToServeAdmin = new AdminPortalManager();
window.RainRouteAdmin = window.SaveToServeAdmin;
