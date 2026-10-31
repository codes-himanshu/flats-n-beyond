import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X, ChevronDown } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Navbar({ onOpenAdmin, onOpenSchedule, totalListings, onSelectLocation, onSelectService }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLocationClick = (loc) => {
    setMobileMenuOpen(false);
    if (onSelectLocation) onSelectLocation(loc);
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServiceClick = (srv) => {
    setMobileMenuOpen(false);
    if (onSelectService) onSelectService(srv);
    const element = document.getElementById('properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-amber-100/80 py-3'
          : 'bg-white/90 backdrop-blur-sm border-b border-amber-100/50 py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          
          {/* Brand Logo: Clean, Borderless, Pure Vector */}
          <a
            href="#"
            className="flex items-center group focus:outline-none transition-transform hover:opacity-95"
            aria-label="Flats-n-Beyond Home"
          >
            <BrandLogo theme="light" size="default" />
          </a>

          {/* Center Navigation Links: Generous Spacing & Balanced Alignment */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-700">
            <button
              onClick={() => handleNavClick('properties')}
              className="hover:text-slate-950 transition-colors py-1 cursor-pointer"
            >
              Featured Properties
            </button>

            {/* Corridor Quick Links */}
            <div className="relative group">
              <button
                onClick={() => handleNavClick('locations')}
                className="flex items-center gap-1.5 hover:text-slate-950 transition-colors py-1 cursor-pointer"
              >
                <span>Prime Corridors</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-100 p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <button
                  onClick={() => handleLocationClick('Gurgaon')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50/70 hover:text-slate-950 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Gurgaon Core</span>
                  <span className="text-[10px] text-slate-400">Cyber City & DLF</span>
                </button>
                <button
                  onClick={() => handleLocationClick('Golf Course')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50/70 hover:text-slate-950 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Golf Course Road</span>
                  <span className="text-[10px] text-amber-600 font-semibold">Billionaire Mile</span>
                </button>
                <button
                  onClick={() => handleLocationClick('Dwarka Expressway')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50/70 hover:text-slate-950 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Dwarka Expressway</span>
                  <span className="text-[10px] text-slate-400">Diplomatic Node</span>
                </button>
                <button
                  onClick={() => handleLocationClick('Noida')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50/70 hover:text-slate-950 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Noida & Sec 150</span>
                  <span className="text-[10px] text-slate-400">Expressway Hub</span>
                </button>
              </div>
            </div>

            {/* Core Services Dropdown */}
            <div className="relative group">
              <button
                onClick={() => handleNavClick('services')}
                className="flex items-center gap-1.5 hover:text-stone-950 transition-colors py-1 cursor-pointer"
              >
                <span>Services</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 mt-3 w-60 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-100 p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <button
                  onClick={() => handleServiceClick('Fresh Bookings')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-800 hover:bg-amber-50/70 transition-colors flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-slate-900">Fresh Bookings</span>
                  <span className="text-[10px] text-slate-500">Direct developer allocations & VIP pricing</span>
                </button>
                <button
                  onClick={() => handleServiceClick('Sale & Purchase')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-800 hover:bg-amber-50/70 transition-colors flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-slate-900">Sale & Purchase</span>
                  <span className="text-[10px] text-slate-500">Verified resale, title audits & registry</span>
                </button>
                <button
                  onClick={() => handleNavClick('interiors')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-800 hover:bg-amber-50/70 transition-colors flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-slate-900">Bespoke Interiors</span>
                  <span className="text-[10px] text-slate-500">Turnkey architectural & luxury fit-outs</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('interiors')}
              className="hover:text-slate-950 transition-colors py-1 cursor-pointer"
            >
              Bespoke Interiors
            </button>

            <button
              onClick={() => handleNavClick('why-us')}
              className="hover:text-slate-950 transition-colors py-1 cursor-pointer"
            >
              Why Us
            </button>
          </nav>

          {/* Right Action CTAs: Sufficient Spacing, No Telephone Crowding */}
          <div className="hidden sm:flex items-center space-x-3.5 shrink-0">
            {/* Schedule Visit Button */}
            <button
              onClick={onOpenSchedule}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all duration-200 cursor-pointer"
            >
              Schedule Visit
            </button>

            {/* Interactive Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all duration-200 cursor-pointer"
              title="Open Property Inventory Admin Panel"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
              <span className="ml-1 px-1.5 py-0.2 bg-slate-950/30 text-[10px] rounded-full font-bold">
                {totalListings}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              aria-label="Admin Panel"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{totalListings}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-amber-50/70 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-md border-b border-amber-100 px-5 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-amber-100/60">
            <button
              onClick={() => handleLocationClick('Gurgaon')}
              className="text-left p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              Gurgaon
            </button>
            <button
              onClick={() => handleLocationClick('Golf Course')}
              className="text-left p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              Golf Course
            </button>
            <button
              onClick={() => handleLocationClick('Dwarka Expressway')}
              className="text-left p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              Dwarka Exp.
            </button>
            <button
              onClick={() => handleLocationClick('Noida')}
              className="text-left p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              Noida Exp.
            </button>
          </div>

          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-800">
            <button
              onClick={() => handleNavClick('properties')}
              className="text-left py-2 px-2 hover:bg-amber-50/70 rounded-lg cursor-pointer"
            >
              Featured Properties
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className="text-left py-2 px-2 hover:bg-amber-50/70 rounded-lg cursor-pointer"
            >
              Core Advisory Services
            </button>
            <button
              onClick={() => handleNavClick('interiors')}
              className="text-left py-2 px-2 hover:bg-amber-50/70 rounded-lg cursor-pointer"
            >
              Bespoke Interiors
            </button>
            <button
              onClick={() => handleNavClick('why-us')}
              className="text-left py-2 px-2 hover:bg-amber-50/70 rounded-lg cursor-pointer"
            >
              Why Flats-n-Beyond
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSchedule();
              }}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold text-center cursor-pointer shadow-sm"
            >
              Schedule Private Consultation
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
