import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_PROPERTIES } from './src/data/initialProperties.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSCODES = ['admin123', 'fnb2026'];

app.use(cors());
app.use(express.json());

// Fallback file storage paths for offline resiliency
const FALLBACK_DATA_DIR = path.join(__dirname, 'server_data');
const FALLBACK_ENQUIRIES_FILE = path.join(FALLBACK_DATA_DIR, 'enquiries_fallback.json');
const FALLBACK_PROPERTIES_FILE = path.join(FALLBACK_DATA_DIR, 'properties_fallback.json');

if (!fs.existsSync(FALLBACK_DATA_DIR)) {
  fs.mkdirSync(FALLBACK_DATA_DIR, { recursive: true });
}

// Seed Initial Enquiries for Demonstration
const SEED_ENQUIRIES = [
  {
    _id: 'seed-001',
    name: 'Vikramaditya Singhania',
    phone: '+91 98110 54321',
    email: 'vikram.singhania@apexholding.com',
    propertyTitle: 'The Camellia Reserve Residences',
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
    _id: 'seed-002',
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
    _id: 'seed-003',
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

// Fallback loaders & savers
const loadFallbackEnquiries = () => {
  try {
    if (fs.existsSync(FALLBACK_ENQUIRIES_FILE)) {
      const raw = fs.readFileSync(FALLBACK_ENQUIRIES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading fallback enquiries:', err.message);
  }
  return [...SEED_ENQUIRIES];
};

const saveFallbackEnquiries = (enquiries) => {
  try {
    fs.writeFileSync(FALLBACK_ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving fallback enquiries:', err.message);
  }
};

const loadFallbackProperties = () => {
  try {
    if (fs.existsSync(FALLBACK_PROPERTIES_FILE)) {
      const raw = fs.readFileSync(FALLBACK_PROPERTIES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading fallback properties:', err.message);
  }
  return [...INITIAL_PROPERTIES];
};

const saveFallbackProperties = (properties) => {
  try {
    fs.writeFileSync(FALLBACK_PROPERTIES_FILE, JSON.stringify(properties, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving fallback properties:', err.message);
  }
};

let fallbackEnquiries = loadFallbackEnquiries();
let fallbackProperties = loadFallbackProperties();

// ==============================================================================
// MONGOOSE SCHEMAS & MODELS
// ==============================================================================

// 1. Property Schema
const PropertySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    subLocality: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: 'Gurgaon' },
    serviceType: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true },
    priceNum: { type: Number, default: 0 },
    configuration: { type: String, default: '3 BHK' },
    bedrooms: { type: Number, default: 3 },
    bathrooms: { type: Number, default: 3 },
    areaSqft: { type: Number, default: 2000 },
    possession: { type: String, default: 'Ready to Move' },
    badge: { type: String, default: 'New Listing' },
    rera: { type: String, default: 'Verified' },
    image: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    photoLabels: { type: [String], default: [] },
    description: { type: String, required: true, trim: true },
    amenities: { type: [String], default: [] },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Property = mongoose.model('Property', PropertySchema);

// 2. Customer Enquiry Schema
const EnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    propertyTitle: { type: String, trim: true, default: 'General NCR Consultation' },
    propertyId: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: 'Gurgaon' },
    serviceType: { type: String, trim: true, default: 'Fresh Bookings' },
    budget: { type: String, trim: true, default: '' },
    preferredDate: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Tour Scheduled', 'Closed'],
      default: 'New'
    },
    source: { type: String, default: 'Website Enquiry Form' }
  },
  { timestamps: true }
);

const Enquiry = mongoose.model('Enquiry', EnquirySchema);

// Connection State Tracking
let dbState = {
  connected: false,
  mode: 'fallback',
  uriConfigured: Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0),
  dbName: null,
  cluster: null,
  message: 'Connecting to MongoDB Atlas...'
};

// Connect to MongoDB Atlas
const connectToMongoDB = async () => {
  const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';

  if (!uri) {
    dbState = {
      connected: false,
      mode: 'fallback',
      uriConfigured: false,
      dbName: 'Local Store (Atlas URI pending)',
      cluster: null,
      message: 'MongoDB Atlas URI is not configured yet. Running in resilient local fallback mode.'
    };
    console.log('[Flats-n-Beyond Server] MONGODB_URI not provided. Running in fallback mode.');
    return;
  }

  try {
    console.log('[Flats-n-Beyond Server] Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

    const conn = mongoose.connection;
    const parsedDb = conn.name || 'flats_n_beyond';
    const host = conn.host || 'cluster0.tijuobs.mongodb.net';

    dbState = {
      connected: true,
      mode: 'mongodb_atlas',
      uriConfigured: true,
      dbName: parsedDb,
      cluster: host,
      message: `Successfully connected to MongoDB Atlas database "${parsedDb}" on cluster ${host}.`
    };
    console.log(`[Flats-n-Beyond Server] Successfully connected to MongoDB Atlas! Database: ${parsedDb}`);

    // Auto-seed Properties collection if empty
    const propertyCount = await Property.countDocuments();
    if (propertyCount === 0) {
      console.log(`[Flats-n-Beyond Server] Initializing MongoDB Atlas with ${INITIAL_PROPERTIES.length} curated luxury properties...`);
      await Property.insertMany(INITIAL_PROPERTIES);
      console.log('[Flats-n-Beyond Server] Initial property catalog successfully synced with MongoDB Atlas.');
    } else {
      console.log(`[Flats-n-Beyond Server] Found ${propertyCount} live property listings in MongoDB Atlas.`);
    }

    // Auto-seed Enquiries collection if empty
    const enquiryCount = await Enquiry.countDocuments();
    if (enquiryCount === 0 && fallbackEnquiries.length > 0) {
      console.log(`[Flats-n-Beyond Server] Initializing MongoDB Atlas with demo inquiries...`);
      const cleanSeed = fallbackEnquiries.map(({ _id, ...rest }) => rest);
      await Enquiry.insertMany(cleanSeed);
      console.log('[Flats-n-Beyond Server] Customer enquiries collection initialized in MongoDB Atlas.');
    } else {
      console.log(`[Flats-n-Beyond Server] Found ${enquiryCount} live enquiries in MongoDB Atlas.`);
    }
  } catch (err) {
    dbState = {
      connected: false,
      mode: 'fallback',
      uriConfigured: true,
      dbName: 'Local Store (Atlas error)',
      cluster: null,
      error: err.message,
      message: `Failed to connect to MongoDB Atlas (${err.message}). Resilient fallback storage is active.`
    };
    console.error('[Flats-n-Beyond Server] MongoDB Atlas connection error:', err.message);
  }
};

// Initialize connection
connectToMongoDB();

// Admin Authentication Guard Middleware
const verifyAdmin = (req, res, next) => {
  const passcode = req.headers['x-admin-passcode'] || req.body?.passcode || req.query?.passcode;
  if (!passcode || !ADMIN_PASSCODES.includes(String(passcode).trim())) {
    return res.status(401).json({
      error: 'Unauthorized: Valid administrator passcode required to manage inventory or customer leads.'
    });
  }
  next();
};

// ==============================================================================
// REST API ENDPOINTS
// ==============================================================================

// 1. Health & Connection Status
app.get('/api/status', async (req, res) => {
  try {
    let enquiryCount = fallbackEnquiries.length;
    let propertyCount = fallbackProperties.length;

    if (dbState.connected && mongoose.connection.readyState === 1) {
      enquiryCount = await Enquiry.countDocuments();
      propertyCount = await Property.countDocuments();
    }

    res.json({
      ...dbState,
      totalProperties: propertyCount,
      totalEnquiries: enquiryCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Admin Passcode Verification
app.post('/api/admin/verify', (req, res) => {
  const { passcode } = req.body;
  if (passcode && ADMIN_PASSCODES.includes(String(passcode).trim())) {
    return res.json({ success: true, message: 'Administrator credentials verified.' });
  }
  return res.status(401).json({ success: false, message: 'Invalid administrator passcode.' });
});

// ==============================================================================
// PROPERTY LISTINGS API
// ==============================================================================

// 3. Fetch All Properties (Public Website & Admin Panel)
app.get('/api/properties', async (req, res) => {
  try {
    if (dbState.connected && mongoose.connection.readyState === 1) {
      const records = await Property.find().sort({ createdAt: -1 });
      return res.json(records);
    } else {
      return res.json(fallbackProperties);
    }
  } catch (err) {
    console.error('Fetch properties error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve properties', details: err.message });
  }
});

// 4. Fetch Single Property
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (dbState.connected && mongoose.connection.readyState === 1) {
      const prop = await Property.findOne({ id }) || await Property.findById(id).catch(() => null);
      if (!prop) return res.status(404).json({ error: 'Property not found' });
      return res.json(prop);
    } else {
      const prop = fallbackProperties.find((p) => p.id === id);
      if (!prop) return res.status(404).json({ error: 'Property not found' });
      return res.json(prop);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve property', details: err.message });
  }
});

// 5. Add New Property (Admin Protected)
app.post('/api/properties', verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      location,
      subLocality,
      city,
      serviceType,
      price,
      priceNum,
      configuration,
      bedrooms,
      bathrooms,
      areaSqft,
      possession,
      badge,
      rera,
      image,
      images,
      photoLabels,
      description,
      amenities,
      featured
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Property title is required' });
    }
    if (!price || !price.trim()) {
      return res.status(400).json({ error: 'Price is required' });
    }
    if (!image || !image.trim()) {
      return res.status(400).json({ error: 'Primary image URL is required' });
    }

    const newId = req.body.id || `fnb-${Date.now().toString().slice(-5)}`;
    const galleryImages = Array.isArray(images) && images.length > 0 ? images : [image.trim()];
    const labels = Array.isArray(photoLabels) && photoLabels.length > 0
      ? photoLabels
      : ['Outer View', 'Living Hall', 'Master Bedroom', 'Modern Kitchen'];

    const propertyPayload = {
      id: newId,
      title: title.trim(),
      location: location || 'Gurgaon',
      subLocality: subLocality ? subLocality.trim() : `${location || 'Gurgaon'}, NCR`,
      city: city || (location === 'Noida' ? 'Noida' : 'Gurgaon'),
      serviceType: serviceType || 'Fresh Bookings',
      price: price.trim(),
      priceNum: Number(priceNum) || 35000000,
      configuration: configuration || '3 BHK',
      bedrooms: Number(bedrooms) || 3,
      bathrooms: Number(bathrooms) || 3,
      areaSqft: Number(areaSqft) || 2000,
      possession: possession || 'Ready to Move',
      badge: badge || 'New Listing',
      rera: rera ? rera.trim() : 'HARERA/RERA Verified',
      image: image.trim(),
      images: galleryImages,
      photoLabels: labels,
      description: (description || '').trim(),
      amenities: Array.isArray(amenities) ? amenities : ['Luxury Clubhouse', '24/7 Security'],
      featured: Boolean(featured)
    };

    if (dbState.connected && mongoose.connection.readyState === 1) {
      const doc = new Property(propertyPayload);
      const savedDoc = await doc.save();
      console.log(`[Flats-n-Beyond] Added new listing "${savedDoc.title}" to MongoDB Atlas (_id: ${savedDoc._id})`);
      return res.status(201).json({
        success: true,
        storage: 'mongodb_atlas',
        property: savedDoc
      });
    } else {
      fallbackProperties.unshift(propertyPayload);
      saveFallbackProperties(fallbackProperties);
      console.log(`[Flats-n-Beyond] Saved new listing "${propertyPayload.title}" to local fallback storage`);
      return res.status(201).json({
        success: true,
        storage: 'fallback_storage',
        property: propertyPayload
      });
    }
  } catch (err) {
    console.error('Save property error:', err.message);
    res.status(500).json({ error: 'Failed to publish property listing', details: err.message });
  }
});

// 6. Delete Property (Admin Protected)
app.delete('/api/properties/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (dbState.connected && mongoose.connection.readyState === 1) {
      const deleted = await Property.findOneAndDelete({ id }) || await Property.findByIdAndDelete(id).catch(() => null);
      if (!deleted) {
        return res.status(404).json({ error: 'Property not found in MongoDB Atlas' });
      }
      console.log(`[Flats-n-Beyond] Removed property "${id}" from MongoDB Atlas`);
      return res.json({ success: true, message: `Property ${id} deleted from MongoDB Atlas` });
    } else {
      const initialLen = fallbackProperties.length;
      fallbackProperties = fallbackProperties.filter((p) => p.id !== id);
      if (fallbackProperties.length === initialLen) {
        return res.status(404).json({ error: 'Property not found in local storage' });
      }
      saveFallbackProperties(fallbackProperties);
      return res.json({ success: true, message: `Property ${id} removed from local storage` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property', details: err.message });
  }
});

// 7. Reset Property Catalog (Admin Protected)
app.post('/api/properties/reset', verifyAdmin, async (req, res) => {
  try {
    if (dbState.connected && mongoose.connection.readyState === 1) {
      await Property.deleteMany({});
      await Property.insertMany(INITIAL_PROPERTIES);
      console.log('[Flats-n-Beyond] Restored curated sample properties in MongoDB Atlas');
      return res.json({
        success: true,
        message: 'Restored original curated properties in MongoDB Atlas',
        properties: INITIAL_PROPERTIES
      });
    } else {
      fallbackProperties = [...INITIAL_PROPERTIES];
      saveFallbackProperties(fallbackProperties);
      return res.json({
        success: true,
        message: 'Restored original curated properties in local storage',
        properties: INITIAL_PROPERTIES
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset properties', details: err.message });
  }
});

// ==============================================================================
// CUSTOMER ENQUIRIES API
// ==============================================================================

// 8. Fetch All Customer Enquiries (Admin Dashboard)
app.get('/api/enquiries', async (req, res) => {
  try {
    if (dbState.connected && mongoose.connection.readyState === 1) {
      const records = await Enquiry.find().sort({ createdAt: -1 });
      return res.json(records);
    } else {
      return res.json(fallbackEnquiries);
    }
  } catch (err) {
    console.error('Fetch enquiries error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve enquiries', details: err.message });
  }
});

// 9. Submit New Customer Enquiry (Customer Website Form)
app.post('/api/enquiries', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      propertyTitle,
      propertyId,
      location,
      serviceType,
      budget,
      preferredDate,
      notes,
      source
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!phone || !phone.trim() || phone.trim().length < 8) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const newEnquiryPayload = {
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      propertyTitle: (propertyTitle || 'General Advisory Consultation').trim(),
      propertyId: propertyId || '',
      location: location || 'Gurgaon',
      serviceType: serviceType || 'Fresh Bookings',
      budget: (budget || '').trim(),
      preferredDate: (preferredDate || '').trim(),
      notes: (notes || '').trim(),
      status: 'New',
      source: source || 'Website Customer Form'
    };

    if (dbState.connected && mongoose.connection.readyState === 1) {
      const doc = new Enquiry(newEnquiryPayload);
      const savedDoc = await doc.save();
      console.log(`[Flats-n-Beyond] Saved new enquiry from "${name}" to MongoDB Atlas (_id: ${savedDoc._id})`);
      return res.status(201).json({
        success: true,
        storage: 'mongodb_atlas',
        enquiry: savedDoc
      });
    } else {
      const fallbackDoc = {
        _id: `lead-${Date.now()}`,
        ...newEnquiryPayload,
        createdAt: new Date().toISOString()
      };
      fallbackEnquiries.unshift(fallbackDoc);
      saveFallbackEnquiries(fallbackEnquiries);
      console.log(`[Flats-n-Beyond] Saved new enquiry from "${name}" to fallback storage`);
      return res.status(201).json({
        success: true,
        storage: 'fallback_storage',
        enquiry: fallbackDoc
      });
    }
  } catch (err) {
    console.error('Save enquiry error:', err.message);
    res.status(500).json({ error: 'Failed to record customer enquiry', details: err.message });
  }
});

// 10. Update Enquiry Status
app.patch('/api/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (dbState.connected && mongoose.connection.readyState === 1) {
      const updateData = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const updated = await Enquiry.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) {
        return res.status(404).json({ error: 'Enquiry not found in MongoDB Atlas' });
      }
      return res.json({ success: true, enquiry: updated });
    } else {
      const idx = fallbackEnquiries.findIndex((e) => e._id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Enquiry not found in local storage' });
      }
      if (status) fallbackEnquiries[idx].status = status;
      if (notes !== undefined) fallbackEnquiries[idx].notes = notes;
      saveFallbackEnquiries(fallbackEnquiries);
      return res.json({ success: true, enquiry: fallbackEnquiries[idx] });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update enquiry', details: err.message });
  }
});

// 11. Delete Enquiry
app.delete('/api/enquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (dbState.connected && mongoose.connection.readyState === 1) {
      const deleted = await Enquiry.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Enquiry not found in MongoDB Atlas' });
      }
      return res.json({ success: true, message: 'Enquiry removed from MongoDB Atlas' });
    } else {
      const initialLen = fallbackEnquiries.length;
      fallbackEnquiries = fallbackEnquiries.filter((e) => e._id !== id);
      if (fallbackEnquiries.length === initialLen) {
        return res.status(404).json({ error: 'Enquiry not found in local storage' });
      }
      saveFallbackEnquiries(fallbackEnquiries);
      return res.json({ success: true, message: 'Enquiry removed from local storage' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete enquiry', details: err.message });
  }
});

// 12. Test Custom MongoDB URI
app.post('/api/test-connection', async (req, res) => {
  const { uri } = req.body;
  if (!uri || !uri.trim()) {
    return res.status(400).json({ success: false, message: 'Please provide a MongoDB connection URI' });
  }

  let testConn = null;
  try {
    testConn = await mongoose.createConnection(uri.trim(), { serverSelectionTimeoutMS: 5000 }).asPromise();
    const dbName = testConn.name || 'test';
    await testConn.close();
    return res.json({
      success: true,
      message: `Connection successful! Validated access to database "${dbName}".`,
      dbName
    });
  } catch (err) {
    if (testConn) {
      try { await testConn.close(); } catch {}
    }
    return res.status(400).json({
      success: false,
      message: `Connection failed: ${err.message}`
    });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`[Flats-n-Beyond Server] Backend API running at http://localhost:${PORT}`);
});
