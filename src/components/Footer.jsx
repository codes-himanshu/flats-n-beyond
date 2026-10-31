import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';

const CURRENT_YEAR = 2026;

export default function Footer({ onSelectLocation, onSelectService, onOpenAdmin }) {
  const handleLocationClick = (loc) => {
    if (onSelectLocation) onSelectLocation(loc);
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServiceClick = (srv) => {
    if (onSelectService) onSelectService(srv);
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-850 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-850">
          
          {/* Col 1: Brand Info & Borderless Vector Logo */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo theme="dark" size="default" />

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              NCR&apos;s premier luxury real estate advisory and bespoke interior design consultancy. Delivering institutional due diligence, developer pre-launch privileges, and turnkey architectural craftsmanship across Gurgaon, Golf Course Road, Dwarka Expressway, and Noida.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-200 text-xs font-semibold transition-colors cursor-pointer border border-stone-800"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Inventory Admin Portal</span>
              </button>
            </div>
          </div>

          {/* Col 2: Prime Corridors */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Prime Corridors
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleLocationClick('Golf Course')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Golf Course Road & Ext.
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLocationClick('Dwarka Expressway')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Dwarka Expressway (NPR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLocationClick('Gurgaon')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Gurgaon Core (Cyber City & DLF)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLocationClick('Noida')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Noida Expressway & Sec 150
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Core Advisory Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Core Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleServiceClick('Fresh Bookings')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Fresh Bookings & Allotments
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleServiceClick('Sale & Purchase')}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Sale & Purchase (Title Audited)
                </button>
              </li>
              <li>
                <a
                  href="#interiors"
                  className="hover:text-amber-400 transition-colors text-left block"
                >
                  Bespoke Interiors Studio
                </a>
              </li>
              <li>
                <a
                  href="#properties"
                  className="hover:text-amber-400 transition-colors text-left block"
                >
                  Duplex Penthouses
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate Offices & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Corporate Advisory
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>Two Horizon Center, Golf Course Road, DLF Phase 5, Gurgaon 122002</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="tel:+919811054000" className="hover:text-white transition-colors">
                  +91 98110 54000
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="mailto:advisory@flatsnbeyond.com" className="hover:text-white transition-colors">
                  advisory@flatsnbeyond.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Mon – Sun: 9:30 AM – 7:30 PM IST</span>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer & Compliance */}
        <div className="pt-8 text-[11px] text-stone-500 space-y-3 leading-relaxed">
          <p>
            <strong className="text-stone-400">RERA & Compliance Disclaimer:</strong> Flats-n-Beyond is a specialized real estate advisory and bespoke design consultancy. All project images, architectural plans, configurations, and amenities shown are sourced directly from RERA-registered developers or verified title holders. Project approvals may be verified on the official HARERA (harera.gov.in) and UP-RERA (up-rera.in) portals.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-stone-850 text-stone-400">
            <p>© {CURRENT_YEAR} Flats-n-Beyond. All rights reserved. Where dreams find an address.</p>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="hover:text-stone-300">Privacy Policy</span>
              <span className="text-stone-700">•</span>
              <span className="hover:text-stone-300">Terms of Advisory</span>
              <span className="text-stone-700">•</span>
              <span className="hover:text-stone-300">RERA Verification</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
