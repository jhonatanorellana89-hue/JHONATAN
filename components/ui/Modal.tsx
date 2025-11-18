import React from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm modal-animate"
      onClick={onClose}
    >
      <div 
        className="glass-pane border border-border rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-border-subtle">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-white">
            <CloseIcon />
          </button>
        </header>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};