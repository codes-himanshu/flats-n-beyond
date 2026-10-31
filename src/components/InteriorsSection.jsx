import React, { useState } from 'react';
import { Sparkles, Palette, CheckCircle2 } from 'lucide-react';

export default function InteriorsSection({ onOpenSchedule }) {
  const [activeTab, setActiveTab] = useState('minimalist');

  const interiorShowcases = {
    minimalist: {
      title: "Contemporary Monochromatic Haven",
      locality: "The Camellias, Golf Course Road",
      description: "Seamless open-plan design featuring bookmatched Grigio Italian marble, concealed flush-to-wall magnetic doors, and ambient perimeter lighting.",
      image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Concealed Acoustic Doors", "Bookmatched Grigio Marble", "Zero-Glare Architectural Lighting", "Integrated Wine Display Gallery"]
    },
    neoclassical: {
      title: "Classic Contemporary Grandeur",
      locality: "DLF Magnolias, Sector 42",
      description: "Clean wall paneling paired with champagne brass fixtures, recessed warm ceiling illumination, and bespoke herringbone smoked-oak timber flooring.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Understated Wall Paneling", "Smoked Oak Herringbone Parquet", "Custom Velvet & Brass Seating", "Travertine Fireplace Cladding"]
    },
    loft: {
      title: "Sky Penthouse Architectural Loft",
      locality: "Dwarka Expressway High-Rise",
      description: "Exposed architectural micro-cement textures, fluted acoustic wooden baffles, motorized smart drapery, and a sleek matte-black island kitchen with quartz waterfall edges.",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Micro-Cement Feature Walls", "Fluted Oak Acoustic Cladding", "Matte Black Island Kitchen", "Integrated Concealed Audio"]
    }
  };

  const current = interiorShowcases[activeTab];

  return (
    <section id="interiors" className="py-24 bg-slate-950 text-slate-100 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Flats-n-Beyond Design Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Bespoke Interiors Crafted For Elite Residences
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              We eliminate multi-vendor coordination by pairing every property transaction with an in-house architectural team that delivers turnkey craftsmanship.
            </p>
          </div>

          {/* Quick Consultation CTA */}
          <div className="shrink-0">
            <button
              onClick={() => onOpenSchedule('Bespoke Interiors')}
              className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              <span>Book Design Consultation</span>
            </button>
          </div>
        </div>

        {/* Style Selector Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'minimalist', label: 'Contemporary Minimalist' },
            { id: 'neoclassical', label: 'Classic Contemporary' },
            { id: 'loft', label: 'Architectural Loft' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white font-bold shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Showcase Spotlight Card */}
        <div className="bg-stone-800/80 rounded-3xl overflow-hidden border border-stone-700 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left: HD Photo Showcase */}
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:h-[480px] overflow-hidden bg-stone-950">
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-6 right-6">
              <span className="text-[11px] uppercase font-bold text-amber-300 tracking-wider">
                Completed Project Execution
              </span>
              <p className="text-lg font-bold text-white">{current.locality}</p>
            </div>
          </div>

          {/* Right: Architectural Details */}
          <div className="lg:col-span-5 p-8 flex flex-col justify-between bg-stone-900">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Design Concept
              </span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {current.description}
              </p>

              {/* Scope & Highlights */}
              <div className="mt-6 pt-6 border-t border-stone-800 space-y-3">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Signature Inclusions
                </span>
                {current.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-stone-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 4-step Turnkey Execution Flow */}
            <div className="mt-8 pt-6 border-t border-stone-800 grid grid-cols-4 gap-2 text-center text-[10px] text-stone-400">
              <div className="bg-stone-800 p-2 rounded-xl">
                <span className="block font-bold text-amber-400">01</span>
                <span>3D Plan</span>
              </div>
              <div className="bg-stone-800 p-2 rounded-xl">
                <span className="block font-bold text-amber-400">02</span>
                <span>Material</span>
              </div>
              <div className="bg-stone-800 p-2 rounded-xl">
                <span className="block font-bold text-amber-400">03</span>
                <span>Fitout</span>
              </div>
              <div className="bg-stone-800 p-2 rounded-xl">
                <span className="block font-bold text-amber-400">04</span>
                <span>Handover</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
