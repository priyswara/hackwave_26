/**
 * Save to Serve - Account Verification & KYC Submission Interface
 * Food Safety & Operational Documentation Review & Reconsideration Workflow
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class KycManager {
  renderView(user) {
    const isApproved = user.kycStatus === 'approved';
    const isPending = user.kycStatus === 'pending';
    const isRejected = user.kycStatus === 'rejected';
    const isReconsideration = user.kycStatus === 'reconsideration_requested' || user.kycStatus === 'under_reconsideration';

    let badgeClass = 'bg-warning text-dark';
    let badgeLabel = 'Pending Review';
    if (isApproved) {
      badgeClass = 'bg-success text-white';
      badgeLabel = 'Approved';
    } else if (isRejected) {
      badgeClass = 'bg-danger text-white';
      badgeLabel = 'Rejected';
    } else if (isReconsideration) {
      badgeClass = 'bg-info text-dark';
      badgeLabel = 'Reconsideration Under Review';
    }

    return `
      <div class="custom-card">
        <div class="custom-card-header">
          <div>
            <h5 class="card-title-custom"><i class="bi bi-shield-check text-success"></i> Account Verification & KYC Dossier</h5>
            <div class="text-muted small">Official credentials control food listing and pickup authorization on Save to Serve</div>
          </div>
          <span class="badge ${badgeClass} text-uppercase fs-6">
            ${badgeLabel}
          </span>
        </div>

        <div class="row g-4 mb-3">
          <div class="col-lg-6">
            <h6 class="fw-bold mb-3" style="color:var(--dark-olive);">Organization & Contact Profile</h6>
            <div class="p-3 bg-light rounded border small">
              <div class="mb-2"><strong>Organization / Name:</strong> ${user.orgName || user.name}</div>
              <div class="mb-2"><strong>Registered Role:</strong> <span class="badge badge-${user.role}">${user.role.toUpperCase()}</span></div>
              <div class="mb-2"><strong>Email Address:</strong> ${user.email}</div>
              <div class="mb-2"><strong>Phone Number:</strong> ${user.phone}</div>
              <div><strong>Facility / Kitchen Address:</strong> ${user.address || 'Bengaluru'}</div>
            </div>
          </div>

          <div class="col-lg-6">
            <h6 class="fw-bold mb-3" style="color:var(--dark-olive);">Verification Status & Actions</h6>
            
            ${isApproved ? `
              <div class="p-3 rounded border text-center" style="background:var(--light-olive); border-color:rgba(102,114,56,0.3)!important;">
                <i class="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
                <h6 class="fw-bold text-success mb-1">Account Fully Verified</h6>
                <p class="small text-muted mb-2">Verified with: <strong>${user.verificationDetails?.docType || user.verifiedDoc || 'Verified Organization Credential'}</strong></p>
                <div class="small font-monospace mb-2 text-dark">${user.verificationDetails?.docNumber || 'DOC-VERIFIED-2026'}</div>
                <span class="badge bg-success">Active Food Rescue & Operations Authorized</span>
              </div>
            ` : isPending ? `
              <div class="p-3 rounded border bg-light">
                <div class="d-flex align-items-center gap-2 mb-2 text-warning">
                  <i class="bi bi-hourglass-split fs-4"></i>
                  <h6 class="fw-bold mb-0 text-dark">Verification In Progress</h6>
                </div>
                <p class="small text-muted mb-2">
                  Your submitted credentials are under review by the Super Admin operations team.
                </p>
                <div class="small mb-2"><strong>Submitted Credential:</strong> ${user.verificationDetails?.docType || 'License Documentation'} (${user.verificationDetails?.docNumber || 'Pending'})</div>
                <div class="small text-muted"><i class="bi bi-clock"></i> Submitted: ${user.verificationDetails?.submittedAt ? new Date(user.verificationDetails.submittedAt).toLocaleDateString() : 'Recently'}</div>
              </div>
            ` : isReconsideration ? `
              <div class="p-3 rounded border bg-light">
                <div class="d-flex align-items-center gap-2 mb-2 text-info">
                  <i class="bi bi-arrow-repeat fs-4 text-primary"></i>
                  <h6 class="fw-bold mb-0 text-dark">Reconsideration Under Review</h6>
                </div>
                <p class="small text-muted mb-2">
                  Your reconsideration request has been received and queued for Super Admin review.
                </p>
                <div class="alert alert-info py-2 small mb-2">
                  <strong>Your Explanation:</strong> "${user.verificationDetails?.reconsiderationReason || 'Updated documentation submitted'}"
                </div>
                ${user.verificationDetails?.rejectionReason ? `
                  <div class="small text-muted mb-1"><strong>Previous Note:</strong> "${user.verificationDetails.rejectionReason}"</div>
                ` : ''}
                <div class="small text-muted"><i class="bi bi-clock"></i> Reconsideration Submitted: ${user.verificationDetails?.reconsiderationSubmittedAt ? new Date(user.verificationDetails.reconsiderationSubmittedAt).toLocaleDateString() : 'Recently'}</div>
              </div>
            ` : `
              <!-- Rejected State: Allow Requesting Reconsideration (Never self-approve) -->
              <div class="p-3 rounded border" style="background:#FFF9F8; border-color:#F5BDB5!important;">
                <div class="d-flex align-items-center gap-2 mb-2 text-danger">
                  <i class="bi bi-x-circle-fill fs-4"></i>
                  <h6 class="fw-bold mb-0 text-danger">Verification Application Rejected</h6>
                </div>
                <div class="alert alert-danger py-2 small mb-3">
                  <strong>Reason:</strong> ${user.verificationDetails?.rejectionReason || 'The submitted documentation could not be validated.'}
                </div>
                <p class="small text-muted mb-3">
                  You may submit an explanation and updated credentials to request reconsideration by an administrator:
                </p>

                <form onsubmit="window.SaveToServeKYC.handleReconsiderationSubmit(event)">
                  <div class="mb-3">
                    <label class="form-label-custom">Explanation / Note for Administrator *</label>
                    <textarea id="reconExplanation" class="form-control form-control-custom" rows="2" placeholder="Explain the corrections or attach valid license details..." required></textarea>
                  </div>
                  <div class="row g-2 mb-3">
                    <div class="col-md-6">
                      <label class="form-label-custom">Updated Document Type</label>
                      <select id="reconDocType" class="form-select form-select-custom">
                        ${user.role === 'donor' ? `
                          <option value="FSSAI License / Food Safety Registration">FSSAI Food Safety License</option>
                          <option value="Municipal Trade / Health License">Municipal Health License</option>
                        ` : user.role === 'ngo' ? `
                          <option value="NGO Darpan / 80G Certificate">NGO Darpan / Trust Certificate</option>
                          <option value="Society Registration Certificate">Society Registration Certificate</option>
                        ` : `
                          <option value="Volunteer Identity & Safety Card">Volunteer Photo ID & Safety Card</option>
                          <option value="Driver License / Vehicle Registration">Driver License & Vehicle Registration</option>
                        `}
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label-custom">Document Number</label>
                      <input type="text" id="reconDocNumber" class="form-control form-control-custom" placeholder="e.g. KA-2026-REG-8890">
                    </div>
                  </div>
                  <button type="submit" class="btn btn-olive w-100">
                    <i class="bi bi-send-check"></i> Request Reconsideration
                  </button>
                </form>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  handleReconsiderationSubmit(event) {
    event.preventDefault();
    const user = window.SaveToServeAuth?.getCurrentUser();
    if (!user) return;

    const explanation = document.getElementById('reconExplanation')?.value.trim();
    const docType = document.getElementById('reconDocType')?.value || '';
    const docNumber = document.getElementById('reconDocNumber')?.value.trim() || '';

    if (!explanation) {
      window.SaveToServeApp?.showToast('Please provide an explanation for reconsideration.', 'warning');
      return;
    }

    const res = window.SaveToServeDB?.requestReconsideration(user.id, explanation, docType, docNumber);
    if (res && res.success) {
      window.SaveToServeApp?.showToast('Reconsideration request submitted to Super Admin!', 'success');
      if (user.role === 'donor') window.SaveToServeDonor?.render('kyc');
      else if (user.role === 'volunteer') window.SaveToServeVolunteer?.render('kyc');
      else if (user.role === 'ngo') window.SaveToServeNGO?.render('kyc');
    } else {
      window.SaveToServeApp?.showToast(res ? res.message : 'Could not submit request.', 'danger');
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const user = window.SaveToServeAuth?.getCurrentUser();
    if (!user) return;

    const docType = document.getElementById('docType')?.value;
    const docNumber = document.getElementById('docNumber')?.value.trim();

    user.verifiedDoc = `${docType} (#${docNumber})`;
    user.kycStatus = 'pending';
    user.verificationDetails = {
      docType,
      docNumber,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      rejectionReason: '',
      reconsiderationReason: ''
    };

    const u = window.SaveToServeDB?.getUserById(user.id);
    if (u) {
      u.verifiedDoc = user.verifiedDoc;
      u.kycStatus = 'pending';
      u.verificationDetails = user.verificationDetails;
      window.SaveToServeDB?.saveState();
    }

    window.SaveToServeAuth?.saveSession(user);
    window.SaveToServeDB?.logActivity(user.name, `Submitted verification document: ${docType}`, user.id, 'KYC Submitted');
    window.SaveToServeApp?.showToast('Verification submitted! An administrator will review your credentials.', 'success');
    
    if (user.role === 'donor') window.SaveToServeDonor?.render('kyc');
    else if (user.role === 'volunteer') window.SaveToServeVolunteer?.render('kyc');
    else if (user.role === 'ngo') window.SaveToServeNGO?.render('browse-food');
  }
}

window.SaveToServeKYC = new KycManager();
window.RainRouteKYC = window.SaveToServeKYC;
