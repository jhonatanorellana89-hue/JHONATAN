import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TrophyIcon } from './Icons';

type ToastType = 'success' | 'error' | 'info' | 'achievement';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [{ id, message, type }, ...prevToasts]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 4000);
  }, []);

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success': return { bg: 'bg-growth', text: 'text-white', icon: null };
      case 'error': return { bg: 'bg-danger', text: 'text-white', icon: null };
      case 'achievement': return { bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', text: 'text-black', icon: <TrophyIcon /> };
      case 'info':
      default:
        return { bg: 'bg-panel border border-border-subtle', text: 'text-white', icon: null };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 md:bottom-auto md:top-4 right-1/2 translate-x-1/2 md:right-4 md:translate-x-0 z-50 flex flex-col items-center gap-2 w-full max-w-sm px-4">
        {toasts.map(toast => {
          const style = getToastStyle(toast.type);
          return (
            <div
              key={toast.id}
              className={`w-full flex items-center justify-center gap-2 text-center px-4 py-2 rounded-lg shadow-lg font-semibold text-sm toast-animate ${style.bg} ${style.text}`}
            >
              {style.icon}
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};