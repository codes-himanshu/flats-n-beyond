import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LocationExplorer from './components/LocationExplorer';
import PropertyGrid from './components/PropertyGrid';
import ServicesSection from './components/ServicesSection';
import InteriorsSection from './components/InteriorsSection';
import WhyUsSection from './components/WhyUsSection';
import TestimonialsSection from './components/TestimonialsSection';
import Footer from './components/Footer';
import PropertyModal from './components/PropertyModal';
import AdminPanelModal from './components/AdminPanelModal';
import ScheduleVisitModal from './components/ScheduleVisitModal';
import Toast from './components/Toast';
import { INITIAL_PROPERTIES } from './data/initialProperties';
import {
  fetchProperties,
  addProperty,
  deleteProperty,
  resetProperties
} from './services/propertyService';

const LOCAL_STORAGE_KEY = 'flats_n_beyond_inventory_v1';

export default function App() {
  // Inventory state with localStorage caching & MongoDB Atlas live hydration
  const [properties, setProperties] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load properties from localStorage', e);
    }
    return INITIAL_PROPERTIES;
  });

  // Hydrate live properties from MongoDB Atlas on mount
  useEffect(() => {
    let isMounted = true;
    fetchProperties().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setProperties(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(properties));
    } catch (e) {
      console.error('Failed to persist properties', e);
    }
  }, [properties]);

  // Filtering state
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedConfig, setSelectedConfig] = useState('All');

  // Modals state
  const [activePropertyModal, setActivePropertyModal] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleTargetProperty, setScheduleTargetProperty] = useState(null);
  const [schedulePrefillService, setSchedulePrefillService] = useState(null);

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Admin Actions (Connected directly to MongoDB Atlas)
  const handleAddProperty = async (newProp, passcode = 'admin123') => {
    // Optimistic UI update
    setProperties((prev) => [newProp, ...prev]);
    try {
      const res = await addProperty(newProp, passcode);
      if (res?.storage === 'mongodb_atlas') {
        showToast(`Listing "${newProp.title}" published and stored in MongoDB Atlas!`);
      } else {
        showToast(`Listing "${newProp.title}" successfully published!`);
      }
    } catch (err) {
      console.error('Error saving property to MongoDB:', err);
      showToast(`Listing published locally.`, 'info');
    }
  };

  const handleDeleteProperty = async (id, passcode = 'admin123') => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    if (activePropertyModal?.id === id) {
      setActivePropertyModal(null);
    }
    try {
      await deleteProperty(id, passcode);
      showToast('Listing removed from MongoDB Atlas and live catalog.', 'info');
    } catch (err) {
      console.error('Error removing property from MongoDB:', err);
      showToast('Listing removed from live view.', 'info');
    }
  };

  const handleResetToDefault = async (passcode = 'admin123') => {
    setProperties(INITIAL_PROPERTIES);
    try {
      await resetProperties(passcode);
      showToast('Restored original curated portfolio listings in MongoDB Atlas.');
    } catch (err) {
      console.error('Error resetting properties in MongoDB:', err);
      showToast('Restored original curated portfolio listings.');
    }
  };

  // Quick Action Handlers
  const handleHeroSearch = ({ location, service, config }) => {
    setSelectedLocation(location || 'All');
    setSelectedService(service || 'All');
    setSelectedConfig(config || 'All');
  };

  const handleOpenSchedule = (propertyOrService) => {
    if (typeof propertyOrService === 'string') {
      setScheduleTargetProperty(null);
      setSchedulePrefillService(propertyOrService);
    } else if (propertyOrService && typeof propertyOrService === 'object') {
      setScheduleTargetProperty(propertyOrService);
      setSchedulePrefillService(propertyOrService.serviceType);
    } else {
      setScheduleTargetProperty(null);
      setSchedulePrefillService(null);
    }
    setIsScheduleOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent font-sans text-slate-800 selection:bg-slate-900 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSchedule={() => handleOpenSchedule()}
        totalListings={properties.length}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onSelectService={(srv) => setSelectedService(srv)}
      />

      {/* Main Body */}
      <main className="flex-1">
        {/* Hero Section with synced filters */}
        <Hero
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
          onSearchSubmit={handleHeroSearch}
          onQuickFilterLocation={(loc) => setSelectedLocation(loc)}
        />

        {/* 4 Prime Corridors Overview */}
        <LocationExplorer
          onSelectLocation={(loc) => setSelectedLocation(loc)}
        />

        {/* Filterable Properties Catalog */}
        <PropertyGrid
          properties={properties}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
          onSelectProperty={(prop) => setActivePropertyModal(prop)}
          onScheduleVisit={(prop) => handleOpenSchedule(prop)}
        />

        {/* 3 Core Services: Fresh Bookings, Sale & Purchase, Bespoke Interiors */}
        <ServicesSection
          onSelectService={(srv) => setSelectedService(srv)}
          onOpenSchedule={(srv) => handleOpenSchedule(srv)}
        />

        {/* Bespoke Interiors Studio Showcase */}
        <InteriorsSection
          onOpenSchedule={(service) => handleOpenSchedule(service || 'Bespoke Interiors')}
        />

        {/* Credibility & Fiduciary Advisory */}
        <WhyUsSection
          onOpenSchedule={() => handleOpenSchedule()}
        />

        {/* Client Endorsements */}
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onSelectService={(srv) => setSelectedService(srv)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Modals & Portals */}
      {activePropertyModal && (
        <PropertyModal
          property={activePropertyModal}
          onClose={() => setActivePropertyModal(null)}
          onScheduleVisit={(prop) => handleOpenSchedule(prop)}
        />
      )}

      {isAdminOpen && (
        <AdminPanelModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          properties={properties}
          onAddProperty={handleAddProperty}
          onDeleteProperty={handleDeleteProperty}
          onResetToDefault={handleResetToDefault}
          showToast={showToast}
        />
      )}

      {isScheduleOpen && (
        <ScheduleVisitModal
          isOpen={isScheduleOpen}
          onClose={() => {
            setIsScheduleOpen(false);
            setScheduleTargetProperty(null);
            setSchedulePrefillService(null);
          }}
          selectedProperty={scheduleTargetProperty}
          prefilledService={schedulePrefillService}
          showToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
