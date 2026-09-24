/**
 * Save to Serve - Volunteer Rescue Portal Logic
 * Available Rescue Tasks, Acceptance, Secure Code Handoff & Task History
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class VolunteerPortalManager {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('savetoserve:statechange', () => {
      if (window.SaveToServeApp?.currentRoute === 'volunteer-portal') {
        this.render();
      }
    });
  }

  render(activeTab = 'active-tasks') {
    const container = document.getElementById('volunteer-portal-view');
    if (!container) return;

    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user || user.role !== 'volunteer') {
      container.innerHTML = `
        <div class="container py-5 text-center">
          <div class="alert alert-danger d-inline-block px-4 py-3 shadow-sm">
            <i class="bi bi-bicycle fs-2 d-block mb-2 text-danger"></i>
            <h5 class="fw-bold">Volunteer Access Required</h5>
            <p class="mb-3 text-muted">Please log in as a registered rescue volunteer to view tasks.</p>
            <button class="btn btn-purple" onclick="window.SaveToServeApp.navigateTo('login')">Go to Login</button>
          </div>
        </div>`;
      return;
    }

    const allDonations = window.SaveToServeDB.getDonations();
    const availableTasks = allDonations.filter(d => d.status === 'claimed' && !d.assignedVolunteerId);
    const myAssignedTasks = allDonations.filter(d => (d.assignedVolunteerId === user.id || (!d.assignedVolunteerId && d.status === 'claimed')) && ['claimed', 'in-transit'].includes(d.status));
    const completedTasks = allDonations.filter(d => (d.assignedVolunteerId === user.id || d.assignedVolunteerName === user.name) && d.status === 'completed');
    const isApproved = user.kycStatus === 'approved';

    container.innerHTML = `
      <div class="container py-4">
        <!-- Verification Banner if not approved -->
        ${!isApproved ? `
          <div class="alert ${user.kycStatus === 'rejected' ? 'alert-danger' : 'alert-warning'} d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 shadow-sm">
            <div class="d-flex align-items-center gap-2">
              <i class="bi ${user.kycStatus === 'rejected' ? 'bi-x-octagon-fill' : 'bi-hourglass-split'} fs-4"></i>
              <div>
                <strong>Volunteer Verification Status: <span class="text-uppercase">${user.kycStatus}</span></strong>
                <div class="small">${user.kycStatus === 'rejected' ? `Rejection reason: "${user.verificationDetails?.rejectionReason || 'Please resubmit training documents'}"` : 'Your volunteer credentials are pending admin review. You can accept tasks once approved.'}</div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-dark" onclick="window.SaveToServeVolunteer.switchTab('kyc')">
              View Safety Dossier
            </button>
          </div>
        ` : ''}

        <!-- Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-icon icon-blue" style="width:54px;height:54px;border-radius:14px;">
              <i class="bi bi-bicycle fs-2"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <h3 class="mb-0 fw-bold" style="color:var(--deep-purple);">${user.name}</h3>
                <span class="badge ${isApproved ? 'badge-volunteer' : user.kycStatus === 'rejected' ? 'bg-danger text-white' : 'badge-admin'}">
                  ${isApproved ? '✓ Certified Food Courier' : user.kycStatus === 'rejected' ? '✕ Verification Rejected' : '⏳ Verification Pending'}
                </span>
              </div>
              <p class="text-muted small mb-0"><i class="bi bi-truck-front"></i> ${user.vehicleType || 'Two-Wheeler (Insulated Box)'} | ${user.phone}</p>
            </div>
          </div>
          <div>
            <span class="badge bg-light text-dark border p-2">
              <i class="bi bi-shield-check text-success"></i> Safe Food Handling Protocol
            </span>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-4 col-6">
            <div class="stat-card">
              <div class="stat-icon icon-purple"><i class="bi bi-bell-fill"></i></div>
              <div>
                <div class="stat-value">${availableTasks.length}</div>
                <div class="stat-label">Open Pickup Requests</div>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-6">
            <div class="stat-card stat-green">
              <div class="stat-icon icon-green"><i class="bi bi-box-seam"></i></div>
              <div>
                <div class="stat-value">${myAssignedTasks.length}</div>
                <div class="stat-label">My Active Tasks</div>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-12">
            <div class="stat-card">
              <div class="stat-icon icon-blue"><i class="bi bi-award-fill text-warning"></i></div>
              <div>
                <div class="stat-value">${completedTasks.length}</div>
                <div class="stat-label">Completed Deliveries</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Subnav -->
        <div class="portal-subnav">
          <button class="subnav-btn ${activeTab === 'active-tasks' ? 'active' : ''}" onclick="window.SaveToServeVolunteer.switchTab('active-tasks')">
            <i class="bi bi-pin-map-fill"></i> Active Pickups & Verification (${myAssignedTasks.length})
          </button>
          <button class="subnav-btn ${activeTab === 'available-tasks' ? 'active' : ''}" onclick="window.SaveToServeVolunteer.switchTab('available-tasks')">
            <i class="bi bi-plus-circle"></i> Browse Available Tasks (${availableTasks.length})
          </button>
          <button class="subnav-btn ${activeTab === 'history' ? 'active' : ''}" onclick="window.SaveToServeVolunteer.switchTab('history')">
            <i class="bi bi-clock-history"></i> Rescue History (${completedTasks.length})
          </button>
          <button class="subnav-btn ${activeTab === 'kyc' ? 'active' : ''}" onclick="window.SaveToServeVolunteer.switchTab('kyc')">
            <i class="bi bi-shield-check"></i> Verification Status
          </button>
        </div>

        <!-- Tab Content -->
        <div id="volunteer-tab-content">
          ${this.renderTabContent(activeTab, myAssignedTasks, availableTasks, completedTasks, user, isApproved)}
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    this.render(tabName);
  }

  renderTabContent(tabName, myAssignedTasks, availableTasks, completedTasks, user, isApproved) {
    if (tabName === 'available-tasks') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-plus-circle text-primary"></i> Open Food Rescue Pickup Tasks</h5>
            <span class="badge bg-light text-dark border">Immediate Transit Needed</span>
          </div>

          ${availableTasks.length === 0 ? `
            <div class="p-4 text-center text-muted">
              <i class="bi bi-check-circle fs-2 text-success mb-2 d-block"></i>
              <p>No open unassigned pickups right now. Check back soon or view active tasks!</p>
            </div>
          ` : `
            <div class="row g-3">
              ${availableTasks.map(d => `
                <div class="col-lg-6">
                  <div class="p-3 border rounded h-100" style="background:#FAF9FC;">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h6 class="fw-bold mb-0" style="color:var(--deep-purple);">${d.foodName}</h6>
                      <span class="badge badge-expiry-warning">⏰ Safe until ${new Date(d.safeUntil).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>

                    <div class="small mb-3">
                      <div class="text-muted"><i class="bi bi-shop text-primary"></i> Pickup: <strong>${d.donorOrg}</strong> (${d.donorAddress})</div>
                      <div class="text-muted"><i class="bi bi-building text-success"></i> Deliver to: <strong>${d.claimedByNgoName}</strong></div>
                      <div class="text-muted"><i class="bi bi-box"></i> Quantity: <strong>${d.portions} meals (~${d.quantityKg} kg)</strong></div>
                    </div>

                    <button class="btn btn-purple btn-sm w-100" onclick="window.SaveToServeVolunteer.acceptTask('${d.id}')" ${!isApproved ? 'disabled title="Volunteer verification required"' : ''}>
                      <i class="bi bi-check2"></i> Accept Pickup Task
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }

    if (tabName === 'history') {
      return `
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-clock-history text-primary"></i> Volunteer Rescue Mission History</h5>
            <span class="badge bg-success">${completedTasks.length} Completed</span>
          </div>

          ${completedTasks.length === 0 ? `
            <div class="p-4 text-center text-muted">
              <i class="bi bi-trophy fs-2 mb-2 d-block"></i>
              <p>Your completed rescue missions will appear here.</p>
            </div>
          ` : `
            <div class="table-responsive-custom">
              <table class="table-custom">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Donor & NGO</th>
                    <th>Portions</th>
                    <th>Completed At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${completedTasks.map(d => `
                    <tr>
                      <td class="fw-bold">${d.foodName}</td>
                      <td>
                        <div><small class="text-muted">From:</small> ${d.donorOrg}</div>
                        <div><small class="text-muted">To:</small> ${d.claimedByNgoName || 'Community'}</div>
                      </td>
                      <td><strong>${d.portions} portions</strong></td>
                      <td>${new Date(d.distributionTimestamp || d.pickupTimestamp || d.createdAt).toLocaleDateString()} ${new Date(d.distributionTimestamp || d.pickupTimestamp || d.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                      <td><span class="badge bg-success">Rescued & Delivered</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `;
    }

    if (tabName === 'kyc') {
      return window.SaveToServeKYC ? window.SaveToServeKYC.renderView(user) : '<div class="p-4">KYC Module Loaded</div>';
    }

    // Default: active-tasks
    return `
      <div class="custom-card">
        <div class="custom-card-header">
          <h5 class="card-title-custom"><i class="bi bi-truck text-primary"></i> Active Pickup & Secure Verification</h5>
          <span class="badge bg-light text-dark border">Transit Phase</span>
        </div>

        ${myAssignedTasks.length === 0 ? `
          <div class="p-4 text-center text-muted">
            <i class="bi bi-bicycle fs-1 mb-2 d-block text-secondary"></i>
            <h5 class="fw-bold">No Active Pickups In Progress</h5>
            <p class="small">You currently have no active deliveries. Browse available tasks to start a rescue mission!</p>
            <button class="btn btn-purple btn-sm" onclick="window.SaveToServeVolunteer.switchTab('available-tasks')">
              Browse Open Tasks
            </button>
          </div>
        ` : `
          <div class="row g-3">
            ${myAssignedTasks.map(d => `
              <div class="col-lg-6">
                <div class="p-3 border rounded h-100" style="background:#FAF9FC; border-color:var(--light-purple)!important;">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="fw-bold mb-0" style="color:var(--deep-purple);">${d.foodName}</h6>
                    <span class="badge ${d.status === 'in-transit' ? 'bg-primary' : 'bg-warning text-dark'} text-uppercase">
                      ${d.status === 'in-transit' ? '🚚 In Transit' : '⏳ Awaiting Pickup'}
                    </span>
                  </div>

                  <div class="p-2 bg-white rounded border small mb-3">
                    <div><strong>🏢 Pickup:</strong> ${d.donorOrg} (${d.donorAddress})</div>
                    <div><strong>📞 Donor Phone:</strong> ${d.donorPhone}</div>
                    <hr class="my-1">
                    <div><strong>🏠 Destination:</strong> ${d.claimedByNgoName}</div>
                    <div><strong>📦 Quantity:</strong> ${d.portions} portions (${d.category})</div>
                    <div><strong>⏰ Deadline:</strong> ${new Date(d.safeUntil).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  </div>

                  ${d.status === 'claimed' ? `
                    <div class="p-2 rounded mb-2" style="background:var(--pastel-lavender);">
                      <div class="small fw-bold mb-1" style="color:var(--deep-purple);">Step 1: Confirm Pickup with Donor Code</div>
                      <div class="input-group">
                        <input type="text" id="pickupCodeInput-${d.id}" class="form-control form-control-sm font-monospace" placeholder="Enter Donor's Code (e.g. ${d.pickupCode})">
                        <button class="btn btn-sm btn-purple" onclick="window.SaveToServeVolunteer.confirmPickupCode('${d.id}')">
                          Verify & Start Transit
                        </button>
                      </div>
                      <div class="text-muted" style="font-size:0.75rem; margin-top:4px;">
                        <em>Demo helper: The donor's code is <strong>${d.pickupCode}</strong></em>
                      </div>
                    </div>
                  ` : `
                    <div class="p-2 rounded mb-2 bg-light border">
                      <div class="small text-success fw-bold mb-1"><i class="bi bi-check-circle-fill"></i> Food Picked Up Safely</div>
                      <div class="small text-muted mb-2">You are en route to ${d.claimedByNgoName}. Please ensure thermal containers remain closed during transit.</div>
                      <button class="btn btn-sm btn-green w-100" onclick="window.SaveToServeVolunteer.markDeliveredToNGO('${d.id}')">
                        <i class="bi bi-box-arrow-in-down"></i> Mark Handed Over to NGO
                      </button>
                    </div>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  acceptTask(donationId) {
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user) return;

    if (user.kycStatus !== 'approved') {
      window.SaveToServeApp?.showToast('Verification required to accept tasks.', 'warning');
      return;
    }

    const res = window.SaveToServeDB.acceptVolunteerTask(donationId, user);
    if (res.success) {
      window.SaveToServeApp?.showToast(`Task accepted! Proceed to ${res.donation.donorOrg} for pickup.`, 'success');
      this.switchTab('active-tasks');
    } else {
      window.SaveToServeApp?.showToast(res.message, 'danger');
    }
  }

  confirmPickupCode(donationId) {
    const input = document.getElementById(`pickupCodeInput-${donationId}`);
    if (!input) return;

    const code = input.value.trim();
    if (!code) {
      window.SaveToServeApp?.showToast('Please enter the donor pickup verification code.', 'warning');
      return;
    }

    const res = window.SaveToServeDB.confirmPickup(donationId, code);
    if (res.success) {
      window.SaveToServeApp?.showToast('Pickup verified! Status changed to In-Transit.', 'success');
      this.render('active-tasks');
    } else {
      window.SaveToServeApp?.showToast(res.message, 'danger');
    }
  }

  markDeliveredToNGO(donationId) {
    const donation = window.SaveToServeDB.getDonationById(donationId);
    if (!donation) return;

    window.SaveToServeDB.logActivity(window.SaveToServeAuth.getCurrentUser().name, `Arrived at ${donation.claimedByNgoName} with ${donation.foodName}`, donation.id, 'Arrived');
    window.SaveToServeApp?.showToast(`Arrived at ${donation.claimedByNgoName}. Awaiting NGO distribution confirmation!`, 'info');
    this.render('active-tasks');
  }
}

window.SaveToServeVolunteer = new VolunteerPortalManager();
window.RainRouteVolunteer = window.SaveToServeVolunteer;
