import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Transactions, TransferModal } from './components/Transactions';
import { BalanceSheet } from './components/Accounts';
import { Categories } from './components/Categories';
import { Sync } from './components/Sync';
import { Ventures } from './components/Ventures';
import { Recurring } from './components/Recurring';
import { useAppData } from './hooks/useAppData';
import { ToastProvider } from './components/ui/Toast';
import { Modal } from './components/ui/Modal';

export type View = 'dashboard' | 'transactions' | 'balanceSheet' | 'categories' | 'ventures' | 'recurring' | 'sync';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  onConfirm: (() => void) | null;
}

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, title: '', onConfirm: null });
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const requestConfirmation = useCallback((title: string, onConfirm: () => void) => {
    setConfirmation({ isOpen: true, title, onConfirm });
  }, []);

  const appData = useAppData({ requestConfirmation });

  const handleConfirm = () => {
    confirmation.onConfirm?.();
    setConfirmation({ isOpen: false, title: '', onConfirm: null });
  };

  const handleCancel = () => {
    setConfirmation({ isOpen: false, title: '', onConfirm: null });
  };


  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard appData={appData} setView={setView} openTransferModal={() => setIsTransferModalOpen(true)} />;
      case 'transactions':
        return <Transactions appData={appData} />;
      case 'balanceSheet':
        return <BalanceSheet appData={appData} />;
      case 'categories':
        return <Categories appData={appData} />;
      case 'ventures':
        return <Ventures appData={appData} />;
      case 'recurring':
        return <Recurring appData={appData} />;
      case 'sync':
        return <Sync appData={appData} />;
      default:
        return <Dashboard appData={appData} setView={setView} openTransferModal={() => setIsTransferModalOpen(true)} />;
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-0 md:p-4 h-screen">
        {confirmation.isOpen && (
            <Modal title={confirmation.title} onClose={handleCancel}>
                <div className="space-y-4">
                    <p className="text-muted">Esta acción no se puede deshacer. ¿Estás seguro de que quieres continuar?</p>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={handleCancel} className="px-4 py-2 rounded-lg bg-card font-semibold">Cancelar</button>
                        <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-danger text-white font-bold">Confirmar</button>
                    </div>
                </div>
            </Modal>
        )}
        <TransferModal 
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            appData={appData}
        />
        <div className="md:rounded-2xl overflow-hidden glass-pane shadow-2xl flex flex-col md:flex-row h-full border border-border">
            <Layout appData={appData} currentView={view} setView={setView}>
                <main className="p-3 md:p-6 overflow-auto flex-1 bg-transparent">
                    {renderView()}
                </main>
            </Layout>
        </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
