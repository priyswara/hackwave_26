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
      id: 'usr-donor-2',
      name: 'Pooja Hegde',
      orgName: 'Green Leaf Organic Bistro & Bakery',
      email: 'greenleaf@savetoserve.org',
      phone: '+91 98765 22334',
      role: 'donor',
      password: 'password123',
      kycStatus: 'approved',
      verificationDetails: {
        docType: 'FSSAI Food Safety License',
        docNumber: 'FSSAI-KA-2025-88129',
        submittedAt: '2026-09-03T10:00:00Z',
        reviewedAt: '2026-09-04T11:00:00Z',
        rejectionReason: ''
      },
      address: '7th Main Road, Koramangala 1st Block, Bengaluru',
      coords: [12.9345, 77.6101],
      registeredAt: '2026-09-03T10:00:00Z',
      verifiedDoc: 'FSSAI License #KA-2025-88129 (Verified)'
    },
    {
      id: 'usr-donor-distant',
      name: 'Chef Vikram Sethi',
      orgName: 'Whitefield Tech Park Grand Cafeteria',
      email: 'whitefield@savetoserve.org',
      phone: '+91 98765 99881',
      role: 'donor',
      password: 'password123',
      kycStatus: 'approved',
      verificationDetails: {
        docType: 'FSSAI Food Safety License',
        docNumber: 'FSSAI-KA-2024-55412',
        submittedAt: '2026-08-20T10:00:00Z',
        reviewedAt: '2026-08-21T11:00:00Z',
        rejectionReason: ''
      },
      address: 'ITPB Road, Whitefield, Bengaluru',
      coords: [12.9856, 77.7460],
      registeredAt: '2026-08-20T10:00:00Z',
      verifiedDoc: 'FSSAI License #KA-2024-55412 (Verified)'
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
      logoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200&auto=format&fit=crop&q=60',
      description: 'Asha Food & Hope Shelter provides nutritious daily meals, safe emergency shelter, and community support to vulnerable individuals and destitute families across central Bengaluru.',
      mission: 'Zero hunger and zero food waste in our community through rapid surplus recovery, dignified food distribution, and empathetic care.',
      contactPerson: 'Sister Ananya Roy (Director of Shelter Operations)',
      peopleServed: 145,
      beneficiaryCapacity: 160,
      staffCount: 12,
      volunteerCount: 38,
      servedCategories: ['Children', 'Elderly People', 'Homeless People', 'Families in Need'],
      storageCapacity: {
        coldStorageLitres: 450,
        dryStorageKg: 1200,
        refrigerationUnits: 4,
        transportVehicles: '1 Insulated Delivery Van + 1 Cargo E-Rickshaw'
      },
      operatingHours: '07:00 AM - 10:00 PM (Daily)',
      foodCollectionAvailability: 'Immediate self-collection with NGO van available 08:00 - 21:00; 24/7 staff on-site to receive courier deliveries.',
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
      originalQuantity: 50,
      availableQuantity: 50,
      claimedQuantity: 0,
      quantityUnit: 'servings',
      portions: 50,
      quantityKg: 17.5,
      foodType: 'veg',
      prepTime: new Date(Date.now() - 1.5 * 3600000).toISOString(),
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
      claims: [],
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      isDemo: true
    },
    {
      id: 'DON-2026-104',
      foodName: '60 Portions Dal Tadka, Jeera Rice & Phulkas',
      category: 'Cooked Meal',
      originalQuantity: 60,
      availableQuantity: 60,
      claimedQuantity: 0,
      quantityUnit: 'servings',
      portions: 60,
      quantityKg: 21.0,
      foodType: 'veg',
      prepTime: new Date(Date.now() - 1 * 3600000).toISOString(),
      safeUntil: new Date(Date.now() + 4.5 * 3600000).toISOString(),
      donorId: 'usr-donor-1',
      donorName: 'Chef Rajesh Sharma',
      donorOrg: 'Spice Symphony Grand Banquet',
      donorPhone: '+91 98765 43210',
      donorAddress: '24 MG Road, Indiranagar, Bengaluru',
      donorCoords: [12.9784, 77.6408],
      storageInfo: 'Packed in insulated warm cambros. Safe temperature maintained.',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
      status: 'available',
      claimedByNgoId: null,
      claimedByNgoName: null,
      claimTimestamp: null,
      assignedVolunteerId: null,
      assignedVolunteerName: null,
      pickupCode: 'STS-6612',
      pickupTimestamp: null,
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0,
      qrVoucherCode: 'VOUCHER-STS-104',
      qrVoucherRedeemed: false,
      holdingHubId: null,
      weatherRescuePlan: null,
      claims: [],
      createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
      isDemo: true
    },
    {
      id: 'DON-2026-105',
      foodName: '45 Portions Veg Pulao & Mix Veg Korma',
      category: 'Cooked Meal',
      originalQuantity: 45,
      availableQuantity: 0,
      claimedQuantity: 45,
      quantityUnit: 'servings',
      portions: 45,
      quantityKg: 15.5,
      foodType: 'veg',
      prepTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      safeUntil: new Date(Date.now() + 3 * 3600000).toISOString(),
      donorId: 'usr-donor-1',
      donorName: 'Chef Rajesh Sharma',
      donorOrg: 'Spice Symphony Grand Banquet',
      donorPhone: '+91 98765 43210',
      donorAddress: '24 MG Road, Indiranagar, Bengaluru',
      donorCoords: [12.9784, 77.6408],
      storageInfo: 'Thermal catering trays. Awaiting volunteer courier pickup.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
      status: 'claimed',
      claimedByNgoId: 'usr-ngo-1',
      claimedByNgoName: 'Asha Food & Hope Shelter',
      claimTimestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      assignedVolunteerId: null,
      assignedVolunteerName: null,
      pickupCode: 'STS-5521',
      pickupTimestamp: null,
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0,
      qrVoucherCode: 'VOUCHER-STS-105',
      qrVoucherRedeemed: false,
      holdingHubId: null,
      weatherRescuePlan: null,
      claims: [
        {
          claimId: 'CLM-DON-2026-105-1',
          donationId: 'DON-2026-105',
          ngoId: 'usr-ngo-1',
          ngoName: 'Asha Food & Hope Shelter',
          claimedQuantity: 45,
          unit: 'servings',
          claimTimestamp: new Date(Date.now() - 20 * 60000).toISOString(),
          status: 'claimed',
          pickupCode: 'STS-5521',
          qrVoucherCode: 'VOUCHER-STS-105',
          qrVoucherRedeemed: false,
          assignedVolunteerId: null,
          assignedVolunteerName: null,
          pickupTimestamp: null,
          deliveryTimestamp: null,
          distributionTimestamp: null,
          beneficiariesReached: 0
        }
      ],
      createdAt: new Date(Date.now() - 1.8 * 3600000).toISOString(),
      isDemo: true
    },
    {
      id: 'DON-2026-102',
      foodName: '35 Meal Packs: Paneer Butter Masala & Roti',
      category: 'Cooked Meal',
      originalQuantity: 35,
      availableQuantity: 0,
      claimedQuantity: 35,
      quantityUnit: 'packets',
      portions: 35,
      quantityKg: 12.0,
      foodType: 'veg',
      prepTime: new Date(Date.now() - 2.5 * 3600000).toISOString(),
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
      claims: [
        {
          claimId: 'CLM-DON-2026-102-1',
          donationId: 'DON-2026-102',
          ngoId: 'usr-ngo-1',
          ngoName: 'Asha Food & Hope Shelter',
          claimedQuantity: 35,
          unit: 'packets',
          claimTimestamp: new Date(Date.now() - 40 * 60000).toISOString(),
          status: 'claimed',
          pickupCode: 'STS-8831',
          qrVoucherCode: 'VOUCHER-STS-102',
          qrVoucherRedeemed: false,
          assignedVolunteerId: 'usr-vol-1',
          assignedVolunteerName: 'Karan Verma',
          pickupTimestamp: null,
          deliveryTimestamp: null,
          distributionTimestamp: null,
          beneficiariesReached: 0
        }
      ],
      createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      isDemo: true
    },
    {
      id: 'DON-2026-106',
      foodName: '25 Boxes Garden Fresh Salad & Seasonal Fruits',
      category: 'Produce',
      originalQuantity: 25,
      availableQuantity: 0,
      claimedQuantity: 25,
      quantityUnit: 'boxes',
      portions: 25,
      quantityKg: 9.0,
      foodType: 'vegan',
      prepTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      safeUntil: new Date(Date.now() + 2.5 * 3600000).toISOString(),
      donorId: 'usr-donor-1',
      donorName: 'Chef Rajesh Sharma',
      donorOrg: 'Spice Symphony Grand Banquet',
      donorPhone: '+91 98765 43210',
      donorAddress: '24 MG Road, Indiranagar, Bengaluru',
      donorCoords: [12.9784, 77.6408],
      storageInfo: 'Sealed eco-friendly fresh boxes with ice pack lining.',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
      status: 'in-transit',
      claimedByNgoId: 'usr-ngo-1',
      claimedByNgoName: 'Asha Food & Hope Shelter',
      claimTimestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      assignedVolunteerId: 'usr-vol-1',
      assignedVolunteerName: 'Karan Verma',
      pickupCode: 'STS-4190',
      pickupTimestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0,
      qrVoucherCode: 'VOUCHER-STS-106',
      qrVoucherRedeemed: false,
      holdingHubId: null,
      weatherRescuePlan: null,
      claims: [
        {
          claimId: 'CLM-DON-2026-106-1',
          donationId: 'DON-2026-106',
          ngoId: 'usr-ngo-1',
          ngoName: 'Asha Food & Hope Shelter',
          claimedQuantity: 25,
          unit: 'boxes',
          claimTimestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          status: 'in-transit',
          pickupCode: 'STS-4190',
          qrVoucherCode: 'VOUCHER-STS-106',
          qrVoucherRedeemed: false,
          assignedVolunteerId: 'usr-vol-1',
          assignedVolunteerName: 'Karan Verma',
          pickupTimestamp: new Date(Date.now() - 20 * 60000).toISOString(),
          deliveryTimestamp: null,
          distributionTimestamp: null,
          beneficiariesReached: 0
        }
      ],
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      isDemo: true
    },
    {
      id: 'DON-2026-103',
      foodName: '40 Fresh Baked Whole Wheat Breads & Buns',
      category: 'Bakery',
      originalQuantity: 40,
      availableQuantity: 0,
      claimedQuantity: 40,
      quantityUnit: 'packets',
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
      claims: [
        {
          claimId: 'CLM-DON-2026-103-1',
          donationId: 'DON-2026-103',
          ngoId: 'usr-ngo-1',
          ngoName: 'Asha Food & Hope Shelter',
          claimedQuantity: 40,
          unit: 'packets',
          claimTimestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
          status: 'completed',
          pickupCode: 'STS-3319',
          qrVoucherCode: 'VOUCHER-STS-103',
          qrVoucherRedeemed: true,
          assignedVolunteerId: 'usr-vol-1',
          assignedVolunteerName: 'Karan Verma',
          pickupTimestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
          deliveryTimestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
          distributionTimestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          beneficiariesReached: 40
        }
      ],
      createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      isDemo: true
    },
    {
      id: 'DON-2026-107',
      foodName: '40 Servings Organic Lentil Soup & Quinoa Bowls',
      category: 'Cooked Meal',
      originalQuantity: 40,
      availableQuantity: 40,
      claimedQuantity: 0,
      quantityUnit: 'servings',
      portions: 40,
      quantityKg: 14.0,
      foodType: 'veg',
      prepTime: new Date(Date.now() - 1 * 3600000).toISOString(),
      safeUntil: new Date(Date.now() + 3.5 * 3600000).toISOString(),
      donorId: 'usr-donor-2',
      donorName: 'Pooja Hegde',
      donorOrg: 'Green Leaf Organic Bistro & Bakery',
      donorPhone: '+91 98765 22334',
      donorAddress: '7th Main Road, Koramangala 1st Block, Bengaluru',
      donorCoords: [12.9345, 77.6101],
      storageInfo: 'Sealed stainless steel thermal kettles. Hot and wholesome.',
      imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60',
      status: 'available',
      claimedByNgoId: null,
      claimedByNgoName: null,
      claimTimestamp: null,
      assignedVolunteerId: null,
      assignedVolunteerName: null,
      pickupCode: 'STS-9124',
      pickupTimestamp: null,
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0,
      qrVoucherCode: 'VOUCHER-STS-107',
      qrVoucherRedeemed: false,
      holdingHubId: null,
      weatherRescuePlan: null,
      claims: [],
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      isDemo: true
    },
    {
      id: 'DON-2026-108',
      foodName: '30 Packs Fresh Harvest Salad & Seed Rolls',
      category: 'Produce',
      originalQuantity: 30,
      availableQuantity: 30,
      claimedQuantity: 0,
      quantityUnit: 'packets',
      portions: 30,
      quantityKg: 9.0,
      foodType: 'vegan',
      prepTime: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      safeUntil: new Date(Date.now() + 1.5 * 3600000).toISOString(), // Approaching expiry (< 2 hours)
      donorId: 'usr-donor-2',
      donorName: 'Pooja Hegde',
      donorOrg: 'Green Leaf Organic Bistro & Bakery',
      donorPhone: '+91 98765 22334',
      donorAddress: '7th Main Road, Koramangala 1st Block, Bengaluru',
      donorCoords: [12.9345, 77.6101],
      storageInfo: 'Packed in eco boxes with cold-gel insulation. Immediate consumption advised.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
      status: 'available',
      claimedByNgoId: null,
      claimedByNgoName: null,
      claimTimestamp: null,
      assignedVolunteerId: null,
      assignedVolunteerName: null,
      pickupCode: 'STS-7719',
      pickupTimestamp: null,
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0,
      qrVoucherCode: 'VOUCHER-STS-108',
      qrVoucherRedeemed: false,
      holdingHubId: null,
      weatherRescuePlan: null,
      claims: [],
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      isDemo: true
    },
    {
      id: 'DON-2026-109',
      foodName: '50 Portions Veg Fried Rice & Manchurian',
      category: 'Cooked Meal',
      originalQuantity: 50,
      availableQuantity: 50,
      claimedQuantity: 0,
      quantityUnit: 'servings',
      portions: 50,
      quantityKg: 18.0,
      foodType: 'veg',
      prepTime: new Date(Date.now() - 1 * 3600000).toISOString(),
      safeUntil: new Date(Date.now() + 4 * 3600000).toISOString(),
      donorId: 'usr-donor-distant',
      donorName: 'Chef Vikram Sethi',
      donorOrg: 'Whitefield Tech Park Grand Cafeteria',
      donorPhone: '+91 98765 99881',
      donorAddress: 'ITPB Road, Whitefield, Bengaluru',
      donorCoords: [12.9856, 77.7460], // > 10 km from Austin Town NGO [12.9611, 77.6145] (~14.8 km)
      storageInfo: 'Packed in bulk insulated thermal cambros.',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
      status: 'available',
      claimedByNgoId: null,
      claimedByNgoName: null,
      claimTimestamp: null,
      assignedVolunteerId: null,
      assignedVolunteerName: null,
      pickupCode: 'STS-8842',
      pickupTimestamp: null,
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0,
      qrVoucherCode: 'VOUCHER-STS-109',
      qrVoucherRedeemed: false,
      holdingHubId: null,
      weatherRescuePlan: null,
      claims: [],
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      isDemo: true
    }
  ],

  reviews: [
    {
      id: 'REV-001',
      ngoId: 'usr-ngo-1',
      ngoName: 'Asha Food & Hope Shelter',
      reviewerId: 'usr-donor-1',
      reviewerName: 'Chef Rajesh Sharma',
      reviewerRole: 'donor',
      reviewerOrg: 'Spice Symphony Grand Banquet',
      transactionId: 'DON-2026-103',
      transactionFoodName: '40 Fresh Baked Whole Wheat Breads & Buns',
      rating: 5,
      comment: 'Exemplary coordination! Sister Ananya and her team received the 40 fresh bread packs promptly and distributed them to shelter residents within the hour. True partners in zero food waste.',
      createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      isVerifiedTransaction: true,
      reported: false,
      reportReason: ''
    },
    {
      id: 'REV-002',
      ngoId: 'usr-ngo-1',
      ngoName: 'Asha Food & Hope Shelter',
      reviewerId: 'usr-vol-1',
      reviewerName: 'Karan Verma',
      reviewerRole: 'volunteer',
      reviewerOrg: 'Save to Serve Volunteer Corps',
      transactionId: 'DON-2026-103',
      transactionFoodName: '40 Fresh Baked Whole Wheat Breads & Buns',
      rating: 5,
      comment: 'Super fast and organized handoff at the Austin Town Shelter gate. The shelter staff had thermal storage ready to store the food immediately.',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      isVerifiedTransaction: true,
      reported: false,
      reportReason: ''
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
          // Ensure reviews array exists
          if (!parsed.reviews || !Array.isArray(parsed.reviews)) {
            parsed.reviews = JSON.parse(JSON.stringify(INITIAL_STATE.reviews || []));
          } else if (parsed.reviews.length === 0 && INITIAL_STATE.reviews && INITIAL_STATE.reviews.length > 0) {
            parsed.reviews = JSON.parse(JSON.stringify(INITIAL_STATE.reviews));
          }

          // Ensure all default seed users exist and merge any new profile properties
          INITIAL_STATE.users.forEach(seedUser => {
            const existingUser = parsed.users.find(u => u.id === seedUser.id || u.email.toLowerCase() === seedUser.email.toLowerCase());
            if (!existingUser) {
              parsed.users.push(JSON.parse(JSON.stringify(seedUser)));
            } else if (seedUser.role === 'ngo') {
              // Ensure newly added NGO profile fields are present if not yet set
              const ngoFields = ['logoUrl', 'description', 'mission', 'contactPerson', 'peopleServed', 'beneficiaryCapacity', 'staffCount', 'volunteerCount', 'servedCategories', 'storageCapacity', 'operatingHours', 'foodCollectionAvailability'];
              ngoFields.forEach(field => {
                if (existingUser[field] === undefined && seedUser[field] !== undefined) {
                  existingUser[field] = seedUser[field];
                }
              });
            }
          });

          // Ensure all default demo sample donations exist without overwriting user-created donations
          INITIAL_STATE.donations.forEach(seedDon => {
            const existingIdx = parsed.donations.findIndex(d => d.id === seedDon.id);
            if (existingIdx === -1) {
              parsed.donations.push(JSON.parse(JSON.stringify(seedDon)));
            } else if (parsed.donations[existingIdx].isDemo) {
              // Refresh demo expiry times if they have expired in localStorage to keep demo active
              const currSafe = new Date(parsed.donations[existingIdx].safeUntil).getTime();
              if (isNaN(currSafe) || currSafe <= Date.now()) {
                parsed.donations[existingIdx].safeUntil = seedDon.safeUntil;
                parsed.donations[existingIdx].prepTime = seedDon.prepTime;
                parsed.donations[existingIdx].createdAt = seedDon.createdAt;
                if (seedDon.status !== parsed.donations[existingIdx].status && parsed.donations[existingIdx].status === 'expired') {
                  parsed.donations[existingIdx].status = seedDon.status;
                }
              }
            }
          });

          // Normalize all donations in state to support inventory quantity management
          parsed.donations.forEach(d => {
            if (d.originalQuantity === undefined) {
              d.originalQuantity = d.portions || 1;
            }
            if (d.quantityUnit === undefined) {
              d.quantityUnit = 'servings';
            }
            if (d.claimedQuantity === undefined) {
              d.claimedQuantity = (d.status === 'claimed' || d.status === 'in-transit' || d.status === 'completed') ? (d.portions || 0) : 0;
            }
            if (d.availableQuantity === undefined) {
              d.availableQuantity = (d.status === 'claimed' || d.status === 'in-transit' || d.status === 'completed') ? 0 : Math.max(0, d.originalQuantity - d.claimedQuantity);
            }
            if (!Array.isArray(d.claims)) {
              d.claims = [];
              if (d.claimedByNgoId || d.status === 'claimed' || d.status === 'in-transit' || d.status === 'completed') {
                d.claims.push({
                  claimId: 'CLM-' + d.id,
                  donationId: d.id,
                  ngoId: d.claimedByNgoId || 'usr-ngo-1',
                  ngoName: d.claimedByNgoName || 'Asha Food & Hope Shelter',
                  claimedQuantity: d.claimedQuantity || d.portions || d.originalQuantity,
                  unit: d.quantityUnit || 'servings',
                  claimTimestamp: d.claimTimestamp || d.createdAt || new Date().toISOString(),
                  status: d.status,
                  pickupCode: d.pickupCode || 'STS-' + Math.floor(1000 + Math.random() * 9000),
                  qrVoucherCode: d.qrVoucherCode || 'VOUCHER-' + d.id,
                  qrVoucherRedeemed: !!d.qrVoucherRedeemed,
                  assignedVolunteerId: d.assignedVolunteerId || null,
                  assignedVolunteerName: d.assignedVolunteerName || null,
                  pickupTimestamp: d.pickupTimestamp || null,
                  deliveryTimestamp: d.deliveryTimestamp || null,
                  distributionTimestamp: d.distributionTimestamp || null,
                  beneficiariesReached: d.beneficiariesReached || 0
                });
              }
            }
          });

          this.saveState(parsed);
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
      
      if (status === 'approved') {
        user.verificationDetails.rejectionReason = '';
        user.verificationDetails.reconsiderationReason = '';
      } else if (status === 'rejected') {
        user.verificationDetails.rejectionReason = rejectionReason || 'Verification documentation could not be validated.';
      }
      
      this.saveState();

      const actionText = status === 'approved' 
        ? `Approved verification for ${user.name} (${user.orgName || user.role})`
        : `Rejected verification for ${user.name}: "${user.verificationDetails.rejectionReason}"`;
      
      this.logActivity('Admin Operations', actionText, user.id, status === 'approved' ? 'KYC Approved' : 'KYC Rejected');

      this.addNotification({
        recipientRole: user.role,
        recipientId: user.id,
        title: status === 'approved' ? '✅ Verification Approved!' : '⚠️ Verification Update',
        message: status === 'approved' 
          ? `Your ${user.role.toUpperCase()} account has been verified. Full rescue and donation permissions granted.`
          : `Your verification request was reviewed. Reason: ${user.verificationDetails.rejectionReason}`,
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

  requestReconsideration(userId, explanation, updatedDocType = '', updatedDocNumber = '') {
    const user = this.getUserById(userId);
    if (!user) return { success: false, message: 'User not found.' };
    
    if (user.kycStatus !== 'rejected') {
      return { success: false, message: 'Reconsideration can only be requested for rejected applications.' };
    }

    if (!explanation || !explanation.trim()) {
      return { success: false, message: 'Please provide an explanation or additional details for reconsideration.' };
    }

    user.kycStatus = 'reconsideration_requested';
    if (!user.verificationDetails) user.verificationDetails = {};
    
    user.verificationDetails.reconsiderationReason = explanation.trim();
    user.verificationDetails.reconsiderationSubmittedAt = new Date().toISOString();
    
    if (updatedDocType && updatedDocType.trim()) {
      user.verificationDetails.docType = updatedDocType.trim();
    }
    if (updatedDocNumber && updatedDocNumber.trim()) {
      user.verificationDetails.docNumber = updatedDocNumber.trim();
    }

    this.saveState();

    this.logActivity(user.name, `Submitted verification reconsideration request`, user.id, 'KYC Reconsideration');

    this.addNotification({
      recipientRole: 'admin',
      title: `📋 Reconsideration Request: ${user.name}`,
      message: `${user.name} (${user.orgName || user.role}) requested verification reconsideration. Note: "${explanation.trim()}"`,
      type: 'verification'
    });

    this.notifySubscribers('USER_UPDATED', user);
    return { success: true, user };
  }

  // --- Helper Date & Time Utilities (Local Timezone & Countdowns) ---
  static formatDateTime(isoString) {
    if (!isoString) return 'Not specified';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Invalid date';
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) + ', ' + d.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return String(isoString);
    }
  }

  static formatDate(isoString) {
    if (!isoString) return 'Not specified';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Invalid date';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return String(isoString);
    }
  }

  static formatTime(isoString) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  static getExpiryCountdown(safeUntilISO) {
    if (!safeUntilISO) {
      return {
        isExpired: false,
        isApproachingExpiry: false,
        diffHours: 0,
        diffMs: 0,
        countdownText: 'No deadline set',
        badgeHtml: '<span class="badge bg-secondary">No Expiry</span>',
        warningHtml: ''
      };
    }

    const safeUntil = new Date(safeUntilISO).getTime();
    const now = Date.now();
    const diffMs = safeUntil - now;
    const diffHours = diffMs / 3600000;

    if (diffMs <= 0) {
      return {
        isExpired: true,
        isApproachingExpiry: false,
        diffHours: 0,
        diffMs,
        countdownText: 'Expired',
        badgeHtml: '<span class="badge badge-expired"><i class="bi bi-x-circle me-1"></i> Expired</span>',
        warningHtml: '<div class="alert alert-danger py-1 px-2 small mb-2 d-flex align-items-center gap-1"><i class="bi bi-x-octagon-fill text-danger"></i> <span><strong>Food Expired:</strong> Safe consumption window has elapsed.</span></div>'
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let timeString = '';
    if (days > 0) {
      timeString = `${days}d ${hours}h left`;
    } else if (hours > 0) {
      timeString = `${hours}h ${minutes}m left`;
    } else {
      timeString = `${minutes}m left`;
    }

    const isApproachingExpiry = diffHours < 2; // Approaching expiry threshold (< 2 hours)

    if (isApproachingExpiry) {
      return {
        isExpired: false,
        isApproachingExpiry: true,
        diffHours,
        diffMs,
        countdownText: `${timeString} (Urgent)`,
        badgeHtml: `<span class="badge badge-expiry-urgent"><i class="bi bi-alarm-fill me-1"></i> ${timeString} (Urgent)</span>`,
        warningHtml: `<div class="alert alert-warning py-1 px-2 small mb-2 d-flex align-items-center gap-1"><i class="bi bi-exclamation-triangle-fill text-warning"></i> <span><strong>Approaching Expiry:</strong> Must be collected within ${timeString}!</span></div>`
      };
    }

    if (diffHours < 4) {
      return {
        isExpired: false,
        isApproachingExpiry: false,
        diffHours,
        diffMs,
        countdownText: timeString,
        badgeHtml: `<span class="badge badge-expiry-warning"><i class="bi bi-clock-history me-1"></i> ${timeString}</span>`,
        warningHtml: ''
      };
    }

    return {
      isExpired: false,
      isApproachingExpiry: false,
      diffHours,
      diffMs,
      countdownText: timeString,
      badgeHtml: `<span class="badge badge-expiry-safe"><i class="bi bi-check-circle me-1"></i> ${timeString} Safe</span>`,
      warningHtml: ''
    };
  }

  // --- Donation Operations ---
  checkAndExpireDonations() {
    let changed = false;
    const now = Date.now();
    this.state.donations.forEach(d => {
      if (d.status === 'available' && d.safeUntil) {
        if (new Date(d.safeUntil).getTime() <= now) {
          d.status = 'expired';
          changed = true;
          this.logActivity('System Safety Protocol', `Marked surplus food ${d.foodName} as Expired`, d.id, 'Food Expired');
        }
      }
    });

    if (changed) {
      this.saveState();
      this.notifySubscribers('DONATIONS_EXPIRED');
    }
    return changed;
  }

  getDonations() { 
    this.checkAndExpireDonations();
    return this.state.donations; 
  }

  getDonationById(id) { 
    this.checkAndExpireDonations();
    return this.state.donations.find(d => d.id === id); 
  }

  addDonation(donationData) {
    const id = 'DON-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
    const originalQuantity = parseInt(donationData.originalQuantity || donationData.portions || 1);
    const quantityUnit = donationData.quantityUnit || 'servings';
    const portions = originalQuantity;
    
    // Calculate approximate KG based on unit
    let quantityKg = 0;
    if (quantityUnit === 'kg') {
      quantityKg = originalQuantity;
    } else if (quantityUnit === 'grams') {
      quantityKg = originalQuantity / 1000;
    } else if (quantityUnit === 'litres') {
      quantityKg = originalQuantity * 1.0;
    } else {
      quantityKg = donationData.quantityKg || (portions * (this.state.settings.kgPerPortion || 0.35));
    }

    const nowISO = new Date().toISOString();
    const newDonation = {
      id,
      ...donationData,
      originalQuantity,
      availableQuantity: originalQuantity,
      claimedQuantity: 0,
      quantityUnit,
      portions,
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
      claims: [],
      prepTime: donationData.prepTime || nowISO,
      safeUntil: donationData.safeUntil || new Date(Date.now() + 4 * 3600000).toISOString(),
      createdAt: donationData.createdAt || nowISO
    };

    this.state.donations.unshift(newDonation);
    this.saveState();

    this.logActivity(newDonation.donorName, `Posted surplus food: ${newDonation.foodName} (${newDonation.originalQuantity} ${newDonation.quantityUnit})`, newDonation.id, 'Surplus Posted');
    
    this.addNotification({
      recipientRole: 'ngo',
      title: '🍲 New Surplus Food Available',
      message: `${newDonation.donorOrg} listed ${newDonation.originalQuantity} ${newDonation.quantityUnit} of ${newDonation.foodName}. Safe until ${SaveToServeStore.formatDateTime(newDonation.safeUntil)}.`,
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

  updateDonationQuantity(donationId, newAvailableQuantity) {
    const donation = this.getDonationById(donationId);
    if (!donation) return { success: false, message: 'Donation listing not found.' };

    const parsedQty = parseInt(newAvailableQuantity);
    if (isNaN(parsedQty) || parsedQty < 0) {
      return { success: false, message: 'Available quantity must be a non-negative number (0 or greater).' };
    }

    const prevAvailable = donation.availableQuantity || 0;
    donation.availableQuantity = parsedQty;
    donation.originalQuantity = (donation.claimedQuantity || 0) + parsedQty;
    donation.portions = parsedQty;

    if (parsedQty === 0 && donation.status === 'available') {
      donation.status = 'claimed';
    } else if (parsedQty > 0 && (donation.status === 'claimed' || donation.status === 'unavailable')) {
      donation.status = 'available';
    }

    this.saveState();

    this.logActivity(donation.donorName, `Updated available quantity of ${donation.foodName} to ${parsedQty} ${donation.quantityUnit || 'servings'}`, donation.id, 'Quantity Updated');

    this.addNotification({
      recipientRole: 'ngo',
      title: '📦 Surplus Food Quantity Updated',
      message: `${donation.donorOrg} updated ${donation.foodName}: ${parsedQty} ${donation.quantityUnit || 'servings'} now available.`,
      type: 'donation'
    });

    this.notifySubscribers('DONATION_QUANTITY_UPDATED', donation);
    return { success: true, donation, previousAvailable: prevAvailable, newAvailable: parsedQty };
  }

  cancelDonation(id, reason = 'Cancelled by donor') {
    const donation = this.getDonationById(id);
    if (donation && (donation.status === 'available' || donation.status === 'expired' || donation.status === 'claimed')) {
      donation.status = 'cancelled';
      donation.availableQuantity = 0;
      this.saveState();
      this.logActivity(donation.donorName, `Cancelled donation ${donation.id}: ${reason}`, donation.id, 'Cancelled');
      this.notifySubscribers('DONATION_CANCELLED', donation);
      return true;
    }
    return false;
  }

  claimDonation(donationId, ngoUser, requestedQuantity = null) {
    const donation = this.getDonationById(donationId);
    if (!donation) return { success: false, message: 'Donation not found.' };
    
    if (donation.status === 'expired' || (donation.safeUntil && new Date(donation.safeUntil).getTime() <= Date.now())) {
      donation.status = 'expired';
      this.saveState();
      return { success: false, message: 'Cannot claim: This food donation has reached its expiry deadline and is expired.' };
    }

    const currentAvailable = donation.availableQuantity !== undefined ? donation.availableQuantity : (donation.status === 'available' ? donation.portions : 0);

    if (currentAvailable <= 0 || donation.status === 'cancelled' || donation.status === 'completed') {
      return { success: false, message: `Cannot claim: This food listing has already been fully claimed or is unavailable.` };
    }

    // Determine quantity to claim
    const claimQty = requestedQuantity !== null && requestedQuantity !== undefined 
      ? parseInt(requestedQuantity) 
      : currentAvailable;

    if (isNaN(claimQty) || claimQty <= 0) {
      return { success: false, message: 'Please specify a valid claim quantity greater than 0.' };
    }

    if (claimQty > currentAvailable) {
      return { 
        success: false, 
        message: `Requested ${claimQty} ${donation.quantityUnit || 'servings'} exceeds currently available inventory (${currentAvailable} ${donation.quantityUnit || 'servings'} left).` 
      };
    }

    // Decrease available inventory and increase claimed
    donation.availableQuantity = currentAvailable - claimQty;
    donation.claimedQuantity = (donation.claimedQuantity || 0) + claimQty;
    donation.portions = donation.availableQuantity;

    // Update listing status
    if (donation.availableQuantity === 0) {
      donation.status = 'claimed';
    } else {
      donation.status = 'available';
    }

    const claimId = 'CLM-' + Date.now().toString(36) + '-' + Math.floor(100 + Math.random() * 900);
    const pickupCode = 'STS-' + Math.floor(1000 + Math.random() * 9000);
    const qrVoucherCode = 'VOUCHER-' + donation.id + '-' + Math.floor(100 + Math.random() * 900);
    const claimTimestamp = new Date().toISOString();

    const availableVol = this.state.users.find(u => u.role === 'volunteer' && u.kycStatus === 'approved');

    const claimRecord = {
      claimId,
      donationId: donation.id,
      ngoId: ngoUser.id,
      ngoName: ngoUser.orgName || ngoUser.name,
      claimedQuantity: claimQty,
      unit: donation.quantityUnit || 'servings',
      claimTimestamp,
      status: 'claimed',
      pickupCode,
      qrVoucherCode,
      qrVoucherRedeemed: false,
      assignedVolunteerId: availableVol ? availableVol.id : null,
      assignedVolunteerName: availableVol ? availableVol.name : null,
      pickupTimestamp: null,
      deliveryTimestamp: null,
      distributionTimestamp: null,
      beneficiariesReached: 0
    };

    if (!Array.isArray(donation.claims)) donation.claims = [];
    donation.claims.unshift(claimRecord);

    // Sync primary fields on donation object for compatibility
    donation.claimedByNgoId = ngoUser.id;
    donation.claimedByNgoName = ngoUser.orgName || ngoUser.name;
    donation.claimTimestamp = claimTimestamp;
    donation.pickupCode = pickupCode;
    donation.qrVoucherCode = qrVoucherCode;
    if (availableVol) {
      donation.assignedVolunteerId = availableVol.id;
      donation.assignedVolunteerName = availableVol.name;
    }

    this.saveState();

    this.logActivity(
      ngoUser.orgName || ngoUser.name, 
      `Claimed ${claimQty} ${donation.quantityUnit || 'servings'} of ${donation.foodName} from ${donation.donorOrg} (${donation.availableQuantity} remaining)`, 
      donation.id, 
      'Claimed'
    );

    this.addNotification({
      recipientRole: 'donor',
      recipientId: donation.donorId,
      title: '✅ Surplus Food Claimed',
      message: `${ngoUser.orgName || ngoUser.name} claimed ${claimQty} ${donation.quantityUnit || 'servings'} of ${donation.foodName}. Remaining available: ${donation.availableQuantity} ${donation.quantityUnit || 'servings'}. Pickup code: ${pickupCode}`,
      type: 'claim'
    });

    if (claimRecord.assignedVolunteerId) {
      this.addNotification({
        recipientRole: 'volunteer',
        recipientId: claimRecord.assignedVolunteerId,
        title: '🚴 New Pickup Task Assigned',
        message: `Pickup ${claimQty} ${donation.quantityUnit || 'servings'} from ${donation.donorOrg} -> Deliver to ${ngoUser.orgName || ngoUser.name}.`,
        type: 'task'
      });
    }

    this.notifySubscribers('DONATION_CLAIMED', { donation, claim: claimRecord });
    return { success: true, donation, claim: claimRecord };
  }

  cancelClaim(claimId, reason = 'Cancelled by NGO') {
    let targetDonation = null;
    let targetClaim = null;

    for (const d of this.state.donations) {
      if (Array.isArray(d.claims)) {
        const found = d.claims.find(c => c.claimId === claimId || c.id === claimId);
        if (found) {
          targetDonation = d;
          targetClaim = found;
          break;
        }
      }
      if (d.id === claimId && d.status === 'claimed') {
        targetDonation = d;
        targetClaim = {
          claimId: 'CLM-' + d.id,
          claimedQuantity: d.claimedQuantity || d.portions || d.originalQuantity || 1,
          status: d.status
        };
        break;
      }
    }

    if (!targetDonation || !targetClaim) {
      return { success: false, message: 'Claim record not found.' };
    }

    if (targetClaim.status !== 'claimed') {
      return { success: false, message: `Cannot cancel claim: food handoff is already ${targetClaim.status}.` };
    }

    const restoreQty = targetClaim.claimedQuantity || 0;
    targetClaim.status = 'cancelled';
    targetClaim.cancelledAt = new Date().toISOString();

    // Restore inventory to parent donation
    targetDonation.availableQuantity = (targetDonation.availableQuantity || 0) + restoreQty;
    targetDonation.claimedQuantity = Math.max(0, (targetDonation.claimedQuantity || 0) - restoreQty);
    targetDonation.portions = targetDonation.availableQuantity;

    if (targetDonation.availableQuantity > 0 && (targetDonation.status === 'claimed' || targetDonation.status === 'cancelled')) {
      targetDonation.status = 'available';
    }

    this.saveState();

    this.logActivity(
      targetClaim.ngoName || 'NGO', 
      `Cancelled claim of ${restoreQty} ${targetDonation.quantityUnit || 'servings'} for ${targetDonation.foodName}. Inventory restored.`, 
      targetDonation.id, 
      'Claim Cancelled'
    );

    this.addNotification({
      recipientRole: 'donor',
      recipientId: targetDonation.donorId,
      title: '🔄 Surplus Food Quantity Restored',
      message: `Claim for ${restoreQty} ${targetDonation.quantityUnit || 'servings'} of ${targetDonation.foodName} was cancelled. ${targetDonation.availableQuantity} ${targetDonation.quantityUnit || 'servings'} is now available again for other NGOs.`,
      type: 'donation'
    });

    this.notifySubscribers('CLAIM_CANCELLED', { donation: targetDonation, claim: targetClaim });
    return { 
      success: true, 
      message: `Claim successfully cancelled. ${restoreQty} ${targetDonation.quantityUnit || 'servings'} restored to inventory!`, 
      donation: targetDonation, 
      claim: targetClaim 
    };
  }

  getClaimsForNgo(ngoId) {
    const claims = [];
    this.checkAndExpireDonations();

    this.state.donations.forEach(d => {
      if (Array.isArray(d.claims) && d.claims.length > 0) {
        d.claims.forEach(c => {
          if (c.ngoId === ngoId || c.claimedByNgoId === ngoId) {
            claims.push({
              ...c,
              donationId: d.id,
              foodName: d.foodName,
              category: d.category,
              foodType: d.foodType,
              safeUntil: d.safeUntil,
              prepTime: d.prepTime,
              createdAt: d.createdAt,
              donorId: d.donorId,
              donorName: d.donorName,
              donorOrg: d.donorOrg,
              donorPhone: d.donorPhone,
              donorAddress: d.donorAddress,
              donorCoords: d.donorCoords,
              imageUrl: d.imageUrl,
              storageInfo: d.storageInfo,
              originalQuantity: d.originalQuantity,
              availableQuantity: d.availableQuantity,
              unit: c.unit || d.quantityUnit || 'servings'
            });
          }
        });
      } else if (d.claimedByNgoId === ngoId && ['claimed', 'in-transit', 'completed'].includes(d.status)) {
        claims.push({
          claimId: 'CLM-' + d.id,
          donationId: d.id,
          ngoId: d.claimedByNgoId,
          ngoName: d.claimedByNgoName,
          claimedQuantity: d.claimedQuantity || d.portions || d.originalQuantity || 1,
          unit: d.quantityUnit || 'servings',
          claimTimestamp: d.claimTimestamp || d.createdAt,
          status: d.status,
          pickupCode: d.pickupCode,
          qrVoucherCode: d.qrVoucherCode,
          qrVoucherRedeemed: d.qrVoucherRedeemed,
          assignedVolunteerId: d.assignedVolunteerId,
          assignedVolunteerName: d.assignedVolunteerName,
          pickupTimestamp: d.pickupTimestamp,
          deliveryTimestamp: d.deliveryTimestamp,
          distributionTimestamp: d.distributionTimestamp,
          beneficiariesReached: d.beneficiariesReached,
          foodName: d.foodName,
          category: d.category,
          foodType: d.foodType,
          safeUntil: d.safeUntil,
          prepTime: d.prepTime,
          createdAt: d.createdAt,
          donorId: d.donorId,
          donorName: d.donorName,
          donorOrg: d.donorOrg,
          donorPhone: d.donorPhone,
          donorAddress: d.donorAddress,
          donorCoords: d.donorCoords,
          imageUrl: d.imageUrl,
          storageInfo: d.storageInfo,
          originalQuantity: d.originalQuantity,
          availableQuantity: d.availableQuantity
        });
      }
    });

    return claims.sort((a, b) => new Date(b.claimTimestamp || 0) - new Date(a.claimTimestamp || 0));
  }

  acceptVolunteerTask(donationId, volunteerUser) {
    const donation = this.getDonationById(donationId);
    if (!donation) return { success: false, message: 'Task not found.' };
    
    if (donation.status === 'expired' || (donation.safeUntil && new Date(donation.safeUntil).getTime() <= Date.now())) {
      donation.status = 'expired';
      this.saveState();
      return { success: false, message: 'Cannot accept task: This food donation has reached its expiry deadline and is expired.' };
    }

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
    const cleanCode = voucherCode.trim().toUpperCase();
    let targetDonation = null;
    let targetClaim = null;

    for (const d of this.state.donations) {
      if (Array.isArray(d.claims)) {
        const found = d.claims.find(c => c.qrVoucherCode === cleanCode);
        if (found) {
          targetDonation = d;
          targetClaim = found;
          break;
        }
      }
      if (d.qrVoucherCode === cleanCode) {
        targetDonation = d;
        break;
      }
    }

    if (!targetDonation) return { success: false, message: 'Invalid or unrecognized QR voucher code.' };
    
    if (targetClaim) {
      if (targetClaim.qrVoucherRedeemed) return { success: false, message: 'This voucher has already been redeemed.' };
      targetClaim.qrVoucherRedeemed = true;
      targetClaim.status = 'completed';
      targetClaim.deliveryTimestamp = new Date().toISOString();
      targetClaim.distributionTimestamp = new Date().toISOString();
      targetClaim.beneficiariesReached = targetClaim.claimedQuantity;
      
      // If all claims completed and no available inventory left, mark donation completed
      const allClaimsDone = targetDonation.claims.every(c => c.status === 'completed' || c.status === 'cancelled');
      if (allClaimsDone && (targetDonation.availableQuantity || 0) === 0) {
        targetDonation.status = 'completed';
        targetDonation.qrVoucherRedeemed = true;
      }
    } else {
      if (targetDonation.qrVoucherRedeemed) return { success: false, message: 'This voucher has already been redeemed.' };
      targetDonation.qrVoucherRedeemed = true;
      targetDonation.status = 'completed';
      targetDonation.deliveryTimestamp = new Date().toISOString();
      targetDonation.distributionTimestamp = new Date().toISOString();
      targetDonation.beneficiariesReached = targetDonation.portions || targetDonation.originalQuantity;
    }

    this.saveState();

    const redeemedQty = targetClaim ? `${targetClaim.claimedQuantity} ${targetClaim.unit}` : `${targetDonation.portions} portions`;
    this.logActivity('Direct QR Redemption Desk', `Redeemed voucher ${cleanCode} for ${redeemedQty} of ${targetDonation.foodName}`, targetDonation.id, 'Voucher Redeemed');
    this.notifySubscribers('VOUCHER_REDEEMED', targetDonation);
    return { success: true, donation: targetDonation, claim: targetClaim };
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

  // --- Geographic Distance Calculations (Haversine Formula) ---
  static calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined || lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
    const nLat1 = parseFloat(lat1);
    const nLon1 = parseFloat(lon1);
    const nLat2 = parseFloat(lat2);
    const nLon2 = parseFloat(lon2);
    if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

    const R = 6371; // Earth's mean radius in km
    const dLat = (nLat2 - nLat1) * Math.PI / 180;
    const dLon = (nLon2 - nLon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(nLat1 * Math.PI / 180) * Math.cos(nLat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    return SaveToServeStore.calculateDistanceKm(lat1, lon1, lat2, lon2);
  }

  /**
   * Query all distinct donors and their available non-expired food listings within a given radius in KM.
   * Calculates actual geometric Haversine distance using stored coordinates.
   */
  getNearbyDonorsWithListings(ngoCoords, radiusKm = 10) {
    this.checkAndExpireDonations();
    if (!ngoCoords || !Array.isArray(ngoCoords) || ngoCoords.length < 2 || isNaN(parseFloat(ngoCoords[0])) || isNaN(parseFloat(ngoCoords[1]))) {
      return {
        ngoCoordsValid: false,
        ngoCoords: null,
        radiusKm,
        donors: [],
        availableListings: [],
        totalDistinctDonors: 0,
        totalListingsCount: 0,
        totalPortions: 0,
        totalQuantityKg: 0,
        approachingExpiryCount: 0
      };
    }

    const ngoLat = parseFloat(ngoCoords[0]);
    const ngoLon = parseFloat(ngoCoords[1]);
    const now = Date.now();
    const availableDonations = this.state.donations.filter(d => 
      (d.status === 'available' || ((d.availableQuantity || 0) > 0 && d.status !== 'cancelled' && d.status !== 'expired')) && 
      (d.availableQuantity === undefined || d.availableQuantity > 0) &&
      d.safeUntil && 
      new Date(d.safeUntil).getTime() > now
    );

    const donorMap = new Map();

    availableDonations.forEach(donation => {
      let donorCoords = donation.donorCoords;
      if (!donorCoords && donation.donorId) {
        const donorUser = this.getUserById(donation.donorId);
        if (donorUser && donorUser.coords) donorCoords = donorUser.coords;
      }

      if (donorCoords && Array.isArray(donorCoords) && donorCoords.length === 2) {
        const distKm = SaveToServeStore.calculateDistanceKm(ngoLat, ngoLon, donorCoords[0], donorCoords[1]);
        if (distKm !== null && distKm <= radiusKm) {
          const donorKey = donation.donorId || donation.donorOrg || `${donorCoords[0]},${donorCoords[1]}`;
          if (!donorMap.has(donorKey)) {
            const donorUser = donation.donorId ? this.getUserById(donation.donorId) : null;
            const donorId = donation.donorId || 'usr-donor-1';
            const ratingStats = this.getDonorRatingStats(donorId);
            donorMap.set(donorKey, {
              donorId: donorId,
              donorName: donation.donorName || (donorUser ? donorUser.name : 'Verified Donor Kitchen'),
              donorOrg: donation.donorOrg || (donorUser ? donorUser.orgName : 'Donor Kitchen'),
              donorPhone: donation.donorPhone || (donorUser ? donorUser.phone : ''),
              donorAddress: donation.donorAddress || (donorUser ? donorUser.address : 'Bengaluru'),
              donorCoords: donorCoords,
              distanceKm: distKm,
              ratingStats: ratingStats,
              averageRating: ratingStats.averageRating,
              reviewCount: ratingStats.totalReviews,
              listings: []
            });
          }

          const donorEntry = donorMap.get(donorKey);
          donorEntry.listings.push({
            ...donation,
            distanceKm: distKm
          });
        }
      }
    });

    const donorList = Array.from(donorMap.values()).sort((a, b) => a.distanceKm - b.distanceKm);

    // Flat list of nearby active listings
    const allNearbyListings = [];
    donorList.forEach(d => {
      d.listings.forEach(l => allNearbyListings.push(l));
    });

    const totalPortions = allNearbyListings.reduce((sum, l) => sum + (l.portions || 0), 0);
    const totalQuantityKg = parseFloat(allNearbyListings.reduce((sum, l) => sum + (l.quantityKg || (l.portions * 0.35)), 0).toFixed(1));
    const approachingExpiryCount = allNearbyListings.filter(l => {
      const diffHours = (new Date(l.safeUntil).getTime() - now) / 3600000;
      return diffHours <= 2 && diffHours > 0;
    }).length;

    return {
      ngoCoordsValid: true,
      ngoCoords: [ngoLat, ngoLon],
      radiusKm,
      donors: donorList,
      availableListings: allNearbyListings,
      totalDistinctDonors: donorList.length,
      totalListingsCount: allNearbyListings.length,
      totalPortions,
      totalQuantityKg,
      approachingExpiryCount
    };
  }

  // --- Donor Reviews (Written by NGOs about Donors) ---
  getReviews() {
    return this.state.reviews || [];
  }

  getReviewsForDonor(donorId) {
    const all = this.state.reviews || [];
    return all.filter(r => r.donorId === donorId && !r.reported);
  }

  getDonorRatingStats(donorId) {
    const reviews = this.getReviewsForDonor(donorId);
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        averageFormatted: '0.0',
        totalReviews: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      breakdown[star] = (breakdown[star] || 0) + 1;
      sum += (r.rating || 5);
    });

    const avg = sum / reviews.length;
    return {
      averageRating: parseFloat(avg.toFixed(1)),
      averageFormatted: avg.toFixed(1),
      totalReviews: reviews.length,
      breakdown
    };
  }

  getAllDonorReviews() {
    const all = this.state.reviews || [];
    return all.filter(r => r.donorId && !r.reported);
  }

  getEligibleCompletedDonationsForDonorReview(ngoId) {
    if (!ngoId) return [];
    const completed = this.state.donations.filter(d => 
      d.status === 'completed' &&
      d.claimedByNgoId === ngoId
    );

    const existingReviews = this.state.reviews || [];
    // Filter out completed donations where this NGO has already submitted a review
    return completed.filter(d => {
      return !existingReviews.some(r => r.transactionId === d.id && (r.reviewerNgoId === ngoId || r.reviewerId === ngoId));
    });
  }

  addDonorReview(reviewData) {
    const { donorId, reviewerNgoId, transactionId, rating, comment } = reviewData;
    if (!donorId || !reviewerNgoId || !transactionId) {
      return { success: false, message: 'Missing required review fields.' };
    }

    const donation = this.getDonationById(transactionId);
    if (!donation) {
      return { success: false, message: 'Referenced food donation does not exist.' };
    }

    if (donation.status !== 'completed') {
      return { success: false, message: 'Reviews can only be submitted for completed food collections.' };
    }

    if (donation.claimedByNgoId !== reviewerNgoId) {
      return { success: false, message: 'Your NGO was not the recipient for this donation transaction.' };
    }

    if (donation.donorId !== donorId && donation.donorOrg !== donorId) {
      return { success: false, message: 'Transaction donor does not match the target donor.' };
    }

    this.state.reviews = this.state.reviews || [];
    const existing = this.state.reviews.find(r => r.transactionId === transactionId && (r.reviewerNgoId === reviewerNgoId || r.reviewerId === reviewerNgoId));
    if (existing) {
      return { success: false, message: 'A verified review has already been submitted for this donation transaction.' };
    }

    const ngoUser = this.getUserById(reviewerNgoId);
    const donorUser = this.getUserById(donorId);
    const numRating = Math.max(1, Math.min(5, parseInt(rating) || 5));

    const newReview = {
      id: 'REV-DONOR-' + Date.now().toString(36),
      donorId,
      donorOrg: donorUser ? (donorUser.orgName || donorUser.name) : (donation.donorOrg || 'Donor Kitchen'),
      donorAddress: donorUser ? donorUser.address : (donation.donorAddress || 'Bengaluru'),
      reviewerNgoId,
      reviewerNgoName: ngoUser ? (ngoUser.orgName || ngoUser.name) : (donation.claimedByNgoName || 'NGO Shelter'),
      reviewerName: ngoUser ? ngoUser.name : 'Authorized NGO Staff',
      transactionId,
      transactionFoodName: donation.foodName,
      portionsRescued: donation.portions,
      rating: numRating,
      comment: (comment || '').trim(),
      createdAt: new Date().toISOString(),
      isVerifiedTransaction: true,
      reported: false,
      reportReason: ''
    };

    this.state.reviews.unshift(newReview);
    this.saveState();

    this.logActivity(newReview.reviewerNgoName, `Submitted a ${numRating}-star verified donor review for ${newReview.donorOrg}`, transactionId, 'Donor Review');

    this.addNotification({
      recipientRole: 'donor',
      recipientId: donorId,
      title: `⭐ New ${numRating}-Star Review from ${newReview.reviewerNgoName}`,
      message: `${newReview.reviewerNgoName} reviewed your food collection for "${donation.foodName}": "${newReview.comment.substring(0, 60)}..."`,
      type: 'review'
    });

    this.notifySubscribers('REVIEW_ADDED', newReview);
    return { success: true, review: newReview };
  }

  // --- Legacy NGO Reviews & Helper Compatibility ---
  getReviewsForNgo(ngoId) {
    const all = this.state.reviews || [];
    return all.filter(r => r.ngoId === ngoId);
  }

  getNgoRatingStats(ngoId) {
    const reviews = this.getReviewsForNgo(ngoId).filter(r => !r.reported);
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        averageFormatted: '0.0',
        totalReviews: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      breakdown[star] = (breakdown[star] || 0) + 1;
      sum += (r.rating || 5);
    });

    const averageRating = sum / reviews.length;

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      averageFormatted: averageRating.toFixed(1),
      totalReviews: reviews.length,
      breakdown
    };
  }

  addReview(reviewData) {
    return this.addDonorReview(reviewData);
  }

  reportReview(reviewId, reason, reportedByUserId) {
    this.state.reviews = this.state.reviews || [];
    const review = this.state.reviews.find(r => r.id === reviewId);
    if (!review) return { success: false, message: 'Review not found.' };

    review.reported = true;
    review.reportReason = (reason || 'Inappropriate content').trim();
    review.reportedAt = new Date().toISOString();
    review.reportedBy = reportedByUserId || 'User';
    this.saveState();

    this.logActivity('Review Moderation Desk', `Reported review ${reviewId} for investigation: "${review.reportReason}"`, reviewId, 'Review Reported');

    this.addNotification({
      recipientRole: 'admin',
      title: `🚩 Review Reported for Moderation`,
      message: `Review #${reviewId} on ${review.donorOrg || review.ngoName || 'Donor'} was flagged: "${review.reportReason}".`,
      type: 'moderation'
    });

    this.notifySubscribers('REVIEW_REPORTED', review);
    return { success: true, review };
  }

  // --- NGO & User Profile Management ---
  updateUserProfile(userId, profileData) {
    const user = this.getUserById(userId);
    if (!user) return { success: false, message: 'User not found.' };

    const allowedFields = [
      'name', 'orgName', 'email', 'phone', 'address', 'coords',
      'logoUrl', 'description', 'mission', 'contactPerson',
      'peopleServed', 'beneficiaryCapacity', 'staffCount', 'volunteerCount',
      'servedCategories', 'storageCapacity', 'operatingHours',
      'foodCollectionAvailability', 'vehicleType'
    ];

    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        user[field] = profileData[field];
      }
    });

    this.saveState();
    this.logActivity(user.name, `Updated organization profile information`, user.id, 'Profile Updated');
    this.notifySubscribers('USER_UPDATED', user);
    return { success: true, user };
  }

  updateNgoLocation(userId, address, coords) {
    const user = this.getUserById(userId);
    if (!user) return { success: false, message: 'User not found.' };

    if (address) user.address = address.trim();
    if (coords && Array.isArray(coords) && coords.length === 2) {
      user.coords = [parseFloat(coords[0]), parseFloat(coords[1])];
    }

    this.saveState();
    this.logActivity(user.name, `Updated NGO location coordinates to [${user.coords.join(', ')}]`, user.id, 'Location Updated');
    this.notifySubscribers('USER_UPDATED', user);
    return { success: true, user };
  }
}

window.SaveToServeDB = new SaveToServeStore();
window.RainRouteDB = window.SaveToServeDB;

