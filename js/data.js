/**
 * Save to Serve - Centralized Data Store & State Management
 * Persistent across all 4 portals via localStorage
 * Tagline: Save Food. Serve People. Reduce Waste.
 */

const STORAGE_KEY = 'savetoserve_state_v1';

// Initial clean seed data
const INITIAL_STATE = {
  users: [
    {
      id: 'usr-donor-1',
      name: 'Chef Rajesh Sharma',
      orgName: 'Spice Symphony Grand Banquet',
      email: 'donor@savetoserve.org',
      phone: '+91 98765 43210',
      role: 'donor',
      password: 'password123',
      kycStatus: 'approved',
      verificationDetails: {
        docType: 'FSSAI Food Safety License',
        docNumber: 'FSSAI-KA-10020043000123',
        submittedAt: '2026-09-01T10:00:00Z',
        reviewedAt: '2026-09-02T11:00:00Z',
        rejectionReason: ''
      },
      address: '24 MG Road, Indiranagar, Bengaluru',
      coords: [12.9784, 77.6408],
      registeredAt: '2026-09-01T10:00:00Z',
      verifiedDoc: 'FSSAI License #10020043000123 (Verified)'
    },
    {
      id: 'usr-ngo-1',
      name: 'Sister Ananya Roy',
      orgName: 'Asha Food & Hope Shelter',
      email: 'ngo@savetoserve.org',
      phone: '+91 98765 11223',
      role: 'ngo',
      password: 'password123',
      kycStatus: 'approved',
      verificationDetails: {
        docType: 'NGO Darpan / 80G Certificate',
        docNumber: 'DARPAN-KA-2021-02981',
        submittedAt: '2026-09-05T11:30:00Z',
        reviewedAt: '2026-09-06T09:00:00Z',
        rejectionReason: ''
      },
      address: '42 Shelter Lane, Austin Town, Bengaluru',
      coords: [12.9611, 77.6145],
      beneficiaryCapacity: 120,
      registeredAt: '2026-09-05T11:30:00Z',
      verifiedDoc: 'NGO Darpan Reg #KA/2021/02981 (Verified)'
    },
    {
      id: 'usr-vol-1',
      name: 'Karan Verma',
      orgName: 'Save to Serve Volunteer Corps',
      email: 'volunteer@savetoserve.org',
      phone: '+91 98765 88990',
      role: 'volunteer',
      password: 'password123',
      kycStatus: 'approved',
      verificationDetails: {
        docType: 'Volunteer Photo ID & Safety Card',
        docNumber: 'VOL-SEC-2026-8819',
        submittedAt: '2026-09-10T14:15:00Z',
        reviewedAt: '2026-09-11T10:00:00Z',
        rejectionReason: ''
      },
      address: '15 Koramangala 4th Block, Bengaluru',
      coords: [12.9352, 77.6245],
      vehicleType: 'Two-Wheeler (Insulated Delivery Bag)',
      registeredAt: '2026-09-10T14:15:00Z',
      verifiedDoc: 'Volunteer ID & Safety Training Card (Verified)'
    },
    {
      id: 'usr-admin-1',
      name: 'Operations Administrator',
      orgName: 'Save to Serve Central Command',
      email: 'admin@savetoserve.org',
      phone: '+91 98765 00000',
      role: 'admin',
      password: 'password123',
      kycStatus: 'approved',
      verificationDetails: {
        docType: 'Platform Operations Clearance',
        docNumber: 'ADMIN-AUTH-001',
        submittedAt: '2026-08-15T09:00:00Z',
        reviewedAt: '2026-08-15T09:00:00Z',
        rejectionReason: ''
      },
      address: 'Save to Serve Command Center, Bengaluru',
      coords: [12.9716, 77.5946],
      registeredAt: '2026-08-15T09:00:00Z',
      verifiedDoc: 'Platform Operations Clearance'
    },
    {
      id: 'usr-donor-pending',
      name: 'Priya Iyer',
      orgName: 'Greenwood Corporate Cafeteria',
      email: 'newdonor@savetoserve.org',
      phone: '+91 98765 77711',
      role: 'donor',
      password: 'password123',
      kycStatus: 'pending',
      verificationDetails: {
        docType: 'FSSAI Food Safety License',
        docNumber: 'FSSAI-KA-2026-99014',
        submittedAt: '2026-09-24T08:00:00Z',
        reviewedAt: null,
        rejectionReason: ''
      },
      address: 'Outer Ring Road, Bellandur, Bengaluru',
      coords: [12.9260, 77.6762],
      registeredAt: '2026-09-24T08:00:00Z',
      verifiedDoc: 'FSSAI License #KA-2026-99014 (Pending Review)'
    },
    {
      id: 'usr-vol-pending',
      name: 'Rohit Deshmukh',
      orgName: 'Community First Volunteers',
      email: 'newvolunteer@savetoserve.org',
      phone: '+91 98765 33445',
      role: 'volunteer',
      password: 'password123',
      kycStatus: 'pending',
      verificationDetails: {
        docType: 'Volunteer Photo ID & Safety Card',
        docNumber: 'VOL-SAFETY-BLR-4412',
        submittedAt: '2026-09-24T09:30:00Z',
        reviewedAt: null,
        rejectionReason: ''
      },
      address: 'HSR Layout Sector 2, Bengaluru',
      coords: [12.9121, 77.6446],
      vehicleType: 'Covered Four-Wheeler (Eco Van)',
      registeredAt: '2026-09-24T09:30:00Z',
      verifiedDoc: 'Safety Training Certificate (Pending Review)'
    }
  ],

  donations: [
    {
      id: 'DON-2026-101',
      foodName: '50 Portions Veg Dum Biryani & Raitha',
      category: 'Cooked Meal',
      portions: 50,
      quantityKg: 17.5,
      foodType: 'veg',
      prepTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      safeUntil: new Date(Date.now() + 3.5 * 3600000).toISOString(),
      donorId: 'usr-donor-1',
      donorName: 'Chef Rajesh Sharma',
      donorOrg: 'Spice Symphony Grand Banquet',
      donorPhone: '+91 98765 43210',
      donorAddress: '24 MG Road, Indiranagar, Bengaluru',
      donorCoords: [12.9784, 77.6408],
      storageInfo: 'Packed hot in food-grade thermal containers. Ready for immediate pickup.',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
      status: 'available',
      claimedByNgoId: null,
      claimedByNgoName: null,
      claimTimestamp: null,
      assignedVolunteerId: null,
      assignedVolunteerName: null,
      pickupCode: 'STS-7492',
      pickupTimestamp: null,
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0,
      qrVoucherCode: 'VOUCHER-STS-101',
      qrVoucherRedeemed: false,
      holdingHubId: null,
      weatherRescuePlan: null,
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
    },
    {
      id: 'DON-2026-102',
      foodName: '35 Meal Packs: Paneer Butter Masala & Roti',
      category: 'Cooked Meal',
      portions: 35,
      quantityKg: 12.0,
      foodType: 'veg',
      prepTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      safeUntil: new Date(Date.now() + 2 * 3600000).toISOString(),
      donorId: 'usr-donor-1',
      donorName: 'Chef Rajesh Sharma',
      donorOrg: 'Spice Symphony Grand Banquet',
      donorPhone: '+91 98765 43210',
      donorAddress: '24 MG Road, Indiranagar, Bengaluru',
      donorCoords: [12.9784, 77.6408],
      storageInfo: 'Foil-wrapped portions kept in warming cabinet.',
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60',
      status: 'claimed',
      claimedByNgoId: 'usr-ngo-1',
      claimedByNgoName: 'Asha Food & Hope Shelter',
      claimTimestamp: new Date(Date.now() - 40 * 60000).toISOString(),
      assignedVolunteerId: 'usr-vol-1',
      assignedVolunteerName: 'Karan Verma',
      pickupCode: 'STS-8831',
      pickupTimestamp: null,
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0,
      qrVoucherCode: 'VOUCHER-STS-102',
      qrVoucherRedeemed: false,
      holdingHubId: null,
      weatherRescuePlan: null,
      createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString()
    },
    {
      id: 'DON-2026-103',
      foodName: '40 Fresh Baked Whole Wheat Breads & Buns',
      category: 'Bakery',
      portions: 40,
      quantityKg: 10.0,
      foodType: 'veg',
      prepTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      safeUntil: new Date(Date.now() + 18 * 3600000).toISOString(),
      donorId: 'usr-donor-1',
      donorName: 'Chef Rajesh Sharma',
      donorOrg: 'Spice Symphony Grand Banquet',
      donorPhone: '+91 98765 43210',
      donorAddress: '100 Feet Rd, Indiranagar, Bengaluru',
      donorCoords: [12.9719, 77.6412],
      storageInfo: 'Sealed dry paper packaging. Room temperature safe.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
      status: 'completed',
      claimedByNgoId: 'usr-ngo-1',
      claimedByNgoName: 'Asha Food & Hope Shelter',
      claimTimestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      assignedVolunteerId: 'usr-vol-1',
      assignedVolunteerName: 'Karan Verma',
      pickupCode: 'STS-3319',
      pickupTimestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      deliveryTimestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
      distributionTimestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      beneficiariesReached: 40,
      qrVoucherCode: 'VOUCHER-STS-103',
      qrVoucherRedeemed: true,
      holdingHubId: null,
      weatherRescuePlan: null,
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
    }
  ],

  holdingHubs: [
    {
      id: 'HUB-01',
      name: 'Indiranagar Community Safe Fridge Hub',
      location: '12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru',
      coords: [12.9698, 77.6432],
      status: 'approved',
      capacityTotalPortions: 150,
      currentOccupancy: 20,
      temperatureZone: 'Chilled (2°C - 4°C)',
      contactPhone: '+91 98450 12345',
      manager: 'Volunteer Coordinator Deepak',
      activeUntil: '24/7 Monitored Storage'
    },
    {
      id: 'HUB-02',
      name: 'Koramangala Cold Storage & Distribution Hub',
      location: '80 Feet Rd, 6th Block Koramangala, Bengaluru',
      coords: [12.9341, 77.6209],
      status: 'approved',
      capacityTotalPortions: 250,
      currentOccupancy: 45,
      temperatureZone: 'Cold Storage (1°C - 5°C)',
      contactPhone: '+91 98450 67890',
      manager: 'Asha Foundation Logistics Desk',
      activeUntil: '24/7 Monitored Storage'
    },
    {
      id: 'HUB-03',
      name: 'Ulsoor Lake Community Food Locker',
      location: 'Kensington Road, Ulsoor, Bengaluru',
      coords: [12.9825, 77.6225],
      status: 'approved',
      capacityTotalPortions: 80,
      currentOccupancy: 0,
      temperatureZone: 'Dry & Chilled Lockers',
      contactPhone: '+91 98450 55443',
      manager: 'Ulsoor Civic Volunteers',
      activeUntil: 'Daily 07:00 - 23:00'
    }
  ],

  urgentRequirements: [
    {
      id: 'REQ-101',
      ngoId: 'usr-ngo-1',
      ngoName: 'Asha Food & Hope Shelter',
      foodType: 'veg',
      neededPortions: 45,
      urgency: 'high',
      targetLocation: 'Austin Town Shelter Wing B',
      neededBefore: new Date(Date.now() + 4 * 3600000).toISOString(),
      note: 'Evening dinner distribution for elderly & children.',
      status: 'open',
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
    }
  ],

  notifications: [
    {
      id: 'NOTIF-01',
      recipientRole: 'all',
      recipientId: null,
      title: '🌧️ Weather Alert Active',
      message: 'Monsoon showers anticipated. Save to Serve Weather-Adaptive Engine is dynamically rerouting rescue tasks.',
      type: 'weather',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      read: false
    },
    {
      id: 'NOTIF-02',
      recipientRole: 'ngo',
      recipientId: 'usr-ngo-1',
      title: '🥘 New Surplus Food Listed Nearby',
      message: 'Spice Symphony listed 50 portions of Veg Biryani safe for the next 3.5 hours.',
      type: 'donation',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      read: true
    }
  ],

  activityLogs: [
    {
      id: 'LOG-001',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      actor: 'Chef Rajesh Sharma (Donor)',
      action: 'Listed 40 Fresh Baked Bread Packs',
      targetId: 'DON-2026-103',
      statusBadge: 'Created'
    },
    {
      id: 'LOG-002',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      actor: 'Karan Verma (Volunteer)',
      action: 'Completed pickup and delivery to Asha Shelter',
      targetId: 'DON-2026-103',
      statusBadge: 'Delivered'
    },
    {
      id: 'LOG-003',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      actor: 'Sister Ananya Roy (NGO)',
      action: 'Confirmed receipt & distributed 40 meals to beneficiaries',
      targetId: 'DON-2026-103',
      statusBadge: 'Distributed'
    },
    {
      id: 'LOG-004',
      timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
      actor: 'Chef Rajesh Sharma (Donor)',
      action: 'Listed 50 Portions Veg Dum Biryani',
      targetId: 'DON-2026-101',
      statusBadge: 'Surplus Listed'
    }
  ],

  weatherState: {
    activeScenario: 'normal',
    lastUpdated: new Date().toISOString(),
    scenarios: {
      normal: {
        name: 'Normal Weather',
        icon: 'bi-sun',
        riskScore: 12,
        factors: { rainfall: '0 mm/hr', floodRisk: 'Low', volunteerAvailability: '95%' },
        advisory: 'Standard volunteer and direct NGO routes are fully operational.'
      },
      heavy_rain: {
        name: 'Heavy Rain',
        icon: 'bi-cloud-rain-heavy',
        riskScore: 68,
        factors: { rainfall: '45 mm/hr', floodRisk: 'Moderate Waterlogging', volunteerAvailability: '45%' },
        advisory: 'Two-wheeler delays likely. Recommend direct 4-wheeler NGO pickup or transfer to Indiranagar Safe Fridge Hub.'
      },
      flood_warning: {
        name: 'Flood Warning',
        icon: 'bi-tsunami',
        riskScore: 92,
        factors: { rainfall: '90 mm/hr', floodRisk: 'Critical / Red Alert', volunteerAvailability: '15%' },
        advisory: 'Direct road transit blocked in low-lying zones. Auto-route surplus to nearest Safe Holding Hubs or issue instant QR vouchers for localized collection.'
      },
      volunteer_shortage: {
        name: 'Volunteer Shortage',
        icon: 'bi-people',
        riskScore: 54,
        factors: { rainfall: 'Light Drizzle', floodRisk: 'Low', volunteerAvailability: '20%' },
        advisory: 'Volunteer capacity constrained. Authorize Direct NGO staff van collection or nearest Community Hub dropoff.'
      }
    }
  },

  settings: {
    kgPerPortion: 0.35,
    co2SavedPerKg: 2.5,
    waterSavedPerKg: 350
  }
};

class SaveToServeStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.users && parsed.donations && parsed.holdingHubs) {
          // Ensure all default seed users exist
          INITIAL_STATE.users.forEach(seedUser => {
            const exists = parsed.users.find(u => u.email.toLowerCase() === seedUser.email.toLowerCase());
            if (!exists) {
              parsed.users.push(seedUser);
            }
          });
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read state from localStorage, initializing fresh:', e);
    }
    this.saveState(INITIAL_STATE);
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  saveState(stateToSave) {
    const s = stateToSave || this.state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }

  resetDemoData() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.state.donations[0].prepTime = new Date(Date.now() - 1 * 3600000).toISOString();
    this.state.donations[0].safeUntil = new Date(Date.now() + 3.5 * 3600000).toISOString();
    this.state.donations[1].prepTime = new Date(Date.now() - 2 * 3600000).toISOString();
    this.state.donations[1].safeUntil = new Date(Date.now() + 2 * 3600000).toISOString();
    this.saveState();
    this.notifySubscribers('RESET_DATA');
    return true;
  }

  notifySubscribers(eventType, data) {
    const event = new CustomEvent('savetoserve:statechange', {
      detail: { type: eventType, data: data, state: this.state }
    });
    window.dispatchEvent(event);
  }

  getUsers() { return this.state.users; }
  getUserById(id) { return this.state.users.find(u => u.id === id); }
  
  getUserByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    
    // Direct match
    let found = this.state.users.find(u => u.email.toLowerCase() === clean);
    if (found) return found;

    // Legacy email alias support (e.g. donor@rainroute.org -> donor@savetoserve.org)
    if (clean.endsWith('@rainroute.org')) {
      const alias = clean.replace('@rainroute.org', '@savetoserve.org');
      found = this.state.users.find(u => u.email.toLowerCase() === alias);
    }
    return found || null;
  }

  addUser(userData) {
    const newUser = {
      id: 'usr-' + Date.now().toString(36),
      registeredAt: new Date().toISOString(),
      kycStatus: 'pending',
      verificationDetails: {
        docType: userData.docType || (userData.role === 'donor' ? 'FSSAI Food Safety License' : 'Volunteer Photo ID & Safety Card'),
        docNumber: userData.docNumber || 'DOC-PENDING-' + Math.floor(1000 + Math.random()*9000),
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        rejectionReason: ''
      },
      ...userData
    };
    this.state.users.push(newUser);
    this.saveState();
    this.logActivity(newUser.name, `Registered new ${newUser.role.toUpperCase()} account`, newUser.id, 'New User');
    this.notifySubscribers('USER_ADDED', newUser);
    return newUser;
  }

  updateUserVerification(userId, status, rejectionReason = '') {
    const user = this.getUserById(userId);
    if (user) {
      user.kycStatus = status;
      if (!user.verificationDetails) user.verificationDetails = {};
      user.verificationDetails.reviewedAt = new Date().toISOString();
      user.verificationDetails.rejectionReason = rejectionReason;
      
      this.saveState();

      const actionText = status === 'approved' 
        ? `Approved verification for ${user.name} (${user.orgName || user.role})`
        : `Rejected verification for ${user.name}: "${rejectionReason || 'Incomplete documentation'}"`;
      
      this.logActivity('Admin Operations', actionText, user.id, status === 'approved' ? 'KYC Approved' : 'KYC Rejected');

      this.addNotification({
        recipientRole: user.role,
        recipientId: user.id,
        title: status === 'approved' ? '✅ Verification Approved!' : '⚠️ Verification Update',
        message: status === 'approved' 
          ? `Your ${user.role.toUpperCase()} account has been verified. Full rescue and donation permissions granted.`
          : `Your verification request was reviewed. Reason: ${rejectionReason || 'Please resubmit valid credentials.'}`,
        type: 'verification'
      });

      this.notifySubscribers('USER_UPDATED', user);
      return { success: true, user };
    }
    return { success: false, message: 'User not found.' };
  }

  updateKycStatus(userId, status, rejectionReason = '') {
    return this.updateUserVerification(userId, status, rejectionReason);
  }

  // --- Donation Operations ---
  getDonations() { return this.state.donations; }
  getDonationById(id) { return this.state.donations.find(d => d.id === id); }

  addDonation(donationData) {
    const id = 'DON-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
    const quantityKg = donationData.quantityKg || (donationData.portions * (this.state.settings.kgPerPortion || 0.35));
    const newDonation = {
      id,
      ...donationData,
      quantityKg: parseFloat(quantityKg.toFixed(1)),
      status: 'available',
      claimedByNgoId: null,
      claimedByNgoName: null,
      claimTimestamp: null,
      assignedVolunteerId: null,
      assignedVolunteerName: null,
      pickupCode: 'STS-' + Math.floor(1000 + Math.random() * 9000),
      pickupTimestamp: null,
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0,
      qrVoucherCode: 'VOUCHER-' + id,
      qrVoucherRedeemed: false,
      holdingHubId: null,
      weatherRescuePlan: null,
      createdAt: new Date().toISOString()
    };

    this.state.donations.unshift(newDonation);
    this.saveState();

    this.logActivity(newDonation.donorName, `Posted surplus food: ${newDonation.foodName} (${newDonation.portions} portions)`, newDonation.id, 'Surplus Posted');
    
    this.addNotification({
      recipientRole: 'ngo',
      title: '🍲 New Surplus Food Available',
      message: `${newDonation.donorOrg} listed ${newDonation.portions} portions of ${newDonation.foodName}.`,
      type: 'donation'
    });

    this.notifySubscribers('DONATION_ADDED', newDonation);
    return newDonation;
  }

  updateDonation(id, updateData) {
    const index = this.state.donations.findIndex(d => d.id === id);
    if (index !== -1) {
      this.state.donations[index] = { ...this.state.donations[index], ...updateData };
      this.saveState();
      this.notifySubscribers('DONATION_UPDATED', this.state.donations[index]);
      return this.state.donations[index];
    }
    return null;
  }

  cancelDonation(id, reason = 'Cancelled by donor') {
    const donation = this.getDonationById(id);
    if (donation && donation.status === 'available') {
      donation.status = 'cancelled';
      this.saveState();
      this.logActivity(donation.donorName, `Cancelled donation ${donation.id}: ${reason}`, donation.id, 'Cancelled');
      this.notifySubscribers('DONATION_CANCELLED', donation);
      return true;
    }
    return false;
  }

  claimDonation(donationId, ngoUser) {
    const donation = this.getDonationById(donationId);
    if (!donation) return { success: false, message: 'Donation not found.' };
    if (donation.status !== 'available') {
      return { success: false, message: `Cannot claim: this donation is currently ${donation.status}.` };
    }

    if (new Date(donation.safeUntil).getTime() < Date.now()) {
      donation.status = 'expired';
      this.saveState();
      return { success: false, message: 'Cannot claim: food has reached its safe-use deadline.' };
    }

    donation.status = 'claimed';
    donation.claimedByNgoId = ngoUser.id;
    donation.claimedByNgoName = ngoUser.orgName || ngoUser.name;
    donation.claimTimestamp = new Date().toISOString();

    const availableVol = this.state.users.find(u => u.role === 'volunteer' && u.kycStatus === 'approved');
    if (availableVol) {
      donation.assignedVolunteerId = availableVol.id;
      donation.assignedVolunteerName = availableVol.name;
    }

    this.saveState();

    this.logActivity(donation.claimedByNgoName, `Claimed ${donation.portions} portions of ${donation.foodName} from ${donation.donorOrg}`, donation.id, 'Claimed');

    this.addNotification({
      recipientRole: 'donor',
      recipientId: donation.donorId,
      title: '✅ Surplus Food Claimed',
      message: `${donation.claimedByNgoName} has claimed ${donation.foodName}. Pickup verification code: ${donation.pickupCode}`,
      type: 'claim'
    });

    if (donation.assignedVolunteerId) {
      this.addNotification({
        recipientRole: 'volunteer',
        recipientId: donation.assignedVolunteerId,
        title: '🚴 New Pickup Task Assigned',
        message: `Pickup ${donation.portions} portions from ${donation.donorOrg} -> Deliver to ${donation.claimedByNgoName}.`,
        type: 'task'
      });
    }

    this.notifySubscribers('DONATION_CLAIMED', donation);
    return { success: true, donation };
  }

  acceptVolunteerTask(donationId, volunteerUser) {
    const donation = this.getDonationById(donationId);
    if (!donation) return { success: false, message: 'Task not found.' };
    if (donation.status !== 'claimed') return { success: false, message: 'Task is no longer awaiting volunteer acceptance.' };

    donation.assignedVolunteerId = volunteerUser.id;
    donation.assignedVolunteerName = volunteerUser.name;
    this.saveState();

    this.logActivity(volunteerUser.name, `Accepted pickup task for ${donation.foodName}`, donation.id, 'Task Accepted');
    this.notifySubscribers('TASK_ACCEPTED', donation);
    return { success: true, donation };
  }

  confirmPickup(donationId, codeEntered) {
    const donation = this.getDonationById(donationId);
    if (!donation) return { success: false, message: 'Donation not found.' };

    if (donation.pickupCode !== codeEntered.trim().toUpperCase()) {
      return { success: false, message: 'Invalid pickup verification code. Check with donor kitchen.' };
    }

    donation.status = 'in-transit';
    donation.pickupTimestamp = new Date().toISOString();
    this.saveState();

    this.logActivity(donation.assignedVolunteerName || 'Authorized Courier', `Completed safe food handoff from ${donation.donorOrg}`, donation.id, 'In Transit');

    this.addNotification({
      recipientRole: 'ngo',
      recipientId: donation.claimedByNgoId,
      title: '🚚 Food In Transit',
      message: `${donation.assignedVolunteerName || 'Volunteer'} picked up ${donation.foodName} and is en route to your facility.`,
      type: 'transit'
    });

    this.notifySubscribers('PICKUP_CONFIRMED', donation);
    return { success: true, donation };
  }

  confirmDistribution(donationId, beneficiariesCount) {
    const donation = this.getDonationById(donationId);
    if (!donation) return { success: false, message: 'Donation not found.' };

    donation.status = 'completed';
    donation.distributionTimestamp = new Date().toISOString();
    donation.deliveryTimestamp = donation.deliveryTimestamp || new Date().toISOString();
    donation.beneficiariesReached = parseInt(beneficiariesCount) || donation.portions;
    donation.qrVoucherRedeemed = true;
    this.saveState();

    this.logActivity(donation.claimedByNgoName || 'NGO Distribution Desk', `Distributed ${donation.beneficiariesReached} meals to beneficiaries. Impact updated!`, donation.id, 'Distributed');

    this.addNotification({
      recipientRole: 'all',
      title: '🎉 Successful Rescue & Distribution',
      message: `${donation.beneficiariesReached} people nourished with ${donation.foodName} rescued from ${donation.donorOrg}!`,
      type: 'impact'
    });

    this.notifySubscribers('DISTRIBUTION_CONFIRMED', donation);
    return { success: true, donation };
  }

  redeemVoucher(voucherCode) {
    const donation = this.state.donations.find(d => d.qrVoucherCode === voucherCode.trim().toUpperCase());
    if (!donation) return { success: false, message: 'Invalid or unrecognized QR voucher code.' };
    if (donation.qrVoucherRedeemed) return { success: false, message: 'This voucher has already been redeemed.' };

    donation.qrVoucherRedeemed = true;
    donation.status = 'completed';
    donation.deliveryTimestamp = new Date().toISOString();
    donation.distributionTimestamp = new Date().toISOString();
    donation.beneficiariesReached = donation.portions;
    this.saveState();

    this.logActivity('Direct QR Redemption Desk', `Redeemed voucher ${voucherCode} for ${donation.portions} portions of ${donation.foodName}`, donation.id, 'Voucher Redeemed');
    this.notifySubscribers('VOUCHER_REDEEMED', donation);
    return { success: true, donation };
  }

  setWeatherScenario(scenarioKey) {
    if (!this.state.weatherState.scenarios[scenarioKey]) return false;
    this.state.weatherState.activeScenario = scenarioKey;
    this.state.weatherState.lastUpdated = new Date().toISOString();
    this.saveState();

    const scenario = this.state.weatherState.scenarios[scenarioKey];
    this.logActivity('Weather Intelligence System', `Updated simulation scenario to: ${scenario.name} (Risk: ${scenario.riskScore}/100)`, 'WEATHER', 'Weather Update');

    this.addNotification({
      recipientRole: 'all',
      title: `⛈️ Weather Shift: ${scenario.name}`,
      message: `Risk level ${scenario.riskScore}/100. ${scenario.advisory}`,
      type: 'weather'
    });

    this.notifySubscribers('WEATHER_CHANGED', { scenarioKey, scenario });
    return true;
  }

  applyRescuePlan(donationId, planType, planDetails) {
    const donation = this.getDonationById(donationId);
    if (!donation) return { success: false, message: 'Donation not found.' };

    donation.weatherRescuePlan = {
      planType,
      appliedAt: new Date().toISOString(),
      details: planDetails
    };

    if (planType === 'safe_hub' && planDetails.hubId) {
      donation.holdingHubId = planDetails.hubId;
      donation.status = 'holding-hub';
      const hub = this.state.holdingHubs.find(h => h.id === planDetails.hubId);
      if (hub) {
        hub.currentOccupancy = Math.min(hub.capacityTotalPortions, hub.currentOccupancy + donation.portions);
      }
    } else if (planType === 'direct_ngo') {
      donation.status = 'claimed';
      donation.assignedVolunteerName = 'Direct NGO 4-Wheeler Transport';
    } else if (planType === 'assign_volunteer' && planDetails.volunteerId) {
      donation.assignedVolunteerId = planDetails.volunteerId;
      const vol = this.getUserById(planDetails.volunteerId);
      donation.assignedVolunteerName = vol ? vol.name : 'Emergency Volunteer';
    }

    this.saveState();
    this.logActivity('Weather-Adaptive Engine', `Applied ${planType} plan for ${donation.foodName}: ${planDetails.reason}`, donation.id, 'Rescue Plan Applied');
    this.notifySubscribers('PLAN_APPLIED', { donation, planType, planDetails });
    return { success: true, donation };
  }

  getHoldingHubs() { return this.state.holdingHubs; }
  
  addHoldingHub(hubData) {
    const id = 'HUB-' + (this.state.holdingHubs.length + 1).toString().padStart(2, '0');
    const newHub = {
      id,
      status: 'approved',
      currentOccupancy: 0,
      ...hubData
    };
    this.state.holdingHubs.push(newHub);
    this.saveState();
    this.logActivity('Admin Operations', `Added new Safe Holding Hub: ${newHub.name}`, newHub.id, 'Hub Added');
    this.notifySubscribers('HUB_ADDED', newHub);
    return newHub;
  }

  updateHoldingHub(id, updateData) {
    const hub = this.state.holdingHubs.find(h => h.id === id);
    if (hub) {
      Object.assign(hub, updateData);
      this.saveState();
      this.notifySubscribers('HUB_UPDATED', hub);
      return hub;
    }
    return null;
  }

  getUrgentRequirements() { return this.state.urgentRequirements; }
  
  addUrgentRequirement(reqData) {
    const id = 'REQ-' + Math.floor(100 + Math.random() * 900);
    const newReq = {
      id,
      status: 'open',
      createdAt: new Date().toISOString(),
      ...reqData
    };
    this.state.urgentRequirements.unshift(newReq);
    this.saveState();
    this.logActivity(newReq.ngoName, `Posted urgent requirement for ${newReq.neededPortions} portions of ${newReq.foodType} food`, newReq.id, 'Requirement Posted');
    this.notifySubscribers('REQ_ADDED', newReq);
    return newReq;
  }

  addNotification(notifData) {
    const newNotif = {
      id: 'NOTIF-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      read: false,
      ...notifData
    };
    this.state.notifications.unshift(newNotif);
    this.saveState();
    this.notifySubscribers('NOTIFICATION_ADDED', newNotif);
    return newNotif;
  }

  getNotifications(role = null, userId = null) {
    return this.state.notifications.filter(n => {
      if (n.recipientRole === 'all') return true;
      if (role && n.recipientRole === role) return true;
      if (userId && n.recipientId === userId) return true;
      return false;
    });
  }

  markAllNotificationsRead() {
    this.state.notifications.forEach(n => n.read = true);
    this.saveState();
    this.notifySubscribers('NOTIFICATIONS_READ');
  }

  logActivity(actor, action, targetId = '', statusBadge = 'Info') {
    const log = {
      id: 'LOG-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      actor,
      action,
      targetId,
      statusBadge
    };
    this.state.activityLogs.unshift(log);
    if (this.state.activityLogs.length > 50) {
      this.state.activityLogs.pop();
    }
    this.saveState();
    this.notifySubscribers('ACTIVITY_LOGGED', log);
    return log;
  }

  getActivityLogs() { return this.state.activityLogs; }

  calculateImpact() {
    const completed = this.state.donations.filter(d => d.status === 'completed');
    const inProgress = this.state.donations.filter(d => ['claimed', 'in-transit', 'holding-hub'].includes(d.status));
    const available = this.state.donations.filter(d => d.status === 'available');

    const totalPortionsRescued = completed.reduce((sum, d) => sum + (d.beneficiariesReached || d.portions), 0);
    const totalWastePreventedKg = completed.reduce((sum, d) => sum + (d.quantityKg || (d.portions * 0.35)), 0);
    const activeDonationsCount = inProgress.length + available.length;
    const weatherDisruptedRescued = completed.filter(d => d.weatherRescuePlan !== null).length;

    const co2SavedKg = totalWastePreventedKg * (this.state.settings.co2SavedPerKg || 2.5);
    const waterSavedLitres = totalWastePreventedKg * (this.state.settings.waterSavedPerKg || 350);

    return {
      totalPortionsRescued,
      completedDonationsCount: completed.length,
      totalWastePreventedKg: parseFloat(totalWastePreventedKg.toFixed(1)),
      activeDonationsCount,
      estimatedBeneficiaries: totalPortionsRescued,
      successfulPickups: completed.length,
      weatherDisruptedRescued,
      co2SavedKg: parseFloat(co2SavedKg.toFixed(1)),
      waterSavedLitres: Math.round(waterSavedLitres),
      verifiedRealWorld: totalPortionsRescued > 0,
      kgConversionFactor: this.state.settings.kgPerPortion || 0.35
    };
  }
}

window.SaveToServeDB = new SaveToServeStore();
window.RainRouteDB = window.SaveToServeDB;
