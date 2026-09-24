/**
 * RainRoute - Admin Operations & Moderation Console
 * User Management, KYC Verification Review, Donation Moderation & Audit Logs
 */

class AdminPortalManager {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('rainroute:statechange', () => {
      if (window.RainRouteApp?.currentRoute === 'admin-portal') {
        this.render();
      }
    });
  }

  render(activeTab = 'kyc-review') {
    const container = document.getElementById('admin-portal-view');
    if (!container) return;

    const user = window.RainRouteAuth.getCurrentUser();
    if (!user || user.role !== 'admin') {
      container.innerHTML = `
        <div class="container py-5 text-center">
          <div class="alert alert-danger d-inline-block px-4 py-3">
            <i class="bi bi-shield-x fs-2 d-block mb-2"></i>
            <h5>Admin Access Restricted</h5>
            <p class="mb-3">This command console requires administrative credentials.</p>
            <button class="btn btn-purple" onclick="window.RainRouteApp.navigateTo('login')">Admin Login</button>
          </div>
        </div>`;
      return;
    }

    const users = window.RainRouteDB.getUsers();
    const pendingKyc = users.filter(u => u.kycStatus === 'pending');
    const donations = window.RainRouteDB.getDonations();
    const hubs = window.RainRouteDB.getHoldingHubs();
    const logs = window.RainRouteDB.getActivityLogs();

    container.innerHTML = `
      <div class="container py-4">
        <!-- Admin Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-icon icon-amber" style="width:56px;height:56px;border-radius:16px;">
              <i class="bi bi-shield-lock-fill fs-2"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h3 class="mb-0" style="color:var(--deep-purple);">Platform Operations Command</h3>
                <span class="badge badge-admin">Master Admin</span>
              </div>
              <p class="text-muted small mb-0">System Security, Verification Pipeline, Moderation & Audit Logs</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-danger btn-sm" onclick="window.RainRouteApp.promptResetDemoData()">
              <i class="bi bi-arrow-counterclockwise"></i> Reset Demo Database
            </button>
          </div>
        </div>

        <!-- Metric Overview -->
        <div class="row g-3 mb-4">
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon icon-purple"><i class="bi bi-people"></i></div>
              <div>
                <div class="stat-value">${users.length}</div>
                <div class="stat-label">Total Users</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card ${pendingKyc.length > 0 ? 'border-warning' : ''}">
              <div class="stat-icon icon-amber"><i class="bi bi-shield-exclamation"></i></div>
              <div>
                <div class="stat-value text-warning">${pendingKyc.length}</div>
                <div class="stat-label">Pending KYC</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card stat-green">
              <div class="stat-icon icon-green"><i class="bi bi-box2-heart"></i></div>
              <div>
                <div class="stat-value">${donations.length}</div>
                <div class="stat-label">Total Listings</div>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-icon icon-blue"><i class="bi bi-snow"></i></div>
              <div>
                <div class="stat-value">${hubs.length}</div>
                <div class="stat-label">Holding Hubs</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subnav -->
        <div class="portal-subnav">
          <button class="subnav-btn ${activeTab === 'kyc-review' ? 'active' : ''}" onclick="window.RainRouteAdmin.switchTab('kyc-review')">
            <i class="bi bi-person-check"></i> KYC & Verification (${pendingKyc.length})
          </button>
          <button class="subnav-btn ${activeTab === 'manage-donations' ? 'active' : ''}" onclick="window.RainRouteAdmin.switchTab('manage-donations')">
            <i class="bi bi-grid-3x3-gap"></i> Moderate Surplus Listings (${donations.length})
          </button>
          <button class="subnav-btn ${activeTab === 'manage-users' ? 'active' : ''}" onclick="window.RainRouteAdmin.switchTab('manage-users')">
            <i class="bi bi-person-lines-fill"></i> Manage Users (${users.length})
          </button>
          <button class="subnav-btn ${activeTab === 'holding-hubs' ? 'active' : ''}" onclick="window.RainRouteAdmin.switchTab('holding-hubs')">
            <i class="bi bi-snow2"></i> Safe Holding Hubs (${hubs.length})
          </button>
          <button class="subnav-btn ${activeTab === 'audit-logs' ? 'active' : ''}" onclick="window.RainRouteAdmin.switchTab('audit-logs')">
            <i class="bi bi-journal-text"></i> Audit Logs (${logs.length})
          </button>
        </div>

        <!-- Tab Body -->
        <div id="admin-tab-content">
          ${this.renderTabContent(activeTab, users, pendingKyc, donations, hubs, logs)}
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    this.render(tabName);
  }

  renderTabContent(tabName, users, pendingKyc, donations, hubs, logs) {
    if (tabName === 'kyc-review') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-person-badge text-primary"></i> KYC & Verification Review Queue</h5>
            <span class="badge bg-warning text-dark">${pendingKyc.length} Pending Review</span>
          </div>

          <div class="alert alert-secondary py-2 small mb-4">
            <i class="bi bi-info-circle me-1"></i> <strong>SIMULATED DEMO VERIFICATION:</strong> Demo documents are fictional. Review and approve accounts to grant donation and claim permissions.
          </div>

          ${pendingKyc.length === 0 ? `
            <div class="p-4 text-center text-muted">
              <i class="bi bi-check2-all text-success fs-2 mb-2 d-block"></i>
              <p>No pending verification submissions! All registered entities are verified.</p>
            </div>
          ` : `
            <div class="table-responsive-custom">
              <table class="table-custom">
                <thead>
                  <tr>
                    <th>Organization / User</th>
                    <th>Role</th>
                    <th>Submitted Document (Simulated)</th>
                    <th>Registered At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingKyc.map(u => `
                    <tr>
                      <td>
                        <strong style="color:var(--deep-purple);">${u.orgName || u.name}</strong>
                        <div class="small text-muted">${u.email} | ${u.phone}</div>
                      </td>
                      <td><span class="badge badge-${u.role}">${u.role}</span></td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          <i class="bi bi-file-earmark-text text-primary"></i> ${u.verifiedDoc || 'Business License / NGO Registration'}
                        </span>
                      </td>
                      <td class="small text-muted">${new Date(u.registeredAt).toLocaleDateString()}</td>
                      <td>
                        <div class="d-flex gap-2">
                          <button class="btn btn-sm btn-green" onclick="window.RainRouteAdmin.approveKyc('${u.id}')">
                            <i class="bi bi-check2"></i> Approve
                          </button>
                          <button class="btn btn-sm btn-outline-danger" onclick="window.RainRouteAdmin.rejectKyc('${u.id}')">
                            <i class="bi bi-x"></i> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `;
    }

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
                          <button class="btn btn-sm btn-outline-warning" title="Flag as potentially unsafe" onclick="window.RainRouteAdmin.flagDonation('${d.id}')">
                            <i class="bi bi-flag"></i> Flag
                          </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-danger" title="Remove listing" onclick="window.RainRouteAdmin.removeDonation('${d.id}')">
                          <i class="bi bi-trash"></i>
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

    if (tabName === 'manage-users') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-people text-primary"></i> Registered Platform Users</h5>
            <span class="badge bg-light text-dark border">${users.length} Users</span>
          </div>

          <div class="table-responsive-custom">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>User / Organization</th>
                  <th>Role</th>
                  <th>Phone / Email</th>
                  <th>Address</th>
                  <th>KYC Status</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td>
                      <strong>${u.name}</strong>
                      ${u.orgName ? `<div class="small text-muted">${u.orgName}</div>` : ''}
                    </td>
                    <td><span class="badge badge-${u.role}">${u.role}</span></td>
                    <td class="small">
                      <div>${u.email}</div>
                      <div class="text-muted">${u.phone}</div>
                    </td>
                    <td class="small text-muted">${u.address || 'Bengaluru'}</td>
                    <td>
                      <span class="badge ${u.kycStatus === 'approved' ? 'bg-success' : u.kycStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'} text-uppercase">
                        ${u.kycStatus}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tabName === 'holding-hubs') {
      return window.RainRouteHubs ? window.RainRouteHubs.renderHubsManagementView() : '<div class="p-4">Hubs Loaded</div>';
    }

    if (tabName === 'audit-logs') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-journal-text text-primary"></i> Immutable Platform Activity & Audit Logs</h5>
            <button class="btn btn-outline-primary btn-sm" onclick="window.RainRouteAdmin.exportAuditLogs()">
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

  approveKyc(userId) {
    const res = window.RainRouteDB.updateUserKyc(userId, 'approved');
    if (res) {
      window.RainRouteApp?.showToast('Account verification approved!', 'success');
      this.render('kyc-review');
    }
  }

  rejectKyc(userId) {
    const res = window.RainRouteDB.updateUserKyc(userId, 'rejected');
    if (res) {
      window.RainRouteApp?.showToast('Account verification rejected.', 'warning');
      this.render('kyc-review');
    }
  }

  flagDonation(id) {
    if (confirm('Flag this surplus food listing as potentially unsafe for review?')) {
      window.RainRouteDB.updateDonation(id, { status: 'flagged' });
      window.RainRouteDB.logActivity('Admin Moderation Desk', `Flagged donation ${id} as unsafe`, id, 'Listing Flagged');
      window.RainRouteApp?.showToast('Donation flagged as unsafe and hidden from browse results.', 'warning');
      this.render('manage-donations');
    }
  }

  removeDonation(id) {
    if (confirm('Permanently remove this surplus listing from the platform?')) {
      const idx = window.RainRouteDB.state.donations.findIndex(d => d.id === id);
      if (idx !== -1) {
        window.RainRouteDB.state.donations.splice(idx, 1);
        window.RainRouteDB.saveState();
        window.RainRouteDB.logActivity('Admin Moderation Desk', `Removed donation listing ${id}`, id, 'Listing Removed');
        window.RainRouteApp?.showToast('Listing removed successfully.', 'info');
        this.render('manage-donations');
      }
    }
  }

  exportAuditLogs() {
    const logs = window.RainRouteDB.getActivityLogs();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rainroute_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

window.RainRouteAdmin = new AdminPortalManager();
