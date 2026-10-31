import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const reviews = [
    {
      name: "Rohit & Ananya Khanna",
      designation: "Managing Director, Global Tech Firm",
      property: "Golf Course Road Residence",
      service: "Sale & Purchase + Bespoke Interiors",
      quote: "Flats-n-Beyond handled our Golf Course Road acquisition with remarkable precision. What truly impressed us was their in-house interior studio — they transformed a bare-shell layout into our dream home without us having to deal with contractors even once."
    },
    {
      name: "Capt. Sameer Bhasin (Retd.)",
      designation: "Senior NRI Investor, Singapore",
      property: "Dwarka Expressway Luxury Tower",
      service: "Fresh Bookings Pre-Launch",
      quote: "Being based overseas, title transparency and builder credibility were my top concerns. Flats-n-Beyond secured pre-launch developer allotments at rates that have already appreciated by over 26%. Their legal due diligence is peerless."
    },
    {
      name: "Dr. Malini Sengupta",
      designation: "Senior Consultant, Max Healthcare",
      property: "Sector 128 Expressway, Noida",
      service: "Fresh Bookings",
      quote: "Zero brokerage, completely transparent pricing, and instant allotment of a golf-facing unit. The advisory team was courteous, never pushy, and guided us with complete market integrity."
    }
  ];

  return (
    <section className="py-20 border-b border-amber-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Client Endorsements
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Trusted By High-Net-Worth Homeowners
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Discover why corporate leaders, NRIs, and luxury connoisseurs make Flats-n-Beyond their primary real estate partner in Delhi-NCR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white/90 backdrop-blur-xs rounded-3xl p-7 border border-amber-100 hover:border-amber-200 shadow-xs flex flex-col justify-between relative hover:shadow-lg transition-all duration-300 text-left"
            >
              <div>
                {/* Rating stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-amber-200/80" />
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-amber-100/60">
                <h4 className="text-sm font-bold text-slate-900">{rev.name}</h4>
                <p className="text-[11px] text-slate-500">{rev.designation}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span>📍 {rev.property}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-50/70 border border-amber-100 font-semibold">{rev.service}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
