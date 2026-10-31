import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-stone-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-500 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-in shadow-2xl rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 p-4 flex items-start gap-3 backdrop-blur-md">
      {icons[type] || icons.success}
      <div className="flex-1 text-sm leading-relaxed pr-2 text-left">
        <p className="font-medium text-slate-100">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-slate-800 cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
