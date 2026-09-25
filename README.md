# 🌧️ RainRoute (Save2Serve)
### *Rescue Food. Reduce Waste. Reach Those in Need.*

> **Problem Statement FY001 — Food Rescue & Surplus Donation Platform**

RainRoute connects restaurants, banquets, hostels, caterers, and individuals having **existing surplus food** with nearby NGOs, shelters, and volunteers. Built with **Weather-Adaptive Food Rescue Intelligence**, RainRoute prevents food spoilage during extreme climate events (monsoon downpours, waterlogging, courier deficits) through transparent risk scores, safe micro-holding hubs, direct NGO dispatch, and QR vouchers.

---

## 🌟 Key Features

1. **Four Dedicated Portals**:
   - 🍲 **Donor Portal**: List existing surplus food, set safe-use deadlines, track live claims, and verify pickups with one-time codes.
   - 🏠 **NGO Shelter Portal**: Browse available surplus nearby with real-time dietary and urgency filters, claim donations, broadcast urgent requirements, and confirm beneficiary meal distribution.
   - 🚴 **Volunteer Portal**: Accept dispatch tasks, perform secure code-verified handoffs, and track completion history.
   - 🛡️ **Admin Operations Console**: Review KYC submissions, moderate food listings, manage Safe Holding Hubs, and inspect platform audit logs.

2. **⭐ Signature Innovation — Weather-Adaptive Rescue**:
   - **4 Climate Scenarios**: Normal Weather, Heavy Rain (45 mm/hr), Flood Warning (Red Alert), Volunteer Shortage.
   - **Transparent 0–100 Risk Score**: `Score = (Rain × 40%) + (Flood × 35%) + (Transit Deficit × 25%)`.
   - **Dynamic Leaflet / OpenStreetMap Corridors**: Real-time visualization of safe transit routes.
   - **Actionable Alternative Plans**: Automatic rerouting to Safe Holding Hubs, 4-wheeler NGO vans, or walking-distance QR vouchers.

3. **❄️ Safe Temporary Holding Hubs**:
   - Capacity tracking across community fridges and partner cold storages.
   - Enforced safe-use deadline compliance.

4. **🌱 Dynamic Impact & Environmental Dashboard**:
   - Metrics computed from actual logged rescues.
   - Portions rescued, waste prevented (kg), CO₂e emissions avoided, and water footprint saved.
   - Interactive Chart.js graphs.

5. **📱 Low-Connectivity & SMS Fallback**:
   - Simulated SMS / WhatsApp notification preview drawer for offline courier dispatch.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher recommended)

### Running Locally
1. Clone or download the repository:
   ```bash
   git clone https://github.com/priyswara/hackwave_26.git
   cd hackwave_26
   ```

2. Start the built-in HTTP server:
   ```bash
   npm start
   ```
   *or*
   ```bash
   node server.js
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🔑 Demo Login Credentials

For judging and demonstration, 1-click login buttons are available on the login page:

| Role | Demo Email | Password | Organization / Name |
|---|---|---|---|
| **Donor** | `donor@rainroute.org` | `password123` | Chef Rajesh (Spice Symphony Grand Banquet) |
| **NGO** | `ngo@rainroute.org` | `password123` | Sister Ananya (Asha Food & Hope Shelter) |
| **Volunteer** | `volunteer@rainroute.org` | `password123` | Karan Verma (Rescue Courier) |
| **Admin** | `admin@rainroute.org` | `password123` | Super Admin (Operations Command) |

---

## 📂 Project Structure

```
├── assets/                  # Hero illustrations, logos, icons
├── css/
│   └── style.css            # Olive Green Design System
├── js/
│   ├── data.js              # Centralized Store, State & Persistence
│   ├── auth.js              # Auth & Simulated OTP Flow
│   ├── weather.js           # Signature Weather-Adaptive Rescue Engine
│   ├── donations.js         # Donor Portal Operations
│   ├── ngo.js               # NGO Portal & Claim System
│   ├── volunteer.js         # Volunteer Dispatch & Verification
│   ├── admin.js             # Admin Console & KYC Pipeline
│   ├── hubs.js              # Safe Holding Hubs Manager
│   ├── impact.js            # Impact Analytics & Chart.js Visuals
│   ├── kyc.js               # Simulated Document Verification
│   ├── qr.js                # QR Code Voucher Generator & Terminal
│   ├── notifications.js     # Low-Connectivity SMS & Push Center
│   └── app.js               # Navigation & 7-Step Demo Guide
├── index.html               # Semantic, Responsive HTML Application
├── package.json             # Scripts and metadata
├── server.js                # Lightweight Node.js Server
└── README.md                # Documentation
```

---

## ⚖️ Disclaimers
- **Simulated Integrations**: Weather conditions, OTP SMS delivery, and KYC identity documents are simulated for zero-cost offline demonstration.
- **Safety Protocol**: Always follow official local authority advisories during severe flood conditions.
