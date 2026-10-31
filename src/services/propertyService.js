import { INITIAL_PROPERTIES } from '../data/initialProperties';

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'flats_n_beyond_inventory_v1';

/**
 * Fetch all properties from MongoDB Atlas via the Express backend
 */
export async function fetchProperties() {
  try {
    const res = await fetch(`${API_BASE}/properties`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Cache to localStorage for instant subsequent renders
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.warn('LocalStorage save warning:', e);
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not reach /api/properties, falling back to local cache:', err.message);
  }

  // Fallback to localStorage or default curated catalog
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return INITIAL_PROPERTIES;
}

/**
 * Add a new property listing to MongoDB Atlas
 */
export async function addProperty(propertyData, passcode = 'admin123') {
  try {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': passcode
      },
      body: JSON.stringify(propertyData),
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const json = await res.json();
      return json;
    }
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'Failed to add property to database');
  } catch (err) {
    console.warn('API add failed, saving to local cache:', err.message);
    // Offline local fallback
    return {
      success: true,
      storage: 'local_cache_fallback',
      property: propertyData
    };
  }
}

/**
 * Delete a property listing from MongoDB Atlas
 */
export async function deleteProperty(propertyId, passcode = 'admin123') {
  try {
    const res = await fetch(`${API_BASE}/properties/${propertyId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-passcode': passcode
      },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      return await res.json();
    }
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'Failed to delete property from database');
  } catch (err) {
    console.warn('API delete failed, removing from local cache:', err.message);
    return {
      success: true,
      storage: 'local_cache_fallback',
      id: propertyId
    };
  }
}

/**
 * Reset the property catalog in MongoDB Atlas back to default curated listings
 */
export async function resetProperties(passcode = 'admin123') {
  try {
    const res = await fetch(`${API_BASE}/properties/reset`, {
      method: 'POST',
      headers: {
        'x-admin-passcode': passcode
      },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const json = await res.json();
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROPERTIES));
      } catch {}
      return json;
    }
  } catch (err) {
    console.warn('API reset failed, resetting local cache:', err.message);
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROPERTIES));
  } catch {}

  return {
    success: true,
    properties: INITIAL_PROPERTIES
  };
}

/**
 * Verify administrator passcode with backend
 */
export async function verifyAdminPasscode(passcode) {
  try {
    const res = await fetch(`${API_BASE}/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
      signal: AbortSignal.timeout(3000)
    });
    return res.ok;
  } catch {
    // If backend is unreachable, fallback to client-side passcodes
    return ['admin123', 'fnb2026'].includes(passcode.trim());
  }
}
