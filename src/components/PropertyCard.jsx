import React, { useState } from 'react';
import { MapPin, BedDouble, Bath, Maximize2, MessageCircle, ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

export default function PropertyCard({ property, onSelect, onScheduleVisit }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = property.images && property.images.length > 0 ? property.images : [property.image];
  const photoLabels = property.photoLabels && property.photoLabels.length > 0
    ? property.photoLabels
    : ['Outer View', 'Living Hall', 'Master Suite', 'Modern Kitchen / Bath'];

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (e, idx) => {
    e.stopPropagation();
    setCurrentImgIndex(idx);
  };

  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'Exclusive Launch':
        return 'bg-amber-600 text-white font-bold';
      case 'Verified Resale':
        return 'bg-slate-900 text-white font-semibold';
      case 'Developer Direct':
        return 'bg-slate-800 text-amber-300 font-semibold';
      case 'Turnkey Furnished':
      case 'Architectural Loft':
        return 'bg-amber-700 text-white font-semibold';
      default:
        return 'bg-slate-900 text-white font-semibold';
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Flats-n-Beyond, I would like to inquire about "${property.title}" in ${property.location} (${property.price}) listed on your website.`
  );
  const whatsappUrl = `https://wa.me/919811054000?text=${whatsappMessage}`;

  return (
    <div className="group bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden border border-amber-100 hover:border-amber-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left">
      
      {/* Top Image & Interactive Gallery Switcher */}
      <div
        className="relative aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer"
        onClick={() => onSelect(property)}
      >
        <img
          src={images[currentImgIndex]}
          alt={`${property.title} - ${photoLabels[currentImgIndex] || 'Photo'}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider shadow-xs ${getBadgeStyle(property.badge)}`}>
            {property.badge || property.serviceType}
          </span>

          {/* Room Area Label / Counter Pill */}
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-950/85 backdrop-blur-md text-amber-300 border border-slate-700 flex items-center gap-1 shadow-xs">
            <Camera className="w-3 h-3 text-amber-400" />
            <span>{photoLabels[currentImgIndex] || `Photo ${currentImgIndex + 1}`}</span>
            <span className="text-slate-400 font-normal">({currentImgIndex + 1}/{images.length})</span>
          </span>
        </div>

        {/* Previous & Next Image Switcher Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImg}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/75 hover:bg-slate-900 text-white flex items-center justify-center opacity-85 group-hover:opacity-100 transition-all shadow-md cursor-pointer hover:scale-110"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImg}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/75 hover:bg-slate-900 text-white flex items-center justify-center opacity-85 group-hover:opacity-100 transition-all shadow-md cursor-pointer hover:scale-110"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Gallery Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-11 left-0 right-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => handleDotClick(e, idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentImgIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
                aria-label={`View photo ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Price on Image */}
        <div className="absolute bottom-2.5 left-4 right-4 flex items-end justify-between z-10 pointer-events-none">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold block">Guide Price</span>
            <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-xs">
              {property.price}
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-200 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-slate-700">
            {property.possession}
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Service & Location Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-50/70 text-slate-800 border border-amber-100">
              {property.serviceType}
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{property.location}</span>
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(property)}
            className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors cursor-pointer line-clamp-1"
            title={property.title}
          >
            {property.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {property.subLocality || `${property.location}, NCR`}
          </p>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-amber-100/60 text-slate-700">
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-slate-900">{property.bedrooms || property.configuration}</span>
                <span className="block text-[10px] text-slate-400">Bedrooms</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-slate-900">{property.bathrooms || 3}</span>
                <span className="block text-[10px] text-slate-400">Baths</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-slate-900">{property.areaSqft}</span>
                <span className="block text-[10px] text-slate-400">Sq. Ft.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-5 pt-4 border-t border-amber-100/60 flex items-center gap-2">
          {/* View Details */}
          <button
            onClick={() => onSelect(property)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Schedule Consultation */}
          <button
            onClick={() => onScheduleVisit(property)}
            className="py-2.5 px-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 text-slate-800 border border-amber-100 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
            title="Schedule a Site Visit"
          >
            <Calendar className="w-4 h-4 text-amber-600" />
          </button>

          {/* WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 text-slate-800 border border-amber-100 text-xs font-semibold flex items-center justify-center transition-colors"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-slate-800" />
          </a>
        </div>

      </div>
    </div>
  );
}
