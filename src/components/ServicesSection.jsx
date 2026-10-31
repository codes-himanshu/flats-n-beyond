import React from 'react';
import { KeyRound, ArrowLeftRight, Sparkles, CheckCircle2, ArrowRight, Gem } from 'lucide-react';

export default function ServicesSection({ onSelectService }) {
  const services = [
    {
      id: 'fresh-bookings',
      serviceType: 'Fresh Bookings',
      title: 'Fresh Bookings & Pre-Launches',
      badge: 'Zero Brokerage',
      icon: <KeyRound className="w-6 h-6 text-amber-700" />,
      tagline: 'Direct Developer Allocations',
      description: 'Exclusive first-mover access to premier residential launches across Gurgaon, Noida Expressway, and Golf Course Road. We secure high-appreciating units directly from Grade-A developers before public launch.',
      features: [
        'Direct builder agreements with zero buyer brokerage fees',
        'Access to high-floor golf and green park facing units',
        'Transparent developer escrow tracking and RERA validation',
        'Flexible payment schedule negotiations'
      ],
      ctaText: 'Explore Fresh Launches'
    },
    {
      id: 'sale-purchase',
      serviceType: 'Sale & Purchase',
      title: 'Sale & Purchase (Resale Advisory)',
      badge: 'Title Audited',
      icon: <ArrowLeftRight className="w-6 h-6 text-stone-800" />,
      tagline: 'Secondary Market Brokerage',
      description: 'Institutional-grade secondary market advisory for luxury homeowners and investors. Every listing undergoes comprehensive 30-year title searches, society NOC audits, and swift registry assistance.',
      features: [
        'Exhaustive 30-year revenue record and encumbrance audit',
        'Confidential high-net-worth buyer and seller matching',
        'Transparent price discovery without artificial markups',
        'End-to-end stamp duty, registration, and society handover'
      ],
      ctaText: 'View Verified Resale Listings'
    },
    {
      id: 'bespoke-interiors',
      serviceType: 'Bespoke Interiors',
      title: 'Bespoke Interiors Studio',
      badge: 'Turnkey Luxury',
      icon: <Gem className="w-6 h-6 text-amber-700" />,
      tagline: 'Turnkey Architectural Living',
      description: 'Our in-house design studio transforms bare-shell apartments and penthouses into bespoke architectural spaces. From bookmatched Italian marble to custom German modular systems.',
      features: [
        'Realistic 3D architectural plans before execution',
        'Imported Italian marble, veneers, and custom joinery',
        'Custom German modular kitchens and walk-in dressing suites',
        'Integrated smart lighting and home automation'
      ],
      ctaText: 'View Interior Design Studio'
    }
  ];

  const handleAction = (service) => {
    if (service.serviceType === 'Bespoke Interiors') {
      const element = document.getElementById('interiors');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    if (onSelectService) {
      onSelectService(service.serviceType);
    }
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20 border-b border-amber-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 text-slate-800 border border-amber-100 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Advisory Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Core Advisory Services
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Flats-n-Beyond delivers comprehensive end-to-end guidance across the entire property lifecycle, from initial allotment to turnkey luxury living.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {services.map((item) => (
            <div
              key={item.id}
              className="bg-white/90 backdrop-blur-xs rounded-3xl p-8 border border-amber-100 hover:border-amber-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header Icon & Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-100 text-slate-800">
                    {item.badge}
                  </span>
                </div>

                {/* Service Title & Tagline */}
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-amber-600 mt-1">
                  {item.tagline}
                </p>

                {/* Description */}
                <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Feature Bullets */}
                <div className="mt-6 space-y-2.5 pt-6 border-t border-amber-100/60">
                  {item.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  onClick={() => handleAction(item)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 group-hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{item.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
