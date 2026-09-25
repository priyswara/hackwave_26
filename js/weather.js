/**
 * Save to Serve - Signature Innovation: Weather-Adaptive Food Rescue Engine
 * Universal Interactive Leaflet Weather Rescue Map with 3 Accessible Risk Levels across ALL Four Portals:
 * 1. Level 1 — Low Risk (Green)
 * 2. Level 2 — Moderate Risk (Yellow/Amber)
 * 3. Level 3 — High Risk (Red)
 * 
 * Portal Contexts: Donor, NGO, Volunteer, and Super Admin.
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class WeatherAdaptiveRescueEngine {
  constructor() {
    this.maps = {}; // Map of containerId -> { map, markers, routeLayers, currentFilter }
    this.activeFilter = 'all'; // 'all' | 'level1' | 'level2' | 'level3'
  }

  getScenario() {
    const key = window.SaveToServeDB?.state?.weatherState?.activeScenario || 'normal';
    const scenarios = window.SaveToServeDB?.state?.weatherState?.scenarios || {};
    return {
      key,
      ...(scenarios[key] || {
        name: 'Normal Weather',
        severity: 'low',
        precipitation: '0 mm/hr',
        riskLevel: 'Level 1 — Low Risk',
        advisory: 'Standard operations. Road and route conditions are assessed as relatively safe.',
        icon: 'bi-sun-fill'
      })
    };
  }

  setScenario(scenarioKey) {
    const res = window.SaveToServeDB.setWeatherScenario(scenarioKey);
    // Re-render any active weather views
    if (window.SaveToServeApp?.currentRoute === 'weather-rescue' || window.SaveToServeApp?.currentRoute === 'admin-portal') {
      this.renderWeatherDashboard();
    }
    // Dispatch event so any portal tab using weather map updates
    window.dispatchEvent(new CustomEvent('savetoserve:weatherchange', { detail: { scenarioKey } }));
    return res;
  }

  calculateDisruptionScore(scenarioKey) {
    let rainWeight = 0;
    let floodWeight = 0;
    let volDeficitWeight = 0;

    switch (scenarioKey) {
      case 'heavy_rain':
        rainWeight = 75;
        floodWeight = 60;
        volDeficitWeight = 70;
        break;
      case 'flood_warning':
        rainWeight = 95;
        floodWeight = 95;
        volDeficitWeight = 85;
        break;
      case 'volunteer_shortage':
        rainWeight = 20;
        floodWeight = 15;
        volDeficitWeight = 80;
        break;
      case 'normal':
      default:
        rainWeight = 10;
        floodWeight = 10;
        volDeficitWeight = 15;
        break;
    }

    const totalScore = Math.round((rainWeight * 0.40) + (floodWeight * 0.35) + (volDeficitWeight * 0.25));

    let riskLevel = 'Level 1 — Low Risk';
    let riskColor = '#2E8540';
    let riskBadge = 'bg-success';
    let riskSummary = 'Weather and route conditions are assessed as relatively safe based on available information.';
    let cautionNote = 'Low risk indicates standard operating safety, but does not guarantee that every individual road or corridor is hazard-free.';

    if (totalScore > 75) {
      riskLevel = 'Level 3 — High Risk (Avoid Affected Routes)';
      riskColor = '#DC2626';
      riskBadge = 'bg-danger';
      riskSummary = 'Severe weather or reported waterlogging hazards make primary routes unsafe.';
      cautionNote = 'Do not travel through flooded or hazardous routes. Safe Alternative Holding Hubs and local QR Vouchers are activated.';
    } else if (totalScore > 40) {
      riskLevel = 'Level 2 — Moderate Risk (Caution Required)';
      riskColor = '#D97706';
      riskBadge = 'bg-warning text-dark';
      riskSummary = 'Weather conditions may create transit delays or require extra caution.';
      cautionNote = 'Review route conditions, confirm pickup arrangements, and coordinate with the NGO or donor before dispatch.';
    }

    return {
      totalScore,
      breakdown: {
        rainFactor: { label: 'Precipitation Severity (40%)', value: rainWeight, weighted: Math.round(rainWeight * 0.40) },
        floodFactor: { label: 'Route Vulnerability & Inundation (35%)', value: floodWeight, weighted: Math.round(floodWeight * 0.35) },
        transitFactor: { label: 'Volunteer / Vehicle Deficit (25%)', value: volDeficitWeight, weighted: Math.round(volDeficitWeight * 0.25) }
      },
      level: riskLevel,
      color: riskColor,
      badge: riskBadge,
      summary: riskSummary,
      cautionNote
    };
  }

  getAffectedDonations() {
    const scenarioKey = window.SaveToServeDB?.state?.weatherState?.activeScenario || 'normal';
    const donations = window.SaveToServeDB?.getDonations() || [];
    const now = Date.now();

    const activeDonations = donations.filter(d => ['available', 'claimed', 'in-transit'].includes(d.status));

    if (scenarioKey === 'normal') {
      return [];
    }

    return activeDonations.map(d => {
      const safeUntilMs = new Date(d.safeUntil).getTime();
      const hoursRemaining = Math.max(0, (safeUntilMs - now) / 3600000);
      const isUrgent = hoursRemaining <= 3;

      let reason = '';
      let recommendedPlanType = 'direct_ngo';
      let planDetails = {};

      if (scenarioKey === 'heavy_rain') {
        reason = 'Two-wheeler volunteer transit slowed by waterlogged arterial roads.';
        if (d.portions <= 40) {
          const hubs = window.SaveToServeDB.getHoldingHubs().filter(h => h.status === 'approved' && (h.capacityTotalPortions - h.currentOccupancy) >= d.portions);
          if (hubs.length > 0) {
            recommendedPlanType = 'safe_hub';
            planDetails = {
              hubId: hubs[0].id,
              hubName: hubs[0].name,
              reason: `Transfer to nearby cold holding hub (${hubs[0].name}) within 1.2km to safeguard until rain subsides.`
            };
          } else {
            recommendedPlanType = 'direct_ngo';
            planDetails = {
              reason: 'Dispatch authorized NGO 4-wheeler covered vehicle for rain-protected batch transport.'
            };
          }
        } else {
          recommendedPlanType = 'direct_ngo';
          planDetails = {
            reason: 'Dispatch authorized NGO covered vehicle directly to donor kitchen.'
          };
        }
      } else if (scenarioKey === 'flood_warning') {
        reason = 'Severe road inundation detected along primary route. Road travel restricted.';
        recommendedPlanType = 'qr_voucher';
        planDetails = {
          voucherCode: d.qrVoucherCode,
          reason: 'Issue Direct Community QR Voucher for immediate on-site collection by local beneficiaries within walking distance.'
        };
      } else if (scenarioKey === 'volunteer_shortage') {
        reason = 'Volunteer courier network at capacity. No courier assigned within 15 min.';
        recommendedPlanType = 'direct_ngo';
        planDetails = {
          reason: 'Enable authorized Direct NGO Staff pickup with express route clearance.'
        };
      }

      return {
        donation: d,
        hoursRemaining: hoursRemaining.toFixed(1),
        isUrgent,
        reason,
        recommendedPlanType,
        planDetails
      };
    });
  }

  /**
   * Universal Map Renderer used across Donor, NGO, Volunteer, and Super Admin portals.
   */
  renderWeatherMapWidget(containerElId, portalRole = 'donor', options = {}) {
    const container = document.getElementById(containerElId);
    if (!container) return;

    const currentScenario = this.getScenario();
    const risk = this.calculateDisruptionScore(currentScenario.key);
    const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const mapDivId = `leafletMap_${containerElId}`;

    // Portal-Specific Safety Advice
    let portalSpecificGuidance = '';
    if (portalRole === 'donor') {
      portalSpecificGuidance = `
        <div class="p-3 rounded border mb-3" style="background:#FAF8FC; border-color:var(--portal-border)!important;">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-shop text-primary fs-5"></i>
            <strong style="color:var(--dark-olive);">Donor Kitchen & Handoff Safety Advisory</strong>
          </div>
          <div class="small text-muted mb-2">
            <strong>Pickup Area Weather:</strong> ${currentScenario.name} (${currentScenario.precipitation}) • 
            <span class="badge ${risk.badge}">${risk.level}</span>
          </div>
          <ul class="small text-muted mb-0 ps-3" style="line-height:1.5;">
            <li><strong>Food Packaging:</strong> Ensure hot food containers are sealed in waterproof thermal packaging during wet weather.</li>
            <li><strong>Safe Handoff Protocol:</strong> Verify the arriving courier's vehicle suitability (e.g. covered box) and require the Pickup Verification Code before release.</li>
            <li><strong>Route Safety:</strong> ${currentScenario.key === 'flood_warning' ? '<span class="text-danger fw-bold">Severe road inundation reported. If couriers cannot arrive safely, consider on-site Community QR Voucher redemption.</span>' : 'Standard handoffs active. Maintain indoor holding if transit delays occur.'}</li>
          </ul>
        </div>
      `;
    } else if (portalRole === 'ngo') {
      portalSpecificGuidance = `
        <div class="p-3 rounded border mb-3" style="background:#F4FAF6; border-color:var(--portal-border)!important;">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-building text-success fs-5"></i>
            <strong style="color:var(--dark-olive);">NGO Shelter Collection & Route Feasibility</strong>
          </div>
          <div class="small text-muted mb-2">
            <strong>Transit Corridor Risk:</strong> <span class="badge ${risk.badge}">${risk.level}</span> • 
            <span class="text-muted">Precipitation: ${currentScenario.precipitation}</span>
          </div>
          <ul class="small text-muted mb-0 ps-3" style="line-height:1.5;">
            <li><strong>Dispatch Feasibility Check:</strong> ${currentScenario.key === 'flood_warning' ? '<span class="text-danger fw-bold">Primary transit corridors blocked. Direct couriers to nearest Safe Holding Hubs or issue on-site QR Vouchers.</span>' : currentScenario.key === 'heavy_rain' ? '<span class="text-warning fw-bold">Two-wheeler transit slowed. Authorize 4-wheeler covered vehicle dispatch for high-portion meals.</span>' : 'All standard collection corridors are clear and operable.'}</li>
            <li><strong>Safe Holding Hub Redirection:</strong> If shelter arrival cannot occur before food safe-use deadline, claim nearest cold storage hub.</li>
          </ul>
        </div>
      `;
    } else if (portalRole === 'volunteer') {
      portalSpecificGuidance = `
        <div class="p-3 rounded border mb-3" style="background:#F6F4FB; border-color:var(--portal-border)!important;">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi bi-bicycle text-info fs-5"></i>
            <strong style="color:var(--dark-olive);">Volunteer Courier Route Safety & Weather Alerts</strong>
          </div>
          <div class="small text-muted mb-2">
            <strong>Active Transit Risk:</strong> <span class="badge ${risk.badge}">${risk.level}</span>
          </div>
          <div class="alert ${currentScenario.key === 'flood_warning' ? 'alert-danger' : currentScenario.key === 'heavy_rain' ? 'alert-warning' : 'alert-success'} py-2 px-3 small mb-2">
            <i class="bi bi-shield-fill-exclamation me-1"></i>
            <strong>COURIER SAFETY RULE:</strong> ${currentScenario.key === 'flood_warning' ? 'HIGH RISK — Do not attempt travel through waterlogged roads, flooded underpasses, or barricaded routes under any circumstances.' : currentScenario.key === 'heavy_rain' ? 'MODERATE RISK — Reduce speed, keep headlights on, and ensure insulated backpack is fully zipped. Seek temporary shelter at Safe Hubs if rain intensifies.' : 'LOW RISK — Standard safe riding conditions. Always observe traffic and helmet safety.'}
          </div>
          <p class="small text-muted mb-0">
            <em>Never compromise personal safety to complete a delivery. If a route becomes hazardous, report road blockage in the app.</em>
          </p>
        </div>
      `;
    } else if (portalRole === 'admin') {
      portalSpecificGuidance = `
        <div class="p-3 rounded border mb-3 bg-white">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <strong style="color:var(--dark-olive);"><i class="bi bi-sliders me-1"></i> Administrator Climate Scenario Simulation Console</strong>
            <span class="badge bg-light text-muted border">Simulation Engine</span>
          </div>
          <div class="scenario-btn-group mb-2">
            <button class="scenario-btn ${currentScenario.key === 'normal' ? 'active' : ''}" onclick="window.SaveToServeWeather.setScenario('normal')">
              <i class="bi bi-sun"></i> Level 1: Normal Weather
            </button>
            <button class="scenario-btn ${currentScenario.key === 'heavy_rain' ? 'active' : ''}" onclick="window.SaveToServeWeather.setScenario('heavy_rain')">
              <i class="bi bi-cloud-rain-heavy"></i> Level 2: Heavy Rain (45 mm/hr)
            </button>
            <button class="scenario-btn ${currentScenario.key === 'flood_warning' ? 'active' : ''}" onclick="window.SaveToServeWeather.setScenario('flood_warning')">
              <i class="bi bi-tsunami"></i> Level 3: Flood Warning (Red Alert)
            </button>
            <button class="scenario-btn ${currentScenario.key === 'volunteer_shortage' ? 'active' : ''}" onclick="window.SaveToServeWeather.setScenario('volunteer_shortage')">
              <i class="bi bi-people"></i> Courier Deficit
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="weather-map-component">
        <!-- Weather & Safety Banner -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
          <div>
            <h5 class="fw-bold mb-1" style="color:var(--dark-olive);">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i> Interactive Weather Rescue Map & Route Safety
            </h5>
            <p class="text-muted small mb-0">
              Live multi-layer route safety matrix with transparent Level 1 (Low), Level 2 (Moderate), and Level 3 (High) risk zones.
            </p>
          </div>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="badge bg-light text-muted border py-2 px-3 small">
              <i class="bi bi-clock-history me-1"></i> Last updated: ${lastUpdated}
            </span>
            <span class="badge bg-light text-muted border py-2 px-3 small">
              <i class="bi bi-info-circle me-1"></i> SIMULATED DATA — FOR RESCUE DRILLS
            </span>
          </div>
        </div>

        <!-- Portal Context Advisory -->
        ${portalSpecificGuidance}

        <!-- Interactive Risk Filter & Quick Status Bar -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 mb-3 rounded" style="background:#FFFFFF; border:1.5px solid var(--portal-border);">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="small fw-bold text-muted">Filter Map View:</span>
            <div class="btn-group btn-group-sm" role="group" aria-label="Risk Filters">
              <button type="button" class="btn ${this.activeFilter === 'all' ? 'btn-olive' : 'btn-outline-secondary'}" onclick="window.SaveToServeWeather.filterMap('${containerElId}', 'all')">
                All Risk Levels
              </button>
              <button type="button" class="btn ${this.activeFilter === 'level1' ? 'btn-success text-white' : 'btn-outline-success'}" onclick="window.SaveToServeWeather.filterMap('${containerElId}', 'level1')">
                <i class="bi bi-check-circle me-1"></i> Level 1: Low Risk
              </button>
              <button type="button" class="btn ${this.activeFilter === 'level2' ? 'btn-warning text-dark' : 'btn-outline-warning'}" onclick="window.SaveToServeWeather.filterMap('${containerElId}', 'level2')">
                <i class="bi bi-exclamation-triangle me-1"></i> Level 2: Caution Required
              </button>
              <button type="button" class="btn ${this.activeFilter === 'level3' ? 'btn-danger text-white' : 'btn-outline-danger'}" onclick="window.SaveToServeWeather.filterMap('${containerElId}', 'level3')">
                <i class="bi bi-x-octagon me-1"></i> Level 3: High Risk
              </button>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <span class="small text-muted">Active Weather Advisory:</span>
            <span class="badge ${risk.badge} py-2 px-3">${currentScenario.name} — ${risk.level}</span>
          </div>
        </div>

        <!-- Main Map & Risk Summary Grid -->
        <div class="row g-3 mb-3">
          <div class="col-lg-8">
            <div class="position-relative">
              <div id="${mapDivId}" style="width:100%; height:400px; border-radius:var(--radius-lg); border:1.5px solid var(--portal-border); z-index:1;"></div>
              
              <!-- 3-Level Accessible Legend Box -->
              <div class="map-legend-overlay p-2 bg-white rounded shadow-sm border small" style="position:absolute; bottom:12px; left:12px; z-index:1000; max-width:320px; font-size:0.78rem; opacity:0.96;">
                <div class="fw-bold mb-1 text-dark d-flex align-items-center justify-content-between">
                  <span><i class="bi bi-layers me-1"></i> Weather Risk Legend</span>
                  <span class="text-muted" style="font-size:0.7rem;">OpenStreetMap</span>
                </div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge bg-success" style="width:18px;height:18px;padding:0;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;">✓</span>
                  <span><strong>Level 1 — Low Risk:</strong> Relatively safe route conditions.</span>
                </div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge bg-warning text-dark" style="width:18px;height:18px;padding:0;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;">!</span>
                  <span><strong>Level 2 — Caution Required:</strong> Weather delays likely; review routes.</span>
                </div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge bg-danger" style="width:18px;height:18px;padding:0;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;">✕</span>
                  <span><strong>Level 3 — High Risk:</strong> Floods / hazards. Avoid affected routes.</span>
                </div>
                <hr class="my-1">
                <div class="d-flex flex-wrap gap-2 text-muted" style="font-size:0.72rem;">
                  <span>🍲 Donor</span>
                  <span>🏠 NGO</span>
                  <span>❄️ Safe Hub</span>
                  <span>🛣️ Corridor</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Risk Score & Safety Breakdown Panel -->
          <div class="col-lg-4">
            <div class="custom-card h-100 mb-0 p-3 d-flex flex-column justify-content-between" style="background:#FFFFFF;">
              <div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="fw-bold mb-0" style="color:var(--dark-olive);"><i class="bi bi-speedometer2 me-1"></i> Disruption Risk Index</h6>
                  <span class="badge ${risk.badge}">${risk.totalScore}/100</span>
                </div>

                <div class="text-center py-2">
                  <div class="risk-score-display" style="color:${risk.color}; font-size:2rem;">
                    ${risk.totalScore} <span class="fs-6 text-muted">/ 100</span>
                  </div>
                  <div class="risk-progress-bar my-2" style="height:8px;">
                    <div class="risk-progress-fill" style="width:${risk.totalScore}%; background-color:${risk.color};"></div>
                  </div>
                  <div class="small fw-bold" style="color:${risk.color};">${risk.level}</div>
                </div>

                <div class="p-2 rounded bg-light border small my-2">
                  <div class="fw-bold mb-1 text-dark"><i class="bi bi-shield-check text-success"></i> Safety Assessment:</div>
                  <div class="text-muted">${risk.summary}</div>
                </div>

                <div class="small text-muted mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span>${risk.breakdown.rainFactor.label}:</span>
                    <strong>${risk.breakdown.rainFactor.value} pts</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span>${risk.breakdown.floodFactor.label}:</span>
                    <strong>${risk.breakdown.floodFactor.value} pts</strong>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span>${risk.breakdown.transitFactor.label}:</span>
                    <strong>${risk.breakdown.transitFactor.value} pts</strong>
                  </div>
                </div>
              </div>

              <div class="p-2 rounded border small" style="background:#FFFDF5; border-color:#E8DC8A!important;">
                <div class="text-warning fw-bold mb-1"><i class="bi bi-info-circle-fill"></i> Operational Safety Notice:</div>
                <div class="text-muted" style="font-size:0.76rem;">
                  ${risk.cautionNote}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Explanations of All 3 Risk Levels -->
        <div class="row g-3">
          <div class="col-md-4">
            <div class="p-3 rounded border h-100" style="background:#F4FAF6; border-color:#BEE3D2!important;">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-success">Level 1</span>
                <strong class="text-success">Low Risk (Green)</strong>
              </div>
              <p class="small text-muted mb-0">
                Weather and route conditions are assessed as relatively safe. Available food pickup and delivery locations are open. <em>Note: Low risk does not guarantee every road is safe.</em>
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-3 rounded border h-100" style="background:#FFFDF5; border-color:#E8DC8A!important;">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-warning text-dark">Level 2</span>
                <strong class="text-dark">Moderate Risk (Amber)</strong>
              </div>
              <p class="small text-muted mb-0">
                Weather conditions may create transit delays or surface water. Review conditions, confirm pickup arrangements with NGO/donor before dispatch, and use rain-protected vehicles.
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-3 rounded border h-100" style="background:#FFFAFA; border-color:#F5BDB5!important;">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge bg-danger">Level 3</span>
                <strong class="text-danger">High Risk (Red)</strong>
              </div>
              <p class="small text-muted mb-0">
                Severe weather or flood hazards detected. <strong>Avoid affected routes.</strong> Never enter waterlogged areas. Redirect food to Safe Holding Hubs or issue on-site QR Vouchers.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.initLeafletInstance(mapDivId, containerElId, portalRole);
    }, 120);
  }

  filterMap(containerElId, filterKey) {
    this.activeFilter = filterKey;
    const mapDivId = `leafletMap_${containerElId}`;
    const mapState = this.maps[mapDivId];
    if (mapState) {
      this.updateLeafletMarkers(mapDivId, containerElId);
    } else {
      const user = window.SaveToServeAuth?.getCurrentUser();
      const role = user ? user.role : 'donor';
      this.renderWeatherMapWidget(containerElId, role);
    }
  }

  initLeafletInstance(mapDivId, containerElId, portalRole) {
    const mapEl = document.getElementById(mapDivId);
    if (!mapEl) return;

    if (this.maps[mapDivId] && this.maps[mapDivId].map) {
      try {
        this.maps[mapDivId].map.remove();
      } catch (e) {
        console.warn('Map cleanup error:', e);
      }
      delete this.maps[mapDivId];
    }

    const defaultCoords = [12.9716, 77.6200]; // Bengaluru center coordinates

    if (typeof L === 'undefined') {
      mapEl.innerHTML = `
        <div class="p-4 text-center bg-light rounded d-flex flex-column align-items-center justify-content-center h-100">
          <i class="bi bi-map text-primary fs-1 mb-2"></i>
          <p class="mb-0 text-muted">Interactive Weather Route Map (Leaflet / OpenStreetMap simulation)</p>
        </div>`;
      return;
    }

    try {
      const map = L.map(mapDivId, { zoomControl: true }).setView(defaultCoords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      this.maps[mapDivId] = {
        map,
        markers: [],
        routeLayers: [],
        containerElId,
        portalRole
      };

      this.updateLeafletMarkers(mapDivId, containerElId);

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 250);
    } catch (e) {
      console.error('Error initializing Leaflet map:', e);
    }
  }

  updateLeafletMarkers(mapDivId, containerElId) {
    const mapState = this.maps[mapDivId];
    if (!mapState || !mapState.map || typeof L === 'undefined') return;

    const { map } = mapState;

    // Clear existing layers
    mapState.markers.forEach(m => map.removeLayer(m));
    mapState.routeLayers.forEach(r => map.removeLayer(r));
    mapState.markers = [];
    mapState.routeLayers = [];

    const donations = window.SaveToServeDB?.getDonations() || [];
    const hubs = window.SaveToServeDB?.getHoldingHubs() || [];
    const scenarioKey = window.SaveToServeDB?.state?.weatherState?.activeScenario || 'normal';
    const risk = this.calculateDisruptionScore(scenarioKey);
    const filter = this.activeFilter;

    // Determine location risk level based on scenario and listing state
    const currentScenario = this.getScenario();

    const donorIcon = L.divIcon({
      html: `<div style="background:#7653A6;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:16px;border:2px solid #FFFFFF;">🍲</div>`,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const ngoIcon = L.divIcon({
      html: `<div style="background:#356B4A;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:16px;border:2px solid #FFFFFF;">🏠</div>`,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const hubIcon = L.divIcon({
      html: `<div style="background:#2563EB;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:16px;border:2px solid #FFFFFF;">❄️</div>`,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Add Donor markers
    donations.forEach(d => {
      if (d.donorCoords && d.donorCoords.length === 2) {
        // Evaluate item risk level
        let itemRiskLevel = 'level1';
        let itemBadge = '<span class="badge bg-success">Level 1 — Low Risk</span>';
        if (scenarioKey === 'flood_warning') {
          itemRiskLevel = 'level3';
          itemBadge = '<span class="badge bg-danger">Level 3 — High Risk (Avoid Arterial Corridor)</span>';
        } else if (scenarioKey === 'heavy_rain') {
          itemRiskLevel = 'level2';
          itemBadge = '<span class="badge bg-warning text-dark">Level 2 — Caution Required</span>';
        }

        // Apply filter
        if (filter !== 'all' && filter !== itemRiskLevel) {
          return;
        }

        const marker = L.marker(d.donorCoords, { icon: donorIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;font-size:13px;min-width:210px;">
            <div class="mb-1">${itemBadge}</div>
            <strong style="color:#543675;font-size:14px;">🍲 ${d.foodName}</strong><br>
            <span>🏢 <strong>${d.donorOrg}</strong></span><br>
            <span class="text-muted">📍 ${d.donorAddress}</span><br>
            <hr style="margin:6px 0;">
            <span>🍱 <strong>${d.portions} portions</strong> | Status: <b style="text-transform:uppercase;">${d.status}</b></span><br>
            <span>⏰ Safe until: ${new Date(d.safeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><br>
            <span>🌧️ Weather: <strong>${currentScenario.name}</strong> (${currentScenario.precipitation})</span><br>
            <div style="margin-top:6px;font-size:11px;color:#666;">
              <em>Last updated: Just now • Source: Simulated Meteorological Index</em>
            </div>
          </div>
        `);
        mapState.markers.push(marker);
      }
    });

    // Add Safe Holding Hubs
    hubs.forEach(h => {
      if (h.coords && h.coords.length === 2) {
        // Safe hubs are available as safe holding destinations across all levels
        if (filter === 'level3' || filter === 'all' || filter === 'level2') {
          const marker = L.marker(h.coords, { icon: hubIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family:sans-serif;font-size:13px;min-width:210px;">
              <span class="badge bg-primary mb-1">❄️ Safe Holding Hub (Intermediate Protection)</span><br>
              <strong style="color:#2563EB;font-size:14px;">${h.name}</strong><br>
              <span>📍 ${h.address}</span><br>
              <hr style="margin:6px 0;">
              <span>📦 Available Capacity: <strong>${h.capacityTotalPortions - h.currentOccupancy} / ${h.capacityTotalPortions} portions</strong></span><br>
              <span>🌡️ Temperature Zone: <strong>${h.temperatureZone}</strong></span><br>
              <div style="margin-top:6px;font-size:11px;color:#666;">
                <em>Safe destination when extreme rain or flooding prevents direct shelter transit.</em>
              </div>
            </div>
          `);
          mapState.markers.push(marker);
        }
      }
    });

    // Draw active routing polylines color-coded by scenario risk level
    const routeCoords = [
      [12.9784, 77.6408], // Indiranagar Donor
      [12.9698, 77.6432], // Domlur Arterial Junction
      [12.9611, 77.6145]  // Austin Town Shelter
    ];

    let routeColor = '#2E8540'; // Level 1: Green
    let routeDash = null;
    let routeRisk = 'level1';
    let routeLabel = 'Level 1 Safe Transit Corridor (Open)';

    if (scenarioKey === 'heavy_rain') {
      routeColor = '#D97706'; // Level 2: Amber
      routeDash = '8, 8';
      routeRisk = 'level2';
      routeLabel = 'Level 2 Waterlogged Transit Corridor (Caution Required)';
    } else if (scenarioKey === 'flood_warning') {
      routeColor = '#DC2626'; // Level 3: Red
      routeDash = '10, 10';
      routeRisk = 'level3';
      routeLabel = 'Level 3 Flooded Corridor (High Risk — Avoid Travel)';
    }

    if (filter === 'all' || filter === routeRisk) {
      const routeLine = L.polyline(routeCoords, {
        color: routeColor,
        weight: 5,
        dashArray: routeDash,
        opacity: 0.9
      }).addTo(map);

      routeLine.bindPopup(`
        <div style="font-family:sans-serif;font-size:13px;">
          <strong style="color:${routeColor};">${routeLabel}</strong><br>
          <span>Corridor: Indiranagar ➔ Domlur ➔ Austin Town</span><br>
          <span class="text-muted">Weather Risk: <strong>${risk.level}</strong></span><br>
          <div style="margin-top:4px;font-size:11px;color:#666;">
            ${scenarioKey === 'flood_warning' ? '<span class="text-danger">⚠️ Travel through this route is unsafe. Couriers are redirected to safe holding hubs.</span>' : 'Advisory active.'}
          </div>
        </div>
      `);

      mapState.routeLayers.push(routeLine);
    }
  }

  renderWeatherDashboard() {
    const container = document.getElementById('weather-rescue-view');
    if (!container) return;

    const currentScenario = this.getScenario();
    const risk = this.calculateDisruptionScore(currentScenario.key);
    const affected = this.getAffectedDonations();

    container.innerHTML = `
      <div class="container py-4">
        <!-- Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h2 class="mb-1 fw-bold" style="color:var(--dark-olive);">🌧️ Weather-Adaptive Food Rescue</h2>
            <p class="text-muted mb-0">Dynamic multi-path rerouting to prevent surplus food spoilage during extreme climate events.</p>
          </div>
          <span class="badge bg-light text-muted border px-3 py-2">
            <i class="bi bi-info-circle me-1"></i> SIMULATED WEATHER — DEMO DATA FOR RESCUE DRILLS
          </span>
        </div>

        <!-- Embedded Full Map Widget -->
        <div id="weather-rescue-master-map-container" class="mb-4"></div>

        <!-- Affected Donations & Alternative Rescue Plans -->
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-lightning-charge text-primary"></i> Affected Surplus Listings & Alternative Rescue Plans</h5>
            <span class="badge bg-secondary">${affected.length} Actionable Items</span>
          </div>

          ${affected.length === 0 ? `
            <div class="p-4 text-center text-muted">
              <i class="bi bi-check-circle-fill text-success fs-2 mb-2 d-block"></i>
              <p class="mb-0">All current rescue operations are moving smoothly under ${currentScenario.name}.</p>
            </div>
          ` : `
            <div class="row g-3">
              ${affected.map(item => `
                <div class="col-lg-6">
                  <div class="plan-card ${item.isUrgent ? 'plan-priority-high' : 'plan-priority-medium'}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span class="badge ${item.isUrgent ? 'badge-expiry-urgent' : 'badge-expiry-warning'} mb-1">
                          ⏰ Safe for ${item.hoursRemaining}h remaining
                        </span>
                        <h6 class="fw-bold mb-0" style="color:var(--dark-olive);">${item.donation.foodName}</h6>
                      </div>
                      <span class="badge bg-light text-dark border">${item.donation.portions} portions</span>
                    </div>

                    <p class="small text-muted mb-2">
                      <i class="bi bi-geo-alt me-1"></i> ${item.donation.donorOrg} (${item.donation.donorAddress})
                    </p>

                    <div class="p-2 bg-light rounded small mb-3 border">
                      <div class="text-danger fw-bold"><i class="bi bi-exclamation-triangle"></i> Disruption:</div>
                      <div>${item.reason}</div>
                    </div>

                    <div class="p-2 rounded small mb-3" style="background:var(--pastel-mint); border: 1px solid var(--soft-green);">
                      <div class="fw-bold" style="color:var(--deep-green);"><i class="bi bi-shield-check"></i> Recommended Adaptive Plan:</div>
                      <div>${item.planDetails.reason}</div>
                    </div>

                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-green w-100" onclick="window.SaveToServeWeather.applyAlternativePlan('${item.donation.id}', '${item.recommendedPlanType}', ${JSON.stringify(item.planDetails).replace(/"/g, '&quot;')})">
                        <i class="bi bi-check2-circle"></i> Apply Alternative Plan
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    setTimeout(() => {
      this.renderWeatherMapWidget('weather-rescue-master-map-container', 'admin');
    }, 100);
  }

  applyAlternativePlan(donationId, planType, planDetails) {
    const res = window.SaveToServeDB?.applyRescuePlan(donationId, planType, planDetails);
    if (res && res.success) {
      window.SaveToServeApp?.showToast(`Adaptive Rescue Plan Applied for ${res.donation.foodName}!`, 'success');
      this.renderWeatherDashboard();
    } else {
      window.SaveToServeApp?.showToast(res ? res.message : 'Error applying plan.', 'danger');
    }
  }
}

window.SaveToServeWeather = new WeatherAdaptiveRescueEngine();
window.RainRouteWeather = window.SaveToServeWeather;
