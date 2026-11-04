import React, { useEffect } from 'react';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-bio-emerald shrink-0" />,
    info: <Info className="w-4 h-4 text-bio-cyan shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-bio-amber shrink-0" />,
  };

  const borders = {
    success: 'border-bio-emerald/40',
    info: 'border-bio-cyan/40',
    warning: 'border-bio-amber/40',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bio-glass-card border ${borders[toast.type]} shadow-xl text-xs text-white animate-slide-up backdrop-blur-md`}
    >
      {icons[toast.type]}
      <span className="font-medium">{toast.text}</span>
    </div>
  );
};
