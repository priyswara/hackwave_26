/**
 * Save to Serve - QR Vouchers & Direct Redemption Engine
 * Dynamic QR generation for direct surplus food collection & simulated verification terminal
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class QrVoucherManager {
  generateSvgQr(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    
    const size = 17;
    let rects = '';
    
    const addCorner = (x, y) => {
      rects += `<rect x="${x}" y="${y}" width="4" height="4" fill="#543675"/>`;
      rects += `<rect x="${x+1}" y="${y+1}" width="2" height="2" fill="#FFFFFF"/>`;
    };
    addCorner(1, 1);
    addCorner(12, 1);
    addCorner(1, 12);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if ((r <= 5 && c <= 5) || (r <= 5 && c >= 11) || (r >= 11 && c <= 5)) continue;
        const bit = ((hash ^ (r * 31 + c * 17)) & (1 << ((r + c) % 16))) !== 0;
        if (bit) {
          rects += `<rect x="${c}" y="${r}" width="0.9" height="0.9" fill="#543675"/>`;
        }
      }
    }

    return `
      <svg viewBox="0 0 17 17" width="160" height="160" xmlns="http://www.w3.org/2000/svg" style="border-radius:12px;background:#ffffff;padding:8px;box-shadow:0 4px 12px rgba(84,54,117,0.15);">
        ${rects}
      </svg>
    `;
  }

  showVoucherModal(donationId) {
    const donation = window.SaveToServeDB.getDonationById(donationId);
    if (!donation) return;

    const modalTitle = document.getElementById('globalModalTitle');
    const modalBody = document.getElementById('globalModalBody');
    if (!modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="bi bi-qr-code text-primary me-2"></i> Save to Serve Instant Rescue Voucher`;
    modalBody.innerHTML = `
      <div class="qr-voucher-box">
        <div class="mb-3">
          ${this.generateSvgQr(donation.qrVoucherCode)}
        </div>
        <div class="voucher-code-badge">${donation.qrVoucherCode}</div>
        <h5 class="fw-bold mb-1" style="color:var(--dark-olive);">${donation.foodName}</h5>
        <p class="small text-muted mb-2">Issued to: <strong>${donation.claimedByNgoName || 'Authorized NGO'}</strong></p>

        <div class="p-2 bg-light rounded text-start small mb-3 border">
          <div><i class="bi bi-shop me-1 text-primary"></i> <strong>Pickup From:</strong> ${donation.donorOrg} (${donation.donorAddress})</div>
          <div><i class="bi bi-box me-1 text-success"></i> <strong>Portions:</strong> ${donation.portions} meals (~${donation.quantityKg} kg)</div>
          <div><i class="bi bi-alarm me-1 text-danger"></i> <strong>Safe Deadline:</strong> ${new Date(donation.safeUntil).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
          <div><i class="bi bi-info-circle me-1 text-muted"></i> <strong>Status:</strong> ${donation.qrVoucherRedeemed ? '<span class="badge bg-success">REDEEMED</span>' : '<span class="badge bg-warning text-dark">UNREDEEMED</span>'}</div>
        </div>

        <p class="small text-muted mb-0">
          <em>Present this digital code / QR at the donor counter for immediate surplus food release.</em>
        </p>
      </div>
    `;

    const modalEl = document.getElementById('globalModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modalEl);
      bsModal.show();
    }
  }

  renderRedemptionTerminal() {
    return `
      <div class="custom-card">
        <div class="custom-card-header">
          <h5 class="card-title-custom"><i class="bi bi-qr-code-scan text-primary"></i> Direct QR Voucher Redemption Terminal</h5>
          <span class="badge bg-light text-dark border">Verification Desk</span>
        </div>

        <div class="row g-4 align-items-center">
          <div class="col-lg-6">
            <div class="p-4 rounded text-center" style="background:var(--light-olive); border: 2px dashed var(--primary-olive);">
              <i class="bi bi-camera fs-1 text-primary mb-2 d-block"></i>
              <h6 class="fw-bold mb-2">Simulated Live QR Scanner</h6>
              <p class="small text-muted mb-3">Camera access is simulated for testing. Enter the voucher code manually or click one of the active vouchers below.</p>
              <button class="btn btn-olive btn-sm" onclick="window.SaveToServeQR.simulateCameraScan()">
                <i class="bi bi-upc-scan"></i> Simulate Scan (Auto-Redeem Active Voucher)
              </button>
            </div>
          </div>

          <div class="col-lg-6">
            <form onsubmit="window.SaveToServeQR.handleManualRedeem(event)">
              <label class="form-label-custom">Enter Voucher Code Manually</label>
              <div class="input-group mb-3">
                <input type="text" id="manualVoucherCode" class="form-control form-control-custom font-monospace text-uppercase" placeholder="e.g. VOUCHER-DON-2026-101" required>
                <button type="submit" class="btn btn-green">
                  <i class="bi bi-check2"></i> Redeem Voucher
                </button>
              </div>
            </form>

            <div class="small text-muted">
              <strong>Quick Test Active Vouchers:</strong>
              <div class="d-flex flex-wrap gap-2 mt-2">
                ${window.SaveToServeDB.getDonations().filter(d => !d.qrVoucherRedeemed).map(d => `
                  <button class="btn btn-sm btn-outline-secondary font-monospace" onclick="document.getElementById('manualVoucherCode').value='${d.qrVoucherCode}'">
                    ${d.qrVoucherCode}
                  </button>
                `).join('') || '<span class="text-muted">No unredeemed vouchers.</span>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleManualRedeem(event) {
    event.preventDefault();
    const code = document.getElementById('manualVoucherCode').value.trim();
    if (!code) return;

    const res = window.SaveToServeDB.redeemVoucher(code);
    if (res.success) {
      window.SaveToServeApp?.showToast(`Voucher ${code} successfully redeemed for ${res.donation.foodName}!`, 'success');
      document.getElementById('manualVoucherCode').value = '';
      if (window.SaveToServeNGO) window.SaveToServeNGO.render('qr-redemption');
    } else {
      window.SaveToServeApp?.showToast(res.message, 'danger');
    }
  }

  simulateCameraScan() {
    const unredeemed = window.SaveToServeDB.getDonations().find(d => !d.qrVoucherRedeemed);
    if (unredeemed) {
      const res = window.SaveToServeDB.redeemVoucher(unredeemed.qrVoucherCode);
      if (res.success) {
        window.SaveToServeApp?.showToast(`[Simulated Scan] Verified & redeemed ${unredeemed.qrVoucherCode}!`, 'success');
        if (window.SaveToServeNGO) window.SaveToServeNGO.render('qr-redemption');
      }
    } else {
      window.SaveToServeApp?.showToast('All sample vouchers are already redeemed!', 'info');
    }
  }
}

window.SaveToServeQR = new QrVoucherManager();
window.RainRouteQR = window.SaveToServeQR;
