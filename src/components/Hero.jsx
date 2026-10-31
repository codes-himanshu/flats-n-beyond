import React from 'react';
import { Search, MapPin, Building, Sparkles } from 'lucide-react';

export default function Hero({
  selectedLocation,
  setSelectedLocation,
  selectedService,
  setSelectedService,
  selectedConfig,
  setSelectedConfig,
  onSearchSubmit,
  onQuickFilterLocation
}) {
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit({
        location: selectedLocation,
        service: selectedService,
        config: selectedConfig
      });
    }
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePillClick = (loc) => {
    if (setSelectedLocation) {
      setSelectedLocation(loc);
    }
    if (onQuickFilterLocation) {
      onQuickFilterLocation(loc);
    }
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden border-b border-amber-100/80 text-left">
      
      {/* Background Animated Ambient Light */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-amber-200/25 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Animated Top Tagline Badge */}
        <div className="flex justify-center mb-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-amber-100 shadow-xs text-xs font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
            <span className="uppercase tracking-wider text-[11px] font-bold text-slate-900">Flats-n-Beyond</span>
            <span className="text-amber-300">•</span>
            <span className="text-slate-600 font-medium">Where dreams find an address</span>
          </div>
        </div>

        {/* Main Headline (Rich Slate & Warm Amber) */}
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up-delay-1">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            NCR&apos;s Finest Residences,{' '}
            <span className="text-amber-600">Curated With Precision.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Specializing in direct developer bookings, verified prime resales, and turnkey bespoke interiors across Gurgaon, Golf Course Road, Dwarka Expressway, and Noida.
          </p>
        </div>

        {/* Location Quick-Filters Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto animate-fade-in-up-delay-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" /> Corridors:
          </span>
          {[
            { name: 'All NCR', value: 'All' },
            { name: 'Gurgaon', value: 'Gurgaon' },
            { name: 'Golf Course', value: 'Golf Course' },
            { name: 'Dwarka Expressway', value: 'Dwarka Expressway' },
            { name: 'Noida', value: 'Noida' }
          ].map((loc) => (
            <button
              key={loc.value}
              onClick={() => handlePillClick(loc.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedLocation === loc.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/90 hover:bg-amber-50/70 text-slate-700 border border-amber-100 shadow-2xs'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        {/* Main Search Filter Console Card */}
        <div className="mt-10 max-w-5xl mx-auto animate-fade-in-up-delay-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-xl border border-amber-100">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Location Select */}
              <div className="flex flex-col space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  Corridor / Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-amber-50/40 hover:bg-amber-50/80 border border-amber-100 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="All">All Prime Corridors</option>
                  <option value="Gurgaon">Gurgaon (Cyber City & DLF)</option>
                  <option value="Golf Course">Golf Course Road & Ext.</option>
                  <option value="Dwarka Expressway">Dwarka Expressway</option>
                  <option value="Noida">Noida & Sector 150</option>
                </select>
              </div>

              {/* Service Type Select */}
              <div className="flex flex-col space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-600" />
                  Service Category
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-amber-50/40 hover:bg-amber-50/80 border border-amber-100 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="All">All Advisory Services</option>
                  <option value="Fresh Bookings">Fresh Bookings (Direct Allotment)</option>
                  <option value="Sale & Purchase">Sale & Purchase (Verified Resale)</option>
                  <option value="Bespoke Interiors">Bespoke Interiors (Turnkey)</option>
                </select>
              </div>

              {/* Configuration Select */}
              <div className="flex flex-col space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Configuration
                </label>
                <select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(e.target.value)}
                  className="w-full bg-amber-50/40 hover:bg-amber-50/80 border border-amber-100 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="All">Any Configuration</option>
                  <option value="2 BHK">2 BHK Residences</option>
                  <option value="3 BHK">3 BHK Suites</option>
                  <option value="4 BHK">4 BHK Luxury Suites</option>
                  <option value="Penthouse">Duplex Penthouses</option>
                  <option value="Villa">Luxury Villas</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full h-[45px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Search Properties</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Corporate Trust & Credibility Metrics */}
        <div className="mt-12 pt-8 border-t border-amber-100/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">₹ 1,200+ Cr</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction Portfolio</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600">4 Corridors</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gurgaon, Noida, Golf Course & Dwarka</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">100% Verified</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RERA & Title Clear</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">In-House Studio</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bespoke Interior Living</p>
          </div>
        </div>

      </div>
    </section>
  );
}
