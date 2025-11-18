import React, { useState, useEffect } from 'react';
import { AppDataHook, Asset, Debt, Cuenta, EquityAsset } from '../types';
import { fmtMoney } from '../utils/helpers';
// FIX: Imported WalletIcon to be used in getEquityAssetIcon helper function.
import { PlusIcon, EditIcon, DeleteIcon, HomeIcon, CarIcon, WalletIcon } from './ui/Icons';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';
import { DebtPaydownSimulator } from './DebtPaydownSimulator';

const CuentaModal: React.FC<{ isOpen: boolean; onClose: () => void; appData: AppDataHook; existingCuenta: Cuenta | null; }> = ({ isOpen, onClose, appData, existingCuenta }) => {
    const [cuentaData, setCuentaData] = useState<Partial<Cuenta>>(existingCuenta || { name: '', type: 'Cuenta de Ahorros', balance: 0, currency: 'PEN' });
    const { showToast } = useToast();

    useEffect(() => {
        if(existingCuenta) setCuentaData(existingCuenta);
        else setCuentaData({ name: '', type: 'Cuenta de Ahorros', balance: 0, currency: 'PEN' });
    }, [existingCuenta, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cuentaData.name) {
            showToast('El nombre es requerido.', 'error');
            return;
        }
        if (existingCuenta) {
            await appData.updateCuenta(existingCuenta.id, cuentaData);
        } else {
            await appData.addCuenta(cuentaData as any);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal title={existingCuenta ? 'Editar Cuenta' : 'Nueva Cuenta de Efectivo'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted">Nombre de la Cuenta</label>
                        <input type="text" value={cuentaData.name || ''} onChange={e => setCuentaData({...cuentaData, name: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Tipo (ej. Billetera)</label>
                        <input type="text" value={cuentaData.type || ''} onChange={e => setCuentaData({...cuentaData, type: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-muted">Saldo Inicial</label>
                        <input type="number" step="0.01" value={cuentaData.balance || 0} onChange={e => setCuentaData({...cuentaData, balance: parseFloat(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-card font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 text-white font-bold">Guardar Cuenta</button>
                </div>
            </form>
        </Modal>
    )
}

const EquityAssetModal: React.FC<{ isOpen: boolean; onClose: () => void; appData: AppDataHook; existingAsset: EquityAsset | null; }> = ({ isOpen, onClose, appData, existingAsset }) => {
    const [assetData, setAssetData] = useState<Partial<EquityAsset>>(existingAsset || { name: '', type: 'Bienes Raíces', value: 0 });
    const { showToast } = useToast();
    
    useEffect(() => {
        if(existingAsset) setAssetData(existingAsset);
        else setAssetData({ name: '', type: 'Bienes Raíces', value: 0 });
    }, [existingAsset, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assetData.name) {
            showToast('El nombre es requerido.', 'error');
            return;
        }
        if (existingAsset) {
            await appData.updateEquityAsset(existingAsset.id, assetData);
        } else {
            await appData.addEquityAsset(assetData as any);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal title={existingAsset ? 'Editar Activo Patrimonial' : 'Nuevo Activo Patrimonial'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted">Nombre del Activo</label>
                        <input type="text" value={assetData.name || ''} onChange={e => setAssetData({...assetData, name: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Tipo</label>
                        <select value={assetData.type || 'Bienes Raíces'} onChange={e => setAssetData({...assetData, type: e.target.value as EquityAsset['type']})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option>Bienes Raíces</option>
                            <option>Vehículo</option>
                            <option>Otro</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-muted">Valor de Mercado Actual</label>
                        <input type="number" step="0.01" value={assetData.value || 0} onChange={e => setAssetData({...assetData, value: parseFloat(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-card font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-teal text-white font-bold">Guardar Activo</button>
                </div>
            </form>
        </Modal>
    );
};

const AssetModal: React.FC<{ isOpen: boolean; onClose: () => void; appData: AppDataHook; existingAsset: Asset | null; }> = ({ isOpen, onClose, appData, existingAsset }) => {
    const [assetData, setAssetData] = useState<Partial<Asset>>(existingAsset || { name: '', type: 'Bienes Raíces', balance: 0, currency: 'PEN', passiveIncome: 0 });
    const { showToast } = useToast();
    
    useEffect(() => {
        if(existingAsset) setAssetData(existingAsset);
        else setAssetData({ name: '', type: 'Bienes Raíces', balance: 0, currency: 'PEN', passiveIncome: 0 });
    }, [existingAsset, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assetData.name) {
            showToast('El nombre es requerido.', 'error');
            return;
        }
        if (existingAsset) {
            await appData.updateAsset(existingAsset.id, assetData);
        } else {
            await appData.addAsset(assetData as any);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal title={existingAsset ? 'Editar Activo de Inversión' : 'Nuevo Activo de Inversión'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted">Nombre del Activo</label>
                        <input type="text" value={assetData.name || ''} onChange={e => setAssetData({...assetData, name: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Tipo (ej. Acciones)</label>
                        <input type="text" value={assetData.type || ''} onChange={e => setAssetData({...assetData, type: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Valor / Costo</label>
                        <input type="number" step="0.01" value={assetData.balance || 0} onChange={e => setAssetData({...assetData, balance: parseFloat(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                     <div>
                        <label className="text-sm text-muted">Ingreso Pasivo Mensual</label>
                        <input type="number" step="0.01" value={assetData.passiveIncome || 0} onChange={e => setAssetData({...assetData, passiveIncome: parseFloat(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-card font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-teal text-white font-bold">Guardar Activo</button>
                </div>
            </form>
        </Modal>
    );
};

const DebtModal: React.FC<{ isOpen: boolean; onClose: () => void; appData: AppDataHook; existingDebt: Debt | null; }> = ({ isOpen, onClose, appData, existingDebt }) => {
    const [debtData, setDebtData] = useState<Partial<Debt>>(existingDebt || { name: '', outstanding: 0, monthlyPayment: 0 });
    const { showToast } = useToast();

    useEffect(() => {
        if(existingDebt) setDebtData(existingDebt);
        else setDebtData({ name: '', outstanding: 0, monthlyPayment: 0 });
    }, [existingDebt, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!debtData.name) {
            showToast('El nombre es requerido.', 'error');
            return;
        }
        if (existingDebt) {
            await appData.updateDebt(existingDebt.id, debtData);
        } else {
            await appData.addDebt(debtData as any);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal title={existingDebt ? 'Editar Pasivo' : 'Nuevo Pasivo'} onClose={onClose}>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-sm text-muted">Nombre</label>
                        <input type="text" value={debtData.name || ''} onChange={e => setDebtData({...debtData, name: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Saldo Pendiente</label>
                        <input type="number" step="0.01" value={debtData.outstanding || 0} onChange={e => setDebtData({...debtData, outstanding: parseFloat(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div>
                        <label className="text-sm text-muted">Gasto Mensual (Cuota)</label>
                        <input type="number" step="0.01" value={debtData.monthlyPayment || 0} onChange={e => setDebtData({...debtData, monthlyPayment: parseFloat(e.target.value)})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-muted">Vincular a Activo Patrimonial (Opcional)</label>
                        <select value={debtData.equityAssetId || ''} onChange={e => setDebtData({...debtData, equityAssetId: e.target.value})} className="w-full mt-1 p-2 bg-panel border border-border rounded-md">
                            <option value="">-- Ninguno --</option>
                            {appData.data.equityAssets.map(ea => <option key={ea.id} value={ea.id}>{ea.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-card font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-teal text-white font-bold">Guardar Pasivo</button>
                </div>
            </form>
        </Modal>
    );
}

const getEquityAssetIcon = (type: EquityAsset['type']) => {
    switch(type) {
        case 'Bienes Raíces': return <HomeIcon />;
        case 'Vehículo': return <CarIcon />;
        default: return <WalletIcon />;
    }
}

const TableCard: React.FC<{title: string, colorClass: string, onAdd: () => void, children: React.ReactNode, headers: string[]}> = ({title, colorClass, onAdd, children, headers}) => (
     <div className="glass-card rounded-xl shadow-lg overflow-hidden">
        <div className={`flex justify-between items-center p-4 bg-black/20`}>
            <h2 className={`text-lg font-bold ${colorClass}`}>{title}</h2>
            <button onClick={onAdd} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-subtle text-primary text-sm font-semibold border border-border-subtle hover:bg-white/20 transition-colors`}>
                <PlusIcon /> Nuevo
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted">
                    <tr>
                        {headers.map(h => <th key={h} className="p-3 font-semibold">{h}</th>)}
                        <th className="p-3"></th>
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    </div>
);

export const BalanceSheet: React.FC<{ appData: AppDataHook }> = ({ appData }) => {
    const [isCuentaModalOpen, setIsCuentaModalOpen] = useState(false);
    const [editingCuenta, setEditingCuenta] = useState<Cuenta | null>(null);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [isEquityAssetModalOpen, setIsEquityAssetModalOpen] = useState(false);
    const [editingEquityAsset, setEditingEquityAsset] = useState<EquityAsset | null>(null);
    const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [simulatingDebt, setSimulatingDebt] = useState<Debt | null>(null);

    const openCuentaModal = (cuenta: Cuenta | null = null) => { setEditingCuenta(cuenta); setIsCuentaModalOpen(true); };
    const openAssetModal = (asset: Asset | null = null) => { setEditingAsset(asset); setIsAssetModalOpen(true); };
    const openEquityAssetModal = (asset: EquityAsset | null = null) => { setEditingEquityAsset(asset); setIsEquityAssetModalOpen(true); };
    const openDebtModal = (debt: Debt | null = null) => { setEditingDebt(debt); setIsDebtModalOpen(true); };

    return (
        <div className="space-y-6">
            <CuentaModal isOpen={isCuentaModalOpen} onClose={() => setIsCuentaModalOpen(false)} appData={appData} existingCuenta={editingCuenta} />
            <AssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} appData={appData} existingAsset={editingAsset} />
            <EquityAssetModal isOpen={isEquityAssetModalOpen} onClose={() => setIsEquityAssetModalOpen(false)} appData={appData} existingAsset={editingEquityAsset} />
            <DebtModal isOpen={isDebtModalOpen} onClose={() => setIsDebtModalOpen(false)} appData={appData} existingDebt={editingDebt} />
            {simulatingDebt && <DebtPaydownSimulator isOpen={!!simulatingDebt} onClose={() => setSimulatingDebt(null)} debt={simulatingDebt} />}
            
            <div>
                <h1 className="text-2xl font-extrabold text-primary">Balance General</h1>
                <p className="text-muted">Tu estado financiero completo: activos y pasivos.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                   <TableCard title="Cuentas de Efectivo" colorClass="text-info" onAdd={() => openCuentaModal()} headers={["Nombre", "Saldo"]}>
                     {appData.data.cuentas.map(cuenta => (
                        <tr key={cuenta.id} className="border-t border-border-subtle hover:bg-white/5">
                            <td className="p-3 font-semibold">{cuenta.name}</td>
                            <td className="p-3 font-mono">{fmtMoney(cuenta.balance)}</td>
                            <td className="p-3">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => openCuentaModal(cuenta)} className="text-muted hover:text-info"><EditIcon /></button>
                                    <button onClick={() => appData.requestConfirmation('Eliminar Cuenta', () => appData.deleteCuenta(cuenta.id))} className="text-muted hover:text-danger"><DeleteIcon /></button>
                                </div>
                            </td>
                        </tr>
                     ))}
                   </TableCard>

                   <TableCard title="Activos de Inversión" colorClass="text-growth" onAdd={() => openAssetModal()} headers={["Nombre", "Valor", "Ingreso Pasivo"]}>
                        {appData.data.assets.map(asset => (
                            <tr key={asset.id} className="border-t border-border-subtle hover:bg-white/5">
                                <td className="p-3 font-semibold">{asset.name}</td>
                                <td className="p-3 font-mono">{fmtMoney(asset.balance)}</td>
                                <td className="p-3 font-mono text-growth">+{fmtMoney(asset.passiveIncome)}/m</td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openAssetModal(asset)} className="text-muted hover:text-info"><EditIcon /></button>
                                        <button onClick={() => appData.requestConfirmation('Eliminar Activo', () => appData.deleteAsset(asset.id))} className="text-muted hover:text-danger"><DeleteIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                   </TableCard>

                    <TableCard title="Activos Patrimoniales" colorClass="text-warning" onAdd={() => openEquityAssetModal()} headers={["Nombre", "Valor"]}>
                        {appData.data.equityAssets.map(ea => (
                            <tr key={ea.id} className="border-t border-border-subtle hover:bg-white/5">
                                <td className="p-3 font-semibold flex items-center gap-2">
                                    <span className="text-warning">{getEquityAssetIcon(ea.type)}</span> {ea.name}
                                </td>
                                <td className="p-3 font-mono">{fmtMoney(ea.value)}</td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEquityAssetModal(ea)} className="text-muted hover:text-info"><EditIcon /></button>
                                        <button onClick={() => appData.requestConfirmation('Eliminar Activo', () => appData.deleteEquityAsset(ea.id))} className="text-muted hover:text-danger"><DeleteIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </TableCard>
                </div>

                <div className="space-y-6">
                    <TableCard title="Pasivos (Deudas)" colorClass="text-danger" onAdd={() => openDebtModal()} headers={["Nombre", "Saldo Pendiente", "Estrategia"]}>
                         {appData.data.debts.map(debt => (
                            <tr key={debt.id} className="border-t border-border-subtle hover:bg-white/5">
                                <td className="p-3 font-semibold">{debt.name}</td>
                                <td className="p-3 font-mono text-danger">{fmtMoney(debt.outstanding)}</td>
                                <td className="p-3 font-semibold"><button onClick={() => setSimulatingDebt(debt)} className="text-xs font-bold text-accent-teal hover:underline">Estrategia</button></td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openDebtModal(debt)} className="text-muted hover:text-info"><EditIcon /></button>
                                        <button onClick={() => appData.requestConfirmation('Eliminar Pasivo', () => appData.deleteDebt(debt.id))} className="text-muted hover:text-danger"><DeleteIcon /></button>
                                    </div>
                                </td>
                            </tr>
                         ))}
                    </TableCard>
                </div>
            </div>
        </div>
    );
};
