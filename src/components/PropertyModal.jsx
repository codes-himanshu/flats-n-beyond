import React, { useState } from 'react';
import { X, MapPin, BedDouble, Bath, Maximize2, Calendar, ShieldCheck, CheckCircle2, Calculator, MessageCircle, Phone, ArrowRight, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

export default function PropertyModal({ property, onClose, onScheduleVisit }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // EMI Calculator State
  const defaultLoan = Math.round(((property && property.priceNum) || 50000000) * 0.8);
  const [loanAmount, setLoanAmount] = useState(defaultLoan);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  if (!property) return null;

  const images = property.images && property.images.length > 0 ? property.images : [property.image];
  const photoLabels = property.photoLabels && property.photoLabels.length > 0
    ? property.photoLabels
    : ['Outer View', 'Living Hall', 'Master Suite', 'Modern Kitchen / Bath'];

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  // Calculate Monthly EMI: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const calculateEMI = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const months = tenureYears * 12;
    if (principal <= 0 || monthlyRate <= 0 || months <= 0) return 0;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Flats-n-Beyond, I am viewing "${property.title}" in ${property.location} (${property.price}) and would like to arrange an advisory consultation.`
  );
  const whatsappUrl = `https://wa.me/919811054000?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in text-left">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-100">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Section with Room Angle Switcher */}
        <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden group">
          <img
            src={images[activeImageIndex] || property.image}
            alt={`${property.title} - ${photoLabels[activeImageIndex] || 'Photo'}`}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/30 pointer-events-none" />
          
          {/* Top Info Overlay with Room Area Tag */}
          <div className="absolute top-5 left-5 flex items-center gap-2 z-20">
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-600 text-white shadow-xs">
              {property.badge || property.serviceType}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 backdrop-blur-md text-amber-300 border border-slate-700 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>{photoLabels[activeImageIndex] || `Angle ${activeImageIndex + 1}`}</span>
              <span className="text-slate-400 font-normal">({activeImageIndex + 1}/{images.length})</span>
            </span>
          </div>

          {/* Left/Right Switchers in Modal */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImg}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImg}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Bottom Title on Image */}
          <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between z-10 pointer-events-none">
            <div>
              <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {property.subLocality || `${property.location}, NCR`}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                {property.title}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-300 font-medium block">Price</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {property.price}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Thumbnails with Area Titles */}
        {images.length > 1 && (
          <div className="px-6 py-3 bg-amber-50/50 flex items-center gap-3 overflow-x-auto border-b border-amber-100">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-28 h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer group text-left ${
                  activeImageIndex === idx ? 'border-amber-600 scale-102 shadow-xs' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-semibold text-white px-1.5 py-0.5 truncate block text-center">
                  {photoLabels[idx] || `Photo ${idx + 1}`}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-amber-50/40 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-slate-800 flex items-center justify-center shrink-0">
                <BedDouble className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold text-slate-400">Layout</span>
                <p className="text-sm font-bold text-slate-900">{property.configuration} ({property.bedrooms || 3} Beds)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-slate-800 flex items-center justify-center shrink-0">
                <Bath className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold text-slate-400">Bathrooms</span>
                <p className="text-sm font-bold text-slate-900">{property.bathrooms || 3} En-Suite</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-slate-800 flex items-center justify-center shrink-0">
                <Maximize2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold text-slate-400">Super Area</span>
                <p className="text-sm font-bold text-slate-900">{property.areaSqft} Sq. Ft.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-slate-800 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold text-slate-400">Possession</span>
                <p className="text-sm font-bold text-slate-900">{property.possession || 'Ready to Move'}</p>
              </div>
            </div>
          </div>

          {/* RERA and Description */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="text-lg font-bold text-slate-900">Property Overview</h3>
              {property.rera && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/70 border border-amber-100 text-slate-800 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>RERA: {property.rera}</span>
                </div>
              )}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities & Highlights */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Key Amenities & Signature Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/40 border border-amber-100/80 text-xs font-medium text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Mortgage / EMI Calculator */}
          <div className="p-6 rounded-3xl bg-stone-900 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-stone-800 text-amber-400 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Estimated Mortgage Calculator</h4>
                  <p className="text-[11px] text-stone-400">Plan your luxury acquisition finances</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">Estimated Monthly EMI</span>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {formatCurrency(calculateEMI())}
                  <span className="text-xs text-stone-400 font-normal"> / mo</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-800 text-xs">
              <div>
                <div className="flex justify-between text-stone-300 mb-1">
                  <span>Loan Amount</span>
                  <span className="font-semibold text-white">{formatCurrency(loanAmount)}</span>
                </div>
                <input
                  type="range"
                  min="2000000"
                  max={(property.priceNum || 100000000) * 0.9}
                  step="500000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-stone-300 mb-1">
                  <span>Interest Rate</span>
                  <span className="font-semibold text-white">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="7.5"
                  max="12.0"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-stone-300 mb-1">
                  <span>Tenure</span>
                  <span className="font-semibold text-white">{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onScheduleVisit(property);
              }}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Schedule Private Tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Inquiry</span>
            </a>

            <a
              href="tel:+919811054000"
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 text-slate-800 border border-amber-100 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-slate-600" />
              <span>Call Advisory</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
