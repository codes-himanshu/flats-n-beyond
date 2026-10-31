import React from 'react';
import { PRIME_LOCATIONS } from '../data/locations';
import { MapPin, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LocationExplorer({ onSelectLocation }) {
  const handleLocationClick = (locName) => {
    if (onSelectLocation) {
      onSelectLocation(locName);
    }
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="locations" className="py-20 border-b border-amber-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-amber-100 text-slate-800 text-xs font-semibold mb-3">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Prime Micro-Markets</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              NCR&apos;s High-Yield Investment Corridors
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl">
              Market intelligence, verified infrastructure growth drivers, and hand-selected luxury enclaves across our four operational nodes.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Live Corridor Analytics 2026
            </span>
          </div>
        </div>

        {/* 4 Corridors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {PRIME_LOCATIONS.map((loc) => (
            <div
              key={loc.id}
              className="group relative bg-white/90 backdrop-blur-xs rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-amber-100 hover:border-amber-200 flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                
                {/* Growth Pill */}
                <div className="absolute top-3 right-3 bg-slate-900/90 text-amber-300 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border border-slate-700">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  <span>{loc.growth}</span>
                </div>

                {/* Location Title Over Image */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-bold text-white tracking-tight">{loc.name}</h3>
                  <p className="text-xs text-amber-300 font-medium">{loc.tagline}</p>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 gap-2 pb-4 border-b border-amber-100/60">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Avg. Value</span>
                      <p className="text-xs font-bold text-slate-900">{loc.avgPrice}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">Inventory</span>
                      <p className="text-xs font-bold text-amber-600">{loc.propertiesCount}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {loc.description}
                  </p>

                  {/* Highlights List */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Key Growth Drivers
                    </span>
                    {loc.keyLandmarks.slice(0, 2).map((landmark, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{landmark}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-5 pt-3 border-t border-amber-100/60">
                  <button
                    onClick={() => handleLocationClick(loc.name)}
                    className="w-full py-2.5 rounded-xl bg-amber-50/70 hover:bg-slate-900 text-slate-800 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer border border-amber-100/80"
                  >
                    <span>View {loc.name} Listings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
