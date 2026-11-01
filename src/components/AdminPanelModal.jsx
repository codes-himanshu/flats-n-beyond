import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, PlusCircle, Trash2, ShieldCheck, Building, RotateCcw,
  AlertTriangle, Eye, EyeOff, LogOut, KeyRound,
  Users, Phone, Mail, Calendar, Database,
  Clock, Search, RefreshCw,
  ChevronDown, ChevronUp, Check, MessageCircle, Sparkles,
  ArrowRight, ArrowLeft, Fingerprint, Shield
} from 'lucide-react';
import { PRESET_IMAGES } from '../data/initialProperties';
import {
  fetchDatabaseStatus,
  fetchEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  testMongoConnection
} from '../services/enquiryService';
import {
  requestAdminStep1,
  verifyAdminOtp,
  resendAdminOtp
} from '../services/propertyService';

const ADMIN_PASSCODE = 'Himan@1202';
const SESSION_AUTH_KEY = 'fnb_admin_authenticated_session';
const SESSION_TOKEN_KEY = 'fnb_admin_session_token';

export default function AdminPanelModal({
  isOpen,
  onClose,
  properties,
  onAddProperty,
  onDeleteProperty,
  onResetToDefault,
  showToast
}) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_AUTH_KEY) === 'active';
    } catch {
      return false;
    }
  });

  // 2-Step Authentication State: Step 1 = Passcode, Step 2 = 4-digit OTP
  const [authStep, setAuthStep] = useState(1);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifyingStep1, setIsVerifyingStep1] = useState(false);

  // Step 2 OTP State
  const [challengeId, setChallengeId] = useState('');
  const [sessionOtp, setSessionOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(300); // 5 minutes

  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Tab Selection: 'inventory' | 'leads' | 'add'
  const [activeTab, setActiveTab] = useState('inventory');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Leads & MongoDB Integration State
  const [enquiries, setEnquiries] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [leadFilter, setLeadFilter] = useState('All');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadDeleteConfirmId, setLeadDeleteConfirmId] = useState(null);
  const [updatingLeadId, setUpdatingLeadId] = useState(null);
  const [showMongoInstructions, setShowMongoInstructions] = useState(false);

  // MongoDB URI live test state
  const [testUriInput, setTestUriInput] = useState('');
  const [isTestingUri, setIsTestingUri] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Form State for Add New Listing
  const [formData, setFormData] = useState({
    title: '',
    location: 'Gurgaon',
    subLocality: '',
    serviceType: 'Fresh Bookings',
    price: '',
    priceNum: '',
    configuration: '3 BHK',
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2200,
    possession: 'Ready to Move',
    badge: 'Exclusive Launch',
    rera: '',
    image: '',
    description: '',
    amenities: '24/7 Security, Club House, 2 Reserved Parking, Swimming Pool',
    featured: true
  });

  const [formErrors, setFormErrors] = useState({});

  // Countdown timer for Step 2 OTP
  useEffect(() => {
    let timer = null;
    if (authStep === 2 && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [authStep, otpCountdown]);

  // --------------------------------------------------------------------------
  // 1. BACKGROUND SCROLL LOCK (BODY OVERFLOW FIX)
  // Locks the background landing page completely while the admin modal is open
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    // Cache original overflow & padding-right to avoid layout shift when scrollbar is hidden
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow || '';
      document.body.style.paddingRight = prevPaddingRight || '';
    };
  }, [isOpen]);

  // --------------------------------------------------------------------------
  // 2. LOGOUT & 5-MINUTE INACTIVITY AUTO-TIMEOUT
  // --------------------------------------------------------------------------
  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // Strictly 5 minutes (300,000 ms)

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setAuthStep(1);
    setPasscode('');
    setSessionOtp('');
    setChallengeId('');
    setOtpDigits(['', '', '', '']);
    setAuthError('');
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      sessionStorage.removeItem('fnb_admin_passcode');
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } catch (err) {
      console.error(err);
    }
    if (showToast) {
      showToast('Admin console locked securely.', 'info');
    }
  }, [showToast]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    let timeoutTimer = null;

    const performAutoLogout = () => {
      handleLogout();
      if (showToast) {
        showToast('Admin session expired due to 5 minutes of inactivity.', 'warning');
      }
    };

    const resetInactivityTimer = () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      timeoutTimer = setTimeout(performAutoLogout, INACTIVITY_TIMEOUT_MS);
    };

    // Initialize timer immediately upon session start
    resetInactivityTimer();

    // Listen to user interactions to reset timer
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    return () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetInactivityTimer);
      });
    };
  }, [isAuthenticated, isOpen, handleLogout, showToast]);

  // Refresh leads and database connection status on demand
  const loadLeadsAndStatus = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const [statusRes, leadsRes] = await Promise.all([
        fetchDatabaseStatus(),
        fetchEnquiries()
      ]);
      setDbStatus(statusRes);
      if (Array.isArray(leadsRes)) {
        setEnquiries(leadsRes);
      }
    } catch (err) {
      console.error('Error fetching leads or DB status:', err);
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  // Polling for live enquiries and DB health while admin panel is open
  useEffect(() => {
    let interval = null;
    if (isAuthenticated && isOpen) {
      loadLeadsAndStatus();
      interval = setInterval(() => {
        loadLeadsAndStatus();
      }, 20000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, isOpen, loadLeadsAndStatus]);

  if (!isOpen) return null;

  // --------------------------------------------------------------------------
  // STEP 1: Verify Exact Passcode (Himan@1202)
  // --------------------------------------------------------------------------
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    const entered = passcode.trim();

    if (!entered) {
      setAuthError('Please enter your administrator passcode.');
      return;
    }

    setIsVerifyingStep1(true);
    setAuthError('');

    try {
      const res = await requestAdminStep1(entered);
      if (res.success && res.step === 2) {
        setChallengeId(res.challengeId);
        setSessionOtp(res.otp || '');
        setAuthStep(2);
        setOtpDigits(['', '', '', '']);
        setOtpCountdown(res.expiresInSeconds || 300);
        setAuthError('');
        if (showToast) {
          showToast('Step 1 approved. Enter the 4-digit security code to proceed.');
        }
        setTimeout(() => {
          if (otpInputRefs[0].current) {
            otpInputRefs[0].current.focus();
          }
        }, 100);
      } else {
        setAuthError(res.error || 'Invalid administrator passcode. Access strictly restricted.');
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid administrator passcode. Access strictly restricted.');
    } finally {
      setIsVerifyingStep1(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 2: Handle 4-Digit OTP Input Navigation & Autofill
  // --------------------------------------------------------------------------
  const handleOtpDigitChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length === 0) {
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Single digit input
    if (cleaned.length === 1) {
      newDigits[index] = cleaned;
      setOtpDigits(newDigits);
      if (index < 3 && otpInputRefs[index + 1].current) {
        otpInputRefs[index + 1].current.focus();
      }
    } else {
      // Pasted multiple digits
      const digitsArr = cleaned.slice(0, 4).split('');
      digitsArr.forEach((d, i) => {
        if (i < 4) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(digitsArr.length, 3);
      if (otpInputRefs[nextFocus].current) {
        otpInputRefs[nextFocus].current.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (otpInputRefs[index - 1].current) {
        otpInputRefs[index - 1].current.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasteData) {
      const newDigits = ['', '', '', ''];
      pasteData.split('').forEach((char, i) => {
        if (i < 4) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const targetFocus = Math.min(pasteData.length, 3);
      if (otpInputRefs[targetFocus].current) {
        otpInputRefs[targetFocus].current.focus();
      }
    }
  };

  // --------------------------------------------------------------------------
  // STEP 2: Verify 4-Digit OTP
  // --------------------------------------------------------------------------
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length !== 4) {
      setAuthError('Please enter the complete 4-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setAuthError('');

    try {
      const res = await verifyAdminOtp(challengeId, enteredOtp, sessionOtp);
      if (res.success) {
        setIsAuthenticated(true);
        setAuthError('');
        try {
          sessionStorage.setItem(SESSION_AUTH_KEY, 'active');
          sessionStorage.setItem('fnb_admin_passcode', ADMIN_PASSCODE);
          if (res.sessionToken) {
            sessionStorage.setItem(SESSION_TOKEN_KEY, res.sessionToken);
          }
        } catch (err) {
          console.error(err);
        }
        if (showToast) {
          showToast('Administrative 2-step verification successful. Access granted.');
        }
        loadLeadsAndStatus();
      } else {
        setAuthError(res.error || 'Invalid 4-digit code. Please check and try again.');
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid 4-digit code. Please check and try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend 4-Digit OTP
  const handleResendOtp = async () => {
    if (isResendingOtp || !challengeId) return;
    setIsResendingOtp(true);
    setAuthError('');
    try {
      const res = await resendAdminOtp(challengeId);
      if (res.success) {
        if (res.otp) setSessionOtp(res.otp);
        setOtpCountdown(300);
        setOtpDigits(['', '', '', '']);
        if (showToast) {
          showToast('A fresh 4-digit security code has been generated.');
        }
        if (otpInputRefs[0].current) {
          otpInputRefs[0].current.focus();
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Failed to generate new security code.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  const currentPasscode = ADMIN_PASSCODE;

  // Status Change Handler for Leads
  const handleStatusChange = async (leadId, newStatus) => {
    setUpdatingLeadId(leadId);
    setEnquiries((prev) =>
      prev.map((item) => (item._id === leadId ? { ...item, status: newStatus } : item))
    );

    try {
      await updateEnquiryStatus(leadId, newStatus);
      if (showToast) {
        showToast(`Lead status updated to "${newStatus}".`);
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  // Delete Lead Handler
  const handleDeleteLead = async (leadId, customerName) => {
    try {
      await deleteEnquiry(leadId);
      setEnquiries((prev) => prev.filter((item) => item._id !== leadId));
      setLeadDeleteConfirmId(null);
      if (showToast) {
        showToast(`Enquiry from "${customerName}" deleted successfully.`, 'info');
      }
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
    }
  };

  // Test MongoDB Atlas Connection URI
  const handleTestConnection = async (e) => {
    e.preventDefault();
    if (!testUriInput.trim()) return;

    setIsTestingUri(true);
    setTestResult(null);
    try {
      const res = await testMongoConnection(testUriInput.trim());
      setTestResult(res);
      if (res.success) {
        loadLeadsAndStatus();
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection test error: ${err.message}`
      });
    } finally {
      setIsTestingUri(false);
    }
  };

  // Form Handlers for Add Property
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePresetImageSelect = (url) => {
    setFormData((prev) => ({ ...prev, image: url }));
    if (formErrors.image) {
      setFormErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.price.trim()) errors.price = 'Price is required (e.g. ₹ 4.50 Cr)';
    if (!formData.image.trim()) errors.image = 'Image URL is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    return errors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let num = Number(formData.priceNum);
    if (!num || isNaN(num)) {
      const matchCr = formData.price.match(/([\d.]+)\s*Cr/i);
      const matchL = formData.price.match(/([\d.]+)\s*L/i);
      if (matchCr) {
        num = parseFloat(matchCr[1]) * 10000000;
      } else if (matchL) {
        num = parseFloat(matchL[1]) * 100000;
      } else {
        num = 35000000;
      }
    }

    const amenitiesArray = formData.amenities
      ? formData.amenities.split(',').map((item) => item.trim()).filter(Boolean)
      : ['Luxury Clubhouse', '24/7 Security'];

    const newProperty = {
      id: `fnb-${Date.now().toString().slice(-5)}`,
      title: formData.title.trim(),
      location: formData.location,
      subLocality: formData.subLocality.trim() || `${formData.location}, NCR`,
      city: formData.location === 'Noida' ? 'Noida' : 'Gurgaon',
      serviceType: formData.serviceType,
      price: formData.price.trim(),
      priceNum: num,
      configuration: formData.configuration,
      bedrooms: Number(formData.bedrooms) || 3,
      bathrooms: Number(formData.bathrooms) || 3,
      areaSqft: Number(formData.areaSqft) || 2000,
      possession: formData.possession || 'Ready to Move',
      badge: formData.badge || 'New Listing',
      rera: formData.rera.trim() || 'HARERA/RERA Verified',
      image: formData.image.trim(),
      images: [
        formData.image.trim(),
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
      ],
      photoLabels: ["Outer Facade", "Living Hall", "Master Bedroom", "Modern Kitchen"],
      description: formData.description.trim(),
      amenities: amenitiesArray,
      featured: formData.featured
    };

    onAddProperty(newProperty, currentPasscode);

    // Reset Form
    setFormData({
      title: '',
      location: 'Gurgaon',
      subLocality: '',
      serviceType: 'Fresh Bookings',
      price: '',
      priceNum: '',
      configuration: '3 BHK',
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 2200,
      possession: 'Ready to Move',
      badge: 'Exclusive Launch',
      rera: '',
      image: '',
      description: '',
      amenities: '24/7 Security, Club House, 2 Reserved Parking, Swimming Pool',
      featured: true
    });
    setActiveTab('inventory');
  };

  const handleDelete = (id) => {
    onDeleteProperty(id, currentPasscode);
    setDeleteConfirmId(null);
  };

  // Filtered Leads
  const filteredEnquiries = enquiries.filter((item) => {
    const matchesFilter = leadFilter === 'All' || item.status === leadFilter;
    const q = leadSearch.toLowerCase().trim();
    if (!q) return matchesFilter;
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.phone && item.phone.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.propertyTitle && item.propertyTitle.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const newLeadsCount = enquiries.filter((l) => l.status === 'New').length;

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in text-left">
      <div className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto overscroll-contain shadow-2xl border-2 border-slate-300 flex flex-col">
        
        {/* ================================================================== */}
        {/* UNAUTHENTICATED STRICT 2-STEP LOGIN GATEWAY                        */}
        {/* ================================================================== */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-10 max-w-md mx-auto w-full text-center space-y-6">
            
            {/* Top Emblem & Branding */}
            <div className="space-y-3">
              <div className="relative mx-auto w-16 h-16 rounded-2xl bg-slate-900 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-amber-500" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                  2FA
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Institutional Gateway</span>
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Flats-n-Beyond Command Console
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Strict multi-step authorization required for portfolio inventory control and private customer leads.
                </p>
              </div>
            </div>

            {/* Step Progress Tracker */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl text-xs font-semibold">
              <div className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authStep === 1
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 bg-white/70'
              }`}>
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                  {authStep === 2 ? '✓' : '1'}
                </span>
                <span>Passcode</span>
              </div>

              <div className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authStep === 2
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-400'
              }`}>
                <span className={`w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                  authStep === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-300 text-slate-600'
                }`}>
                  2
                </span>
                <span>Security Code</span>
              </div>
            </div>

            {/* Error Message Box */}
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 animate-fade-in flex items-start gap-2 text-left">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 1: EXACT PASSCODE ENTRY (Himan@1202)                       */}
            {/* ============================================================== */}
            {authStep === 1 && (
              <form onSubmit={handleStep1Submit} autoComplete="off" className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="fnb_admin_passcode" className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                    Administrator Security Passcode
                  </label>
                  <div className="relative">
                    <input
                      id="fnb_admin_passcode"
                      name="fnb_admin_passcode"
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setAuthError('');
                      }}
                      placeholder="Enter administrator passcode"
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      data-lpignore="true"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all placeholder:text-slate-400"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingStep1}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isVerifyingStep1 ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>Validating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Proceed to 2FA Verification</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ============================================================== */}
            {/* STEP 2: 4-DIGIT ONE-TIME PASSCODE (OTP) VERIFICATION           */}
            {/* ============================================================== */}
            {authStep === 2 && (
              <form onSubmit={handleStep2Submit} autoComplete="off" className="space-y-5 text-left animate-fade-in">
                
                {/* Session Security Code Notification */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Session Security Code</span>
                    </span>
                    <span className="text-[11px] font-mono font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      ⏱ {formatTimer(otpCountdown)}
                    </span>
                  </div>

                  {sessionOtp && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-medium text-slate-600">Verification Code:</span>
                      <strong className="font-mono text-slate-900 font-bold text-sm tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        {sessionOtp}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block text-left">
                    Enter 4-Digit Security Code
                  </label>

                  {/* 4 Separate PIN Input Boxes - No Browser Autofill */}
                  <div className="flex items-center justify-between gap-3 pt-1" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpInputRefs[idx]}
                        type="text"
                        name={`fnb_admin_otp_${idx}`}
                        id={`fnb_admin_otp_${idx}`}
                        inputMode="numeric"
                        maxLength={1}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        data-form-type="other"
                        data-lpignore="true"
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-14 h-14 text-center text-2xl font-mono font-black rounded-xl border-2 transition-all focus:outline-none ${
                          digit
                            ? 'border-amber-500 bg-white ring-2 ring-amber-500/20 text-slate-950'
                            : 'border-slate-300 bg-slate-50 focus:border-amber-500 focus:bg-white text-slate-950'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Resend and Step 1 Back Navigation */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep(1);
                      setAuthError('');
                    }}
                    className="text-slate-600 hover:text-slate-950 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Passcode</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendingOtp || otpCountdown > 270}
                    className="text-amber-800 hover:text-amber-950 disabled:opacity-40 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResendingOtp ? 'animate-spin' : ''}`} />
                    <span>Resend Code</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpDigits.join('').length !== 4}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>Verifying Security Code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Authenticate & Open Dashboard</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Cancel Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
              >
                Return to Website
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* AUTHENTICATED MANAGEMENT PORTAL - HIGH CONTRAST UPGRADE        */
          /* ============================================================== */
          <>
            {/* Header: Clean Obsidian Theme */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 text-white rounded-t-3xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-amber-500 flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-bold tracking-tight text-white">Flats-n-Beyond Command Console</h2>
                    <span className="text-[10px] font-medium uppercase px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      2FA Active Session
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      5m Auto-Lock
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Live inventory management and customer lead pipeline synced with MongoDB Atlas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Logout / Lock button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-800 shadow-xs"
                  title="Lock and Log Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Lock Portal</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
                  aria-label="Close admin modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clean Segmented Tab Navigation Controls Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Tab 1: Live Inventory */}
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'inventory'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-amber-500" />
                  <span>Live Inventory ({properties.length})</span>
                </button>

                {/* Tab 2: Customer Enquiries / Leads */}
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 relative ${
                    activeTab === 'leads'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>Customer Enquiries ({enquiries.length})</span>
                  {newLeadsCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full">
                      {newLeadsCount}
                    </span>
                  )}
                </button>

                {/* Tab 3: Add New Property */}
                <button
                  onClick={() => setActiveTab('add')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'add'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Add Property</span>
                </button>
              </div>

              {/* Reset Catalog / Refresh Leads */}
              {activeTab === 'inventory' && (
                <button
                  onClick={() => {
                    if (window.confirm('Restore initial curated listings in MongoDB Atlas? Any newly added mock properties will be reset.')) {
                      onResetToDefault(currentPasscode);
                    }
                  }}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                  title="Reset to default curated inventory"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Catalog</span>
                </button>
              )}

              {activeTab === 'leads' && (
                <button
                  onClick={loadLeadsAndStatus}
                  disabled={loadingLeads}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh leads and database connection"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${loadingLeads ? 'animate-spin' : ''}`} />
                  <span>Refresh Leads</span>
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              
              {/* TAB 1: LIVE INVENTORY TABLE & REMOVE */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Current Active Listings</h3>
                      <p className="text-xs text-slate-500">
                        Changes take effect immediately on the visitor catalog and MongoDB Atlas database.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>New Listing</span>
                    </button>
                  </div>

                  {properties.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <p className="text-sm font-semibold text-slate-800">No properties in inventory</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">Click below to add a property or restore sample data.</p>
                      <button
                        onClick={() => onResetToDefault(currentPasscode)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors"
                      >
                        Restore Sample Listings
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                      {properties.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-center gap-4 min-w-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-14 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900 truncate">
                                  {item.title}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  {item.configuration}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                                  {item.serviceType}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 truncate">
                                📍 {item.subLocality || item.location} | RERA: {item.rera || 'Verified'}
                              </p>
                              <p className="text-sm font-bold text-slate-900 mt-0.5">
                                {item.price} <span className="text-slate-500 font-normal text-xs">({item.areaSqft} sq.ft)</span>
                              </p>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {deleteConfirmId === item.id ? (
                              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-rose-50 border border-rose-200 animate-fade-in">
                                <span className="text-[11px] font-medium text-rose-800 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Confirm delete?
                                </span>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs"
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded-lg cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                                title="Remove listing from live view and database"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CUSTOMER ENQUIRIES / LEADS DASHBOARD (MONGODB ATLAS) */}
              {activeTab === 'leads' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* MongoDB Atlas Integration Status Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-800 bg-slate-800/80 text-amber-400 shadow-inner">
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">
                              {dbStatus?.connected
                                ? `MongoDB Atlas: Connected (${dbStatus.dbName || 'flats_n_beyond'})`
                                : 'MongoDB Atlas Ready (Local Storage Active)'}
                            </h4>
                            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                              dbStatus?.connected
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                              {dbStatus?.connected ? 'Cloud Atlas Synced' : 'Resilient Fallback Mode'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {dbStatus?.connected
                              ? `All customer leads and tour requests are streaming in real-time to your MongoDB Atlas collection: "enquiries".`
                              : `The backend is saving leads into resilient storage. Connect your personal MongoDB Atlas database to persist leads in your cloud cluster.`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowMongoInstructions(!showMongoInstructions)}
                        className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{showMongoInstructions ? 'Hide Setup Guide' : 'Connection Setup'}</span>
                        {showMongoInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Collapsible Atlas Setup Instructions */}
                    {showMongoInstructions && (
                      <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 text-xs text-slate-300 animate-fade-in">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <p className="font-semibold text-white text-xs uppercase tracking-wider">
                            How to connect your personal MongoDB Atlas database:
                          </p>
                          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-300">
                            <li>
                              Open your MongoDB Atlas account (<span className="text-white font-medium">cloud.mongodb.com</span>) and click <strong>Database &rarr; Connect</strong>.
                            </li>
                            <li>
                              Select <strong>Drivers &rarr; Node.js</strong> and copy your connection string URI:
                              <div className="mt-1 p-2.5 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-lg border border-slate-800 overflow-x-auto select-all">
                                mongodb+srv://&lt;username&gt;:&lt;password&gt;@&lt;cluster-name&gt;.mongodb.net/flats_n_beyond?retryWrites=true&amp;w=majority
                              </div>
                            </li>
                            <li>
                              Open the project root file <span className="text-white font-medium">.env</span> (or use the live tester below) and update:
                              <div className="mt-1 p-2.5 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-lg border border-slate-800 overflow-x-auto select-all">
                                MONGODB_URI=mongodb+srv://&lt;your-username&gt;:&lt;your-password&gt;@cluster0.abcde.mongodb.net/flats_n_beyond?retryWrites=true&amp;w=majority
                              </div>
                            </li>
                            <li>
                              Restart the development servers with <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono">npm run dev:all</code>.
                            </li>
                          </ol>
                        </div>

                        {/* Live Atlas URI Tester */}
                        <form onSubmit={handleTestConnection} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                            Quick Connection Test (Verify Atlas URI from Browser):
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="password"
                              value={testUriInput}
                              onChange={(e) => setTestUriInput(e.target.value)}
                              placeholder="Paste mongodb+srv://... to test connection"
                              className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                            />
                            <button
                              type="submit"
                              disabled={isTestingUri || !testUriInput.trim()}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs cursor-pointer transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              {isTestingUri ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                                  <span>Testing...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5 text-slate-950" />
                                  <span>Test URI</span>
                                </>
                              )}
                            </button>
                          </div>
                          {testResult && (
                            <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                              testResult.success
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {testResult.message}
                            </div>
                          )}
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Total Leads
                        </span>
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                      </div>
                      <p className="text-2xl font-bold text-slate-900 mt-1.5">{enquiries.length}</p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          New Inquiries
                        </span>
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      </div>
                      <p className="text-2xl font-bold text-amber-600 mt-1.5">
                        {enquiries.filter((e) => e.status === 'New').length}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          In Contact
                        </span>
                        <span className="w-2 h-2 rounded-full bg-cyan-600" />
                      </div>
                      <p className="text-2xl font-bold text-cyan-700 mt-1.5">
                        {enquiries.filter((e) => e.status === 'Contacted').length}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Tours & Closed
                        </span>
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                      </div>
                      <p className="text-2xl font-bold text-slate-800 mt-1.5">
                        {enquiries.filter((e) => e.status === 'Tour Scheduled' || e.status === 'Closed').length}
                      </p>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    {/* Status Filter Buttons */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      {['All', 'New', 'Contacted', 'Tour Scheduled', 'Closed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setLeadFilter(status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                            leadFilter === status
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[260px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={leadSearch}
                        onChange={(e) => setLeadSearch(e.target.value)}
                        placeholder="Search name, phone, property..."
                        className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                      />
                    </div>
                  </div>

                  {/* Leads List */}
                  {loadingLeads ? (
                    <div className="py-16 text-center text-slate-500 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600" />
                      <p className="text-xs font-bold">Loading customer enquiries...</p>
                    </div>
                  ) : filteredEnquiries.length === 0 ? (
                    <div className="py-14 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                      <Users className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-sm font-semibold text-slate-800">No enquiries found</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {leadSearch || leadFilter !== 'All'
                          ? 'No results match the selected filter or search term. Try resetting the filters.'
                          : 'Customer submissions from the website will appear here in real time.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredEnquiries.map((lead) => {
                        const formattedDate = lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Recent';

                        const rawPhone = (lead.phone || '').replace(/[^\d]/g, '');
                        const waPhone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
                        const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                          `Hello ${lead.name}, thank you for contacting Flats-n-Beyond regarding "${lead.propertyTitle || 'luxury properties in NCR'}". We are pleased to assist you.`
                        )}`;

                        return (
                          <div
                            key={lead._id}
                            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-3.5"
                          >
                            {/* Card Top: Customer & Status */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                              <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h4 className="text-base font-bold text-slate-900">{lead.name}</h4>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                    lead.status === 'New'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : lead.status === 'Contacted'
                                      ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                      : lead.status === 'Tour Scheduled'
                                      ? 'bg-slate-100 text-slate-800 border-slate-200'
                                      : 'bg-slate-900 text-white border-slate-900'
                                  }`}>
                                    {lead.status}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {formattedDate}
                                  </span>
                                </div>
                              </div>

                              {/* Status Dropdown Selector */}
                              <div className="flex items-center gap-2">
                                <label className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Status:</label>
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                  disabled={updatingLeadId === lead._id}
                                  className="text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer shadow-xs"
                                >
                                  <option value="New">New</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Tour Scheduled">Tour Scheduled</option>
                                  <option value="Closed">Closed</option>
                                </select>
                              </div>
                            </div>

                            {/* Card Middle: Property and Enquiry Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                              {/* Interest */}
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                  Property / Service Interest
                                </span>
                                <p className="font-bold text-slate-900 text-xs">
                                  {lead.propertyTitle || 'General NCR Advisory'}
                                </p>
                                <p className="text-slate-500 font-normal text-[11px]">
                                  📍 {lead.location} • {lead.serviceType}
                                  {lead.budget && ` • Budget: ${lead.budget}`}
                                </p>
                              </div>

                              {/* Direct Contact Links */}
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                  Contact Information
                                </span>
                                <div className="flex flex-col gap-1">
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="font-medium text-slate-800 hover:text-amber-600 inline-flex items-center gap-1.5 transition-colors"
                                  >
                                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{lead.phone}</span>
                                  </a>
                                  {lead.email && (
                                    <a
                                      href={`mailto:${lead.email}`}
                                      className="font-normal text-slate-600 hover:text-amber-600 inline-flex items-center gap-1.5 transition-colors truncate"
                                    >
                                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                                      <span className="truncate">{lead.email}</span>
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Preferred Schedule / Source */}
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                  Preferred Visit Date
                                </span>
                                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{lead.preferredDate || 'Flexible / Immediate Consultation'}</span>
                                </p>
                                <span className="text-[10px] font-normal text-slate-400 block">
                                  Source: {lead.source || 'Website Form'}
                                </span>
                              </div>
                            </div>

                            {/* Client Notes / Special Requirements */}
                            {lead.notes && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed italic">
                                &ldquo;{lead.notes}&rdquo;
                              </div>
                            )}

                            {/* Card Footer: Quick Actions */}
                            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                {/* WhatsApp Trigger */}
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium inline-flex items-center gap-2 shadow-xs transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>WhatsApp Client</span>
                                </a>

                                {/* Phone Call */}
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium inline-flex items-center gap-2 border border-slate-200 shadow-xs transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Call Now</span>
                                </a>
                              </div>

                              {/* Delete Enquiry */}
                              <div>
                                {leadDeleteConfirmId === lead._id ? (
                                  <div className="flex items-center gap-2 p-1 rounded-xl bg-rose-50 border border-rose-200">
                                    <span className="text-[11px] font-medium text-rose-800">Delete enquiry?</span>
                                    <button
                                      onClick={() => handleDeleteLead(lead._id, lead.name)}
                                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setLeadDeleteConfirmId(null)}
                                      className="px-2 py-1 bg-slate-200 text-slate-800 text-xs font-medium rounded-lg cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setLeadDeleteConfirmId(lead._id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                                    title="Delete Lead"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: ADD NEW PROPERTY FORM */}
              {activeTab === 'add' && (
                <form onSubmit={handleFormSubmit} className="space-y-5 animate-fade-in">
                  <div className="pb-2 border-b border-slate-200">
                    <h3 className="text-base font-bold text-slate-900">Add New Property Listing</h3>
                    <p className="text-xs text-slate-500">
                      Publish a new residence to the live catalog with multi-photo gallery support.
                    </p>
                  </div>

                  {/* Grid 1: Basic Identifiers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Property Title / Project Name *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. DLF Privana North Residences"
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-300 ${
                          formErrors.title ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-slate-400'
                        }`}
                      />
                      {formErrors.title && <p className="text-[11px] text-rose-600 font-medium">{formErrors.title}</p>}
                    </div>

                    {/* Corridor / Location */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Corridor / Location *
                      </label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 cursor-pointer font-medium"
                      >
                        <option value="Gurgaon">Gurgaon (Cyber City & DLF)</option>
                        <option value="Golf Course">Golf Course Road & Ext.</option>
                        <option value="Dwarka Expressway">Dwarka Expressway</option>
                        <option value="Noida">Noida & Sector 150</option>
                      </select>
                    </div>

                    {/* Sub Locality */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Micro-Locality / Sector
                      </label>
                      <input
                        type="text"
                        name="subLocality"
                        value={formData.subLocality}
                        onChange={handleInputChange}
                        placeholder="e.g. Sector 76, Southern Peripheral Road"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                      />
                    </div>

                    {/* Service Category */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Service Category *
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 cursor-pointer font-medium"
                      >
                        <option value="Fresh Bookings">Fresh Bookings (Developer Direct)</option>
                        <option value="Sale & Purchase">Sale & Purchase (Secondary Resale)</option>
                        <option value="Bespoke Interiors">Bespoke Interiors (Turnkey Fitout)</option>
                      </select>
                    </div>

                  </div>

                  {/* Grid 2: Pricing & Configurations */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    
                    {/* Price Display */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Price String *
                      </label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g. ₹ 4.50 Cr or ₹ 95 Lac"
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-300 ${
                          formErrors.price ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-slate-400'
                        }`}
                      />
                      {formErrors.price && <p className="text-[11px] text-rose-600 font-medium">{formErrors.price}</p>}
                    </div>

                    {/* Configuration */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Configuration
                      </label>
                      <select
                        name="configuration"
                        value={formData.configuration}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                      >
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4 BHK">4 BHK</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Villa">Exclusive Villa</option>
                      </select>
                    </div>

                    {/* Area Sq. Ft */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Super Area (Sq. Ft.)
                      </label>
                      <input
                        type="number"
                        name="areaSqft"
                        value={formData.areaSqft}
                        onChange={handleInputChange}
                        placeholder="2450"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                      />
                    </div>

                  </div>

                  {/* Grid 3: Possession, Badge & RERA */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Possession Timeline
                      </label>
                      <input
                        type="text"
                        name="possession"
                        value={formData.possession}
                        onChange={handleInputChange}
                        placeholder="e.g. Ready to Move or Dec 2026"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        Badge / Tag
                      </label>
                      <input
                        type="text"
                        name="badge"
                        value={formData.badge}
                        onChange={handleInputChange}
                        placeholder="e.g. Exclusive Launch, Verified Resale"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                        RERA Number
                      </label>
                      <input
                        type="text"
                        name="rera"
                        value={formData.rera}
                        onChange={handleInputChange}
                        placeholder="e.g. RC/REP/HARERA/GGM/2024"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {/* Image URL & 1-Click Preset Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Image URL *</span>
                      <span className="text-[11px] font-normal text-slate-500">Or pick from curated presets below</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://images.unsplash.com/..."
                        className={`flex-1 px-3.5 py-2.5 bg-white border rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-300 ${
                          formErrors.image ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-slate-400'
                        }`}
                      />
                      {formData.image && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    {formErrors.image && <p className="text-[11px] text-rose-600 font-medium">{formErrors.image}</p>}

                    {/* Quick Presets */}
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block mb-1.5">
                        Click to Use Preset Luxury Visual:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {PRESET_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePresetImageSelect(preset.url)}
                            className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              formData.image === preset.url
                                ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-500/20'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <img src={preset.url} alt={preset.label} className="w-full h-10 object-cover rounded-lg" />
                            <span className="text-[10px] font-medium text-slate-700 truncate w-full text-center">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                      Full Property Description *
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the architectural highlights, views, connectivity, and luxurious interior appointments..."
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-300 ${
                        formErrors.description ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-slate-400'
                      }`}
                    />
                    {formErrors.description && <p className="text-[11px] text-rose-600 font-medium">{formErrors.description}</p>}
                  </div>

                  {/* Amenities */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                      Amenities (Comma separated)
                    </label>
                    <input
                      type="text"
                      name="amenities"
                      value={formData.amenities}
                      onChange={handleInputChange}
                      placeholder="e.g. Golf View, Private Lift, Olympic Pool, Concierge"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="featured" className="text-xs font-medium text-slate-800 cursor-pointer">
                      Feature this listing prominently in the spotlight
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('inventory')}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Publish Listing</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}
