/**
 * Save to Serve - Account Verification & KYC Submission Interface
 * Upload Demo Food Safety / Identity Documents & View Admin Status
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class KycManager {
  renderView(user) {
    const isApproved = user.kycStatus === 'approved';
    const isPending = user.kycStatus === 'pending';
    const isRejected = user.kycStatus === 'rejected';

    return `
      <div class="custom-card">
        <div class="custom-card-header">
          <div>
            <h5 class="card-title-custom"><i class="bi bi-shield-check text-primary"></i> Account Verification & KYC Status</h5>
            <div class="text-muted small">Verification status directly controls your surplus food listing & pickup rights</div>
          </div>
          <span class="badge ${isApproved ? 'bg-success' : isPending ? 'bg-warning text-dark' : 'bg-danger'} text-uppercase fs-6">
            ${user.kycStatus}
          </span>
        </div>

        <div class="alert alert-secondary py-2 small mb-4">
          <i class="bi bi-shield-exclamation text-primary me-1"></i> <strong>SIMULATED DEMO VERIFICATION:</strong> Fictional demonstration documents only. No actual legal or government identity documentation is collected.
        </div>

        <div class="row g-4 mb-3">
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
                <p class="small text-muted mb-2">Verified with: <strong>${user.verificationDetails?.docType || user.verifiedDoc || 'Certified Business Registration'}</strong></p>
                <div class="small font-monospace mb-2 text-dark">${user.verificationDetails?.docNumber || 'DOC-VERIFIED-2026'}</div>
                <span class="badge bg-success">Active Rescue & Donation Rights Granted</span>
              </div>
            ` : `
              <div>
                ${isRejected ? `
                  <div class="alert alert-danger py-2 small mb-3">
                    <strong>Rejection Reason:</strong> ${user.verificationDetails?.rejectionReason || 'Please provide clear licensing information.'}
                    <div class="mt-1">You may resubmit updated details below.</div>
                  </div>
                ` : ''}

                <form onsubmit="window.SaveToServeKYC.handleSubmit(event)">
                  <div class="mb-3">
                    <label class="form-label-custom">Select Demo Document Type</label>
                    <select id="docType" class="form-select-custom w-100" required>
                      ${user.role === 'donor' ? `
                        <option value="FSSAI License / Food Safety Registration">FSSAI Food Safety License (Donor)</option>
                        <option value="Municipal Trade / Health License">Municipal Health & Trade License</option>
                      ` : user.role === 'ngo' ? `
                        <option value="NGO Darpan / 80G Certificate">NGO Darpan / Trust Certificate</option>
                        <option value="Society Registration Certificate">Society Registration Certificate</option>
                      ` : `
                        <option value="Volunteer Identity & Safety Card">Volunteer Photo ID & Safety Clearance</option>
                        <option value="Driver License / Vehicle Document">Driver License & Insulated Kit Card</option>
                      `}
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
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  handleSubmit(event) {
    event.preventDefault();
    const user = window.SaveToServeAuth.getCurrentUser();
    if (!user) return;

    const docType = document.getElementById('docType').value;
    const docNumber = document.getElementById('docNumber').value.trim();

    user.verifiedDoc = `${docType} (#${docNumber})`;
    user.kycStatus = 'pending';
    user.verificationDetails = {
      docType,
      docNumber,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      rejectionReason: ''
    };

    const u = window.SaveToServeDB.getUserById(user.id);
    if (u) {
      u.verifiedDoc = user.verifiedDoc;
      u.kycStatus = 'pending';
      u.verificationDetails = user.verificationDetails;
      window.SaveToServeDB.saveState();
    }

    window.SaveToServeAuth.saveSession(user);
    window.SaveToServeDB.logActivity(user.name, `Submitted verification document: ${docType}`, user.id, 'KYC Submitted');
    window.SaveToServeApp?.showToast('Verification submitted! An admin will review shortly in the Admin Console.', 'success');
    
    if (user.role === 'donor') window.SaveToServeDonor.render('kyc');
    else if (user.role === 'volunteer') window.SaveToServeVolunteer.render('kyc');
    else if (user.role === 'ngo') window.SaveToServeNGO.render('browse-food');
  }
}

window.SaveToServeKYC = new KycManager();
window.RainRouteKYC = window.SaveToServeKYC;
