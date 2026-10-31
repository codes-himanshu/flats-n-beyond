import React, { useState, useMemo } from 'react';
import PropertyCard from './PropertyCard';
import { Search, RotateCcw, Building, MapPin, X } from 'lucide-react';

export default function PropertyGrid({
  properties,
  selectedLocation,
  setSelectedLocation,
  selectedService,
  setSelectedService,
  selectedConfig,
  setSelectedConfig,
  onSelectProperty,
  onScheduleVisit
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // 1. Location filter
      if (selectedLocation && selectedLocation !== 'All' && item.location !== selectedLocation) {
        return false;
      }

      // 2. Service filter
      if (selectedService && selectedService !== 'All' && item.serviceType !== selectedService) {
        return false;
      }

      // 3. Config filter
      if (selectedConfig && selectedConfig !== 'All' && item.configuration !== selectedConfig) {
        return false;
      }

      // 4. Budget filter
      if (budgetFilter !== 'All') {
        const p = item.priceNum || 0;
        if (budgetFilter === 'under3' && p > 30000000) return false;
        if (budgetFilter === '3to6' && (p < 30000000 || p > 60000000)) return false;
        if (budgetFilter === '6to10' && (p < 60000000 || p > 100000000)) return false;
        if (budgetFilter === 'above10' && p < 100000000) return false;
      }

      // 5. Smart Search Query (multi-token search across all relevant fields)
      if (searchQuery.trim() !== '') {
        const tokens = searchQuery.trim().toLowerCase().split(/\s+/);
        const searchableText = [
          item.title,
          item.location,
          item.subLocality || '',
          item.city || '',
          item.configuration || '',
          item.serviceType || '',
          item.badge || '',
          item.description || '',
          (item.amenities || []).join(' ')
        ].join(' ').toLowerCase();

        // Every token must match
        const matchesAllTokens = tokens.every((token) => searchableText.includes(token));
        if (!matchesAllTokens) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priceLow') return (a.priceNum || 0) - (b.priceNum || 0);
      if (sortBy === 'priceHigh') return (b.priceNum || 0) - (a.priceNum || 0);
      if (sortBy === 'areaHigh') return (b.areaSqft || 0) - (a.areaSqft || 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [properties, selectedLocation, selectedService, selectedConfig, budgetFilter, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedLocation('All');
    setSelectedService('All');
    setSelectedConfig('All');
    setBudgetFilter('All');
    setSearchQuery('');
    setSortBy('featured');
  };

  const isFilterActive =
    (selectedLocation && selectedLocation !== 'All') ||
    (selectedService && selectedService !== 'All') ||
    (selectedConfig && selectedConfig !== 'All') ||
    budgetFilter !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <section id="properties" className="py-20 border-b border-amber-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 text-slate-800 border border-amber-100 text-xs font-semibold mb-3">
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span>Curated Inventory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Featured Residences & Penthouses
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Verified luxury developments with complete title transparency, guaranteed pre-launch allocations, and turnkey bespoke residences.
          </p>
        </div>

        {/* Filter Navigation Bar */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-amber-100 mb-10 space-y-4">
          
          {/* Row 1: Corridor Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-amber-100/60">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> Corridors:
              </span>
              {['All', 'Gurgaon', 'Golf Course', 'Dwarka Expressway', 'Noida'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    selectedLocation === loc
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-amber-50/60 hover:bg-amber-100/70 text-slate-700'
                  }`}
                >
                  {loc === 'All' ? 'All NCR' : loc}
                </button>
              ))}
            </div>

            {/* Quick Reset */}
            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-amber-50/70 hover:bg-amber-100/80 transition-colors cursor-pointer border border-amber-100"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Row 2: Service Pills & Secondary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            
            {/* Service Filters */}
            <div className="lg:col-span-5 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
                Service:
              </span>
              {[
                { label: 'All Services', val: 'All' },
                { label: 'Fresh Bookings', val: 'Fresh Bookings' },
                { label: 'Sale & Purchase', val: 'Sale & Purchase' },
                { label: 'Bespoke Interiors', val: 'Bespoke Interiors' }
              ].map((srv) => (
                <button
                  key={srv.val}
                  onClick={() => setSelectedService(srv.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedService === srv.val
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-amber-50/40 hover:bg-amber-50/80 text-slate-700 border border-amber-100/80'
                  }`}
                >
                  {srv.label}
                </button>
              ))}
            </div>

            {/* Configuration Select */}
            <div className="lg:col-span-2">
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(e.target.value)}
                className="w-full bg-amber-50/40 border border-amber-100/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer"
              >
                <option value="All">All Configurations</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Villa">Luxury Villa</option>
              </select>
            </div>

            {/* Budget Range */}
            <div className="lg:col-span-2">
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="w-full bg-amber-50/40 border border-amber-100/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer"
              >
                <option value="All">All Budgets</option>
                <option value="under3">Under ₹3 Crore</option>
                <option value="3to6">₹3 Cr to ₹6 Crore</option>
                <option value="6to10">₹6 Cr to ₹10 Crore</option>
                <option value="above10">Above ₹10 Crore</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="lg:col-span-3 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search sector, project, builder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-amber-50/40 border border-amber-100/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:bg-white"
              />
            </div>

          </div>

          {/* Active Filter Tags Bar (When any filter is active) */}
          {isFilterActive && (
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-amber-100/60 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Criteria:</span>
              {selectedLocation !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-slate-800 text-[11px] font-medium">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('All')} className="hover:text-slate-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedService !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-slate-800 text-[11px] font-medium">
                  {selectedService}
                  <button onClick={() => setSelectedService('All')} className="hover:text-slate-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedConfig !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-slate-800 text-[11px] font-medium">
                  {selectedConfig}
                  <button onClick={() => setSelectedConfig('All')} className="hover:text-slate-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {budgetFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-slate-800 text-[11px] font-medium">
                  Budget: {budgetFilter}
                  <button onClick={() => setBudgetFilter('All')} className="hover:text-slate-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery.trim() !== '' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-slate-800 text-[11px] font-medium">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery('')} className="hover:text-slate-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Row 3: Meta Summary & Sort */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-amber-100/60 flex-wrap gap-2">
            <span>
              Showing <strong className="text-slate-900 font-bold">{filteredProperties.length}</strong> verified properties
              {selectedLocation !== 'All' && <span> in <strong className="text-amber-600">{selectedLocation}</strong></span>}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="areaHigh">Area: Largest First</option>
              </select>
            </div>
          </div>

        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelect={onSelectProperty}
                onScheduleVisit={onScheduleVisit}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-xl mx-auto shadow-sm">
            <Building className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-900">No matching listings found</h3>
            <p className="text-stone-500 text-xs mt-1 mb-6">
              We couldn&apos;t find any properties matching your current filter combination. Try clearing some criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
