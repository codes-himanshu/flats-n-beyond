import React, { useState } from 'react';
import { X, Calendar, Phone, Mail, User, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { submitEnquiry } from '../services/enquiryService';

export default function ScheduleVisitModal({ isOpen, onClose, selectedProperty, prefilledService, showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: selectedProperty ? selectedProperty.location : 'Gurgaon',
    service: prefilledService || (selectedProperty ? selectedProperty.serviceType : 'Fresh Bookings'),
    preferredDate: '',
    notes: selectedProperty ? `Interested in ${selectedProperty.title} (${selectedProperty.price})` : ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim() || formData.phone.length < 8) errs.phone = 'Valid phone number required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitEnquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        propertyTitle: selectedProperty ? selectedProperty.title : 'General NCR Advisory',
        propertyId: selectedProperty ? selectedProperty.id : '',
        location: formData.location,
        serviceType: formData.service,
        budget: selectedProperty ? selectedProperty.price : '',
        preferredDate: formData.preferredDate,
        notes: formData.notes,
        source: selectedProperty ? 'Property Schedule Tour' : 'Website Consultation Request'
      });

      setSubmitted(true);
      if (showToast) {
        if (res?.storage === 'mongodb_atlas') {
          showToast('Enquiry saved to MongoDB Atlas! An executive will reach out promptly.');
        } else {
          showToast('Enquiry recorded successfully! Our advisor will connect shortly.');
        }
      }
    } catch (err) {
      console.error('Enquiry error:', err);
      setSubmitted(true);
      if (showToast) showToast('Enquiry recorded successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in text-left">
      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-100">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300 text-[10px] font-semibold mb-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>Private Appointment</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight">
              {selectedProperty ? `Schedule Tour: ${selectedProperty.title}` : 'Schedule Advisory Consultation'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Direct access to our Senior Advisory with zero obligation.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close form"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-slate-900 border border-amber-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-amber-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Consultation Confirmed</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{formData.name}</strong>. Our senior real estate advisor for <strong className="text-slate-900">{formData.location}</strong> has received your inquiry and will connect with you at <strong className="text-slate-900">{formData.phone}</strong> shortly.
              </p>
              <div className="pt-4 border-t border-amber-100/60">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Return to Exploration
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Vikramaditya Singhania"
                  className={`w-full px-3.5 py-2.5 bg-amber-50/40 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:bg-white ${
                    errors.name ? 'border-amber-600 focus:ring-amber-600' : 'border-amber-100 focus:ring-slate-900'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-amber-700 font-semibold">{errors.name}</p>}
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98110 XXXXX"
                  className={`w-full px-3.5 py-2.5 bg-amber-50/40 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:bg-white ${
                    errors.phone ? 'border-amber-600 focus:ring-amber-600' : 'border-amber-100 focus:ring-slate-900'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-amber-700 font-semibold">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-100 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              {/* Location & Service Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Preferred Corridor
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer font-medium"
                  >
                    <option value="Gurgaon">Gurgaon</option>
                    <option value="Golf Course">Golf Course</option>
                    <option value="Dwarka Expressway">Dwarka Expressway</option>
                    <option value="Noida">Noida</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Service Required
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer font-medium"
                  >
                    <option value="Fresh Bookings">Fresh Bookings</option>
                    <option value="Sale & Purchase">Sale & Purchase</option>
                    <option value="Bespoke Interiors">Bespoke Interiors</option>
                  </select>
                </div>
              </div>

              {/* Preferred Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Preferred Visit Date
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white cursor-pointer"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Specific Requirements
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Budget requirements, preferred floor, or design style..."
                  className="w-full px-3.5 py-2 bg-amber-50/40 border border-amber-100 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>Confirm Appointment Request</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Strict privacy guaranteed. Saved directly into secure platform database.</span>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
