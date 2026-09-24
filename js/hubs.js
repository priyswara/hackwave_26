/**
 * Save to Serve - Safe Temporary Holding Hubs Module
 * Community Fridges, Cold Storage Partner Lockers, Capacity Tracking & Temperature Integrity
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class HoldingHubsManager {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('savetoserve:statechange', () => {
      if (window.SaveToServeApp?.currentRoute === 'holding-hubs') {
        this.render();
      }
    });
  }

  render() {
    const container = document.getElementById('holding-hubs-view');
    if (!container) return;

    const hubs = window.SaveToServeDB.getHoldingHubs();
    const isAdmin = window.SaveToServeAuth.hasRole('admin');

    container.innerHTML = `
      <div class="container py-4">
        <!-- Safety Disclaimer -->
        <div class="alert alert-secondary py-2 small d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-shield-check text-success fs-5"></i>
          <div>
            <strong>SAFE STORAGE PROTOCOL:</strong> Safe Holding Hubs are temperature-regulated community fridges & cold locker facilities for short-term preservation during severe transit disruptions. Never hold food past its safe-use deadline.
          </div>
        </div>

        <!-- Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h2 class="mb-1 fw-bold" style="color:var(--deep-purple);">❄️ Safe Temporary Holding Hubs</h2>
            <p class="text-muted mb-0">Certified cold chain micro-facilities for weather-contingency storage.</p>
          </div>
          ${isAdmin ? `
            <button class="btn btn-purple" onclick="window.SaveToServeHubs.showAddHubModal()">
              <i class="bi bi-plus-circle"></i> Add New Holding Hub
            </button>
          ` : ''}
        </div>

        <!-- Hubs Grid -->
        <div class="row g-4">
          ${hubs.map(hub => {
            const pct = Math.round((hub.currentOccupancy / hub.capacityTotalPortions) * 100);
            const availableSpace = hub.capacityTotalPortions - hub.currentOccupancy;
            const barColor = pct > 85 ? '#DC2626' : pct > 60 ? '#D97706' : '#2E8540';

            return `
              <div class="col-lg-4 col-md-6">
                <div class="custom-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h5 class="fw-bold mb-1" style="color:var(--deep-purple);">${hub.name}</h5>
                      <span class="badge ${hub.status === 'approved' ? 'badge-ngo' : 'badge-admin'} text-uppercase">
                        ${hub.status}
                      </span>
                    </div>

                    <p class="small text-muted mb-3">
                      <i class="bi bi-geo-alt-fill text-danger me-1"></i> ${hub.location}
                    </p>

                    <!-- Capacity Gauge -->
                    <div class="p-3 bg-light rounded border mb-3">
                      <div class="d-flex justify-content-between small fw-bold mb-1">
                        <span>Current Storage Occupancy:</span>
                        <span>${hub.currentOccupancy} / ${hub.capacityTotalPortions} Portions</span>
                      </div>
                      <div class="progress" style="height: 10px; border-radius: 5px;">
                        <div class="progress-bar" style="width: ${pct}%; background-color: ${barColor};"></div>
                      </div>
                      <div class="d-flex justify-content-between small text-muted mt-2">
                        <span>Available Space: <strong>${availableSpace} portions</strong></span>
                        <span>${pct}% Full</span>
                      </div>
                    </div>

                    <!-- Specs -->
                    <div class="small text-muted mb-3">
                      <div><i class="bi bi-thermometer-half text-primary"></i> <strong>Temp:</strong> ${hub.temperatureZone}</div>
                      <div><i class="bi bi-person text-secondary"></i> <strong>Manager:</strong> ${hub.manager || 'Facility Desk'}</div>
                      <div><i class="bi bi-telephone text-success"></i> <strong>Contact:</strong> ${hub.contactPhone}</div>
                      <div><i class="bi bi-clock-history text-muted"></i> <strong>Access:</strong> ${hub.activeUntil}</div>
                    </div>
                  </div>

                  <div class="pt-2 border-top d-flex gap-2">
                    ${isAdmin ? `
                      <button class="btn btn-sm btn-outline-danger w-100" onclick="window.SaveToServeHubs.toggleHubStatus('${hub.id}')">
                        ${hub.status === 'approved' ? 'Deactivate' : 'Approve'}
                      </button>
                    ` : `
                      <button class="btn btn-sm btn-soft-purple w-100" onclick="window.SaveToServeHubs.viewHubDetails('${hub.id}')">
                        <i class="bi bi-info-circle"></i> View Hub Info
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderHubsManagementView() {
    const hubs = window.SaveToServeDB.getHoldingHubs();
    return `
      <div class="custom-card">
        <div class="custom-card-header">
          <h5 class="card-title-custom"><i class="bi bi-snow text-primary"></i> Safe Holding Hubs Registry</h5>
          <button class="btn btn-purple btn-sm" onclick="window.SaveToServeHubs.showAddHubModal()">
            <i class="bi bi-plus-circle"></i> Add Hub
          </button>
        </div>

        <div class="table-responsive-custom">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Hub Name & Location</th>
                <th>Capacity</th>
                <th>Temperature Zone</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${hubs.map(h => `
                <tr>
                  <td>
                    <strong>${h.name}</strong>
                    <div class="small text-muted">${h.location}</div>
                  </td>
                  <td><strong>${h.currentOccupancy} / ${h.capacityTotalPortions}</strong> portions</td>
                  <td class="small">${h.temperatureZone}</td>
                  <td class="small">${h.manager} (${h.contactPhone})</td>
                  <td><span class="badge ${h.status === 'approved' ? 'bg-success' : 'bg-secondary'}">${h.status}</span></td>
                  <td>
                    <button class="btn btn-sm ${h.status === 'approved' ? 'btn-outline-warning' : 'btn-outline-success'}" onclick="window.SaveToServeHubs.toggleHubStatus('${h.id}')">
                      ${h.status === 'approved' ? 'Deactivate' : 'Approve'}
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

  showAddHubModal() {
    const name = prompt('Enter Safe Holding Hub Name (e.g., Koramangala Community Fridge):');
    if (!name) return;
    const location = prompt('Enter Hub Location Address:', 'Koramangala 5th Block, Bengaluru');
    if (!location) return;
    const capacity = parseInt(prompt('Enter Max Portions Capacity:', '100')) || 100;
    const temp = prompt('Enter Temperature Zone:', 'Chilled (2°C - 4°C)');
    const phone = prompt('Enter Contact Phone:', '+91 98765 00112');

    window.SaveToServeDB.addHoldingHub({
      name,
      location,
      capacityTotalPortions: capacity,
      temperatureZone: temp || 'Chilled (2°C - 4°C)',
      contactPhone: phone || '+91 98765 00112',
      manager: 'Facility Volunteer Desk',
      activeUntil: '24/7 Monitored Storage',
      coords: [12.9350, 77.6250]
    });

    window.SaveToServeApp?.showToast('New Safe Holding Hub added successfully!', 'success');
    this.render();
  }

  toggleHubStatus(hubId) {
    const hub = window.SaveToServeDB.getHoldingHubs().find(h => h.id === hubId);
    if (!hub) return;

    const newStatus = hub.status === 'approved' ? 'inactive' : 'approved';
    window.SaveToServeDB.updateHoldingHub(hubId, { status: newStatus });
    window.SaveToServeApp?.showToast(`Hub status changed to ${newStatus}.`, 'info');
    this.render();
  }

  viewHubDetails(hubId) {
    const hub = window.SaveToServeDB.getHoldingHubs().find(h => h.id === hubId);
    if (!hub) return;
    alert(`Safe Holding Hub Details:\n\nName: ${hub.name}\nLocation: ${hub.location}\nCapacity: ${hub.currentOccupancy}/${hub.capacityTotalPortions} portions\nTemp Zone: ${hub.temperatureZone}\nManager: ${hub.manager}\nPhone: ${hub.contactPhone}`);
  }
}

window.SaveToServeHubs = new HoldingHubsManager();
window.RainRouteHubs = window.SaveToServeHubs;
