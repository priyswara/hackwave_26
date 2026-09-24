/**
 * RainRoute - Account Verification (Simulated KYC)
 * Upload Demo Business/NGO Documents, Status Badges & Admin Pipeline
 */

class KycManager {
  renderView(user) {
    const isApproved = user.kycStatus === 'approved';
    const isPending = user.kycStatus === 'pending';
    const isRejected = user.kycStatus === 'rejected';

    return `
      <div class="custom-card">
        <div class="custom-card-header">
          <h5 class="card-title-custom"><i class="bi bi-shield-check text-primary"></i> Account Verification & KYC Status</h5>
          <span class="badge ${isApproved ? 'bg-success' : isPending ? 'bg-warning text-dark' : 'bg-danger'} text-uppercase">
            ${user.kycStatus}
          </span>
        </div>

        <div class="alert alert-secondary py-2 small mb-4">
          <i class="bi bi-shield-exclamation text-primary me-1"></i> <strong>SIMULATED DEMO VERIFICATION:</strong> Fictional demonstration documents only. No actual legal or government identity documentation is collected or claimed.
        </div>

        <div class="row g-4 mb-4">
          <div class="col-lg-6">
            <h6 class="fw-bold mb-3" style="color:var(--deep-purple);">Organization & Contact Profile</h6>
            <div class="p-3 bg-light rounded border small">
              <div class="mb-2"><strong>Organization Name:</strong> ${user.orgName || user.name}</div>
              <div class="mb-2"><strong>Platform Role:</strong> <span class="badge badge-${user.role}">${user.role.toUpperCase()}</span></div>
              <div class="mb-2"><strong>Registered Email:</strong> ${user.email}</div>
              <div class="mb-2"><strong>Phone Number:</strong> ${user.phone}</div>
              <div><strong>Kitchen / Facility Address:</strong> ${user.address || 'Bengaluru'}</div>
            </div>
          </div>

          <div class="col-lg-6">
            <h6 class="fw-bold mb-3" style="color:var(--deep-purple);">Verification Credentials (Demo)</h6>
            ${isApproved ? `
              <div class="p-3 rounded border text-center" style="background:var(--pastel-mint); border-color:var(--soft-green)!important;">
                <i class="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
                <h6 class="fw-bold text-success mb-1">Account Fully Verified</h6>
                <p class="small text-muted mb-2">Verified with: <strong>${user.verifiedDoc || 'Certified Business Registration'}</strong></p>
                <span class="badge bg-success">Active Rescue & Donation Rights Granted</span>
              </div>
            ` : `
              <form onsubmit="window.RainRouteKYC.handleSubmit(event)">
                <div class="mb-3">
                  <label class="form-label-custom">Select Demo Document Type</label>
                  <select id="docType" class="form-select-custom w-100" required>
                    <option value="FSSAI License / Food Safety Registration">FSSAI Food Safety License (Donor)</option>
                    <option value="NGO Darpan / 80G Certificate">NGO Darpan / Trust Certificate (NGO)</option>
                    <option value="Volunteer Identity & Safety Card">Volunteer Photo ID & Safety Clearance</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label-custom">Demo Document Number</label>
                  <input type="text" id="docNumber" class="form-control-custom w-100" placeholder="e.g. KA-2026-FSSAI-8890" value="DEMO-VERIFY-${Math.floor(1000 + Math.random()*9000)}" required>
                </div>
                <button type="submit" class="btn btn-purple w-100">
                  <i class="bi bi-upload"></i> Submit for Admin Verification
                </button>
              </form>
            `}
          </div>
        </div>
      </div>
    `;
  }

  handleSubmit(event) {
    event.preventDefault();
    const user = window.RainRouteAuth.getCurrentUser();
    if (!user) return;

    const docType = document.getElementById('docType').value;
    const docNumber = document.getElementById('docNumber').value.trim();

    user.verifiedDoc = `${docType} (#${docNumber})`;
    user.kycStatus = 'pending';

    // Update in DB
    const u = window.RainRouteDB.getUserById(user.id);
    if (u) {
      u.verifiedDoc = user.verifiedDoc;
      u.kycStatus = 'pending';
      window.RainRouteDB.saveState();
    }

    window.RainRouteAuth.saveSession(user);
    window.RainRouteDB.logActivity(user.name, `Submitted verification document: ${docType}`, user.id, 'KYC Submitted');
    window.RainRouteApp?.showToast('Verification submitted! An admin will review shortly in the Admin Console.', 'success');
    
    // Rerender view
    if (user.role === 'donor') window.RainRouteDonor.render('kyc');
    else if (user.role === 'ngo') window.RainRouteNGO.render('browse-food');
  }
}

window.RainRouteKYC = new KycManager();
