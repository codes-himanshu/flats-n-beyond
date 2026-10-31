// Customer Enquiry & MongoDB Atlas API Service

const API_BASE = '/api';
const LOCAL_LEADS_BACKUP_KEY = 'fnb_customer_enquiries_local_backup_v1';

// Seed demo leads for offline resiliency
const INITIAL_DEMO_LEADS = [
  {
    _id: 'lead-local-001',
    name: 'Vikramaditya Singhania',
    phone: '+91 98110 54321',
    email: 'vikram.singhania@apexholding.com',
    propertyTitle: 'The Sovereign Sky-Mansions',
    propertyId: 'fnb-101',
    location: 'Golf Course',
    serviceType: 'Fresh Bookings',
    budget: '₹ 15.50 Cr',
    preferredDate: '2026-11-04',
    notes: 'Interested in high-floor golf facing unit. Please arrange private tour with senior director.',
    status: 'New',
    source: 'Website Schedule Modal',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    _id: 'lead-local-002',
    name: 'Radhika & Anshul Mehra',
    phone: '+91 98200 87654',
    email: 'anshul.mehra@globaltech.sg',
    propertyTitle: 'Aura Sky Vistas - High-Rise Living',
    propertyId: 'fnb-102',
    location: 'Dwarka Expressway',
    serviceType: 'Fresh Bookings',
    budget: '₹ 4.00 Cr',
    preferredDate: '2026-11-06',
    notes: 'Overseas NRI buyer. Seeking title verification and direct allotment for 3 BHK unit.',
    status: 'Contacted',
    source: 'Property Detail Modal',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    _id: 'lead-local-003',
    name: 'Dr. Harshvardhan Kapoor',
    phone: '+91 99102 33445',
    email: 'dr.kapoor@medanta.org',
    propertyTitle: 'Bespoke Turnkey Penthouse Fitout',
    propertyId: '',
    location: 'Gurgaon',
    serviceType: 'Bespoke Interiors',
    budget: '₹ 2.50 Cr (Interior Scope)',
    preferredDate: '2026-11-08',
    notes: 'Completed bare-shell acquisition in DLF Phase 5. Need architectural 3D plan & Italian marble joinery.',
    status: 'Tour Scheduled',
    source: 'Bespoke Interiors Section',
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString()
  }
];

const getLocalBackup = () => {
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_BACKUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not read local backup:', err);
  }
  return INITIAL_DEMO_LEADS;
};

const saveLocalBackup = (leads) => {
  try {
    localStorage.setItem(LOCAL_LEADS_BACKUP_KEY, JSON.stringify(leads));
  } catch (err) {
    console.warn('Could not save local backup:', err);
  }
};

/**
 * Check backend and MongoDB Atlas connection status
 */
export async function fetchDatabaseStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // If backend isn't reached, report local fallback
  }

  return {
    connected: false,
    mode: 'offline_fallback',
    uriConfigured: false,
    dbName: 'Browser Local Storage',
    message: 'Backend server is in local mode. Ensure "node server.js" is running to connect to MongoDB Atlas.'
  };
}

/**
 * Fetch all customer enquiries for the Admin Dashboard
 */
export async function fetchEnquiries() {
  try {
    const res = await fetch(`${API_BASE}/enquiries`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveLocalBackup(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('API fetch failed, falling back to local storage cache:', err.message);
  }

  return getLocalBackup();
}

/**
 * Submit a customer enquiry from the website
 */
export async function submitEnquiry(enquiryData) {
  try {
    const res = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryData),
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (err) {
    console.warn('API post failed, saving to local backup:', err.message);
  }

  // Resilient fallback storage
  const fallbackLead = {
    _id: `lead-local-${Date.now()}`,
    ...enquiryData,
    status: 'New',
    createdAt: new Date().toISOString()
  };
  const current = getLocalBackup();
  current.unshift(fallbackLead);
  saveLocalBackup(current);

  return {
    success: true,
    storage: 'local_storage_fallback',
    enquiry: fallbackLead
  };
}

/**
 * Update an enquiry's status (New, Contacted, Tour Scheduled, Closed)
 */
export async function updateEnquiryStatus(id, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Status patch failed, updating local backup:', err.message);
  }

  // Update in local cache
  const list = getLocalBackup();
  const updated = list.map((item) => (item._id === id ? { ...item, status: newStatus } : item));
  saveLocalBackup(updated);
  return { success: true, updatedLocal: true };
}

/**
 * Delete an enquiry from the database
 */
export async function deleteEnquiry(id) {
  try {
    const res = await fetch(`${API_BASE}/enquiries/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Delete failed, removing from local backup:', err.message);
  }

  const list = getLocalBackup();
  const filtered = list.filter((item) => item._id !== id);
  saveLocalBackup(filtered);
  return { success: true, removedLocal: true };
}

/**
 * Test a MongoDB connection URI from the Admin Panel
 */
export async function testMongoConnection(uri) {
  try {
    const res = await fetch(`${API_BASE}/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
      signal: AbortSignal.timeout(7000)
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      message: `Failed to reach backend tester: ${err.message}`
    };
  }
}
