import React from 'react';
import { View } from '../App';
import { DashboardIcon, TransactionsIcon, BalanceSheetIcon, CategoriesIcon, SyncIcon, VentureIcon, CloudIcon, RepeatIcon } from './ui/Icons';
import { AppDataHook } from '../types';

const FreedomMeter: React.FC<{ appData: AppDataHook }> = ({ appData }) => {
    const { percentage } = appData.selectDashboardData.freedomRace;

    return (
        <div className="flex items-center gap-3">
            <div className="text-right">
                <div className="font-bold text-sm text-accent-teal leading-none font-mono">{percentage.toFixed(1)}%</div>
                <div className="text-xs text-muted leading-none">Libertad</div>
            </div>
             <div className="w-24 bg-black/20 rounded-full h-2 border border-border-subtle">
                <div className="bg-gradient-to-r from-accent-2 to-accent-teal h-full rounded-full" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
};


const Header: React.FC<{ appData: AppDataHook }> = ({ appData }) => (
  <header className="flex items-center justify-between p-3 glass-pane border-b border-border">
    <div className="flex gap-3 items-center">
       <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center font-black text-lg text-bg-dark shadow-lg">
        CF
      </div>
      <div>
        <div className="font-extrabold text-base tracking-tight">C.F. PRO</div>
      </div>
    </div>
    <FreedomMeter appData={appData} />
  </header>
);

const NavItem: React.FC<{ view: View; label: string; currentView: View; setView: (view: View) => void; children: React.ReactNode; isSidebar?: boolean; }> = ({ view, label, currentView, setView, children, isSidebar = false }) => {
  const isActive = currentView === view;
  
  if (isSidebar) {
    return (
        <button
            onClick={() => setView(view)}
            className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 group ${isActive ? 'bg-accent-teal/10 text-accent-teal' : 'text-muted hover:bg-white/5 hover:text-primary'}`}
        >
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-accent to-accent-teal transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
            {children}
            <span>{label}</span>
        </button>
    )
  }

  return (
    <button
      onClick={() => setView(view)}
      className={`relative flex-1 flex flex-col items-center gap-1 p-2 rounded-lg font-bold text-[10px] transition-colors duration-300 ${isActive ? 'text-accent-teal' : 'text-muted hover:text-primary'}`}
    >
      {children}
      <span>{label}</span>
      {isActive && <div className="absolute bottom-0 h-0.5 w-6 bg-accent-teal rounded-full"></div>}
    </button>
  );
};

const NavContent: React.FC<{ currentView: View; setView: (view: View) => void; isSidebar?: boolean; }> = ({ currentView, setView, isSidebar }) => (
    <>
        <NavItem view="dashboard" label="Dashboard" currentView={currentView} setView={setView} isSidebar={isSidebar}><DashboardIcon /></NavItem>
        <NavItem view="transactions" label="Transacciones" currentView={currentView} setView={setView} isSidebar={isSidebar}><TransactionsIcon /></NavItem>
        <NavItem view="balanceSheet" label="Balance" currentView={currentView} setView={setView} isSidebar={isSidebar}><BalanceSheetIcon /></NavItem>
        <NavItem view="ventures" label="Ventures" currentView={currentView} setView={setView} isSidebar={isSidebar}><VentureIcon /></NavItem>
        <NavItem view="recurring" label="Recurrentes" currentView={currentView} setView={setView} isSidebar={isSidebar}><RepeatIcon /></NavItem>
        <NavItem view="categories" label="Categorías" currentView={currentView} setView={setView} isSidebar={isSidebar}><CategoriesIcon /></NavItem>
        <NavItem view="sync" label="Ajustes" currentView={currentView} setView={setView} isSidebar={isSidebar}><SyncIcon /></NavItem>
    </>
)

const Sidebar: React.FC<{ currentView: View; setView: (view: View) => void; appData: AppDataHook }> = ({ currentView, setView, appData }) => (
    <aside className="w-64 glass-pane border-r border-border p-4 flex-col justify-between hidden md:flex">
        <div>
            <div className="flex gap-3 items-center mb-6">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center font-black text-xl text-bg-dark shadow-lg">
                    CF
                </div>
                <div>
                    <div className="font-extrabold text-base tracking-tight text-primary">Wealth Command</div>
                    <div className="text-xs font-bold text-accent-teal">PRO</div>
                </div>
            </div>
            <nav className="flex flex-col gap-2">
                <NavContent currentView={currentView} setView={setView} isSidebar={true} />
            </nav>
        </div>
        <div className="space-y-3">
             <FreedomMeter appData={appData} />
             <div className={`flex items-center gap-2 text-xs font-bold p-2 rounded-lg ${appData.isCloudOn ? 'bg-accent-teal/10 text-accent-teal' : 'bg-white/5 text-muted'}`}>
                <CloudIcon />
                <span>{appData.isCloudOn ? 'Cloud Sync Activo' : 'Modo Local'}</span>
            </div>
        </div>
    </aside>
);

const BottomNav: React.FC<{ currentView: View; setView: (view: View) => void }> = ({ currentView, setView }) => (
  <nav className="relative grid grid-cols-7 gap-1 p-1 justify-between glass-pane border-t border-border md:hidden">
    <NavContent currentView={currentView} setView={setView} />
  </nav>
);

interface LayoutProps {
    children: React.ReactNode;
    currentView: View;
    setView: (view: View) => void;
    appData: AppDataHook;
}


export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, appData }) => {
  return (
    <>
      <Sidebar currentView={currentView} setView={setView} appData={appData} />
      <div className="flex flex-col flex-1">
        <div className="md:hidden"><Header appData={appData} /></div>
        {children}
        <BottomNav currentView={currentView} setView={setView} />
      </div>
    </>
  );
};
