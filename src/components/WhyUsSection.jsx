import React from 'react';
import { ShieldCheck, Award, HeartHandshake, Sparkles, Users } from 'lucide-react';

export default function WhyUsSection({ onOpenSchedule }) {
  const pillars = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
      title: "100% Title & Legal Due Diligence",
      desc: "Every listed resale asset undergoes rigorous 30-year revenue audits, court litigation cross-checks, and encumbrance verification before presentation."
    },
    {
      icon: <Award className="w-6 h-6 text-amber-600" />,
      title: "Zero Buyer Brokerage on Launches",
      desc: "Direct corporate builder allocations for fresh bookings with preferential inventory access, pre-launch pricing advantages, and zero advisory markup."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-600" />,
      title: "In-House Interior Architecture",
      desc: "Unlike generic brokers, we have an internal design studio that plans and crafts your luxury interior from bare shell to final handover."
    },
    {
      icon: <Users className="w-6 h-6 text-amber-600" />,
      title: "Private Family Office Advisory",
      desc: "Trusted by CXOs, high-net-worth families, and NRIs globally for confidential acquisitions, lease management, and wealth compounding in NCR."
    }
  ];

  return (
    <section id="why-us" className="py-24 border-b border-amber-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Brand Story */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-amber-100 text-slate-800 text-xs font-semibold">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
              <span>The Flats-n-Beyond Advantage</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Where Institutional Integrity Meets Luxury Living
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed">
              Founded on the belief that acquiring a prime address should be an inspiring milestone rather than a stressful ordeal, Flats-n-Beyond combines deep micro-market intelligence with personalized advisory.
            </p>

            <p className="text-slate-600 text-sm leading-relaxed">
              Whether you are locking in a golf-facing duplex on Golf Course Road or designing a custom turnkey penthouse along Dwarka Expressway, our senior advisory team acts as your fiduciary advocate.
            </p>

            <div className="pt-2">
              <button
                onClick={() => onOpenSchedule()}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer"
              >
                Connect With Senior Leadership
              </button>
            </div>
          </div>

          {/* Right Column: 4 Credibility Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/90 backdrop-blur-xs border border-amber-100 hover:border-amber-200 transition-all duration-300 shadow-2xs group hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-center mb-4 shadow-2xs group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
