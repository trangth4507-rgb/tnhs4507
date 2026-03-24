import React from 'react';
import { X, CheckCircle, WarningCircle, Info } from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-50 flex flex-col gap-2 w-[90vw] sm:w-80">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-md border shadow-lg animate-toast-in
            ${toast.type === 'success' ? 'bg-card border-success text-foreground' : ''}
            ${toast.type === 'error' ? 'bg-card border-error text-foreground' : ''}
            ${toast.type === 'info' ? 'bg-card border-info text-foreground' : ''}
          `}
          role="alert"
          aria-live="polite"
        >
          {toast.type === 'success' && <CheckCircle size={20} weight="regular" className="text-success flex-shrink-0 mt-0.5" />}
          {toast.type === 'error' && <WarningCircle size={20} weight="regular" className="text-error flex-shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info size={20} weight="regular" className="text-info flex-shrink-0 mt-0.5" />}
          <p className="flex-1 text-body-sm text-foreground">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X size={16} weight="regular" />
          </button>
        </div>
      ))}
    </div>
  );
}