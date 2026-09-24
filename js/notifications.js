/**
 * RainRoute - Notification Center & Low-Connectivity Simulated SMS / WhatsApp Drawer
 */

class NotificationManager {
  renderView() {
    const user = window.RainRouteAuth.getCurrentUser();
    const notifications = window.RainRouteDB.getNotifications(user ? user.role : null, user ? user.id : null);

    return `
      <div class="container py-4">
        <!-- Low-Connectivity Disclosure -->
        <div class="alert alert-secondary py-2 small d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-broadcast text-primary fs-5"></i>
          <div>
            <strong>LOW CONNECTIVITY & SMS DISCLOSURE:</strong> In low-bandwidth disaster situations, RainRoute falls back to compressed SMS & lightweight push notifications. Displayed SMS / WhatsApp alerts are <strong>SIMULATED DEMO PREVIEWS</strong>.
          </div>
        </div>

        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h2 class="mb-1" style="color:var(--deep-purple);">🔔 Notifications & Communication Logs</h2>
            <p class="text-muted mb-0">Live feed of weather alerts, surplus handoff verifications & pickup tasks.</p>
          </div>
          <button class="btn btn-outline-secondary btn-sm" onclick="window.RainRouteNotifications.markAllRead()">
            <i class="bi bi-check2-all"></i> Mark All as Read
          </button>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="custom-card mb-0">
              <div class="custom-card-header">
                <h5 class="card-title-custom"><i class="bi bi-inbox text-primary"></i> In-App Alerts</h5>
                <span class="badge bg-light text-dark border">${notifications.length} Alerts</span>
              </div>

              ${notifications.length === 0 ? `
                <div class="p-4 text-center text-muted">
                  <i class="bi bi-bell-slash fs-2 mb-2 d-block"></i>
                  <p>No new notifications right now.</p>
                </div>
              ` : `
                <div class="d-flex flex-column gap-3">
                  ${notifications.map(n => `
                    <div class="p-3 rounded border ${n.read ? 'bg-light' : 'bg-white'}" style="border-left: 4px solid ${n.type === 'weather' ? '#D97706' : n.type === 'claim' ? '#356B4A' : '#7653A6'}!important;">
                      <div class="d-flex justify-content-between align-items-start mb-1">
                        <h6 class="fw-bold mb-0" style="color:var(--deep-purple);">${n.title}</h6>
                        <span class="small text-muted">${new Date(n.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p class="small text-dark mb-2">${n.message}</p>
                      ${n.smsPreview ? `
                        <div class="p-2 rounded font-monospace small" style="background:#F1F5F9; font-size:0.76rem; border:1px dashed #CBD5E1;">
                          <strong>[SIMULATED SMS]</strong> ${n.smsPreview}
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>

          <div class="col-lg-4">
            <div class="custom-card mb-0">
              <div class="custom-card-header">
                <h5 class="card-title-custom"><i class="bi bi-phone text-success"></i> SMS / WhatsApp Preview</h5>
                <span class="badge bg-success">SIMULATED</span>
              </div>
              <p class="small text-muted mb-3">
                Preview of simulated outbound text alerts dispatched to offline couriers and ground NGOs.
              </p>

              <div class="p-3 bg-dark text-white rounded mb-3" style="border-radius:18px; box-shadow:inset 0 2px 8px rgba(0,0,0,0.5);">
                <div class="small text-muted mb-2 text-center">📱 Cellular Broadcast Simulation</div>
                <div class="p-2 rounded mb-2" style="background:#1E293B; font-size:0.8rem; border-left:3px solid #10B981;">
                  <div class="text-success fw-bold">RainRoute Rescue Bot:</div>
                  <div>"Surplus 50 Portions Veg Biryani claimed. Safe deadline 14:30. Pickup code: RR-7492."</div>
                </div>
                <div class="p-2 rounded" style="background:#1E293B; font-size:0.8rem; border-left:3px solid #F59E0B;">
                  <div class="text-warning fw-bold">RainRoute Weather Alert:</div>
                  <div>"Heavy rain active. Two-wheeler transit re-routed to Indiranagar Holding Hub."</div>
                </div>
              </div>

              <button class="btn btn-soft-purple btn-sm w-100" onclick="window.RainRouteNotifications.sendTestSms()">
                <i class="bi bi-send"></i> Send Test Simulated SMS
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  markAllRead() {
    window.RainRouteDB.markAllNotificationsRead();
    window.RainRouteApp?.showToast('All notifications marked as read.', 'info');
    this.render();
  }

  sendTestSms() {
    window.RainRouteDB.addNotification({
      recipientRole: 'all',
      title: '📲 Test Simulated SMS Dispatched',
      message: 'This is a simulated instant notification dispatched to verify offline courier connectivity.',
      type: 'system',
      smsPreview: 'SIMULATED SMS: RainRoute Network Test Ping - System operational.'
    });
    window.RainRouteApp?.showToast('Simulated SMS alert created!', 'success');
    this.render();
  }
}

window.RainRouteNotifications = new NotificationManager();
