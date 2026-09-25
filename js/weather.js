/**
 * Save to Serve - Weather Rescue Map Engine
 * Simple, Clean & Responsive Interactive Map
 * 
 * 1. LOW (Green) - Low weather risk
 * 2. MEDIUM (Yellow) - Medium weather risk
 * 3. HIGH (Red) - High weather risk
 * 
 * Uses actual weather state from SaveToServeDB.
 * If data is unavailable, displays "Weather data unavailable".
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

class WeatherRescueEngine {
  constructor() {
    this.activeMaps = {};
  }

  /**
   * Get current weather condition and assess risk level: LOW, MEDIUM, or HIGH.
   */
  getCurrentWeatherInfo() {
    const weatherState = window.SaveToServeDB?.state?.weatherState;
    if (!weatherState) {
      return {
        available: false,
        name: 'Weather data unavailable',
        riskLevel: 'UNKNOWN',
        badgeClass: 'bg-secondary text-white',
        color: '#6c757d',
        rainfall: 'N/A'
      };
    }

    const activeKey = weatherState.activeScenario || 'normal';
    const scenario = weatherState.scenarios?.[activeKey];

    if (!scenario) {
      return {
        available: false,
        name: 'Weather data unavailable',
        riskLevel: 'UNKNOWN',
        badgeClass: 'bg-secondary text-white',
        color: '#6c757d',
        rainfall: 'N/A'
      };
    }

    let riskLevel = 'LOW';
    let badgeClass = 'bg-success text-white';
    let color = '#2E8540';

    const riskScore = scenario.riskScore || 0;
    const floodRisk = (scenario.factors?.floodRisk || '').toLowerCase();

    if (riskScore > 75 || floodRisk.includes('critical') || floodRisk.includes('red alert') || activeKey === 'flood_warning') {
      riskLevel = 'HIGH';
      badgeClass = 'bg-danger text-white';
      color = '#DC2626';
    } else if (riskScore > 40 || floodRisk.includes('moderate') || activeKey === 'heavy_rain' || activeKey === 'volunteer_shortage') {
      riskLevel = 'MEDIUM';
      badgeClass = 'bg-warning text-dark';
      color = '#D97706';
    } else {
      riskLevel = 'LOW';
      badgeClass = 'bg-success text-white';
      color = '#2E8540';
    }

    return {
      available: true,
      key: activeKey,
      name: scenario.name || 'Current Weather',
      riskScore,
      riskLevel,
      badgeClass,
      color,
      rainfall: scenario.factors?.rainfall || '0 mm/hr',
      floodRisk: scenario.factors?.floodRisk || 'Low',
      advisory: scenario.advisory || 'Standard operations.'
    };
  }

  /**
   * Render the clean Weather Rescue map in the given container.
   */
  renderMap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const weather = this.getCurrentWeatherInfo();
    const mapElementId = `map_canvas_${containerId}`;
    const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    container.innerHTML = `
      <div class="weather-clean-card">
        <!-- Header & Tiny Legend: LOW, MEDIUM, HIGH ONLY -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div class="d-flex align-items-center gap-2">
            <h5 class="fw-bold mb-0" style="color:var(--dark-olive);">
              <i class="bi bi-cloud-rain-heavy text-primary me-1"></i> Weather Rescue Map
            </h5>
            ${weather.available ? `
              <span class="badge ${weather.badgeClass} ms-1">${weather.riskLevel} RISK</span>
            ` : `
              <span class="badge bg-secondary ms-1">Weather data unavailable</span>
            `}
          </div>

          <!-- Tiny Legend -->
          <div class="d-flex align-items-center gap-3 bg-light px-3 py-1 rounded border small">
            <span class="d-inline-flex align-items-center gap-1 fw-bold text-success">
              <span style="display:inline-block;width:10px;height:10px;background:#2E8540;border-radius:50%;"></span> LOW
            </span>
            <span class="d-inline-flex align-items-center gap-1 fw-bold" style="color:#D97706;">
              <span style="display:inline-block;width:10px;height:10px;background:#D97706;border-radius:50%;"></span> MEDIUM
            </span>
            <span class="d-inline-flex align-items-center gap-1 fw-bold text-danger">
              <span style="display:inline-block;width:10px;height:10px;background:#DC2626;border-radius:50%;"></span> HIGH
            </span>
          </div>
        </div>

        <!-- Weather Status Subtitle -->
        <div class="small text-muted mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            ${weather.available ? `
              <span><strong>Condition:</strong> ${weather.name} (${weather.rainfall})</span>
              <span class="ms-2"><strong>Risk Assessment:</strong> <span class="badge ${weather.badgeClass}">${weather.riskLevel}</span></span>
            ` : `
              <span class="text-warning"><i class="bi bi-exclamation-circle me-1"></i> Weather data unavailable</span>
            `}
          </div>
          <div>
            <i class="bi bi-clock me-1"></i> Last updated: ${lastUpdated}
          </div>
        </div>

        <!-- Map Canvas -->
        <div id="${mapElementId}" class="weather-map-canvas" style="width:100%; height:450px; border-radius:12px; border:1.5px solid var(--portal-border); background:#EEF2F6;"></div>
      </div>
    `;

    setTimeout(() => {
      this.initLeaflet(mapElementId, weather);
    }, 40);
  }

  initLeaflet(mapId, weather) {
    const el = document.getElementById(mapId);
    if (!el) return;

    // Teardown previous instance on this canvas
    if (this.activeMaps[mapId]) {
      try {
        this.activeMaps[mapId].remove();
      } catch (e) {}
      delete this.activeMaps[mapId];
    }
    el._leaflet_id = null;

    if (typeof L === 'undefined') {
      el.innerHTML = '<div class="p-4 text-center text-muted">Loading Leaflet Map...</div>';
      return;
    }

    try {
      const map = L.map(mapId, {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([12.9716, 77.6200], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
      }).addTo(map);

      this.activeMaps[mapId] = map;

      const createPin = (color, text) => {
        return L.divIcon({
          html: `<div style="background:${color};color:#FFFFFF;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid #FFFFFF;font-size:10px;font-weight:700;">${text}</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
      };

      const iconLow = createPin('#2E8540', 'LOW');
      const iconMed = createPin('#D97706', 'MED');
      const iconHigh = createPin('#DC2626', 'HIGH');

      const donations = window.SaveToServeDB?.getDonations() || [];
      const hubs = window.SaveToServeDB?.getHoldingHubs() || [];

      // Determine marker color based on actual weather
      let activeIcon = iconLow;
      let activeBadge = 'bg-success';
      if (weather.riskLevel === 'HIGH') {
        activeIcon = iconHigh;
        activeBadge = 'bg-danger';
      } else if (weather.riskLevel === 'MEDIUM') {
        activeIcon = iconMed;
        activeBadge = 'bg-warning text-dark';
      }

      // Add donor location markers
      donations.forEach(d => {
        if (d.donorCoords && d.donorCoords.length === 2) {
          const marker = L.marker(d.donorCoords, { icon: activeIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family:sans-serif;font-size:13px;padding:2px;min-width:180px;">
              <span class="badge ${activeBadge}">${weather.riskLevel} RISK</span><br>
              <strong style="margin-top:4px;display:inline-block;font-size:13px;color:#333;">${d.foodName}</strong><br>
              <span style="color:#666;">${d.donorOrg}</span><br>
              <span style="color:#888;font-size:12px;">${d.donorAddress}</span><br>
              <span style="font-weight:bold;color:#444;">${d.portions} portions</span><br>
              <div class="mt-1 small text-muted"><em>Weather: ${weather.available ? weather.name : 'Data unavailable'}</em></div>
            </div>
          `);
        }
      });

      // Add safe hub markers (always safe/low risk)
      hubs.forEach(h => {
        if (h.coords && h.coords.length === 2) {
          const marker = L.marker(h.coords, { icon: iconLow }).addTo(map);
          marker.bindPopup(`
            <div style="font-family:sans-serif;font-size:13px;padding:2px;min-width:180px;">
              <span class="badge bg-success">LOW RISK</span><br>
              <strong style="margin-top:4px;display:inline-block;font-size:13px;color:#2563EB;">Safe Holding Hub</strong><br>
              <span>${h.name}</span><br>
              <span style="color:#888;font-size:12px;">${h.address}</span>
            </div>
          `);
        }
      });

      // Add route line with actual risk color
      const routeCoords = [
        [12.9784, 77.6408],
        [12.9698, 77.6432],
        [12.9611, 77.6145]
      ];

      L.polyline(routeCoords, {
        color: weather.color,
        weight: 4,
        opacity: 0.85,
        dashArray: weather.riskLevel === 'LOW' ? null : '6, 6'
      }).addTo(map);

      setTimeout(() => {
        if (map && map.invalidateSize) {
          map.invalidateSize();
        }
      }, 120);
    } catch (err) {
      console.error('Error in initLeaflet:', err);
    }
  }

  renderWeatherMapWidget(containerId) {
    this.renderMap(containerId);
  }

  renderWeatherDashboard() {
    const container = document.getElementById('weather-rescue-view');
    if (!container) return;

    container.innerHTML = `
      <div class="container py-4">
        <div id="weather-rescue-clean-box"></div>
      </div>
    `;

    this.renderMap('weather-rescue-clean-box');
  }
}

window.SaveToServeWeather = new WeatherRescueEngine();
window.RainRouteWeather = window.SaveToServeWeather;
