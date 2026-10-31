import React from 'react';

export default function BrandLogo({ theme = 'light', size = 'default' }) {
  const isDark = theme === 'dark';

  const dimensions = {
    sm: { icon: 'w-8 h-8', title: 'text-base', sub: 'text-[9px]' },
    default: { icon: 'w-10 h-10', title: 'text-lg sm:text-xl', sub: 'text-[10px] sm:text-[11px]' },
    lg: { icon: 'w-12 h-12', title: 'text-2xl', sub: 'text-xs' }
  }[size] || { icon: 'w-10 h-10', title: 'text-lg sm:text-xl', sub: 'text-[10px] sm:text-[11px]' };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Pristine Borderless Vector Architectural Key Emblem */}
      <div className={`relative ${dimensions.icon} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xs"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>

          {/* Roof Pavilion Gable Line */}
          <path
            d="M 18 42 L 50 14 L 82 42"
            stroke="url(#goldGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Roof Baseline with Center Gateway Opening */}
          <path
            d="M 18 42 L 36 42"
            stroke="url(#goldGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M 64 42 L 82 42"
            stroke="url(#goldGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Short Architectural Side Pillars */}
          <path
            d="M 23 42 L 23 54"
            stroke="url(#goldGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 77 42 L 77 54"
            stroke="url(#goldGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Key Bow: Elegant Interlocking Infinity / Arch Emblem */}
          <circle
            cx="50"
            cy="38"
            r="12"
            stroke="url(#goldGrad)"
            strokeWidth="4"
          />
          <path
            d="M 50 32 L 54 38 L 50 44 L 46 38 Z"
            fill="url(#goldGrad)"
          />

          {/* Key Column Stem */}
          <path
            d="M 50 50 L 50 86"
            stroke="url(#goldGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Architectural Key Wards (Teeth) */}
          <path
            d="M 50 72 L 60 72"
            stroke="url(#goldGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 50 81 L 63 81"
            stroke="url(#goldGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Typography Hierarchy */}
      <div className="flex flex-col text-left justify-center">
        <span
          className={`font-black tracking-tight leading-none ${dimensions.title} ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          FLATS <span className="text-amber-600 font-extrabold">N</span> BEYOND
        </span>
        <span
          className={`font-semibold tracking-[0.18em] uppercase leading-tight mt-1 ${dimensions.sub} ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Where dreams find an address
        </span>
      </div>
    </div>
  );
}
