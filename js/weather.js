/**
 * Save to Serve - Signature Innovation: Weather-Adaptive Food Rescue Engine
 * Transparent Risk Score, Real-time Disruption Matching, Smart Alternative Plans & Route Map
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class WeatherAdaptiveRescueEngine {
  constructor() {
    this.map = null;
    this.markers = [];
    this.routeLayers = [];
  }

  getScenario() {
    const key = window.SaveToServeDB.state.weatherState.activeScenario || 'normal';
    return {
      key,
      ...window.SaveToServeDB.state.weatherState.scenarios[key]
    };
  }

  setScenario(scenarioKey) {
    const res = window.SaveToServeDB.setWeatherScenario(scenarioKey);
    this.renderWeatherDashboard();
    return res;
  }

  calculateDisruptionScore(scenarioKey) {
    const scenario = window.SaveToServeDB.state.weatherState.scenarios[scenarioKey] || window.SaveToServeDB.state.weatherState.scenarios.normal;
    
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

    return {
      totalScore,
      breakdown: {
        rainFactor: { label: 'Precipitation Severity (40%)', value: rainWeight, weighted: Math.round(rainWeight * 0.40) },
        floodFactor: { label: 'Route Vulnerability & Inundation (35%)', value: floodWeight, weighted: Math.round(floodWeight * 0.35) },
        transitFactor: { label: 'Volunteer / Vehicle Deficit (25%)', value: volDeficitWeight, weighted: Math.round(volDeficitWeight * 0.25) }
      },
      level: totalScore > 75 ? 'Critical' : totalScore > 45 ? 'Moderate' : 'Low'
    };
  }

  getAffectedDonations() {
    const scenarioKey = window.SaveToServeDB.state.weatherState.activeScenario;
    const donations = window.SaveToServeDB.getDonations();
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
              reason: 'Dispatch authorized NGO 4-wheeler vehicle for rain-protected batch transport.'
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

  initMap(elementId = 'weatherMap') {
    const mapEl = document.getElementById(elementId);
    if (!mapEl) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const defaultCoords = [12.9716, 77.6200];
    
    if (typeof L === 'undefined') {
      mapEl.innerHTML = `
        <div class="p-4 text-center bg-light rounded">
          <i class="bi bi-map text-primary fs-1"></i>
          <p class="mt-2 text-muted">Interactive Weather Route Map (Leaflet / OpenStreetMap simulation)</p>
        </div>`;
      return;
    }

    try {
      this.map = L.map(elementId, { zoomControl: true }).setView(defaultCoords, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(this.map);

      this.updateMapMarkers();
    } catch (e) {
      console.error('Error initializing map:', e);
    }
  }

  updateMapMarkers() {
    if (!this.map || typeof L === 'undefined') return;

    this.markers.forEach(m => this.map.removeLayer(m));
    this.routeLayers.forEach(r => this.map.removeLayer(r));
    this.markers = [];
    this.routeLayers = [];

    const donations = window.SaveToServeDB.getDonations();
    const hubs = window.SaveToServeDB.getHoldingHubs();
    const scenarioKey = window.SaveToServeDB.state.weatherState.activeScenario;

    const donorIcon = L.divIcon({
      html: '<div style="background:#7653A6;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">🍲</div>',
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const ngoIcon = L.divIcon({
      html: '<div style="background:#356B4A;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">🏠</div>',
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const hubIcon = L.divIcon({
      html: '<div style="background:#2563EB;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">❄️</div>',
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    donations.forEach(d => {
      if (d.donorCoords && d.donorCoords.length === 2) {
        const marker = L.marker(d.donorCoords, { icon: donorIcon }).addTo(this.map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;font-size:13px;">
            <strong style="color:#543675;">${d.foodName}</strong><br>
            <span>🏢 ${d.donorOrg}</span><br>
            <span>🍱 ${d.portions} portions | Status: <b style="text-transform:uppercase;">${d.status}</b></span><br>
            <span>⏰ Safe until: ${new Date(d.safeUntil).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
        `);
        this.markers.push(marker);
      }
    });

    hubs.forEach(h => {
      if (h.coords && h.coords.length === 2) {
        const marker = L.marker(h.coords, { icon: hubIcon }).addTo(this.map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;font-size:13px;">
            <strong style="color:#2563EB;">Safe Holding Hub</strong><br>
            <span>📍 ${h.name}</span><br>
            <span>📦 Capacity: ${h.currentOccupancy} / ${h.capacityTotalPortions} portions</span><br>
            <span>❄️ Temp: ${h.temperatureZone}</span>
          </div>
        `);
        this.markers.push(marker);
      }
    });

    const routeCoords = [
      [12.9784, 77.6408],
      [12.9698, 77.6432],
      [12.9611, 77.6145]
    ];

    let routeColor = '#356B4A';
    if (scenarioKey === 'heavy_rain') routeColor = '#D97706';
    if (scenarioKey === 'flood_warning') routeColor = '#DC2626';

    const routeLine = L.polyline(routeCoords, {
      color: routeColor,
      weight: 4,
      dashArray: scenarioKey !== 'normal' ? '8, 8' : null,
      opacity: 0.85
    }).addTo(this.map);
    
    this.routeLayers.push(routeLine);
  }

  renderWeatherDashboard() {
    const container = document.getElementById('weather-rescue-view');
    if (!container) return;

    const currentScenario = this.getScenario();
    const risk = this.calculateDisruptionScore(currentScenario.key);
    const affected = this.getAffectedDonations();

    const riskColorClass = risk.totalScore > 75 ? 'text-danger' : risk.totalScore > 45 ? 'text-warning' : 'text-success';
    const riskBarColor = risk.totalScore > 75 ? '#DC2626' : risk.totalScore > 45 ? '#D97706' : '#2E8540';

    container.innerHTML = `
      <div class="container py-4">
        <!-- Safety Disclaimer Banner -->
        <div class="alert alert-warning d-flex align-items-center gap-3 mb-4 shadow-sm" role="alert" style="background:#FFF8E6;border-color:#FFE4A0;">
          <i class="bi bi-shield-exclamation text-warning fs-3"></i>
          <div class="small text-dark">
            <strong>DEMO SAFETY NOTICE:</strong> Weather conditions, route assessments, and risk calculations are simulated for demonstration purposes. Always follow official local authority guidance. Never travel through flooded, waterlogged, or hazardous roads.
          </div>
        </div>

        <!-- Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h2 class="mb-1 fw-bold" style="color:var(--deep-purple);">🌧️ Weather-Adaptive Food Rescue</h2>
            <p class="text-muted mb-0">Dynamic multi-path rerouting to prevent surplus food spoilage during extreme climate events.</p>
          </div>
          <span class="badge bg-light text-muted border px-3 py-2">
            <i class="bi bi-info-circle me-1"></i> SIMULATED WEATHER — DEMO DATA, NOT LIVE CONDITIONS
          </span>
        </div>

        <!-- Scenario Switcher -->
        <div class="weather-control-box">
          <h5 class="fw-bold mb-3" style="color:var(--deep-purple);">Select Climate Simulation Scenario:</h5>
          <div class="scenario-btn-group mb-3">
            <button class="scenario-btn ${currentScenario.key === 'normal' ? 'active' : ''}" onclick="window.SaveToServeWeather.setScenario('normal')">
              <i class="bi bi-sun"></i> Normal Weather
            </button>
            <button class="scenario-btn ${currentScenario.key === 'heavy_rain' ? 'active' : ''}" onclick="window.SaveToServeWeather.setScenario('heavy_rain')">
              <i class="bi bi-cloud-rain-heavy"></i> Heavy Rain (45 mm/hr)
            </button>
            <button class="scenario-btn ${currentScenario.key === 'flood_warning' ? 'active' : ''}" onclick="window.SaveToServeWeather.setScenario('flood_warning')">
              <i class="bi bi-tsunami"></i> Flood Warning (Red Alert)
            </button>
            <button class="scenario-btn ${currentScenario.key === 'volunteer_shortage' ? 'active' : ''}" onclick="window.SaveToServeWeather.setScenario('volunteer_shortage')">
              <i class="bi bi-people"></i> Volunteer Shortage
            </button>
          </div>
          <div class="p-3 bg-white rounded border d-flex align-items-center gap-3">
            <i class="bi ${currentScenario.icon} fs-2 text-primary"></i>
            <div>
              <div class="fw-bold">${currentScenario.name} Active</div>
              <div class="text-muted small">${currentScenario.advisory}</div>
            </div>
          </div>
        </div>

        <!-- Risk Score & Factors Grid -->
        <div class="row g-4 mb-4">
          <div class="col-lg-5">
            <div class="custom-card h-100 mb-0">
              <div class="custom-card-header">
                <h5 class="card-title-custom"><i class="bi bi-speedometer2"></i> Transparent Disruption Risk Score</h5>
                <span class="badge ${risk.totalScore > 75 ? 'bg-danger' : risk.totalScore > 45 ? 'bg-warning text-dark' : 'bg-success'}">${risk.level} Risk</span>
              </div>
              <div class="text-center py-2">
                <div class="risk-score-display ${riskColorClass}">${risk.totalScore} <span class="fs-5 text-muted">/ 100</span></div>
                <div class="risk-progress-bar">
                  <div class="risk-progress-fill" style="width: ${risk.totalScore}%; background-color: ${riskBarColor};"></div>
                </div>
              </div>
              <hr class="my-3">
              <div class="small">
                <div class="fw-bold text-dark mb-2">Explainable Risk Formula:</div>
                <div class="bg-light p-2 rounded mb-3 font-monospace" style="font-size:0.75rem;">
                  Score = (Rain × 40%) + (Flood × 35%) + (Transit Deficit × 25%)
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span>${risk.breakdown.rainFactor.label}:</span>
                  <strong>${risk.breakdown.rainFactor.value} (${risk.breakdown.rainFactor.weighted} pts)</strong>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span>${risk.breakdown.floodFactor.label}:</span>
                  <strong>${risk.breakdown.floodFactor.value} (${risk.breakdown.floodFactor.weighted} pts)</strong>
                </div>
                <div class="d-flex justify-content-between">
                  <span>${risk.breakdown.transitFactor.label}:</span>
                  <strong>${risk.breakdown.transitFactor.value} (${risk.breakdown.transitFactor.weighted} pts)</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="custom-card h-100 mb-0">
              <div class="custom-card-header">
                <h5 class="card-title-custom"><i class="bi bi-map"></i> Dynamic Route & Transit Map</h5>
                <span class="badge bg-light text-dark border">OpenStreetMap / Leaflet</span>
              </div>
              <div id="weatherMap"></div>
              <div class="d-flex flex-wrap gap-3 mt-3 small text-muted">
                <span><span style="color:#7653A6;">●</span> Donor Kitchen</span>
                <span><span style="color:#356B4A;">●</span> NGO Shelter</span>
                <span><span style="color:#2563EB;">●</span> Safe Holding Hub</span>
                <span><span style="color:${riskBarColor}; font-weight:bold;">---</span> Active Rescue Corridor</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Affected Donations & Alternative Rescue Plans -->
        <div class="custom-card">
          <div class="custom-card-header">
            <h5 class="card-title-custom"><i class="bi bi-lightning-charge"></i> Affected Surplus Listings & Alternative Rescue Plans</h5>
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
                        <h6 class="fw-bold mb-0" style="color:var(--deep-purple);">${item.donation.foodName}</h6>
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
      this.initMap('weatherMap');
    }, 100);
  }

  applyAlternativePlan(donationId, planType, planDetails) {
    const res = window.SaveToServeDB.applyRescuePlan(donationId, planType, planDetails);
    if (res.success) {
      window.SaveToServeApp?.showToast(`Adaptive Rescue Plan Applied for ${res.donation.foodName}!`, 'success');
      this.renderWeatherDashboard();
    } else {
      window.SaveToServeApp?.showToast(res.message, 'danger');
    }
  }
}

window.SaveToServeWeather = new WeatherAdaptiveRescueEngine();
window.RainRouteWeather = window.SaveToServeWeather;
